"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContexts";
import { useToast } from "@/components/Toast";
import { addItemToLocalCart } from "@/lib/localCart";
import { formatPrice } from "@/lib/format";
import "./productDetail.css";
import "../../../assets/css/toast.css"


const API_BASE = process.env.NEXT_PUBLIC_API_URL;

export default function ProductDetailClient({ product }) {
    const [selectedSize, setSelectedSize] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const router = useRouter();
    const { user, token, loading } = useAuth();
    const { showToast } = useToast();

    const sizes = Array.isArray(product?.sizes) ? product.sizes : [];

    const addToCartBackend = async () => {
        const res = await fetch(`${API_BASE}/cart/items`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
                product_id: product.id,
                quantity,
                size: selectedSize,
            }),
        });

        const json = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(json.message || "Không thể thêm vào giỏ hàng");
        return json;
    };

    const handleAddToCart = async () => {
        if (!selectedSize) {
            showToast("Vui lòng chọn size", "warning");
            return;
        }

        if (loading) {
            showToast("Đang kiểm tra đăng nhập…", "info");
            return;
        }

        if (!user || !token) {
            addItemToLocalCart({ product_id: product.id, quantity, size: selectedSize });
            showToast("Đã thêm vào giỏ hàng", "success");
            return;
        }

        try {
            await addToCartBackend();
            showToast("Đã thêm vào giỏ hàng", "success");
        } catch (err) {
            showToast(err.message || "Có lỗi xảy ra", "error");
        }
    };

    const handleBuyNow = async () => {
        if (!selectedSize) {
            showToast("Vui lòng chọn size", "warning");
            return;
        }

        if (loading) {
            showToast("Đang kiểm tra đăng nhập…", "info");
            return;
        }

        if (!user || !token) {
            addItemToLocalCart({ product_id: product.id, quantity, size: selectedSize });
            router.push("/checkout");
            return;
        }

        try {
            await addToCartBackend();
            router.push("/checkout");
        } catch (err) {
            showToast(err.message || "Có lỗi xảy ra", "error");
        }
    };

    return (
        <div className="product-detail-container">
            <div className="pd-left">
                <img
                    src={(product?.image_url && product.image_url.trim()) ? product.image_url : "/images/no-image.png"}
                    alt={product?.name || "Product"}
                />

            </div>

            <div className="pd-right">
                <h1>{product.name}</h1>

                <div className="pd-price">
                    {formatPrice(product.price)}{" "}
                    {product.original_price && (
                        <span className="pd-original">{formatPrice(product.original_price)}</span>
                    )}
                </div>

                <div className="pd-sizes">
                    <h4>Chọn size</h4>

                    {sizes.length === 0 ? (
                        <p>Chưa có size cho sản phẩm này</p>
                    ) : (
                        <div className="pd-sizes-list">
                            {sizes.map((s) => (
                                <button
                                    key={`size-${s.value}`}
                                    className={`pd-size-btn ${selectedSize === s.value ? "selected" : ""}`}
                                    onClick={() => setSelectedSize(s.value)}
                                    disabled={s.stock <= 0}
                                    title={s.stock <= 0 ? "Hết hàng" : `Còn ${s.stock}`}
                                >
                                    {s.value}
                                </button>
                            ))}
                        </div>
                    )}
                </div>


                <div className="pd-qty">
                    <h4>Số lượng</h4>
                    <div className="pd-qty-controls">
                        <button onClick={() => setQuantity(Math.max(1, quantity - 1))} disabled={quantity <= 1}>-</button>
                        <span>{quantity}</span>
                        <button onClick={() => setQuantity(quantity + 1)}>+</button>
                    </div>
                </div>

                <div className="pd-actions">
                    <button className="pd-add" onClick={handleAddToCart}>THÊM VÀO GIỎ HÀNG</button>
                    <button className="pd-buy" onClick={handleBuyNow}>MUA NGAY</button>
                </div>

                <div className="pd-desc">
                    <h4>Mô tả</h4>
                    <p>{product.description || "Chưa có mô tả"}</p>
                </div>
            </div>
        </div>
    );
}
