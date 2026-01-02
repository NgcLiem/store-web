"use client";
import Hero from "@/components/Hero";
import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import "./nike.css";
import { formatPrice } from "@/lib/format";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3003";

export default function NikePage() {
    const router = useRouter();

    const [products, setProducts] = useState([]);
    const [sort, setSort] = useState("default");
    const [loading, setLoading] = useState(true);

    //  phân trang
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 16; // bạn đổi 8/12/16 tuỳ ý

    useEffect(() => {
        (async () => {
            try {
                setLoading(true);
                const res = await fetch(`${API_BASE}/products`, {
                    cache: "no-store",
                });
                const data = await res.json().catch(() => null);

                const arr = Array.isArray(data)
                    ? data
                    : Array.isArray(data?.items)
                      ? data.items
                      : Array.isArray(data?.rows)
                        ? data.rows
                        : [];

                const nikeProducts = arr.filter(
                    (p) => Number(p.category_id) === 1,
                );
                setProducts(nikeProducts);
                setCurrentPage(1);
            } catch (err) {
                console.error("Fetch error:", err);
                setProducts([]);
                setCurrentPage(1);
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    const sortedProducts = useMemo(() => {
        const items = Array.isArray(products) ? [...products] : [];
        let result = items;

        if (sort === "price-asc")
            result.sort((a, b) => Number(a.price) - Number(b.price));
        if (sort === "price-desc")
            result.sort((a, b) => Number(b.price) - Number(a.price));
        if (sort === "newest")
            result.sort(
                (a, b) =>
                    new Date(b.created_at).getTime() -
                    new Date(a.created_at).getTime(),
            );
        if (sort === "sale")
            result = result.filter((p) => Number(p.is_hot) === 1);

        return result;
    }, [products, sort]);

    //  tính phân trang từ danh sách đã sort
    const totalItems = sortedProducts.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
    const startIndex = (currentPage - 1) * pageSize;
    const paginated = sortedProducts.slice(startIndex, startIndex + pageSize);

    // nếu đổi sort làm số trang vượt quá, kéo về trang hợp lệ
    useEffect(() => {
        setCurrentPage((p) => Math.min(Math.max(1, p), totalPages));
    }, [totalPages]);

    const go = (p) => setCurrentPage(Math.min(Math.max(1, p), totalPages));

    return (
        <main>
            <Hero />
            <section className="products" id="nike-products">
                <div className="container">
                    <div className="page-layout">
                        <aside className="sidebar">
                            <h3>Bộ lọc & Sắp xếp</h3>

                            <div>
                                <label>
                                    <input
                                        type="radio"
                                        checked={sort === "default"}
                                        onChange={() => setSort("default")}
                                    />{" "}
                                    Mặc định
                                </label>
                            </div>

                            <div>
                                <label>
                                    <input
                                        type="radio"
                                        checked={sort === "price-asc"}
                                        onChange={() => setSort("price-asc")}
                                    />{" "}
                                    Giá tăng dần
                                </label>
                            </div>

                            <div>
                                <label>
                                    <input
                                        type="radio"
                                        checked={sort === "price-desc"}
                                        onChange={() => setSort("price-desc")}
                                    />{" "}
                                    Giá giảm dần
                                </label>
                            </div>

                            <div>
                                <label>
                                    <input
                                        type="radio"
                                        checked={sort === "newest"}
                                        onChange={() => setSort("newest")}
                                    />{" "}
                                    Mới nhất
                                </label>
                            </div>

                            <div>
                                <label>
                                    <input
                                        type="radio"
                                        checked={sort === "sale"}
                                        onChange={() => setSort("sale")}
                                    />{" "}
                                    Đang Sale
                                </label>
                            </div>
                        </aside>

                        <div className="content">
                            <h2>Giày Nike</h2>

                            {loading ? (
                                <p>Đang tải sản phẩm...</p>
                            ) : (
                                <>
                                    <div className="products-grid">
                                        {paginated.length > 0 ? (
                                            paginated.map((p) => (
                                                <div
                                                    key={p.id}
                                                    className="product-card"
                                                    onClick={() =>
                                                        router.push(
                                                            `/product/${p.id}`,
                                                        )
                                                    }
                                                    style={{
                                                        cursor: "pointer",
                                                    }}
                                                >
                                                    {Number(p.is_hot) === 1 && (
                                                        <div className="product-badge">
                                                            Hot
                                                        </div>
                                                    )}

                                                    <div className="containProduct">
                                                        <img
                                                            src={
                                                                p.image_url ||
                                                                "/images/no-image.png"
                                                            }
                                                            alt={p.name}
                                                            className="product-image"
                                                            onError={(e) => {
                                                                e.currentTarget.onerror =
                                                                    null;
                                                                e.currentTarget.src =
                                                                    "/images/no-image.png";
                                                            }}
                                                        />
                                                    </div>

                                                    <div className="product-info">
                                                        <h3>{p.name}</h3>
                                                        <div className="product-price">
                                                            {formatPrice(
                                                                p.price,
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <p>Không có sản phẩm nào.</p>
                                        )}
                                    </div>

                                    {/* Pagination */}
                                    {totalItems > 0 && (
                                        <>
                                            <div className="pagination">
                                                <button
                                                    onClick={() =>
                                                        go(currentPage - 1)
                                                    }
                                                    disabled={currentPage === 1}
                                                >
                                                    Prev
                                                </button>

                                                {Array.from(
                                                    { length: totalPages },
                                                    (_, i) => i + 1,
                                                ).map((n) => (
                                                    <button
                                                        key={n}
                                                        onClick={() => go(n)}
                                                        aria-current={
                                                            n === currentPage
                                                                ? "page"
                                                                : undefined
                                                        }
                                                        className={
                                                            n === currentPage
                                                                ? "active"
                                                                : ""
                                                        }
                                                    >
                                                        {n}
                                                    </button>
                                                ))}

                                                <button
                                                    onClick={() =>
                                                        go(currentPage + 1)
                                                    }
                                                    disabled={
                                                        currentPage ===
                                                        totalPages
                                                    }
                                                >
                                                    Next
                                                </button>
                                            </div>

                                            <div className="pagination-summary">
                                                Hiển thị{" "}
                                                {totalItems === 0
                                                    ? 0
                                                    : startIndex + 1}{" "}
                                                -{" "}
                                                {Math.min(
                                                    startIndex + pageSize,
                                                    totalItems,
                                                )}{" "}
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
