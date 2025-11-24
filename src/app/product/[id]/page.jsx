"use client";
import { useEffect, useState } from "react";
import { formatPrice } from "@/lib/format";
import "./productDetail.css";

export default function ProductDetail({ params }) {
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedSize, setSelectedSize] = useState(null);
    const [quantity, setQuantity] = useState(1);

    useEffect(() => {
        async function load() {
            try {
                const res = await fetch(`/api/products/${params.id}`);
                if (!res.ok) throw new Error('Không lấy được sản phẩm');
                const data = await res.json();
                setProduct(data);
            } catch (err) {
                console.error(err);
                setProduct(null);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, [params.id]);

    const sizes = ["39", "40", "40.5", "42.5", "43"];

    const handleAddToCart = async () => {
        if (!selectedSize) {
            alert('Vui lòng chọn size');
            return;
        }

        try {
            const res = await fetch('/api/cart', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ product_id: product.id, quantity, size: selectedSize, user_id: 1 })
            });
            const json = await res.json();
            if (!res.ok) throw new Error(json.message || 'Lỗi');
            alert('Đã thêm vào giỏ hàng');
        } catch (err) {
            alert('Lỗi: ' + err.message);
        }
    };

    if (loading) return <div className="pd-loading">Đang tải...</div>;
    if (!product) return <div className="pd-missing">Không tìm thấy sản phẩm</div>;

    return (
        <div className="product-detail-container">
            <div className="pd-left">
                <img src={product.image_url || (product.image ? `/images/${product.image}` : '/images/no-image.png')} alt={product.name} />
            </div>
            <div className="pd-right">
                <h1>{product.name}</h1>
                <div className="pd-price">{formatPrice(product.price)} {product.original_price && <span className="pd-original">{formatPrice(product.original_price)}</span>}</div>

                <div className="pd-sizes">
                    <h4>Chọn size</h4>
                    <div className="pd-sizes-list">
                        {sizes.map(s => (
                            <button key={s} className={`pd-size-btn ${selectedSize === s ? 'selected' : ''}`} onClick={() => setSelectedSize(s)}>{s}</button>
                        ))}
                    </div>
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
                    <button className="pd-buy">MUA NGAY</button>
                </div>

                <div className="pd-desc">
                    <h4>Mô tả</h4>
                    <p>{product.description || 'Chưa có mô tả'}</p>
                </div>
            </div>
        </div>
    );
}
