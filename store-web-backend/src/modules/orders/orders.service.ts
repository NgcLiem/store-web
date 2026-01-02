import {
    Injectable,
    BadRequestException,
    NotFoundException,
} from '@nestjs/common';
import { DatabaseService } from '../../database/services/database.service';
import { VouchersService } from '../vouchers/vouchers.service';

export interface Order {
    id: number;
    user_id: number | null;
    order_date: Date | null;
    total_amount: number | null;
    status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
    shipping_address: string | null;
    payment_method: 'cod' | 'credit_card' | 'bank_transfer';
}

export interface OrderItem {
    id: number;
    order_id: number | null;
    product_id: number | null;
    quantity: number | null;
    price: number | null;
}

@Injectable()
export class OrdersService {
    constructor(
        private readonly db: DatabaseService,
        private readonly vouchersService: VouchersService,
    ) {}

    async findAll(
        params: { user_id?: number; status?: string; q?: string } = {},
    ) {
        const { user_id, status, q } = params;
        // Join users so staff/admin screens can search by email/phone/name
        let sql = `
      SELECT o.*,
             u.email AS user_email,
             u.phone AS user_phone,
             u.full_name AS user_full_name
      FROM orders o
      LEFT JOIN users u ON u.id = o.user_id
      WHERE 1=1
    `;
        const values: any[] = [];

        if (user_id) {
            sql += ' AND o.user_id = ?';
            values.push(user_id);
        }

        if (status) {
            sql += ' AND o.status = ?';
            values.push(status);
        }

        // q: allow searching by order id (exact/partial) or user's email/phone/name
        if (q && String(q).trim()) {
            const needle = `%${String(q).trim()}%`;
            const qTrim = String(q).trim();
            const maybeId = Number(qTrim);

            // If q is a number, also match order id exactly
            if (!Number.isNaN(maybeId) && qTrim !== '') {
                sql +=
                    ' AND (o.id = ? OR CAST(o.id AS CHAR) LIKE ? OR u.email LIKE ? OR u.phone LIKE ? OR u.full_name LIKE ?)';
                values.push(maybeId, needle, needle, needle, needle);
            } else {
                sql +=
                    ' AND (CAST(o.id AS CHAR) LIKE ? OR u.email LIKE ? OR u.phone LIKE ? OR u.full_name LIKE ?)';
                values.push(needle, needle, needle, needle);
            }
        }

        sql += ' ORDER BY o.order_date DESC';

        return this.db.query<Order>(sql, values);
    }

    // GET /orders/:id (trả order + items) - 1 query rồi group về 1 object
    async findOneWithItems(id: number) {
        if (!id) throw new BadRequestException('Thiếu id');

        const rows = await this.db.query<any>(
            `
    SELECT
      o.*,
      o.order_date AS created_at,
      u.full_name AS customer_name,
      u.phone AS customer_phone,
      u.email AS customer_email,

      a.full_name AS addr_full_name,
      a.phone AS addr_phone,
      a.address_line AS addr_address_line,

      oi.id AS oi_id,
      oi.order_id AS oi_order_id,
      oi.product_id AS oi_product_id,
      oi.quantity AS oi_quantity,
      oi.size AS oi_size,
      oi.price AS oi_price,

      p.name AS product_name,
      p.image_url AS product_image_url
    FROM orders o
    LEFT JOIN users u ON u.id = o.user_id
    LEFT JOIN addresses a ON a.id = o.address_id
    LEFT JOIN order_items oi ON oi.order_id = o.id
    LEFT JOIN products p ON p.id = oi.product_id
    WHERE o.id = ?
    `,
            [id],
        );

        // Không có đơn
        if (!rows || rows.length === 0) {
            throw new NotFoundException('Không tìm thấy đơn hàng');
        }

        // Lấy phần order (từ row đầu)
        const r0 = rows[0];
        const order = {
            id: r0.id,
            user_id: r0.user_id,
            address_id: r0.address_id,
            payment_method_id: r0.payment_method_id,
            voucher_id: r0.voucher_id,
            order_date: r0.order_date,
            created_at: r0.created_at,
            sub_total: r0.sub_total,
            discount: r0.discount,
            shipping_fee: r0.shipping_fee,
            total_amount: r0.total_amount,
            status: r0.status,
            shipping_address: r0.shipping_address,
            payment_method: r0.payment_method,

            //  thêm thông tin user để FE dùng
            customer_name: r0.addr_full_name || r0.customer_name,
            customer_phone: r0.addr_phone || r0.customer_phone,
            customer_email: r0.customer_email,
            items: [] as any[],
        };

        // Gom items (nếu đơn có item thì oi_id != null)
        for (const r of rows) {
            if (r.oi_id == null) continue;
            order.items.push({
                id: r.oi_id,
                order_id: r.oi_order_id,
                product_id: r.oi_product_id,
                quantity: r.oi_quantity,
                size: r.oi_size,
                price: r.oi_price,

                //  fields FE đang cần
                product_name: r.product_name,
                image_url: r.product_image_url,
                name: r.product_name, // nếu FE fallback item.name
            });
        }

        return order;
    }

