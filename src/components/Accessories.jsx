"use client";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import "../assets/css/productSection.css";
import "../assets/css/accessories.css";
import { formatPrice } from "@/lib/format";

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

export default function AccessoriesSection({
    categoryId = 4,
    pageSize = 16,
    title = "Phụ kiện",
}) {
    const router = useRouter();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        (async () => {
            try {
                setLoading(true);
                setError("");

                const url = new URL(`${API_BASE}/products`);
                url.searchParams.set("category", String(categoryId));

                console.log("Fetching from:", url.toString());
                
                const res = await fetch(url.toString(), { cache: "no-store" });
                const data = await res.json().catch(() => null);
                
                console.log("Accessories raw response:", data);

                let arr = [];
                if (Array.isArray(data)) arr = data;
                else if (data?.items && Array.isArray(data.items)) arr = data.items;
                else if (data?.rows && Array.isArray(data.rows)) arr = data.rows;

                console.log("Accessories parsed array:", arr);
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
        const inCat = products.filter(
            (p) => String(p.category_id) === String(categoryId)
        );
        
        console.log("Products with matching category_id:", inCat);
        
        if (inCat.length > 0) return inCat;

        const keys = [
            "phu kien",
            "phụ kiện",
            "sock",
            "vớ",
            "lot",
            "lót",
            "day",
            "dây",
            "de",
            "đế",
            "shoelace",
            "clean",
            "vệ sinh",
        ];
        const hasKey = (s = "") => {
            const t = String(s).toLowerCase();
            return keys.some((k) => t.includes(k));
        };
        const filtered = products.filter((p) => hasKey(p.name) || hasKey(p.brand));
        console.log("Products with matching keywords:", filtered);
        return filtered;
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
        <section className="products accessories" id="accessories">
            <div className="container">
                <div className="section-header">
                    <h2 className="section-title">{title}</h2>
                </div>
            </div>

            <div className="products-grid">
                {loading ? (
                    <div className="accessories-status accessories-status-loading">
                        Đang tải…
                    </div>
                ) : error ? (
                    <div className="accessories-status accessories-status-error">
                        {error}
                    </div>
                ) : paginated.length ? (
                    paginated.map((p) => (
                        <div key={p.id} className="product-card" onClick={() => router.push(`/product/${p.id}`)} style={{ cursor: 'pointer' }}>
                            {p.is_hot ? <div className="product-badge">Hot</div> : null}
                            <div className="containProduct">
                                <img
                                    src={
                                        p?.image_url && p.image_url.trim()
                                            ? p.image_url
                                            : "/images/no-image.png"
                                    }
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
                                <div className="product-price">{formatPrice(p.price)}</div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="accessories-status accessories-status-empty">
                        Chưa có phụ kiện hiển thị
                    </div>
                )}
            </div>

            {totalItems > 0 && (
                <>
                    <div className="pagination">
                        <button
                            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                            disabled={currentPage === 1}
                        >
                            Prev
                        </button>

                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                            <button
                                key={n}
                                onClick={() => setCurrentPage(n)}
                                aria-current={n === currentPage ? "page" : undefined}
                            >
                                {n}
                            </button>
                        ))}

                        <button
                            onClick={() =>
                                setCurrentPage(Math.min(totalPages, currentPage + 1))
                            }
                            disabled={currentPage === totalPages}
                        >
                            Next
                        </button>
                    </div>

                    <div className="pagination-summary">
                        Hiển thị {totalItems === 0 ? 0 : startIndex + 1} -{" "}
                        {Math.min(startIndex + pageSize, totalItems)} trên {totalItems} phụ
                        kiện
                    </div>
                </>
            )}

        </section>
    );
}
