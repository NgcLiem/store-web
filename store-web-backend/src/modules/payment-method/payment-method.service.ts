import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../../database/services/database.service';

@Injectable()
export class PaymentMethodsService {
    constructor(private readonly db: DatabaseService) { }

    async findAllByUser(userId: number) {
        return this.db.query(
            'SELECT * FROM payment_methods WHERE user_id = ? AND status = "ACTIVE" ORDER BY is_default DESC, id DESC',
            [userId],
        );
    }

    async create(userId: number, dto: any) {
        const isDefault = dto.is_default ? 1 : 0;

        if (isDefault) {
            await this.db.query('UPDATE payment_methods SET is_default = 0 WHERE user_id = ?', [
                userId,
            ]);
        }

        const result: any = await this.db.query(
            `INSERT INTO payment_methods (user_id, type, brand, last4, holder_name, token, is_default)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
                userId,
                dto.type,
                dto.brand,
                dto.last4,
                dto.holder_name,
                dto.token || null,
                isDefault,
            ],
        );

        const [row] = await this.db.query('SELECT * FROM payment_methods WHERE id = ?', [
            result.insertId,
        ]);
        return row;
    }

    async setDefault(userId: number, id: number) {
        const [pm]: any[] = await this.db.query(
            'SELECT * FROM payment_methods WHERE id = ?',
            [id],
        );
        if (!pm) throw new NotFoundException();
        if (pm.user_id !== userId) throw new ForbiddenException();

        await this.db.query('UPDATE payment_methods SET is_default = 0 WHERE user_id = ?', [
            userId,
        ]);
        await this.db.query('UPDATE payment_methods SET is_default = 1 WHERE id = ?', [id]);

        const [updated] = await this.db.query('SELECT * FROM payment_methods WHERE id = ?', [
            id,
        ]);
        return updated;
    }

    async remove(userId: number, id: number) {
        const [pm]: any[] = await this.db.query(
            'SELECT * FROM payment_methods WHERE id = ?',
            [id],
        );
        if (!pm) throw new NotFoundException();
        if (pm.user_id !== userId) throw new ForbiddenException();

        await this.db.query('DELETE FROM payment_methods WHERE id = ?', [id]);
        return { message: 'Đã xoá phương thức thanh toán' };
    }
}
