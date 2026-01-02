import {
    Injectable,
    ForbiddenException,
    NotFoundException,
} from '@nestjs/common';
import { DatabaseService } from '../../database/services/database.service';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';

@Injectable()
export class AddressesService {
    constructor(private readonly db: DatabaseService) {}

    async findAllByUser(userId: number) {
        return this.db.query(
            'SELECT * FROM addresses WHERE user_id = ? ORDER BY is_default DESC, id DESC',
            [userId],
        );
    }

    async create(userId: number, dto: CreateAddressDto) {
        const isDefault = dto.isDefault ? 1 : 0;

        if (isDefault) {
            await this.db.query(
                'UPDATE addresses SET is_default = 0 WHERE user_id = ?',
                [userId],
            );
        }

        const result: any = await this.db.query(
            'INSERT INTO addresses (user_id, full_name, phone, address_line, is_default) VALUES (?, ?, ?, ?, ?)',
            [userId, dto.fullName, dto.phone, dto.addressLine, isDefault],
        );

        const [row] = await this.db.query(
            'SELECT * FROM addresses WHERE id = ?',
            [result.insertId],
        );
        return row;
    }

    async update(userId: number, id: number, dto: UpdateAddressDto) {
        const [addr]: any[] = await this.db.query(
            'SELECT * FROM addresses WHERE id = ?',
            [id],
        );
        if (!addr) throw new NotFoundException('Không tìm thấy địa chỉ');
        if (addr.user_id !== userId) throw new ForbiddenException();

        const full_name = dto.fullName ?? addr.full_name;
        const phone = dto.phone ?? addr.phone;
        const address_line = dto.addressLine ?? addr.address_line;

        await this.db.query(
            'UPDATE addresses SET full_name = ?, phone = ?, address_line = ? WHERE id = ?',
            [full_name, phone, address_line, id],
        );

        const [updated] = await this.db.query(
            'SELECT * FROM addresses WHERE id = ?',
            [id],
        );
        return updated;
    }

    async remove(userId: number, id: number) {
        const [addr]: any[] = await this.db.query(
            'SELECT * FROM addresses WHERE id = ?',
            [id],
        );
        if (!addr) throw new NotFoundException();
        if (addr.user_id !== userId) throw new ForbiddenException();

        await this.db.query('DELETE FROM addresses WHERE id = ?', [id]);
        return { message: 'Đã xoá địa chỉ' };
    }

    async setDefault(userId: number, id: number) {
        const [addr]: any[] = await this.db.query(
            'SELECT * FROM addresses WHERE id = ?',
            [id],
        );
        if (!addr) throw new NotFoundException();
        if (addr.user_id !== userId) throw new ForbiddenException();

        await this.db.query(
            'UPDATE addresses SET is_default = 0 WHERE user_id = ?',
            [userId],
        );
        await this.db.query(
            'UPDATE addresses SET is_default = 1 WHERE id = ?',
            [id],
        );

        const [updated] = await this.db.query(
            'SELECT * FROM addresses WHERE id = ?',
            [id],
        );
        return updated;
    }
}
