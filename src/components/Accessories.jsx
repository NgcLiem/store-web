"use client";
import { useEffect, useMemo, useState } from "react";
import "../assets/css/productSection.css"; // tái dùng style của ProductSection
import { formatPrice } from "@/lib/format";

<<<<<<< HEAD
=======
/**
 * AccessoriesSection
 * - Mặc định gọi /api/products với tham số category_id=3 (bạn chỉnh lại ID cho đúng DB).
 * - Nếu API không hỗ trợ category_id, sẽ lọc client-side theo tên/brand.
 */
>>>>>>> 92794f5fb65a302750cd6c333116af60c1c6d7c0
export default function AccessoriesSection({ categoryId = 4, pageSize = 16, title = "Phụ kiện" }) {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        (async () => {
            try {
                setLoading(true);
                setError("");

                let res = await fetch(`/api/products?category_id=${encodeURIComponent(categoryId)}`, { cache: "no-store" });
                let data = await res.json().catch(() => null);

                if (!Array.isArray(data)) {
                    res = await fetch("/api/products", { cache: "no-store" });
                    data = await res.json().catch(() => []);
                }

                const arr = Array.isArray(data) ? data : (data?.rows || []);
                setProducts(Array.isArray(arr) ? arr : []);
                setCurrentPage(1);
            } catch (e) {
                console.error("Accessories fetch error:", e);
                setError("Không thể tải danh sách phụ kiện.");
                setProducts([]);
                setCurrentPage(1);
            } finally {
                setLoading(false);
            }
        })();
    }, [categoryId]);

    const normalized = useMemo(() => {
        if (!Array.isArray(products)) return [];
        const inCat = products.filter(p => String(p.category_id) === String(categoryId));
        if (inCat.length > 0) return inCat;

        const keys = ["phu kien", "phụ kiện", "sock", "vớ", "lot", "lót", "day", "dây", "de", "đế", "shoelace", "clean", "vệ sinh"];
        const hasKey = (s = "") => {
            const t = String(s).toLowerCase();
            return keys.some(k => t.includes(k));
        };
        return products.filter(p => hasKey(p.name) || hasKey(p.brand));
    }, [products, categoryId]);

    const totalItems = normalized.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
    const startIndex = (currentPage - 1) * pageSize;
    const paginated = normalized.slice(startIndex, startIndex + pageSize);

    useEffect(() => {
        if (currentPage > totalPages) setCurrentPage(totalPages);
        if (currentPage < 1) setCurrentPage(1);
    }, [currentPage, totalPages]);

    return (
        <section className="products" id="accessories">
            <div className="container">
                <div className="section-header">
                    <h2 className="section-title">{title}</h2>
                </div>
            </div>

            <div className="products-grid">
                {loading ? (
                    <div style={{ gridColumn: "1/-1", textAlign: "center" }}>Đang tải…</div>
                ) : error ? (
                    <div style={{ gridColumn: "1/-1", textAlign: "center", color: "#d33" }}>{error}</div>
                ) : paginated.length ? (
                    paginated.map((p) => (
                        <div key={p.id} className="product-card">
                            {p.is_hot ? <div className="product-badge">Hot</div> : null}
                            <div className="containProduct">
                                <img
                                    src={
                                        p.image_url
                                            ? p.image_url
                                            : (p.image && !String(p.image).startsWith("http") ? `/images/${p.image}` : p.image)
                                    }
                                    alt={p.name}
                                    className="product-image"
                                    onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = "/images/no-image.png"; }}
                                />
                            </div>
                            <div className="product-info">
                                <h3 title={p.name}>{p.name}</h3>
                                <div className="product-price">{formatPrice(p.price)}</div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div style={{ gridColumn: "1/-1", textAlign: "center", color: "#666" }}>Chưa có phụ kiện hiển thị</div>
                )}
            </div>

            {/* Pagination */}
            {totalItems > 0 && (
                <>
                    <div className="pagination" style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 20 }}>
                        <button onClick={() => setCurrentPage(Math.max(1, currentPage - 1))} disabled={currentPage === 1}>Prev</button>
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                            <button key={n} onClick={() => setCurrentPage(n)} aria-current={n === currentPage ? "page" : undefined}
                                style={n === currentPage ? { fontWeight: 700 } : {}}>
                                {n}
                            </button>
                        ))}
                        <button onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))} disabled={currentPage === totalPages}>Next</button>
                    </div>
                    <div className="pagination-summary" style={{ textAlign: "center", marginTop: 8, color: "#666" }}>
                        Hiển thị {totalItems === 0 ? 0 : startIndex + 1} - {Math.min(startIndex + pageSize, totalItems)} trên {totalItems} phụ kiện
                    </div>
                </>
            )}
        </section>
    );
}
