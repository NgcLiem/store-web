export const runtime = "nodejs";
import pool from "@/lib/db.js";
import bcrypt from "bcryptjs";

// PUT /api/staffs/:id
export async function PUT(req, { params }) {
    const { id } = await params;
    try {
        const staffid = Number(id);
        if (!staffid) return Response.json({ message: "Thiếu id" }, { status: 400 });
        const { email, full_name, password } = await req.json();
        const hashed = password ? await bcrypt.hash(String(password), 10) : null;

        await pool.query(
            `UPDATE users SET
         email = COALESCE(?, email),
         full_name = COALESCE(?, full_name),
         password = COALESCE(?, password)
       WHERE id = ? AND role = 'staff'`,
            [email || null, full_name || null, hashed, staffid]
        );
        return Response.json({ ok: true }, { status: 200 });
    } catch (e) {
        console.error("STAFF PUT:", e);
        return Response.json({ message: "Server error" }, { status: 500 });
    }
}

// DELETE /api/staffs/:id
export async function DELETE(_req, { params }) {
    const { id } = await params;
    try {
        const staffid = Number(id);
        if (!staffid) return Response.json({ message: "Thiếu id" }, { status: 400 });
        await pool.query(`DELETE FROM users WHERE id = ? AND role = 'staff'`, [staffid]);
        return Response.json({ ok: true }, { status: 200 });
    } catch (e) {
        console.error("STAFF DELETE:", e);
        return Response.json({ message: "Server error" }, { status: 500 });
    }
}
