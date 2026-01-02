"use client";
import Hero from "@/components/Hero";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import "./accessories.css";
import { formatPrice } from "@/lib/format";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3003";

// Sử dụng pageSize (hoặc tùy chỉnh số lượng nếu muốn)
const PAGE_SIZE = 12;

export default function AccessoriesPage() {
    const router = useRouter();

    const [products, setProducts] = useState([]);
    const [sort, setSort] = useState("default");
    const [loading, setLoading] = useState(true);

    const [page, setPage] = useState(1);

    // sort + filter
    const sortedProducts = useMemo(() => {
        const items = Array.isArray(products) ? products : [];
        let result = [...items];

        if (sort === "price-asc") result.sort((a, b) => a.price - b.price);
        if (sort === "price-desc") result.sort((a, b) => b.price - a.price);
        if (sort === "newest")
            result.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        if (sort === "sale") result = result.filter((p) => p.is_hot === 1);

        return result;
    }, [products, sort]);

    // pagination calculations 
    const totalItems = sortedProducts.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));
    
    // Tính toán lại startIndex cho đúng logic hiển thị
    const startIndex = (page - 1) * PAGE_SIZE;
    const pageItems = sortedProducts.slice(startIndex, startIndex + PAGE_SIZE);

    // đổi sort -> quay về page 1
    useEffect(() => {
        setPage(1);
    }, [sort]);

    // Kéo về trang hợp lệ nếu filter làm giảm số trang 
    useEffect(() => {
        setPage((p) => Math.min(Math.max(1, p), totalPages));
    }, [totalPages]);

    // Hàm chuyển trang 
    const go = (p) => setPage(Math.min(Math.max(1, p), totalPages));

    useEffect(() => {
        let cancelled = false;

        (async () => {
            try {
                setLoading(true);
                const res = await fetch(`${API_BASE}/products`, { cache: "no-store" });
                const data = await res.json().catch(() => []);

                const accessoryProducts = Array.isArray(data)
                    ? data.filter((p) => p.category_id === 4)
                    : [];

                if (!cancelled) setProducts(accessoryProducts);
            } catch (err) {
                console.error("Fetch error:", err);
                if (!cancelled) setProducts([]);
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();

        return () => {
            cancelled = true;
        };
    }, []);

    const goToProduct = (id) => router.push(`/product/${id}`);

    return (
        <main>
            <Hero />

            <section className="products" id="accessories">
                <div className="container">
                    <div className="page-layout">
                        <aside className="sidebar">
                            <h3>Bộ lọc & Sắp xếp</h3>
                            
                            <label className="radio-item">
                                <input
                                    type="radio"
                                    checked={sort === "default"}
                                    onChange={() => setSort("default")}
                                />
                                <span>Mặc định</span>
                            </label>

                            <label className="radio-item">
                                <input
                                    type="radio"
                                    checked={sort === "price-asc"}
                                    onChange={() => setSort("price-asc")}
                                />
                                <span>Giá tăng dần</span>
                            </label>

                            <label className="radio-item">
                                <input
                                    type="radio"
                                    checked={sort === "price-desc"}
                                    onChange={() => setSort("price-desc")}
                                />
                                <span>Giá giảm dần</span>
                            </label>

                            <label className="radio-item">
                                <input
                                    type="radio"
                                    checked={sort === "newest"}
                                    onChange={() => setSort("newest")}
                                />
                                <span>Mới nhất</span>
                            </label>

                            <label className="radio-item">
                                <input
                                    type="radio"
                                    checked={sort === "sale"}
                                    onChange={() => setSort("sale")}
                                />
                                <span>Đang Sale</span>
                            </label>

                            <div className="sidebar-divider" />
                        </aside>

                        <div className="content">
                            <h2>Accessories</h2>

                            {loading ? (
                                <p className="loading-text">Đang tải sản phẩm...</p>
                            ) : (
                                <>
                                    <div className="products-grid">
                                        {pageItems.length > 0 ? (
                                            pageItems.map((p) => (
                                                <div
                                                    key={p.id}
                                                    className="product-card"
                                                    onClick={() => goToProduct(p.id)}
                                                    style={{ cursor: "pointer" }}
                                                >
                                                    {p.is_hot === 1 && (
                                                        <div className="product-badge">Hot</div>
                                                    )}

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
                                                        <div className="product-price">
                                                            {formatPrice(p.price)}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <p className="empty-text">Không có sản phẩm nào.</p>
                                        )}
                                    </div>

                                    {totalItems > 0 && (
                                        <>
                                            <div className="pagination">
                                                <button
                                                    onClick={() => go(page - 1)}
                                                    disabled={page === 1}
                                                >
                                                    Prev
                                                </button>

                                                {Array.from(
                                                    { length: totalPages },
                                                    (_, i) => i + 1
                                                ).map((n) => (
                                                    <button
                                                        key={n}
                                                        onClick={() => go(n)}
                                                        aria-current={n === page ? "page" : undefined}
                                                        className={n === page ? "active" : ""}
                                                    >
                                                        {n}
                                                    </button>
                                                ))}

                                                <button
                                                    onClick={() => go(page + 1)}
                                                    disabled={page === totalPages}
                                                >
                                                    Next
                                                </button>
                                            </div>

                                            <div className="pagination-summary">
                                                Hiển thị {totalItems === 0 ? 0 : startIndex + 1} -{" "}
                                                {Math.min(startIndex + PAGE_SIZE, totalItems)}{" "}
                                                trên {totalItems} sản phẩm
                                            </div>
                                        </>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
}