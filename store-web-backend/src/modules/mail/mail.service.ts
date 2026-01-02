import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
    private transporter: nodemailer.Transporter;

    constructor() {
        this.transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.MAIL_USER,
                pass: process.env.MAIL_PASS,
            },
        });
    }

    async sendResetPasswordMail(to: string, resetLink: string) {
        const mailOptions: nodemailer.SendMailOptions = {
            from: `"DONIDG Store" <${process.env.MAIL_USER}>`,
            to,
            subject: 'Khôi phục mật khẩu DONIDG Store',
            html: `
        <p>Xin chào,</p>
        <p>Bạn đã yêu cầu đặt lại mật khẩu cho tài khoản tại DONIDG Store.</p>
        <p>Hãy nhấn vào link dưới đây để đặt lại mật khẩu (có hiệu lực trong 15 phút):</p>
        <p><a href="${resetLink}" target="_blank">${resetLink}</a></p>
        <p>Nếu bạn không yêu cầu, hãy bỏ qua email này.</p>
        <hr/>
        <p>Trân trọng,<br/>DONIDG Store</p>
      `,
        };

        await this.transporter.sendMail(mailOptions);
    }
}
