import {
    Injectable,
    NotFoundException,
    BadRequestException,
} from '@nestjs/common';
import { DatabaseService } from '../../database/services/database.service';

export interface SizeRow {
    value: string;
    stock: number;
}

export interface SizeWithStock {
    size_id: number;
    stock: number;
    size: {
        id: number;
        size_value: string;
    };
}

export interface Product {
    id: number;
    product_code?: string;
    name: string;
    price: number;
    description?: string;
    image_url?: string;
    category_id?: number;
    stock?: number;
    created_at?: string;
    updated_at?: string;

    // sizes với thông tin kho theo size
    sizes?: SizeWithStock[];
}

@Injectable()
export class ProductsService {
    constructor(private readonly db: DatabaseService) {}

    async findAll(q?: string, category?: string | number): Promise<Product[]> {
        const conditions: string[] = [];
        const params: any[] = [];

        if (q) {
            const like = `%${q}%`;
            conditions.push('(p.name LIKE ? OR p.product_code LIKE ?)');
            params.push(like, like);
        }

        if (category && category !== 'all') {
            conditions.push('p.category_id = ?');
            params.push(Number(category));
        }

        let sql = `
            SELECT 
                p.id,
                p.product_code,
                p.name,
                p.price,
                p.description,
                p.image_url,
                p.category_id,
                ps.size_id,
                ps.stock AS size_stock,
                s.id AS size_id_real,
                s.size_value
            FROM products p
            LEFT JOIN product_sizes ps ON p.id = ps.product_id
            LEFT JOIN sizes s ON ps.size_id = s.id
        `;

        if (conditions.length > 0) {
            sql += ' WHERE ' + conditions.join(' AND ');
        }

        sql += ` ORDER BY p.id, CAST(REPLACE(COALESCE(s.size_value, '0'), '.5', '') AS DECIMAL(5,2)), COALESCE(s.size_value, '')`;

        const rows = await this.db.query<any>(sql, params);

        // Nhóm dữ liệu lại theo product
        const productMap = new Map<number, Product>();
        rows.forEach((row) => {
            if (!productMap.has(row.id)) {
                productMap.set(row.id, {
                    id: row.id,
                    product_code: row.product_code,
                    name: row.name,
                    price: row.price,
                    description: row.description,
                    image_url: row.image_url,
                    category_id: row.category_id,
                    stock: 0, // sẽ tính từ sizes
                    sizes: [],
                });
            }

            const product = productMap.get(row.id)!;
            if (row.size_id && row.size_value) {
                product.sizes!.push({
                    size_id: row.size_id,
                    stock: row.size_stock,
                    size: {
                        id: row.size_id_real,
                        size_value: row.size_value,
                    },
                } as any);
            }
        });

        return Array.from(productMap.values());
    }

    //     async findOne(id: number): Promise<Product> {
    //         if (!id) throw new BadRequestException('Thiếu id');

    //         const rows = await this.db.query<Product>(
    //             'SELECT * FROM products WHERE id = ?',
    //             [id],
    //         );
    //         if (rows.length === 0) {
    //             throw new NotFoundException('Không tìm thấy sản phẩm');
    //         }
    //         return rows[0];
    //     }

    //     export interface SizeRow {
    //     size_id: number;
    //     value: string;
    //     stock: number;
    // }

    async findOne(id: number): Promise<Product> {
        if (!id) throw new BadRequestException('Thiếu id');

        const rows = await this.db.query<Product>(
            'SELECT * FROM products WHERE id = ?',
            [id],
        );

        if (rows.length === 0)
            throw new NotFoundException('Không tìm thấy sản phẩm');

        const product = rows[0];

        // Lấy sizes theo product_id từ product_sizes
        const sizeRows = await this.db.query<any>(
            `
    SELECT 
      ps.size_id,
      ps.stock,
      s.id AS size_id_real,
      s.size_value
    FROM product_sizes ps
    JOIN sizes s ON s.id = ps.size_id
    WHERE ps.product_id = ?
    ORDER BY
      CAST(REPLACE(s.size_value, '.5', '') AS DECIMAL(5,2)), s.size_value
    `,
            [id],
        );

        product.sizes = sizeRows.map((row) => ({
            size_id: row.size_id,
            stock: row.stock,
            size: {
                id: row.size_id_real,
                size_value: row.size_value,
            },
        }));
        return product;
    }