    async create(body: any) {
        const { user_id, shipping_address, payment_method, items } = body;

        if (!user_id) {
            throw new BadRequestException('Thiếu user_id');
        }
        if (!items || !Array.isArray(items) || items.length === 0) {
            throw new BadRequestException(
                'Đơn hàng phải có ít nhất 1 sản phẩm',
            );
        }

        const productIds = items
            .map((it: any) => it.product_id)
            .filter(Boolean);
        if (productIds.length === 0) {
            throw new BadRequestException('Danh sách sản phẩm không hợp lệ');
        }

        // Lấy giá hiện tại của sản phẩm
        const products = await this.db.query<any>(
            `SELECT id, price FROM products WHERE id IN (${productIds
                .map(() => '?')
                .join(',')})`,
            productIds,
        );

        const priceMap = new Map<number, number>();
        products.forEach((p: any) => priceMap.set(p.id, Number(p.price)));

        let total = 0;
        const orderItemsToInsert: {
            product_id: number;
            quantity: number;
            price: number;
        }[] = [];

        for (const item of items) {
            const pid = Number(item.product_id);
            const qty = Number(item.quantity || 1);
            const price = priceMap.get(pid);

            if (!price) {
                throw new BadRequestException(
                    `Sản phẩm id=${pid} không tồn tại hoặc không có giá`,
                );
            }

            total += price * qty;
            orderItemsToInsert.push({ product_id: pid, quantity: qty, price });
        }

        // Tạo order
        const insertOrderSql = `
      INSERT INTO orders (user_id, total_amount, status, shipping_address, payment_method)
      VALUES (?, ?, ?, ?, ?)
    `;
        const orderParams = [
            user_id,
            total,
            'pending',
            shipping_address || null,
            payment_method || 'cod',
        ];

        const result: any = await this.db.query(insertOrderSql, orderParams);
        const orderId = result.insertId || result[0]?.insertId;

        // Tạo order_items
        const itemSql = `
  INSERT INTO order_items (order_id, product_id, quantity, size, price)
  VALUES (?, ?, ?, ?, ?)
`;

        for (const oi of orderItemsToInsert) {
            await this.db.query(itemSql, [
                orderId,
                oi.product_id,
                oi.quantity,
                null,
                oi.price,
            ]);
        }

        return { ok: true, id: orderId, total_amount: total };
    }

    async update(id: number, body: Partial<Order>) {
        if (!id) throw new BadRequestException('Thiếu id');

        const fields = [
            'total_amount',
            'status',
            'shipping_address',
            'payment_method',
        ];
        const updates: string[] = [];
        const values: any[] = [];

        for (const field of fields) {
            if (body[field as keyof Order] !== undefined) {
                updates.push(`${field} = ?`);
                values.push(body[field as keyof Order]);
            }
        }

        if (updates.length === 0) {
            throw new BadRequestException('Không có dữ liệu cập nhật');
        }

        values.push(id);
        const sql = `UPDATE orders SET ${updates.join(', ')} WHERE id = ?`;
        await this.db.query(sql, values);

        return { ok: true, message: 'Cập nhật đơn hàng thành công' };
    }

    async remove(id: number) {
        if (!id) throw new BadRequestException('Thiếu id');

        // Xoá order_items trước
        await this.db.query('DELETE FROM order_items WHERE order_id = ?', [id]);
        // Xoá orders
        await this.db.query('DELETE FROM orders WHERE id = ?', [id]);

        return { ok: true, message: 'Đã xoá đơn hàng' };
    }

