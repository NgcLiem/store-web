import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/services/database.service';

@Injectable()
export class UsersService {
    constructor(private readonly db: DatabaseService) { }

    async findAll() {
        return this.db.query('SELECT * FROM users');
    }

    async findOne(id: number) {
        const rows = await this.db.query('SELECT * FROM users WHERE id = ?', [id]);
        return rows[0] || null;
    }

    async updateStatus(id: number, status: string) {
        const normalized =
            status === 'active' || status === 'inactive'
                ? status
                : status
                    ? 'active'
                    : 'inactive';

        await this.db.query(
            'UPDATE users SET status = ? WHERE id = ?',
            [normalized, id],
        );

        return { id, status: normalized };
    }


}