    async create(body: any) {
        if (!body.name || body.price === undefined) {
            throw new BadRequestException('Thiếu name hoặc price');
        }

        const conn = await this.db.getConnection();
        try {
            await conn.beginTransaction();

            const [result] = await conn.execute(
                `INSERT INTO products (product_code, name, price, description, image_url)
       VALUES (?, ?, ?, ?, ?)`,
                [
                    body.product_code || null,
                    body.name,
                    Number(body.price || 0),
                    body.description || null,
                    body.image_url || null,
                ],
            );

            const productId = (result as any).insertId;

            // upsert sizes
            // dùng conn hay this.db đều được, nhưng đang transaction thì nên dùng conn
            if (Array.isArray(body.sizes)) {
                // validate size tồn tại
                const cleaned = body.sizes
                    .map((s: any) => ({
                        size_id: Number(s.size_id),
                        stock: Math.max(0, Number(s.stock || 0)),
                    }))
                    .filter(
                        (s: any) =>
                            Number.isInteger(s.size_id) && s.size_id > 0,
                    );

                if (cleaned.length > 0) {
                    const ids = cleaned.map((x: any) => x.size_id);
                    const [exist] = await conn.query(
                        `SELECT id FROM sizes WHERE id IN (${ids.map(() => '?').join(',')})`,
                        ids,
                    );
                    const existSet = new Set(
                        (exist as any[]).map((x) => Number(x.id)),
                    );
                    for (const s of cleaned) {
                        if (!existSet.has(s.size_id)) {
                            throw new BadRequestException(
                                `size_id=${s.size_id} không tồn tại`,
                            );
                        }
                    }

                    const params: any[] = [];
                    const ph = cleaned
                        .map((s: any) => {
                            params.push(productId, s.size_id, s.stock);
                            return '(?, ?, ?)';
                        })
                        .join(',');

                    await conn.execute(
                        `
          INSERT INTO product_sizes (product_id, size_id, stock)
          VALUES ${ph}
          ON DUPLICATE KEY UPDATE stock = VALUES(stock)
          `,
                        params,
                    );
                }
            }

            await conn.commit();
            return { ok: true, id: productId };
        } catch (e) {
            await conn.rollback();
            throw e;
        } finally {
            conn.release();
        }
    }

    async update(id: number, body: any) {
        if (!id) throw new BadRequestException('Thiếu id');

        const conn = await this.db.getConnection();
        try {
            await conn.beginTransaction();

            // update products (không có stock nữa)
            const fields = [
                'product_code',
                'name',
                'price',
                'description',
                'image_url',
            ];
            const updates: string[] = [];
            const values: any[] = [];

            for (const f of fields) {
                if (body[f] !== undefined) {
                    updates.push(`${f} = ?`);
                    values.push(body[f]);
                }
            }

            if (updates.length > 0) {
                values.push(id);
                await conn.execute(
                    `UPDATE products SET ${updates.join(', ')} WHERE id = ?`,
                    values,
                );
            }

            // upsert sizes
            if (Array.isArray(body.sizes)) {
                const cleaned = body.sizes
                    .map((s: any) => ({
                        size_id: Number(s.size_id),
                        stock: Math.max(0, Number(s.stock || 0)),
                    }))
                    .filter(
                        (s: any) =>
                            Number.isInteger(s.size_id) && s.size_id > 0,
                    );

                //  nếu muốn "đồng bộ y hệt" (FE gửi gì giữ đúng đó) thì:
                // 1) xóa hết size hiện tại của product
                // 2) insert lại
                // (an toàn + đơn giản)
                await conn.execute(
                    `DELETE FROM product_sizes WHERE product_id = ?`,
                    [id],
                );

                if (cleaned.length > 0) {
                    const params: any[] = [];
                    const ph = cleaned
                        .map((s: any) => {
                            params.push(id, s.size_id, s.stock);
                            return '(?, ?, ?)';
                        })
                        .join(',');

                    await conn.execute(
                        `INSERT INTO product_sizes (product_id, size_id, stock) VALUES ${ph}`,
                        params,
                    );
                }
            }

            await conn.commit();
            return { ok: true, message: 'Cập nhật thành công' };
        } catch (e) {
            await conn.rollback();
            throw e;
        } finally {
            conn.release();
        }
    }