    async checkout(userId: number, dto: any) {
        const { address_id, payment_method_id, items, voucher_code } = dto;

        if (!Array.isArray(items) || items.length === 0) {
            throw new BadRequestException('Giỏ hàng trống');
        }

        const conn = await this.db.getConnection();
        try {
            await conn.beginTransaction();

            // 1) address
            const [addressRows] = await conn.query(
                'SELECT * FROM addresses WHERE id = ? AND user_id = ?',
                [address_id, userId],
            );
            const address = (addressRows as any[])[0];
            if (!address) throw new BadRequestException('Địa chỉ không hợp lệ');
            const shippingAddress: string = address.address_line;

            // 2) payment method
            let paymentEnum: 'cod' | 'credit_card' | 'bank_transfer' = 'cod';
            let paymentMethodId: number | null = null;
            let paymentBrand: string | null = null;
            let paymentType: string | null = null;

            if (payment_method_id) {
                const [pmRows] = await conn.query(
                    'SELECT * FROM payment_methods WHERE id = ? AND user_id = ? AND status = "ACTIVE"',
                    [payment_method_id, userId],
                );
                const pm = (pmRows as any[])[0];
                if (!pm)
                    throw new BadRequestException(
                        'Phương thức thanh toán không hợp lệ',
                    );

                paymentMethodId = pm.id;
                paymentBrand = pm.brand ?? null;
                paymentType = pm.type ?? null;

                const type = String(pm.type || '').toUpperCase();
                if (type === 'CARD' || type === 'WALLET')
                    paymentEnum = 'credit_card';
                else if (type === 'BANK') paymentEnum = 'bank_transfer';
                else paymentEnum = 'cod';
            }

            // 3) Chuẩn hoá items + lấy danh sách productIds
            const normalizedItems = items.map((it: any) => ({
                product_id: Number(it.product_id),
                quantity: Math.max(1, Number(it.quantity || 1)),
                // FE gửi size_value (vd "41", "42", "41.5") hoặc có thể gửi số
                size_raw: it.size ?? null,
            }));

            const productIds = normalizedItems
                .map((i) => i.product_id)
                .filter(Boolean);
            if (productIds.length === 0)
                throw new BadRequestException(
                    'Danh sách sản phẩm không hợp lệ',
                );

            // 4) Lấy giá products
            const placeholders = productIds.map(() => '?').join(',');
            const [prodRows] = await conn.query(
                `SELECT id, price FROM products WHERE id IN (${placeholders})`,
                productIds,
            );
            const products = prodRows as any[];

            const priceMap = new Map<number, number>();
            for (const p of products)
                priceMap.set(Number(p.id), Number(p.price));

            // 5) Map size_raw -> size_id từ bảng sizes
            // - Nếu size_raw là number và tồn tại sizes.id => dùng luôn
            // - Nếu không, coi như size_value => map theo sizes.size_value
            const sizeRawList = normalizedItems
                .map((i) => i.size_raw)
                .filter((v) => v !== null && v !== undefined);

            // unique
            const uniqSizeRaw = Array.from(
                new Set(sizeRawList.map((v) => String(v).trim())),
            );

            // tách numeric vs string
            const numericCandidates = uniqSizeRaw
                .filter((s) => /^\d+$/.test(s))
                .map((s) => Number(s));

            const stringCandidates = uniqSizeRaw; // coi là size_value

            // Query sizes theo id
            const sizeIdMap = new Map<
                number,
                { id: number; size_value: string }
            >();
            if (numericCandidates.length > 0) {
                const ph = numericCandidates.map(() => '?').join(',');
                const [rows] = await conn.query(
                    `SELECT id, size_value FROM sizes WHERE id IN (${ph})`,
                    numericCandidates,
                );
                for (const r of rows as any[])
                    sizeIdMap.set(Number(r.id), {
                        id: Number(r.id),
                        size_value: r.size_value,
                    });
            }

            // Query sizes theo size_value
            const sizeValueMap = new Map<string, number>();
            if (stringCandidates.length > 0) {
                const ph = stringCandidates.map(() => '?').join(',');
                const [rows] = await conn.query(
                    `SELECT id, size_value FROM sizes WHERE size_value IN (${ph})`,
                    stringCandidates,
                );
                for (const r of rows as any[])
                    sizeValueMap.set(String(r.size_value), Number(r.id));
            }

            // resolve size_id cho từng item
            const resolvedItems = normalizedItems.map((it) => {
                if (it.size_raw == null) {
                    throw new BadRequestException(
                        `Thiếu size cho sản phẩm id=${it.product_id}`,
                    );
                }

                const rawStr = String(it.size_raw).trim();
                let size_id: number | null = null;

                // nếu rawStr là số và tồn tại sizes.id => dùng như size_id
                if (/^\d+$/.test(rawStr)) {
                    const maybeId = Number(rawStr);
                    if (sizeIdMap.has(maybeId)) {
                        size_id = maybeId;
                    }
                }

                // nếu chưa resolve được => coi rawStr là size_value
                if (!size_id) {
                    const mapped = sizeValueMap.get(rawStr);
                    if (!mapped) {
                        throw new BadRequestException(
                            `Không tồn tại size_value="${rawStr}" (sizes)`,
                        );
                    }
                    size_id = mapped;
                }

                return {
                    product_id: it.product_id,
                    quantity: it.quantity,
                    size_id,
                    size_value: rawStr, // để debug/log
                };
            });

            // 6) Lấy stock theo (product_id, size_id) từ product_sizes
            // dùng row constructor: WHERE (product_id, size_id) IN ((?,?),(?,?),...)
            const pairParams: any[] = [];
            const pairPlaceholders = resolvedItems
                .map((x) => {
                    pairParams.push(x.product_id, x.size_id);
                    return '(?, ?)';
                })
                .join(',');

            const [psRows] = await conn.query(
                `SELECT product_id, size_id, stock FROM product_sizes WHERE (product_id, size_id) IN (${pairPlaceholders})`,
                pairParams,
            );

            const stockMap = new Map<string, number>();
            for (const r of psRows as any[]) {
                stockMap.set(
                    `${Number(r.product_id)}:${Number(r.size_id)}`,
                    Number(r.stock),
                );
            }

            // 7) tính tiền + check stock theo size
            let subTotal = 0;
            const orderItemsToInsert: {
                product_id: number;
                quantity: number;
                size_id: number;
                price: number;
            }[] = [];

            for (const it of resolvedItems) {
                const price = priceMap.get(it.product_id);
                if (price === undefined) {
                    throw new BadRequestException(
                        `Sản phẩm id=${it.product_id} không tồn tại hoặc không có giá`,
                    );
                }

                const key = `${it.product_id}:${it.size_id}`;
                if (!stockMap.has(key)) {
                    throw new BadRequestException(
                        `Sản phẩm id=${it.product_id} chưa có tồn kho cho size_id=${it.size_id} (product_sizes)`,
                    );
                }

                const stock = stockMap.get(key)!;
                if (stock < it.quantity) {
                    throw new BadRequestException(
                        `Sản phẩm id=${it.product_id} size_id=${it.size_id} không đủ tồn kho (còn ${stock}, cần ${it.quantity})`,
                    );
                }

                subTotal += price * it.quantity;
                orderItemsToInsert.push({
                    product_id: it.product_id,
                    quantity: it.quantity,
                    size_id: it.size_id,
                    price,
                });
            }

            // 8) voucher
            let discount = 0;
            let voucherId: number | null = null;
            let userVoucherId: number | null = null;

            if (voucher_code) {
                const res = await this.vouchersService.validateForUser(
                    userId,
                    voucher_code,
                    subTotal,
                );
                discount = res.discount || 0;
                voucherId = res.voucher_id ?? null;
                userVoucherId = res.user_voucher_id ?? null;
            }

            const shippingFee = 30000;
            let totalAmount = subTotal - discount + shippingFee;
            if (totalAmount < 0) totalAmount = 0;

            // 9) insert order
            const [orderResult] = await conn.execute(
                `
        INSERT INTO orders (
          user_id, address_id, payment_method_id, voucher_id,
          order_date, sub_total, discount, shipping_fee, total_amount,
          status, shipping_address, payment_method
        )
        VALUES (?, ?, ?, ?, NOW(), ?, ?, ?, ?, 'pending', ?, ?)
        `,
                [
                    userId,
                    address_id,
                    paymentMethodId,
                    voucherId,
                    subTotal,
                    discount,
                    shippingFee,
                    totalAmount,
                    shippingAddress,
                    paymentEnum,
                ],
            );
            const orderId = (orderResult as any).insertId;

            // 10) insert order_items (lưu size_id hoặc size_value tuỳ bạn thiết kế cột)
            // hiện bạn đang có oi.size (string). Nếu muốn lưu size_value: JOIN sizes lấy size_value.
            // Ở đây mình lưu size_id vào oi.size luôn (string) để khỏi sửa schema:
            for (const oi of orderItemsToInsert) {
                await conn.execute(
                    `INSERT INTO order_items (order_id, product_id, quantity, size, price) VALUES (?, ?, ?, ?, ?)`,
                    [
                        orderId,
                        oi.product_id,
                        oi.quantity,
                        String(oi.size_id),
                        oi.price,
                    ],
                );
            }

            // 11) trừ kho trong product_sizes
            for (const oi of orderItemsToInsert) {
                const [upd] = await conn.execute(
                    `UPDATE product_sizes
           SET stock = stock - ?
           WHERE product_id = ? AND size_id = ? AND stock >= ?`,
                    [oi.quantity, oi.product_id, oi.size_id, oi.quantity],
                );
                const affected = (upd as any).affectedRows ?? 0;
                if (!affected) {
                    throw new BadRequestException(
                        `Không thể trừ tồn kho product_id=${oi.product_id} size_id=${oi.size_id}`,
                    );
                }
            }

            // 12) clear cart
            const [cartRows] = await conn.query(
                'SELECT id FROM carts WHERE user_id = ? LIMIT 1',
                [userId],
            );
            const cartId = (cartRows as any[])[0]?.id;
            if (cartId) {
                await conn.execute('DELETE FROM cart_items WHERE cart_id = ?', [
                    cartId,
                ]);
            }

            // 13) mark voucher used
            if (userVoucherId) {
                await this.vouchersService.markUsed(userVoucherId);
            }

            await conn.commit();

            // 14) momo mock
            const isMomo =
                String(paymentType || '').toUpperCase() === 'WALLET' &&
                String(paymentBrand || '').toUpperCase() === 'MOMO';

            const feBase = process.env.FRONTEND_URL || 'http://localhost:3000';
            const momoPayUrl =
                `${feBase}/momo-mock/pay?` +
                `orderId=${encodeURIComponent(String(orderId))}` +
                `&amount=${encodeURIComponent(String(Math.round(totalAmount)))}` +
                `&orderInfo=${encodeURIComponent(`Thanh toán đơn hàng #${orderId}`)}`;

            return {
                id: orderId,
                user_id: userId,
                address_id,
                payment_method_id: paymentMethodId,
                voucher_id: voucherId,
                sub_total: subTotal,
                discount,
                shipping_fee: shippingFee,
                total_amount: totalAmount,
                status: 'pending',
                shipping_address: shippingAddress,
                payment_method: paymentEnum,
                momo: isMomo ? { payUrl: momoPayUrl } : null,
            };
        } catch (e) {
            await conn.rollback();
            throw e;
        } finally {
            conn.release();
        }
    }

