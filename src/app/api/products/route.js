import pool from "@/lib/db";

export const runtime = "nodejs";

export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);
        const q = (searchParams.get("q") || "").trim();
        const category_id = searchParams.get("category_id");
        const brand = searchParams.get("brand");

        const params = [];
        let sql = `
      SELECT id, product_code, name, price, stock, category_id, is_hot, image_url
      FROM products
      WHERE 1=1
    `;

        if (q) {
            sql += ` AND (name LIKE ? OR product_code LIKE ?)`;
            params.push(`%${q}%`, `%${q}%`);
        }
        if (category_id) {
            sql += ` AND category_id = ?`;
            params.push(Number(category_id));
        }
        if (brand) {
            sql += ` AND brand = ?`;
            params.push(brand);
        }

        sql += ` ORDER BY id DESC`;

        const [rows] = await pool.query(sql, params);
        return Response.json(rows, { status: 200 });
    } catch (e) {
        console.error("PRODUCTS GET:", e);
        return Response.json({ message: "Server error" }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        const { name, price, description, image } = await req.json();
        if (!name || !price) {
            return new Response(JSON.stringify({ message: "Sai thông tin sản phẩm" }))
        }
        const [result] = await pool.query("insert into products (name, price, description, image) values (?, ?, ?, ?)",
            [name, price, description || "", image || ""]);
        return new Response(JSON.stringify((result), { status: 200 }));
    }
    catch (error) {
        console.error("Post error: ", error);
        return new Response(JSON.stringify({ message: "Lỗi thêm sản phẩm" }, { status: 500 }));
    }
}

// Nhan vien

let PRODUCTS = [
    { id: 1, product_code: "NK-001", name: "Nike Air 1", price: 2599000, stock: 12, category_id: 1 },
    { id: 2, product_code: "AD-002", name: "Adidas Ultra", price: 2999000, stock: 5, category_id: 2 },
];

