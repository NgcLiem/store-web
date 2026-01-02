"use client";
import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import "./hotdeal.css"; 
import { formatPrice } from "@/lib/format";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3003";
const PAGE_SIZE = 16;

export default function HotDeal() {
    const router = useRouter();
    const [timeLeft, setTimeLeft] = useState({
        hours: 0,
        minutes: 0,
        seconds: 0,
    });

    const [products, setProducts] = useState([]);
    const [page, setPage] = useState(1);

    // đếm ngược 
    useEffect(() => {
        const targetTime = new Date();
        targetTime.setHours(23, 59, 59, 999);

        const interval = setInterval(() => {
            const now = new Date();
            const diff = targetTime - now;

            if (diff <= 0) {
                clearInterval(interval);
                setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
            } else {
                setTimeLeft({
                    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
                    minutes: Math.floor((diff / (1000 * 60)) % 60),
                    seconds: Math.floor((diff / 1000) % 60),
                });
            }
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    // --- Fetch dữ liệu ---
    useEffect(() => {
        fetch(`${API_BASE}/products`)
            .then((res) => res.json())
            .then((data) => {
                const hotProducts = Array.isArray(data)
                    ? data.filter((p) => Number(p.is_hot) === 1)
                    : [];
                setProducts(hotProducts);
                setPage(1);
            })
            .catch((err) => {
                console.error("Fetch error:", err);
                setProducts([]);
            });
    }, []);

    // --- Logic Phân trang ---
    const totalItems = products.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));

    const pageItems = useMemo(() => {
        const start = (page - 1) * PAGE_SIZE;
        return products.slice(start, start + PAGE_SIZE);
    }, [products, page]);

    const go = (p) => setPage(Math.min(Math.max(1, p), totalPages));

    return (
        <div className="hotdeal-container">
            <div className="hotdeal-banner">
                <h1>🔥 Hot Deal Hôm Nay</h1>
                <p>Giảm giá sốc – chỉ trong hôm nay!</p>
                <div className="countdown">
                    <span>{String(timeLeft.hours).padStart(2, "0")}giờ</span> :
                    <span>{String(timeLeft.minutes).padStart(2, "0")}phút</span> :
                    <span>{String(timeLeft.seconds).padStart(2, "0")}giây</span>
                </div>
            

            <div className="container hotdeal-content">
                <div className="products-grid">
                    {pageItems.length > 0 ? (
                        pageItems.map((p) => (
                            <div
                                key={p.id}
                                className="product-card"
                                onClick={() => router.push(`/product/${p.id}`)}
                                style={{ cursor: "pointer" }}
                            >
                                <div className="product-badge">Hot</div>
                                <div className="containProduct">
                                    <img
                                        src={p.image_url || "/images/no-image.png"}
                                        alt={p.name}
                                        className="product-image"
                                        onError={(e) => {
                                            e.currentTarget.onerror = null;
                                            e.currentTarget.src = "/images/no-image.png";
                                        }}
                                    />
                                </div>
                                <div className="product-info">
                                    <h3 title={p.name}>{p.name}</h3>
                                    <p className="product-desc" style={{display: 'none'}}>{p.description}</p> {/* Ẩn desc nếu muốn gọn */}
                                    <div className="product-price">
                                        {p.sale_price && p.sale_price < p.price ? (
                                            <>
                                                <span className="sale-deal">
                                                    {formatPrice(p.price)}
                                                </span>
                                                <span>{formatPrice(p.sale_price)}</span>
                                            </>
                                        ) : (
                                            formatPrice(p.price || p.priceValue)
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="empty-text">Hiện chưa có Hot Deal nào.</p>
                    )}
                </div>

                {/* PHÂN TRANG*/}
                {totalItems > 0 && (
                    <>
                        <div className="pagination">
                            <button onClick={() => go(page - 1)} disabled={page === 1}>
                                Prev
                            </button>

                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                                (n) => (
                                    <button
                                        key={n}
                                        onClick={() => go(n)}
                                        aria-current={n === page ? "page" : undefined}
                                    >
                                        {n}
                                    </button>
                                )
                            )}

                            <button
                                onClick={() => go(page + 1)}
                                disabled={page === totalPages}
                            >
                                Next
                            </button>
                        </div>

                        <div className="pagination-summary">
                            Hiển thị {totalItems === 0 ? 0 : (page - 1) * PAGE_SIZE + 1} -{" "}
                            {Math.min(page * PAGE_SIZE, totalItems)} trên {totalItems} sản phẩm
                        </div>
                    </>
                )}
                </div>
            </div>
        </div>
    );
}