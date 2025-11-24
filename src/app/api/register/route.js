import bcrypt from "bcryptjs";
import pool from "@/lib/db.js";

export async function POST(req) {
    try {
        const { email, password, fullName, phone, address, sex } = await req.json();

        if (!email || !password || !fullName || !phone || !address || !sex) {
            return new Response(JSON.stringify({ message: "Thiếu thông tin!" }), { status: 400 });
        }

        // Check email tồn tại
        const [exists] = await pool.query("SELECT id FROM users WHERE email = ?", [email]);
        if (exists.length > 0) {
            return new Response(JSON.stringify({ message: "Email đã tồn tại!" }), { status: 400 });
        }

        // Hash mật khẩu
        const hashedPassword = await bcrypt.hash(password, 10);

        // Tạo user mới
        const [result] = await pool.query(
            "INSERT INTO users (email, password, full_name, phone, address, role, sex) VALUES (?, ?, ?, ?, ?, ?, ?)",
            [email, hashedPassword, fullName, phone, address, "customer", sex]
        );

        const newUserId = result.insertId; // ID user vừa tạo

        // 🔥 Tạo luôn giỏ hàng cho user mới
        await pool.query(
            "INSERT INTO carts (user_id, status) VALUES (?, 'active')",
            [newUserId]
        );

        return new Response(JSON.stringify({ message: "Đăng ký thành công!" }), { status: 200 });

    } catch (error) {
        console.error("Register error:", error);
        return new Response(JSON.stringify({ message: "Lỗi server!" }), { status: 500 });
    }
}
