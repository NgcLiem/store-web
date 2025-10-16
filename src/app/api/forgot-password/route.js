import pool from "@/lib/db";
import crypto from "crypto";
import nodemailer from "nodemailer";

export async function POST(req) {
    try {
        const { email } = await req.json();

        if (!email)
            return new Response(JSON.stringify({ message: "Vui lòng nhập email!" }), { status: 400 });

        const [rows] = await pool.query("SELECT * FROM users WHERE email = ?", [email]);
        if (rows.length === 0)
            return new Response(JSON.stringify({ message: "Email không tồn tại!" }), { status: 404 });

        // Sinh token ngẫu nhiên
        const token = crypto.randomBytes(32).toString("hex");
        const expires = new Date(Date.now() + 1000 * 60 * 30); // hết hạn 30 phút

        // Lưu token vào DB
        await pool.query(
            "UPDATE users SET reset_token = ?, reset_expires = ? WHERE email = ?",
            [token, expires, email]
        );

        // Gửi email
        const resetLink = `http://localhost:3000/reset-password?token=${token}`;

        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: "your_gmail@gmail.com",
                pass: "app_password_16_ký_tự",
            },
        });

        await transporter.sendMail({
            from: "DONIDG Store <your_gmail@gmail.com>",
            to: email,
            subject: "Khôi phục mật khẩu của bạn",
            html: `
        <p>Xin chào,</p>
        <p>Bạn vừa yêu cầu khôi phục mật khẩu. Hãy bấm vào liên kết dưới đây để đặt lại mật khẩu:</p>
        <a href="${resetLink}">${resetLink}</a>
        <p>Liên kết này sẽ hết hạn sau 30 phút.</p>
      `,
        });

        return new Response(JSON.stringify({ message: "Link khôi phục đã được gửi qua email!" }), {
            status: 200,
        });
    } catch (error) {
        console.error("Forgot password error:", error);
        return new Response(JSON.stringify({ message: "Lỗi server!" }), { status: 500 });
    }
}
