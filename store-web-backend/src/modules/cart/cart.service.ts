import { Injectable, BadRequestException, ForbiddenException } from '@nestjs/common';
import { DatabaseService } from '../../database/services/database.service';

@Injectable()
export class CartService {
    constructor(private readonly db: DatabaseService) { }

    private async ensureCart(user_id: number): Promise<number> {
        const carts = await this.db.query<any>(
            'SELECT id FROM carts WHERE user_id = ? LIMIT 1',
            [user_id],
        );
        if (carts.length > 0) return carts[0].id;

        const result = await this.db.execute(
            'INSERT INTO carts (user_id) VALUES (?)',
            [user_id],
        );

        return result.insertId;
    }

    async getUserCart(user_id: number) {
        const cartId = await this.ensureCart(user_id);

        const items = await this.db.query<any>(
            `
      SELECT 
        ci.id as cart_item_id,
        ci.quantity,
        ci.size,
        p.id as product_id,
        p.name,
        p.price,
        p.image_url
      FROM cart_items ci
      JOIN products p ON p.id = ci.product_id
      WHERE ci.cart_id = ?
      ORDER BY ci.id DESC
      `,
            [cartId],
        );

        return { cart_id: cartId, user_id, items };
    }

    // POST /cart/items
    async addItem(user_id: number, body: any) {
        const product_id = Number(body.product_id);
        const quantity = Math.max(1, Number(body.quantity || 1));
        const size = body.size ? String(body.size) : null;

        if (!user_id || !product_id) throw new BadRequestException('Thiếu product_id');

        const cartId = await this.ensureCart(user_id);

        const existing = await this.db.query<any>(
            'SELECT id, quantity FROM cart_items WHERE cart_id = ? AND product_id = ? AND (size <=> ?)',
            [cartId, product_id, size],
        );

        if (existing.length > 0) {
            const item = existing[0];
            await this.db.execute(
                'UPDATE cart_items SET quantity = ? WHERE id = ?',
                [item.quantity + quantity, item.id],
            );
            return { ok: true };
        }

        await this.db.execute(
            'INSERT INTO cart_items (cart_id, product_id, size, quantity) VALUES (?, ?, ?, ?)',
            [cartId, product_id, size, quantity],
        );

        return { ok: true };
    }

    // PATCH /cart/items/:id
    async updateItem(user_id: number, cartItemId: number, body: any) {
        const quantity = Math.max(1, Number(body.quantity || 1));

        const rows = await this.db.query<any>(
            `
    SELECT ci.id
    FROM cart_items ci
    JOIN carts c ON c.id = ci.cart_id
    WHERE ci.id = ? AND c.user_id = ?
    `,
            [cartItemId, user_id],
        );

        if (!rows[0]) {
            throw new ForbiddenException('Không có quyền sửa item này');
        }

        await this.db.execute(
            'UPDATE cart_items SET quantity = ? WHERE id = ?',
            [quantity, cartItemId],
        );

        return { ok: true };
    }


    // DELETE /cart/items/:id
    async removeItem(user_id: number, cartItemId: number) {
        const rows = await this.db.query<any>(
            `
    SELECT ci.id
    FROM cart_items ci
    JOIN carts c ON c.id = ci.cart_id
    WHERE ci.id = ? AND c.user_id = ?
    `,
            [cartItemId, user_id],
        );

        if (!rows[0]) {
            throw new ForbiddenException('Không có quyền xoá item này');
        }

        await this.db.execute('DELETE FROM cart_items WHERE id = ?', [cartItemId]);
        return { ok: true };
    }


    // DELETE /cart/clear
    async clearUserCart(user_id: number) {
        const carts = await this.db.query<any>(
            'SELECT id FROM carts WHERE user_id = ? LIMIT 1',
            [user_id],
        );
        if (!carts[0]) return { ok: true };

        await this.db.execute('DELETE FROM cart_items WHERE cart_id = ?', [carts[0].id]);
        return { ok: true };
    }
}
