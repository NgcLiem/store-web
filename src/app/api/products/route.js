import pool from "@/lib/db";

export async function GET() {
    try {
        const [rows] = await pool.query("SELECT * FROM products ORDER BY id DESC");
        return new Response(JSON.stringify(rows), { status: 200 });
    } catch (error) {
        console.error("Database error:", error);
        return new Response(JSON.stringify({ message: "Error connecting to database" }), { status: 500 });
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
