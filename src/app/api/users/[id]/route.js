export const runtime = "nodejs";
import pool from "@/lib/db.js";

// PATCH /api/users/:id  (chỉ cho phép sửa full_name/phone/address)
// Không hỗ trợ active vì DB không có cột này.
export async function PATCH(req, { params }) {
    try {
        const id = Number(params.id);
        if (!id) return Response.json({ message: "Thiếu id" }, { status: 400 });
        const { full_name, phone, address } = await req.json();

        await pool.query(
            `UPDATE users SET
         full_name = COALESCE(?, full_name),
         phone     = COALESCE(?, phone),
         address   = COALESCE(?, address)
       WHERE id = ? AND role = 'customer'`,
            [full_name || null, phone || null, address || null, id]
        );
        return Response.json({ ok: true }, { status: 200 });
    } catch (e) {
        console.error("USER PATCH:", e);
        return Response.json({ message: "Server error" }, { status: 500 });
    }
}
