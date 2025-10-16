import bcrypt from "bcryptjs";
import pool from "@/lib/db";

export async function POST(req) {
    try {
        const { token, newPassword } = await req.json();

        if (!token || !newPassword)
            return new Response(JSON.stringify({ message: "Thiếu dữ liệu!" }), { status: 400 });

        const [rows] = await pool.query(
            "SELECT * FROM users WHERE reset_token = ? AND reset_expires > NOW()",
            [token]
        );

        if (rows.length === 0)
            return new Response(
                JSON.stringify({ message: "Token không hợp lệ hoặc đã hết hạn!" }),
                { status: 400 }
            );

        const hashed = await bcrypt.hash(newPassword, 10);

        await pool.query(
            "UPDATE users SET password = ?, reset_token = NULL, reset_expires = NULL WHERE id = ?",
            [hashed, rows[0].id]
        );

        return new Response(JSON.stringify({ message: "Đặt lại mật khẩu thành công!" }), {
            status: 200,
        });
    } catch (error) {
        console.error("Reset password error:", error);
        return new Response(JSON.stringify({ message: "Lỗi server!" }), { status: 500 });
    }
}
