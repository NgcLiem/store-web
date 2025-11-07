export const runtime = "nodejs";
import pool from "@/lib/db.js";
import bcrypt from "bcryptjs";

// GET /api/staffs?q=
export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);
        const q = (searchParams.get("q") || "").trim();

        let sql = `
      SELECT id, email, full_name, created_at
      FROM users
      WHERE role = 'staff'
    `;
        const params = [];
        if (q) {
            sql += ` AND (email LIKE ? OR full_name LIKE ?)`;
            params.push(`%${q}%`, `%${q}%`);
        }
        sql += ` ORDER BY id DESC`;

        const [rows] = await pool.query(sql, params);
        // thêm active giả cho UI
        const out = rows.map(r => ({ ...r, active: true }));
        return Response.json(out, { status: 200 });
    } catch (e) {
        console.error("STAFF GET:", e);
        return Response.json({ message: "Server error" }, { status: 500 });
    }
}

// POST /api/staffs
export async function POST(req) {
    try {
        const { email, full_name } = await req.json();
        if (!email) return Response.json({ message: "Thiếu email" }, { status: 400 });

        const defaultPassword = "Staff@123";
        const hash = await bcrypt.hash(defaultPassword, 10);

        const [rs] = await pool.query(
            `INSERT INTO users (email, password, role, full_name)
       VALUES (?, ?, 'staff', ?)`,
            [email, hash, full_name || null]
        );
        return Response.json({ id: rs.insertId, temp_password: defaultPassword }, { status: 201 });
    } catch (e) {
        console.error("STAFF POST:", e);
        return Response.json({ message: "Server error" }, { status: 500 });
    }
}
