export async function GET(_, { params }) {
    try {
        const [result] = await pool.query("SELECT * FROM products where id=?", [params.id]);
        if (result.length === 0)
            return new Response(JSON.stringify({ message: "Không tìm thấy sản phẩm" }, { status: 500 }));
        return new Response(JSON.stringify(result[0]), { status: 200 });
    }
    catch (error) {
        console.log("Get error: ", error)
        return new Response(JSON.stringify({ message: "Không có sản phẩm" }, { status: 500 }));
    }
}

export async function PUT(req, { param }) {
    try {
        const { name, price, description, image } = await req.json();
        const [result] = await pool.query("update products set name=?, price= ?, description=?, image==? where id= ?",
            [name, price, description || "", image || "", param.id]);

        return new Response(JSON.stringify((result), { status: 200 }));
    }
    catch (err) {
        console.log("Put error: ", err);
        return new Response(JSON.stringify({ message: "Lỗi cập nhật sản phẩm" }, { status: 500 }));
    }
}

export async function DELETE(_, { param }) {
    try {
        await pool.query("delete from products where id = ?", [param.id]);
        return new Response(JSON.stringify({ message: "Đã xóa sản phẩm có id: "[param.id] }, { status: 200 }));
    }
    catch (error) {
        console.log("Delete error: ", error);
        return new Response(JSON.stringify({ message: "Lỗi xóa sản phẩm" }, { status: 500 }));
    }
}
