import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { DatabaseService } from '../../database/services/database.service';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { MailService } from '../mail/mail.service';

@Injectable()
export class AuthService {
    constructor(
        private jwtService: JwtService,
        private db: DatabaseService,
        private mailService: MailService,
    ) { }

    async login(email: string, password: string) {
        console.log('LOGIN INPUT:', email);

        const rows = await this.db.query<any>(
            'SELECT id, email, password, role, status FROM users WHERE email = ? LIMIT 1',
            [email],
        );

        console.log('LOGIN ROWS:', rows);

        const user = rows[0];

        if (!user) {
            throw new UnauthorizedException('Email không tồn tại');
        }

        if (user.status !== 'active') {
            throw new UnauthorizedException('Tài khoản của bạn đang bị khoá hoặc chưa được kích hoạt');
        }

        const match = await bcrypt.compare(password, user.password);
        console.log('PASSWORD MATCH =', match);

        if (!match) {
            throw new UnauthorizedException('Sai mật khẩu');
        }

        const payload = {
            id: user.id,
            email: user.email,
            role: user.role,
        };

        const token = this.jwtService.sign(payload);

        console.log('LOGIN SUCCESS, payload =', payload);

        return {
            user: payload,
            token,
            expiresIn: 3600,
        };
    }

    async register(dto: { email: string; password: string; fullName: string; sex: string; }) {
        const { email, password, fullName, sex } = dto;

        if (!email || !password || !fullName || !sex) {
            throw new BadRequestException('Thiếu thông tin!');
        }

        const existing = await this.db.query<any>(
            'SELECT id FROM users WHERE email = ? LIMIT 1',
            [email],
        );

        if (existing.length > 0) {
            throw new BadRequestException('Email đã tồn tại!');
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const insertResult: any = await this.db.query(
            'INSERT INTO users (email, password, full_name, role, sex, status) VALUES (?, ?, ?, ?, ?, ?)',
            [email, hashedPassword, fullName, 'customer', sex, 'active'],
        );

        const newUserId =
            insertResult?.insertId ?? insertResult?.[0]?.insertId ?? null;

        if (newUserId) {
            await this.db.query('INSERT INTO carts (user_id) VALUES (?)', [
                newUserId,
            ]);
        }

        return {
            message: 'Đăng ký thành công! Vui lòng đăng nhập.',
        };
    }

    async resetPassword(token: string, newPassword: string) {
        if (!token || !newPassword) {
            throw new BadRequestException('Thiếu dữ liệu!');
        }

        const rows = await this.db.query<any>(
            'SELECT * FROM users WHERE reset_token = ? AND reset_expires > NOW()',
            [token],
        );

        if (!rows || rows.length === 0 || rows[0].status !== 'active') {
            throw new BadRequestException('Token không hợp lệ hoặc đã hết hạn!');
        }

        const user = rows[0];

        const hashed = await bcrypt.hash(newPassword, 10);

        await this.db.query(
            'UPDATE users SET password = ?, reset_token = NULL, reset_expires = NULL WHERE id = ?',
            [hashed, user.id],
        );

        return { message: 'Đặt lại mật khẩu thành công!' };
    }

    async forgotPassword(email: string) {
        if (!email) {
            throw new BadRequestException('Thiếu email!');
        }

        const rows = await this.db.query<any>(
            'SELECT id, email, status FROM users WHERE email = ? LIMIT 1',
            [email],
        );

        if (!rows || rows.length === 0 || rows[0].status !== 'active') {
            return {
                message:
                    'Nếu email tồn tại, link đặt lại mật khẩu đã được gửi. Hãy kiểm tra hộp thư của bạn.',
            };
        }

        const user = rows[0];

        const token = crypto.randomBytes(32).toString('hex');
        const EXPIRE_MINUTES = 15;

        await this.db.query(
            'UPDATE users SET reset_token = ?, reset_expires = DATE_ADD(NOW(), INTERVAL ? MINUTE) WHERE id = ?',
            [token, EXPIRE_MINUTES, user.id],
        );

        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
        const resetLink = `${frontendUrl}/reset-password?token=${token}`;

        await this.mailService.sendResetPasswordMail(email, resetLink);

        return {
            message:
                'Nếu email tồn tại, link đặt lại mật khẩu đã được gửi. Hãy kiểm tra hộp thư của bạn.',
        };
    }

    async seedAdmin() {
        const email = 'admin@example.com';
        const password = 'admin123';
        const fullName = 'Admin User';

        const hashedPassword = await bcrypt.hash(password, 10);

        try {
            await this.db.query(
                'INSERT IGNORE INTO users (email, password, full_name, role) VALUES (?, ?, ?, ?)',
                [email, hashedPassword, fullName, 'admin'],
            );

            return { message: 'Admin user seeded!' };
        } catch (err) {
            throw new BadRequestException('Không thể tạo admin: ' + err.message);
        }
    }

    async changePassword(userId: number, oldPassword: string, newPassword: string) {
        if (!oldPassword || !newPassword) {
            throw new BadRequestException('Thiếu mật khẩu cũ hoặc mới!');
        }

        if (oldPassword === newPassword) {
            throw new BadRequestException('Mật khẩu mới phải khác mật khẩu cũ!');
        }

        const rows = await this.db.query<any>(
            'SELECT id, password FROM users WHERE id = ? LIMIT 1',
            [userId],
        );

        if (!rows || rows.length === 0) {
            throw new BadRequestException('Không tìm thấy người dùng!');
        }

        const user = rows[0];
        const match = await bcrypt.compare(oldPassword, user.password);

        if (!match) {
            throw new BadRequestException('Mật khẩu cũ không chính xác!');
        }

        const hashed = await bcrypt.hash(newPassword, 10);
        await this.db.query('UPDATE users SET password = ? WHERE id = ?', [hashed, userId]);

        return { message: 'Đổi mật khẩu thành công!' };
    }

    private async upsertProductSizes(productId: number, sizes: any[]) {
        // sizes: [{ size_id, stock }]
        if (!Array.isArray(sizes)) return;

        // lọc hợp lệ
        const cleaned = sizes
            .map(s => ({
                size_id: Number(s.size_id),
                stock: Math.max(0, Number(s.stock || 0)),
            }))
            .filter(s => Number.isInteger(s.size_id) && s.size_id > 0);

        // nếu không có sizes => không làm gì (hoặc bạn muốn clear thì xử lý riêng)
        if (cleaned.length === 0) return;

        // (Tuỳ chọn) validate size_id có tồn tại trong sizes
        const ids = cleaned.map(x => x.size_id);
        const exist = await this.db.query<any>(
            `SELECT id FROM sizes WHERE id IN (${ids.map(() => '?').join(',')})`,
            ids,
        );

    }
}