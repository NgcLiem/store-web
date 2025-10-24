import pool from "@/lib/db";

export async function GET(req) {
    const { searchParams } = new URL(req.url);
    const category_id = searchParams.get('category_id');
    const brand = searchParams.get('brand');

    let query = "SELECT * FROM products";
    const params = [];

    // Build WHERE clause dynamically
    const conditions = [];
    if (category_id) {
        conditions.push("category_id = ?");
        params.push(category_id);
    }
    if (brand) {
        conditions.push("brand = ?");
        params.push(brand);
    }

    if (conditions.length > 0) {
        query += " WHERE " + conditions.join(" AND ");
    }

    query += " ORDER BY id DESC";

    try {
        console.log("Executing query:", query);
        console.log("With params:", params);
        const [rows] = await pool.query(query, params);
        console.log("Found rows:", rows.length);
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

//
// export async function GET(_, { params }) {
//     try {
//         const [result] = await pool.query("SELECT * FROM products where id=?", [params.id]);
//         if (result.length === 0)
//             return new Response(JSON.stringify({ message: "Không tìm thấy sản phẩm" }, { status: 500 }));
//         return new Response(JSON.stringify(result[0]), { status: 200 });
//     }
//     catch (error) {
//         console.log("Get error: ", error)
//         return new Response(JSON.stringify({ message: "Không có sản phẩm" }, { status: 500 }));
//     }
// }

// export async function PUT(req, { param }) {
//     try {
//         const { name, price, description, image } = await req.json();
//         const [result] = await pool.query("update products set name=?, price= ?, description=?, image==? where id= ?",
//             [name, price, description || "", image || "", param.id]);

//         return new Response(JSON.stringify((result), { status: 200 }));
//     }
//     catch (err) {
//         console.log("Put error: ", err);
//         return new Response(JSON.stringify({ message: "Lỗi cập nhật sản phẩm" }, { status: 500 }));
//     }
// }

// export async function DELETE(_, { param }) {
//     try {
//         await pool.query("delete from products where id = ?", [param.id]);
//         return new Response(JSON.stringify({ message: "Đã xóa sản phẩm có id: "[param.id] }, { status: 200 }));
//     }
//     catch (error) {
//         console.log("Delete error: ", error);
//         return new Response(JSON.stringify({ message: "Lỗi xóa sản phẩm" }, { status: 500 }));
//     }
// }
