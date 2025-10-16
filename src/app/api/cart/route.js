import pool from "@/lib/db.js";

/** 🧾 LẤY GIỎ HÀNG ACTIVE CỦA USER */
export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);
        const userId = searchParams.get("user_id");

        if (!userId) {
            return new Response(JSON.stringify({ message: "Thiếu user_id" }), { status: 400 });
        }

        // 🔍 Lấy giỏ hàng active của user
        const [cartRows] = await pool.query(
            `SELECT c.id AS cart_id, p.id AS product_id, p.name, p.price, p.image_url, ci.quantity
             FROM carts c
             JOIN cart_items ci ON c.id = ci.cart_id
             JOIN products p ON ci.product_id = p.id
             WHERE c.user_id = ? AND c.status = 'active'`,
            [userId]
        );

        return new Response(JSON.stringify(cartRows), { status: 200 });
    } catch (error) {
        console.error("GET Cart Error:", error);
        return new Response(JSON.stringify({ message: "Lỗi server" }), { status: 500 });
    }
}

/** ➕ THÊM SẢN PHẨM VÀO GIỎ HÀNG */
export async function POST(req) {
    try {
        const { user_id, product_id, quantity } = await req.json();
        if (!user_id || !product_id)
            return new Response(JSON.stringify({ message: "Thiếu thông tin" }), { status: 400 });

        // 🔍 Kiểm tra giỏ hàng active hiện tại
        const [carts] = await pool.query(
            "SELECT id FROM carts WHERE user_id = ? AND status = 'active'",
            [user_id]
        );
        let cartId = carts.length ? carts[0].id : null;

        // 🆕 Nếu chưa có thì tạo mới
        if (!cartId) {
            const [newCart] = await pool.query(
                "INSERT INTO carts (user_id, status) VALUES (?, 'active')",
                [user_id]
            );
            cartId = newCart.insertId;
        }

        // ⚙️ Kiểm tra xem sản phẩm đã có chưa
        const [exists] = await pool.query(
            "SELECT id FROM cart_items WHERE cart_id = ? AND product_id = ?",
            [cartId, product_id]
        );

        if (exists.length > 0) {
            await pool.query(
                "UPDATE cart_items SET quantity = quantity + ? WHERE cart_id = ? AND product_id = ?",
                [quantity || 1, cartId, product_id]
            );
        } else {
            await pool.query(
                "INSERT INTO cart_items (cart_id, product_id, quantity) VALUES (?, ?, ?)",
                [cartId, product_id, quantity || 1]
            );
        }

        return new Response(JSON.stringify({ message: "Đã thêm vào giỏ hàng" }), { status: 200 });
    } catch (error) {
        console.error("POST Cart Error:", error);
        return new Response(JSON.stringify({ message: "Lỗi server" }), { status: 500 });
    }
}

/** ✏️ CẬP NHẬT SỐ LƯỢNG SẢN PHẨM */
export async function PUT(req) {
    try {
        const { user_id, product_id, quantity } = await req.json();
        if (!user_id || !product_id)
            return new Response(JSON.stringify({ message: "Thiếu thông tin" }), { status: 400 });

        const [carts] = await pool.query(
            "SELECT id FROM carts WHERE user_id = ? AND status = 'active'",
            [user_id]
        );
        if (!carts.length)
            return new Response(JSON.stringify({ message: "Không tìm thấy giỏ hàng" }), { status: 404 });

        const cartId = carts[0].id;

        await pool.query(
            "UPDATE cart_items SET quantity = ? WHERE cart_id = ? AND product_id = ?",
            [quantity, cartId, product_id]
        );

        return new Response(JSON.stringify({ message: "Cập nhật số lượng thành công" }), { status: 200 });
    } catch (error) {
        console.error("PUT Cart Error:", error);
        return new Response(JSON.stringify({ message: "Lỗi server" }), { status: 500 });
    }
}

/** ❌ XOÁ SẢN PHẨM TRONG GIỎ */
export async function DELETE(req) {
    try {
        const { user_id, product_id } = await req.json();
        if (!user_id || !product_id)
            return new Response(JSON.stringify({ message: "Thiếu thông tin" }), { status: 400 });

        const [carts] = await pool.query(
            "SELECT id FROM carts WHERE user_id = ? AND status = 'active'",
            [user_id]
        );
        if (!carts.length)
            return new Response(JSON.stringify({ message: "Không tìm thấy giỏ hàng" }), { status: 404 });

        const cartId = carts[0].id;

        await pool.query("DELETE FROM cart_items WHERE cart_id = ? AND product_id = ?", [
            cartId,
            product_id,
        ]);

        return new Response(JSON.stringify({ message: "Đã xoá khỏi giỏ hàng" }), { status: 200 });
    } catch (error) {
        console.error("DELETE Cart Error:", error);
        return new Response(JSON.stringify({ message: "Lỗi server" }), { status: 500 });
    }
}
