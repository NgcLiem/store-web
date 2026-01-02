import { Injectable, BadRequestException } from '@nestjs/common';
import { DatabaseService } from '../../database/services/database.service';

@Injectable()
export class VouchersService {
    constructor(private readonly db: DatabaseService) { }

    async getMyVouchers(userId: number) {
        const sql = `
      SELECT uv.id AS user_voucher_id,
             uv.status AS user_status,
             uv.used_count,
             uv.last_used_at,
             v.*
      FROM user_vouchers uv
      JOIN vouchers v ON v.id = uv.voucher_id
      WHERE uv.user_id = ?
      ORDER BY v.end_date ASC
    `;
        return this.db.query(sql, [userId]);
    }

    async validateForUser(userId: number, code: string, orderTotal: number) {
        const rows: any[] = await this.db.query(
            `
      SELECT uv.*, v.*
      FROM user_vouchers uv
      JOIN vouchers v ON v.id = uv.voucher_id
      WHERE uv.user_id = ? AND v.code = ? LIMIT 1
      `,
            [userId, code],
        );
        const item = rows[0];
        if (!item) throw new BadRequestException('Voucher không hợp lệ');

        const now = new Date();
        if (new Date(item.start_date) > now || new Date(item.end_date) < now) {
            throw new BadRequestException('Voucher đã hết hạn hoặc chưa bắt đầu');
        }
        if (item.user_status !== 'AVAILABLE') {
            throw new BadRequestException('Voucher đã được sử dụng hoặc bị khoá');
        }
        if (orderTotal < Number(item.min_order_amount || 0)) {
            throw new BadRequestException('Chưa đủ điều kiện giá trị đơn hàng');
        }

        let discount = 0;
        if (item.discount_type === 'PERCENT') {
            discount = (orderTotal * Number(item.discount_value)) / 100;
            if (item.max_discount_amount) {
                discount = Math.min(discount, Number(item.max_discount_amount));
            }
        } else if (item.discount_type === 'AMOUNT') {
            discount = Number(item.discount_value);
        } else if (item.discount_type === 'FREESHIP') {
            discount = Number(item.discount_value);
        }

        return {
            code: item.code,
            voucher_id: item.voucher_id,
            user_voucher_id: item.id,
            discount,
            finalTotal: orderTotal - discount,
        };
    }

    async markUsed(userVoucherId: number) {
        await this.db.query(
            `UPDATE user_vouchers
       SET used_count = used_count + 1,
           last_used_at = NOW(),
           status = 'USED'
       WHERE id = ?`,
            [userVoucherId],
        );
    }
}
