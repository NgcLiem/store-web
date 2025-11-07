export const runtime = "nodejs";
import pool from "@/lib/db.js";

// GET /api/users?q=
export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);
        const q = (searchParams.get("q") || "").trim();

        let sql = `
      SELECT id, email, full_name, phone, address, role, created_at
      FROM users
      WHERE role = 'customer'
    `;
        const params = [];
        if (q) {
            sql += ` AND (email LIKE ? OR full_name LIKE ? OR phone LIKE ?)`;
            params.push(`%${q}%`, `%${q}%`, `%${q}%`);
        }
        sql += ` ORDER BY id DESC`;

        const [rows] = await pool.query(sql, params);
        // trả thêm field active giả để UI không lỗi (luôn true)
        const out = rows.map(r => ({ ...r, active: true }));
        return Response.json(out, { status: 200 });
    } catch (e) {
        console.error("USERS GET:", e);
        return Response.json({ message: "Server error" }, { status: 500 });
    }
}
