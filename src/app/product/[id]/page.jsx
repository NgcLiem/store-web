
import ProductDetailClient from "./ProductDetailClient";

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

async function getProduct(productId) {
    try {
        const res = await fetch(`${API_BASE}/products/${productId}`, {
            cache: "no-store",
        });

        if (res.status === 404) {
            return null;
        }

        if (!res.ok) {
            console.error("Fetch product failed:", res.status, await res.text());
            throw new Error("Fetch product failed");
        }

        const data = await res.json();
        return data.product ?? data;
    } catch (error) {
        console.error("Error calling backend /products/:id:", error);
        throw error;
    }
}

export default async function ProductDetail({ params }) {
    const { id } = await params;
    const productId = Number(id);

    if (!productId) {
        return <div>Thiếu id sản phẩm</div>;
    }

    try {
        const product = await getProduct(productId);

        if (!product) {
            return <div>Không tìm thấy sản phẩm</div>;
        }

        return <ProductDetailClient product={product} />;
    } catch (e) {
        return <div>Lỗi khi tải sản phẩm</div>;
    }
}