    async remove(id: number) {
        if (!id) throw new BadRequestException('Thiếu id');

        await this.db.query('DELETE FROM products WHERE id = ?', [id]);
        return { ok: true, message: 'Đã xoá sản phẩm' };
    }

    async updateStock(id: number, stock: number) {
        if (!id) throw new BadRequestException('Thiếu id');

        await this.db.query('UPDATE products SET stock = ? WHERE id = ?', [
            stock,
            id,
        ]);

        return { ok: true, message: 'Đã cập nhật tồn kho' };
    }

    async autocomplete(keyword: string) {
        if (!keyword || keyword.length < 2) {
            return [];
        }

        const like = `%${keyword}%`;
        const sql = `
    SELECT DISTINCT p.name, p.product_code, p.id
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    WHERE p.name LIKE ? OR p.product_code LIKE ? OR c.name LIKE ?
    LIMIT 8
  `;
        return this.db.query(sql, [like, like, like]);
    }

    // Search cho trang /search
    async search(params: {
        query?: string;
        page?: number;
        limit?: number;
        sort?: 'newest' | 'price_asc' | 'price_desc';
    }) {
        const query = (params.query || '').trim();
        const page = Math.max(params.page || 1, 1);
        let limit = params.limit || 12;
        limit = Math.min(Math.max(limit, 1), 48); // 1–48
        const offset = (page - 1) * limit;

        if (!query) {
            throw new BadRequestException('Thiếu từ khóa tìm kiếm');
        }

        const like = `%${query}%`;
        const whereParts: string[] = [
            '(p.name LIKE ? OR p.product_code LIKE ? OR c.name LIKE ?)',
        ];
        const whereParams: any[] = [like, like, like];

        let orderBy = 'p.created_at DESC';
        switch (params.sort) {
            case 'price_asc':
                orderBy = 'p.price ASC';
                break;
            case 'price_desc':
                orderBy = 'p.price DESC';
                break;
            default:
                orderBy = 'p.created_at DESC';
        }

        const where = 'WHERE ' + whereParts.join(' AND ');

        const itemsSql = `
      SELECT 
        p.id,
        p.product_code,
        p.name,
        p.price,
        p.image_url,
        c.name AS category
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      ${where}
      ORDER BY ${orderBy}
      LIMIT ? OFFSET ?
    `;
        const items = await this.db.query(itemsSql, [
            ...whereParams,
            limit,
            offset,
        ]);

        const countSql = `
      SELECT COUNT(*) AS total
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      ${where}
    `;
        const countRows: any[] = await this.db.query(countSql, whereParams);
        const total = Number(countRows[0]?.total || 0);

        return {
            items,
            total,
            page,
            limit,
        };
    }

    private async upsertProductSizes(productId: number, sizes: any[]) {
        // sizes: [{ size_id, stock }]
        if (!Array.isArray(sizes)) return;

        // lọc hợp lệ
        const cleaned = sizes
            .map((s) => ({
                size_id: Number(s.size_id),
                stock: Math.max(0, Number(s.stock || 0)),
            }))
            .filter((s) => Number.isInteger(s.size_id) && s.size_id > 0);

        // nếu không có sizes => không làm gì (hoặc bạn muốn clear thì xử lý riêng)
        if (cleaned.length === 0) return;

        // (Tuỳ chọn) validate size_id có tồn tại trong sizes
        const ids = cleaned.map((x) => x.size_id);
        const exist = await this.db.query<any>(
            `SELECT id FROM sizes WHERE id IN (${ids.map(() => '?').join(',')})`,
            ids,
        );
        const existSet = new Set(exist.map((x) => Number(x.id)));
        for (const s of cleaned) {
            if (!existSet.has(s.size_id)) {
                throw new BadRequestException(
                    `size_id=${s.size_id} không tồn tại trong bảng sizes`,
                );
            }
        }

        // upsert product_sizes
        // cần UNIQUE(product_id, size_id)
        const values: any[] = [];
        const placeholders = cleaned
            .map((s) => {
                values.push(productId, s.size_id, s.stock);
                return '(?, ?, ?)';
            })
            .join(',');

        const sql = `
    INSERT INTO product_sizes (product_id, size_id, stock)
    VALUES ${placeholders}
    ON DUPLICATE KEY UPDATE stock = VALUES(stock)
  `;

        await this.db.query(sql, values);
    }
}
