import pool from "@/lib/db.js";

/** 🧾 LẤY GIỎ HÀNG ACTIVE CỦA USER */
export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);
        const userId = searchParams.get("user_id");

        if (!userId) {
            return new Response(JSON.stringify({ message: "Thiếu user_id" }), { status: 400 });
        }
        // 🔍 Thử lấy theo schema carts/cart_items (preferred)
        const [cartRows] = await pool.query(
            `SELECT c.id AS cart_id, p.id AS product_id, p.name, p.price, p.image_url, ci.quantity
             FROM carts c
             JOIN cart_items ci ON c.id = ci.cart_id
             JOIN products p ON ci.product_id = p.id
             WHERE c.user_id = ?`,
            [userId]
        );

        if (cartRows && cartRows.length > 0) {
            return new Response(JSON.stringify(cartRows), { status: 200 });
        }

        // Nếu không có theo schema preferred, thử fallback sang bảng `cart` nếu project dùng bảng đơn giản
        try {
            const [simpleRows] = await pool.query(
                `SELECT c.id AS cart_id, c.product_id, p.name, p.price, p.image_url, c.quantity
                 FROM cart c
                 LEFT JOIN products p ON c.product_id = p.id
                 WHERE c.user_id = ?`,
                [userId]
            );

            if (simpleRows && simpleRows.length > 0) {
                return new Response(JSON.stringify(simpleRows), { status: 200 });
            }
        } catch (fallbackErr) {
            // fallback query failed (bảng `cart` có thể không tồn tại) — log và tiếp tục trả empty
            console.warn('GET /api/cart fallback query failed:', fallbackErr && fallbackErr.message);
        }

        // Không tìm thấy mục nào trong cả hai schema
        return new Response(JSON.stringify([]), { status: 200 });
    } catch (error) {
        console.error("GET Cart Error:", error);
        const payload = { message: "Lỗi server" };
        if (process.env.NODE_ENV !== 'production') payload.detail = String(error);
        return new Response(JSON.stringify(payload), { status: 500 });
    }
}

/** ➕ THÊM SẢN PHẨM VÀO GIỎ HÀNG */
export async function POST(req) {
    try {
        const { user_id, product_id, quantity = 1, size = null } = await req.json();
        if (!user_id || !product_id) {
            return new Response(JSON.stringify({ message: "Thiếu thông tin" }), { status: 400 });
        }

        // Use a transaction to ensure cart + cart_items are consistent
        const conn = await pool.getConnection();
        try {
            await conn.beginTransaction();

            // find active cart for user (lock row)
            // select the most recent cart for the user (no status column in schema)
            const [carts] = await conn.query(
                "SELECT id FROM carts WHERE user_id = ? ORDER BY id DESC LIMIT 1 FOR UPDATE",
                [user_id]
            );
            let cartId = carts.length ? carts[0].id : null;

            if (!cartId) {
                const [res] = await conn.query(
                    "INSERT INTO carts (user_id) VALUES (?)",
                    [user_id]
                );
                cartId = res.insertId;
            }

            // check existing cart_items row
            const [existing] = await conn.query(
                "SELECT id, quantity FROM cart_items WHERE cart_id = ? AND product_id = ? FOR UPDATE",
                [cartId, product_id]
            );

            let itemId;
            let newQuantity = quantity;
            if (existing.length > 0) {
                itemId = existing[0].id;
                newQuantity = (existing[0].quantity || 0) + quantity;
                await conn.query(
                    "UPDATE cart_items SET quantity = ? WHERE id = ?",
                    [newQuantity, itemId]
                );
            } else {
                const [ins] = await conn.query(
                    "INSERT INTO cart_items (cart_id, product_id, quantity) VALUES (?, ?, ?)",
                    [cartId, product_id, quantity]
                );
                itemId = ins.insertId;
            }

            await conn.commit();

            return new Response(JSON.stringify({ ok: true, cart_id: cartId, item_id: itemId, product_id, quantity: newQuantity }), { status: 200 });
        } catch (txErr) {
            await conn.rollback();
            console.error('Transaction error adding to cart:', txErr);
            return new Response(JSON.stringify({ message: 'Lỗi khi thêm vào giỏ hàng', detail: String(txErr) }), { status: 500 });
        } finally {
            conn.release();
        }
    } catch (error) {
        console.error("POST Cart Error:", error);
        const payload = { message: "Lỗi server" };
        if (process.env.NODE_ENV !== 'production') payload.detail = String(error);
        return new Response(JSON.stringify(payload), { status: 500 });
    }
}

/** ✏️ CẬP NHẬT SỐ LƯỢNG SẢN PHẨM */
export async function PUT(req) {
    try {
        const { user_id, product_id, quantity } = await req.json();
        if (!user_id || !product_id)
            return new Response(JSON.stringify({ message: "Thiếu thông tin" }), { status: 400 });

        const [carts] = await pool.query(
            "SELECT id FROM carts WHERE user_id = ? ORDER BY id DESC LIMIT 1",
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
        const payload = { message: "Lỗi server" };
        if (process.env.NODE_ENV !== 'production') payload.detail = String(error);
        return new Response(JSON.stringify(payload), { status: 500 });
    }
}

/** ❌ XOÁ SẢN PHẨM TRONG GIỎ */
export async function DELETE(req) {
    try {
        const { user_id, product_id } = await req.json();
        if (!user_id || !product_id)
            return new Response(JSON.stringify({ message: "Thiếu thông tin" }), { status: 400 });

        const [carts] = await pool.query(
            "SELECT id FROM carts WHERE user_id = ? ORDER BY id DESC LIMIT 1",
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
        const payload = { message: "Lỗi server" };
        if (process.env.NODE_ENV !== 'production') payload.detail = String(error);
        return new Response(JSON.stringify(payload), { status: 500 });
    }
}
