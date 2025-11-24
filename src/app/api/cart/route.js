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
            `SELECT c.id AS cart_id, p.id AS product_id, p.name, p.price, p.image_url, ci.quantity, ci.size
             FROM carts c
             JOIN cart_items ci ON c.id = ci.cart_id
             JOIN products p ON ci.product_id = p.id
             WHERE c.user_id = ? AND c.status = 'active'`,
            [userId]
        );

        if (cartRows && cartRows.length > 0) {
            return new Response(JSON.stringify(cartRows), { status: 200 });
        }

        // Nếu không có theo schema preferred, thử fallback sang bảng `cart` nếu project dùng bảng đơn giản
        try {
            const [simpleRows] = await pool.query(
                `SELECT c.id AS cart_id, c.product_id, p.name, p.price, p.image_url, c.quantity, c.size
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
        const { user_id, product_id, quantity, size } = await req.json();
        if (!user_id || !product_id)
            return new Response(JSON.stringify({ message: "Thiếu thông tin" }), { status: 400 });

        // Try the preferred carts/cart_items schema first
        try {
            const [carts] = await pool.query(
                "SELECT id FROM carts WHERE user_id = ? AND status = 'active'",
                [user_id]
            );
            let cartId = carts.length ? carts[0].id : null;

            if (!cartId) {
                const [newCart] = await pool.query(
                    "INSERT INTO carts (user_id, status) VALUES (?, 'active')",
                    [user_id]
                );
                // mysql2 returns an OkPacket in newCart
                cartId = newCart.insertId || (newCart[0] && newCart[0].insertId) || null;
            }

            // If we still don't have cartId, throw to try fallback
            if (!cartId) throw new Error('Không tạo được carts row');

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
        } catch (innerErr) {
            // If preferred schema is not available, try a simple `cart` table fallback
            console.warn('Preferred carts/cart_items schema failed, trying fallback:', innerErr && innerErr.message);

            try {
                await pool.query(
                    "INSERT INTO cart (user_id, product_id, quantity, size) VALUES (?, ?, ?, ?)",
                    [user_id, product_id, quantity || 1, size || null]
                );
                return new Response(JSON.stringify({ message: "Đã thêm vào giỏ hàng (fallback)" }), { status: 200 });
            } catch (fallbackErr) {
                console.error('Fallback insert into cart failed:', fallbackErr);
                return new Response(JSON.stringify({ message: 'Lỗi DB khi thêm giỏ hàng', detail: String(fallbackErr) }), { status: 500 });
            }
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
        const payload = { message: "Lỗi server" };
        if (process.env.NODE_ENV !== 'production') payload.detail = String(error);
        return new Response(JSON.stringify(payload), { status: 500 });
    }
}
