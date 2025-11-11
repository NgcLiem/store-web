export const runtime = "nodejs";

import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import pool from "@/lib/db.js";

const JWT_SECRET = process.env.JWT_SECRET || "donidg-secret";     // nhớ đặt biến môi trường trong .env
const JWT_TTL = "5m";                                             // thời hạn token

export async function POST(req) {
    try {
        // 1) Đọc body
        let body;
        try {
            body = await req.json();
        }
        catch {
            return Response.json({ message: "Body không hợp lệ" }, { status: 400 });
        }

        const { email, password } = body || {};
        if (!email || !password) {
            return Response.json({ message: "Thiếu email hoặc mật khẩu" }, { status: 400 });
        }

        // 2) Lấy user
        const [rows] = await pool.query(
            "SELECT id, email, role, password FROM users WHERE email = ?",
            [email]
        );
        if (!rows?.length) {
            return Response.json({ message: "Email không tồn tại" }, { status: 404 });
        }
        const user = rows[0];

        // 3) So sánh mật khẩu
        const ok = await bcrypt.compare(password, user.password);
        if (!ok) {
            return Response.json({ message: "Mật khẩu sai" }, { status: 401 });
        }

        // 4) Tạo JWT
        const payload = { id: user.id, email: user.email, role: user.role };
        const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_TTL });

        // (tuỳ chọn) nếu muốn set HttpOnly cookie thay vì trả token trong JSON:
        // const headers = {
        //   "Set-Cookie": `token=${token}; Path=/; HttpOnly; Max-Age=3600; SameSite=Lax;`
        // };
        // return new Response(JSON.stringify({ user: payload }), { status: 200, headers });

        // 5) Trả JSON (frontend sẽ lưu token và dùng /api/me để verify)
        return Response.json({
            user: payload,
            token,
            expiresIn: 300,              // giây
        }, { status: 200 });

    } catch (err) {
        console.error("Login error:", err.code || err.message, err);
        let msg = "Lỗi server!";
        if (err?.code === "ECONNREFUSED") msg = "Không kết nối được DB";
        if (err?.code === "ER_NO_SUCH_TABLE") msg = "Thiếu bảng users trong DB";
        return Response.json({ message: msg, code: err?.code }, { status: 500 });
    }
}
