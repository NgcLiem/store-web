import pool from "@/lib/db.js";

export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);
        const keyword = searchParams.get("query");

        if (!keyword || keyword.length < 2) {
            return new Response(JSON.stringify([]), { status: 200 });
        }

        // Lấy top 8 sản phẩm phù hợp
        const [rows] = await pool.query(
            `SELECT DISTINCT p.name, p.product_code, p.id
             FROM products p
             LEFT JOIN categories c ON p.category_id = c.id
             WHERE p.name LIKE ? OR p.product_code LIKE ? OR c.name LIKE ?
             LIMIT 8`,
            [`%${keyword}%`, `%${keyword}%`, `%${keyword}%`]
        );

        return new Response(JSON.stringify(rows), { status: 200 });
    } catch (error) {
        console.error("Autocomplete error:", error);
        return new Response(JSON.stringify({ message: "Lỗi server!" }), { status: 500 });
    }
}