    async cancelOrder(orderId: number, userId: number) {
        if (!orderId) throw new BadRequestException('Thiếu id đơn hàng');

        const rows: any[] = await this.db.query(
            'SELECT * FROM orders WHERE id = ?',
            [orderId],
        );
        const order = rows[0];

        if (!order) {
            throw new NotFoundException('Không tìm thấy đơn hàng');
        }

        // kiểm tra đơn có thuộc về user không
        if (order.user_id !== userId) {
            throw new BadRequestException(
                'Bạn không có quyền hủy đơn hàng này',
            );
        }

        // chỉ cho phép hủy nếu đang ở các trạng thái này
        const notCancelableStatuses = ['shipped', 'delivered', 'cancelled'];
        if (notCancelableStatuses.includes(order.status)) {
            throw new BadRequestException(
                'Không thể hủy đơn hàng ở trạng thái hiện tại',
            );
        }

        await this.db.query(
            'UPDATE orders SET status = "cancelled" WHERE id = ?',
            [orderId],
        );

        return {
            ok: true,
            message: 'Đã hủy đơn hàng',
            id: orderId,
            status: 'cancelled',
        };
    }

    async updatePaymentStatusByOrderId(
        orderId: number,
        payload: {
            payment_method?: string;
            payment_status?: 'pending' | 'paid' | 'failed';
            payment_ref?: string;
            status?: string;
            momo_trans_id?: string;
            momo_message?: string;
        },
    ) {
        const id = Number(orderId);
        if (!id || Number.isNaN(id)) {
            throw new BadRequestException('orderId không hợp lệ');
        }

        const updates: string[] = [];
        const values: any[] = [];

        if (payload.status !== undefined) {
            updates.push('status = ?');
            values.push(payload.status);
        }
        if (payload.momo_trans_id !== undefined) {
            updates.push('momo_trans_id = ?');
            values.push(payload.momo_trans_id);
        }
        if (payload.momo_message !== undefined) {
            updates.push('momo_message = ?');
            values.push(payload.momo_message);
        }

        if (updates.length === 0) {
            return { ok: true, message: 'Không có dữ liệu cập nhật' };
        }

        // 1) Thử update đầy đủ
        try {
            values.push(id);
            await this.db.query(
                `UPDATE orders SET ${updates.join(', ')} WHERE id = ?`,
                values,
            );
            return { ok: true };
        } catch (e: any) {
            // 2) Fallback: DB chưa có cột momo_*, chỉ update status
            if (payload.status !== undefined) {
                await this.db.query(
                    'UPDATE orders SET status = ? WHERE id = ?',
                    [payload.status, id],
                );
                return { ok: true, fallback: true };
            }
            throw e;
        }
    }
}
