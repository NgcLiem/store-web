export const runtime = "nodejs";
import pool from "@/lib/db";

// Lấy chi tiết 1 sản phẩm
export async function GET(req, { params }) {
    try {
        const { id } = await params;
        const numericId = Number(id);

        if (!numericId)
            return Response.json({ message: "Thiếu id" }, { status: 400 });

        const [rows] = await pool.query(
            "SELECT * FROM products WHERE id = ?",
            [numericId]
        );

        if (rows.length === 0)
            return Response.json({ message: "Không tìm thấy sản phẩm" }, { status: 404 });

        return Response.json(rows[0], { status: 200 });
    } catch (err) {
        console.error("GET /products/[id] error:", err);
        return Response.json({ message: "Lỗi server" }, { status: 500 });
    }
}

// Cập nhật sản phẩm
export async function PUT(req, { params }) {
    try {
        const { id } = await params;
        const numericId = Number(id);

        if (!numericId)
            return Response.json({ message: "Thiếu id" }, { status: 400 });

        const body = await req.json();

        const fields = ["name", "price", "description", "image", "category_id", "stock"];
        const updates = [];
        const values = [];

        for (const field of fields) {
            if (body[field] !== undefined) {
                updates.push(`${field} = ?`);
                values.push(body[field]);
            }
        }

        if (updates.length === 0)
            return Response.json({ message: "Không có dữ liệu cập nhật" }, { status: 400 });

        values.push(numericId);

        const sql = `UPDATE products SET ${updates.join(", ")} WHERE id = ?`;
        await pool.query(sql, values);

        return Response.json({ ok: true, message: "Cập nhật thành công" }, { status: 200 });
    } catch (err) {
        console.error("PUT /products/[id] error:", err);
        return Response.json({ message: "Lỗi cập nhật" }, { status: 500 });
    }
}

// Xóa sản phẩm
export async function DELETE(req, { params }) {
    try {
        const { id } = await params;
        const numericId = Number(id);

        if (!numericId)
            return Response.json({ message: "Thiếu id" }, { status: 400 });

        await pool.query("DELETE FROM products WHERE id = ?", [numericId]);

        return Response.json({ ok: true, message: "Đã xoá sản phẩm" }, { status: 200 });
    } catch (err) {
        console.error("DELETE /products/[id] error:", err);
        return Response.json({ message: "Lỗi xóa sản phẩm" }, { status: 500 });
    }
}
