import pool from "@/lib/db.js";

export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);
        const keyword = searchParams.get("query");
        const limit = Math.min(parseInt(searchParams.get("limit") || "10", 10), 20);

        if (!keyword) {
            return new Response(JSON.stringify({ message: "Thiếu từ khóa tìm kiếm" }), { status: 400 });
        }

        const [rows] = await pool.query(
            `SELECT p.id, p.product_code, p.name, p.price, p.image_url, p.description, p.stock, p.is_hot, c.name AS category
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       WHERE p.name LIKE ? OR p.product_code LIKE ? OR c.name LIKE ? 
       ORDER BY p.created_at DESC
       LIMIT ?`,
            [`%${keyword}%`, `%${keyword}%`, `%${keyword}%`, limit]
        );

        return new Response(JSON.stringify(rows), { status: 200 });
    } catch (error) {
        console.error("Search error:", error);
        return new Response(JSON.stringify({ message: "Lỗi server!" }), { status: 500 });
    }
}
