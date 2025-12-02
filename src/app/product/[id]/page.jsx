import pool from "@/lib/db";
import ProductDetailClient from "./ProductDetailClient";

export default async function ProductDetail({ params }) {
<<<<<<< HEAD
    const { id } = await params;
=======
    const { id } = await params;  // ✅ FIX: await params
>>>>>>> 92794f5fb65a302750cd6c333116af60c1c6d7c0

    const productId = Number(id);
    if (!productId) return <div>Thiếu id</div>;

    try {
        const [rows] = await pool.query("SELECT * FROM products WHERE id = ?", [productId]);
        const product = rows && rows.length ? rows[0] : null;

        if (!product) return <div>Không tìm thấy sản phẩm</div>;

        return <ProductDetailClient product={product} />;
    } catch (err) {
        console.error('Error loading product:', err);
        return <div>Lỗi khi tải sản phẩm</div>;
    }
<<<<<<< HEAD
}
=======
}
>>>>>>> 92794f5fb65a302750cd6c333116af60c1c6d7c0
