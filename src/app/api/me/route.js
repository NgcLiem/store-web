export const runtime = "nodejs";

import jwt from "jsonwebtoken";
import pool from "@/lib/db.js";
const JWT_SECRET = process.env.JWT_SECRET || "donidg-secret";

export async function GET(req) {
    try {
        const auth = req.headers.get("authorization");
        if (!auth) return Response.json({ message: "Thiếu token" }, { status: 401 });

        const token = auth.split(" ")[1];
        const decoded = jwt.verify(token, JWT_SECRET);

        const [rows] = await pool.query(
            "SELECT id, email, role, full_name FROM users WHERE id = ?",
            [decoded.id]
        );
        if (!rows.length) return Response.json({ message: "User không tồn tại" }, { status: 404 });

        return Response.json({ user: rows[0] }, { status: 200 });
    } catch (e) {
        return Response.json({ message: "Token không hợp lệ hoặc hết hạn" }, { status: 401 });
    }
}
