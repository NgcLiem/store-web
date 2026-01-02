"use client";
import Hero from "@/components/Hero";
import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import "./otherBrand.css";
import { formatPrice } from "@/lib/format";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3003";

export default function OtherBrand() {
    const router = useRouter();

    const [products, setProducts] = useState([]);
    const [sort, setSort] = useState("default");
    const [loading, setLoading] = useState(true);

    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 16;

    const sortedProducts = useMemo(() => {
        const items = Array.isArray(products) ? products : [];
        let result = [...items];

        if (sort === "price-asc") result.sort((a, b) => a.price - b.price);
        if (sort === "price-desc") result.sort((a, b) => b.price - a.price);
        if (sort === "newest")
            result.sort(
                (a, b) => new Date(b.created_at) - new Date(a.created_at),
            );
        if (sort === "sale") result = result.filter((p) => p.is_hot === 1);

        return result;
    }, [products, sort]);

    const totalItems = sortedProducts.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
    const startIndex = (currentPage - 1) * pageSize;
    const paginated = sortedProducts.slice(startIndex, startIndex + pageSize);

    useEffect(() => setCurrentPage(1), [sort]);

    useEffect(() => {
        fetch(`${API_BASE}/products`, { cache: "no-store" })
            .then((res) => res.json())
            .then((data) => {
                const otherBrands = Array.isArray(data)
                    ? data.filter((p) =>
                          [3, 5, 6, 7, 8, 9].includes(p.category_id),
                      )
                    : [];
                setProducts(otherBrands);
                setLoading(false);
                setCurrentPage(1);
            })
            .catch((err) => {
                console.error("Fetch error:", err);
                setProducts([]);
                setLoading(false);
                setCurrentPage(1);
            });
    }, []);

    useEffect(() => {
        if (currentPage > totalPages) setCurrentPage(totalPages);
        if (currentPage < 1) setCurrentPage(1);
    }, [currentPage, totalPages]);

    return (
        <main>
            <Hero />
            <section className="products" id="other-products">
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
                            <h2>Giày Các Hãng Khác</h2>

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
                                                    {p.is_hot === 1 && (
                                                        <div className="product-badge">
                                                            Hot
                                                        </div>
                                                    )}
                                                    <div className="containProduct">
                                                        <img
                                                            src={p.image_url}
                                                            alt={p.name}
                                                            className="product-image"
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

                                    {totalItems > 0 && (
                                        <>
                                            <div className="pagination">
                                                <button
                                                    onClick={() =>
                                                        setCurrentPage((p) =>
                                                            Math.max(1, p - 1),
                                                        )
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
                                                        onClick={() =>
                                                            setCurrentPage(n)
                                                        }
                                                        aria-current={
                                                            n === currentPage
                                                                ? "page"
                                                                : undefined
                                                        }
                                                    >
                                                        {n}
                                                    </button>
                                                ))}

                                                <button
                                                    onClick={() =>
                                                        setCurrentPage((p) =>
                                                            Math.min(
                                                                totalPages,
                                                                p + 1,
                                                            ),
                                                        )
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
