import bcrypt from "bcryptjs";
import pool from "@/lib/db.js";

export async function POST(req) {
    try {
        const { email, password } = await req.json();
        if (!email || !password)
            return new Response(JSON.stringify({ message: "Sai thông tin đăng nhập" }), { status: 500 });

        const [result] = await pool.query("SELECT * FROM users WHERE email = ?", [email]);

        if (result.length === 0)
            return new Response(JSON.stringify({ message: "Email không tồn tại!" }), { status: 500 });

        const user = result[0];
        const match = await bcrypt.compare(password, user.password);

        if (!match)
            return new Response(JSON.stringify({ message: "Mật khẩu sai" }), { status: 500 });

        return new Response(JSON.stringify({
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
            },
        }),
            { status: 200 });
    } catch (error) {
        console.error("Login error:", error);
        return new Response(JSON.stringify({ message: "Lỗi server!" }), { status: 500 });
    }
}
