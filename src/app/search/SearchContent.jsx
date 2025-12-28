'use client';

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import { formatVND } from "@/utils/money";
import "./search.css";

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

export default function SearchContent() {
  const searchParams = useSearchParams();

    const params = useSearchParams();
    const router = useRouter();

    const query = params.get("query") || "";
    const sortParam = params.get("sort") || "newest";
    const pageParam = Number(params.get("page") || "1");

    const [results, setResults] = useState([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [refineTerm, setRefineTerm] = useState(query);

    const page = useMemo(() => Math.max(pageParam, 1), [pageParam]);
    const sort = useMemo(
        () =>
            sortParam === "price_asc" || sortParam === "price_desc"
                ? sortParam
                : "newest",
        [sortParam]
    );

    useEffect(() => {
        if (!query.trim()) {
            setResults([]);
            setTotal(0);
            return;
        }

        const controller = new AbortController();
        const load = async () => {
            setLoading(true);
            setError("");
            try {
                const url = new URL(`${API_BASE}/products/search`);
                url.searchParams.set("query", query);
                url.searchParams.set("page", String(page));
                url.searchParams.set("limit", "12");
                url.searchParams.set("sort", sort);

                const res = await fetch(url.toString(), {
                    signal: controller.signal,
                    cache: "no-store",
                });

                const data = await res.json();

                if (!res.ok) {
                    throw new Error(data?.message || "Không thể tải kết quả");
                }

                setResults(Array.isArray(data.items) ? data.items : []);
                setTotal(Number(data.total || 0));
            } catch (err) {
                if (err.name === "AbortError") return;
                console.error("Search error:", err);
                setError(err.message || "Có lỗi xảy ra");
            } finally {
                setLoading(false);
            }
        };

        load();
        return () => controller.abort();
    }, [query, page, sort]);

    // Điều khiển URL khi đổi sort / refine / page
    const updateSearch = (next) => {
        const q = next.query ?? query;
        const s = next.sort ?? sort;
        const p = next.page ?? 1;

        const searchParams = new URLSearchParams();
        searchParams.set("query", q);
        searchParams.set("sort", s);
        searchParams.set("page", String(p));

        router.push(`/search?${searchParams.toString()}`);
    };

    const handleRefineSubmit = (e) => {
        e.preventDefault();
        const term = refineTerm.trim();
        if (!term) return;
        updateSearch({ query: term, page: 1 });
    };

    const totalPages = useMemo(
        () => (total > 0 ? Math.ceil(total / 12) : 1),
        [total]
    );

  return (
        <main className="search-page">
            <div className="search-header">
                <div>
                    <h2 className="search-title">
                        Kết quả tìm kiếm cho: “{query || refineTerm || ""}”
                    </h2>
                    <div className="search-meta">
                        {loading && "Đang tải..."}
                        {!loading && total > 0 && `${total} sản phẩm được tìm thấy`}
                        {!loading && !total && !error && "Không tìm thấy sản phẩm nào"}
                        {error && <span style={{ color: "#e11d48" }}>{error}</span>}
                    </div>
                </div>

                <div>
                    <label className="muted" style={{ fontSize: 13, marginRight: 6 }}>
                        Sắp xếp:
                    </label>
                    <select
                        value={sort}
                        onChange={(e) => updateSearch({ sort: e.target.value, page: 1 })}
                    >
                        <option value="newest">Mới nhất</option>
                        <option value="price_asc">Giá tăng dần</option>
                        <option value="price_desc">Giá giảm dần</option>
                    </select>
                </div>
            </div>

            {/* Loading skeleton */}
            {loading && (
                <div className="skeleton-grid">
                    {Array.from({ length: 8 }).map((_, i) => (
                        <div key={i} className="skeleton-card">
                            <div className="skeleton-media" />
                            <div className="skeleton-lines">
                                <div className="skeleton-line w80" />
                                <div className="skeleton-line w60" />
                                <div className="skeleton-line w40" />
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Kết quả */}
            {!loading && results.length > 0 && (
                <>
                    <div className="products-grid">
                        {results.map((p) => (
                            <div key={p.id} className="product-card">
                                {/* Badge hot/sale nếu muốn */}
                                {p.is_hot && <div className="product-badge">Hot</div>}

                                <div className="product-media">
                                    <img src={p.image_url} alt={p.name} />
                                </div>

                                <div className="product-info">
                                    <div className="product-name">{p.name}</div>
                                    {p.product_code && (
                                        <div className="product-code">#{p.product_code}</div>
                                    )}
                                    <div className="product-price">
                                        <span>{formatVND(p.price)}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Pagination đơn giản */}
                    {totalPages > 1 && (
                        <div
                            style={{
                                display: "flex",
                                justifyContent: "center",
                                marginTop: 24,
                                gap: 8,
                            }}
                        >
                            <button
                                disabled={page <= 1}
                                onClick={() => updateSearch({ page: page - 1 })}
                            >
                                ← Trước
                            </button>
                            <span className="muted">
                                Trang {page} / {totalPages}
                            </span>
                            <button
                                disabled={page >= totalPages}
                                onClick={() => updateSearch({ page: page + 1 })}
                            >
                                Sau →
                            </button>
                        </div>
                    )}
                </>
            )}

            {/* Empty state */}
            {!loading && !error && results.length === 0 && query.trim() && (
                <div className="search-empty">
                    Không tìm thấy sản phẩm nào phù hợp với “{query}”.
                    <br />
                    Thử lại với từ khóa khác hoặc dùng tên sản phẩm cụ thể hơn.
                </div>
            )}
        </main>
    );
}