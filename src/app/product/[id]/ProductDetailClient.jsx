"use client";
import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContexts";
import { addItemToLocalCart } from "@/lib/localCart";
import { formatPrice } from "@/lib/format";
import { useToast } from "@/components/Toast";

import "./productDetail.css";

export default function ProductDetailClient({ product }) {
    const [selectedSize, setSelectedSize] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const router = useRouter();
    const { user, loading } = useAuth();
    const { showToast } = useToast();

    const sizes = ["39", "40", "40.5", "42.5", "43"];

    const brand = product.brand || "Nike";
    const category = product.category_name || "Giày";

    const { originalPrice, discountPercent } = useMemo(() => {
        const current = Number(product.price || 0);

        const orig =
            product.original_price && Number(product.original_price) > current
                ? Number(product.original_price)
                : Math.round(current * 1.2);

        const percent =
            orig > current ? Math.round(100 - (current / orig) * 100) : 0;

        return { originalPrice: orig, discountPercent: percent };
    }, [product.price, product.original_price]);

    const handleAddToCart = () => {
        if (!selectedSize) {
            showToast("Vui lòng chọn size trước khi thêm vào giỏ!", "error");
            return;
        }

        addItemToLocalCart({
            product_id: product.id,
            quantity,
            size: selectedSize,
        });

        showToast("Đã thêm vào giỏ hàng!", "success");

    };

    const handleBuyNow = () => {
        if (!selectedSize) {
            showToast("Vui lòng chọn size trước khi mua.", "error");
            return;
        }

        if (!user && !loading) {
            router.push(`/login?next=/product/${product.id}`);
            return;
        }

        addItemToLocalCart({
            product_id: product.id,
            quantity,
            size: selectedSize,
        });

        router.push("/cart");
    };

    return (
        <div className="product-detail-page">
            <nav className="pd-breadcrumb" aria-label="breadcrumb">
                <Link href="/">Trang chủ</Link>
                <span className="pd-breadcrumb-sep">/</span>
                <span className="pd-breadcrumb-link">{brand}</span>
                <span className="pd-breadcrumb-sep">/</span>
                <span className="pd-breadcrumb-current">{product.name}</span>
            </nav>

            <div className="product-detail-container">
                <div className="pd-left">
                    <div className="pd-image-wrap">
                        {discountPercent > 0 && (
                            <div className="pd-discount-badge">-{discountPercent}%</div>
                        )}
                        <img
                            src={
                                product.image_url
                                    ? product.image_url
                                    : product.image && !product.image.startsWith("http")
                                        ? `/images/${product.image}`
                                        : product.image || "/images/no-image.png"
                            }
                            alt={product.name}
                            onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = "/images/no-image.png";
                            }}
                        />
                    </div>
                </div>

                <div className="pd-right">
                    <p className="pd-brand">{brand}</p>
                    <h1>{product.name}</h1>

                    <div className="pd-price-row">
                        <span className="pd-price">{formatPrice(product.price)}</span>
                        {originalPrice > product.price && (
                            <>
                                <span className="pd-original">
                                    {formatPrice(originalPrice)}
                                </span>
                                <span className="pd-discount-chip">-{discountPercent}%</span>
                            </>
                        )}
                    </div>

                    {typeof product.stock === "number" && (
                        <div className="pd-meta">
                            <span
                                className={
                                    product.stock > 0 ? "pd-stock pd-stock--ok" : "pd-stock pd-stock--out"
                                }
                            >
                                {product.stock > 0
                                    ? `Còn ${product.stock} sản phẩm`
                                    : "Hết hàng"}
                            </span>
                        </div>
                    )}

                    {/* Chọn size */}
                    <h4>Chọn size</h4>
                    <div className="pd-sizes-list">
                        {sizes.map((size) => (
                            <button
                                key={size}
                                type="button"
                                className={
                                    "pd-size-btn" + (selectedSize === size ? " selected" : "")
                                }
                                onClick={() => setSelectedSize(size)}
                            >
                                {size}
                            </button>
                        ))}
                    </div>

                    {/* Chọn số lượng */}
                    <div className="pd-qty">
                        <h4>Số lượng</h4>
                        <div className="pd-qty-controls">
                            <button
                                type="button"
                                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                                disabled={quantity <= 1}
                            >
                                -
                            </button>
                            <span>{quantity}</span>
                            <button
                                type="button"
                                onClick={() => setQuantity((q) => q + 1)}
                            >
                                +
                            </button>
                        </div>
                    </div>

                    {/* Nút hành động */}
                    <div className="pd-actions">
                        <button className="pd-add" onClick={handleAddToCart}>
                            THÊM VÀO GIỎ HÀNG
                        </button>
                        <button className="pd-buy" onClick={handleBuyNow}>
                            MUA NGAY
                        </button>
                    </div>

                    {/* Mô tả */}
                    <div className="pd-desc">
                        <h4>Mô tả</h4>
                        <p>{product.description || "Chưa có mô tả"}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
