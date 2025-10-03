import pool from "@/lib/db";

export async function POST(req) {
    try {
        const body = await req.json();
        const { email, password } = body;

        const [rows] = await pool.query(
            "SELECT * FROM users WHERE email = ? AND password = ?",
            [email, password]
        );

        if (rows.length > 0) {
            return new Response(JSON.stringify({ success: true, user: rows[0] }), { status: 200 });
        } else {
            return new Response(JSON.stringify({ success: false, message: "Sai tài khoản hoặc mật khẩu" }), { status: 401 });
        }
    } catch (error) {
        console.error(error);
        return new Response(JSON.stringify({ success: false, message: "Lỗi server" }), { status: 500 });
    }
}
