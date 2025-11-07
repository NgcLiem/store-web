export const runtime = "nodejs";
import pool from "@/lib/db.js";

// PUT /api/staffs/:id
export async function PUT(req, { params }) {
    try {
        const id = Number(params.id);
        if (!id) return Response.json({ message: "Thiếu id" }, { status: 400 });
        const { email, full_name } = await req.json();

        await pool.query(
            `UPDATE users SET
         email = COALESCE(?, email),
         full_name = COALESCE(?, full_name)
       WHERE id = ? AND role = 'staff'`,
            [email || null, full_name || null, id]
        );
        return Response.json({ ok: true }, { status: 200 });
    } catch (e) {
        console.error("STAFF PUT:", e);
        return Response.json({ message: "Server error" }, { status: 500 });
    }
}

// DELETE /api/staffs/:id
export async function DELETE(_req, { params }) {
    try {
        const id = Number(params.id);
        if (!id) return Response.json({ message: "Thiếu id" }, { status: 400 });
        await pool.query(`DELETE FROM users WHERE id = ? AND role = 'staff'`, [id]);
        return Response.json({ ok: true }, { status: 200 });
    } catch (e) {
        console.error("STAFF DELETE:", e);
        return Response.json({ message: "Server error" }, { status: 500 });
    }
}
