import bcrypt from "bcryptjs";
import pool from "@/lib/db.js";

export async function POST(req) {
    try {
        console.log(1)
        const { email, password, fullName, phone, address, sex } = await req.json();
        if (!email || !password || !fullName || !phone || !address || !sex) {
            console.log(1)
            return new Response(JSON.stringify({ message: "Thiếu thông tin!" }), { status: 500 });
        }

        const [exists] = await pool.query("SELECT id FROM users WHERE email = ?", [email]);
        if (exists.length > 0) {
            return new Response(JSON.stringify({ message: "Email đã tồn tại!" }), { status: 500 });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await pool.query(
            "INSERT INTO users (email, password, full_name, phone, address, role, sex) VALUES (?, ?, ?, ?, ?, ?, ?)",
            [email, hashedPassword, fullName, phone, address, "customer", sex]
        );

        return new Response(JSON.stringify({ message: "Đăng ký thành công!" }), { status: 200 });
    } catch (error) {
        console.error("Register error:", error);
        return new Response(JSON.stringify(({ message: "Lỗi server!" }), { status: 500 }));
    }
}
