import pool from "@/lib/db";
import ProductDetailClient from "./ProductDetailClient";

export default async function ProductDetail({ params }) {
    const { id } = await params;

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
}
