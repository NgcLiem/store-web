"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import "../assets/css/productSection.css";
import { formatPrice } from "@/lib/format";

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

export default function Products() {
    const [products, setProducts] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 16;

    useEffect(() => {
        const load = async () => {
            try {
                const res = await fetch(`${API_BASE}/products`, {
                    cache: "no-store",
                });

                if (!res.ok) {
                    const text = await res.text();
                    console.error("Products fetch failed:", res.status, text);
                    throw new Error("Network response was not ok");
                }

                const data = await res.json();

                // Handle API response from Nest.js backend
                if (Array.isArray(data)) {
                    setProducts(data);
                } else if (data && Array.isArray(data.products)) {
                    setProducts(data.products);
                } else if (data && Array.isArray(data.rows)) {
                    setProducts(data.rows);
                } else if (data && Array.isArray(data.items)) {
                    setProducts(data.items);
                } else {
                    console.error("Unexpected /products response:", data);
                    setProducts([]);
                }

                setCurrentPage(1);
            } catch (err) {
                console.error("Fetch error:", err);
                setProducts([]);
                setCurrentPage(1);
            }
        };

        load();
    }, []);

    const totalItems = Array.isArray(products) ? products.length : 0;
    const totalPages = totalItems > 0 ? Math.ceil(totalItems / pageSize) : 0;

    useEffect(() => {
        // reset về trang 1 khi danh sách thay đổi (load lại)
        setCurrentPage(1);
    }, [totalItems]);

    useEffect(() => {
        if (totalPages === 0) return;
        if (currentPage > totalPages) setCurrentPage(totalPages);
        if (currentPage < 1) setCurrentPage(1);
    }, [currentPage, totalPages]);

    const startIndex = totalPages === 0 ? 0 : (currentPage - 1) * pageSize;
    const paginated = totalPages === 0 ? [] : products.slice(startIndex, startIndex + pageSize);

    const goToPage = (n) => {
        setCurrentPage(n);

        requestAnimationFrame(() => {
            document
                .getElementById("products")
                ?.scrollIntoView({ behavior: "smooth", block: "start" });
        });
    };


    return (
        <section className="products" id="products">
            <div className="container">
                <div className="section-header">
                    <h2 className="section-title">Sản phẩm mới</h2>
                </div>
            </div>

            <div className="products-grid">
                {paginated.length > 0 ? (
                    paginated.map((p) => (
                        <Link
                            key={p.id}
                            href={`/product/${p.id}`}
                            className="product-card"
                        >
                            <div className="product-badge">Sale</div>
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
                                <h3>{p.name}</h3>
                                <div className="product-price">{formatPrice(p.price)}</div>
                            </div>
                        </Link>
                    ))
                ) : (
                    <div
                        style={{
                            gridColumn: "1/-1",
                            textAlign: "center",
                            color: "#666",
                        }}
                    >
                        Không có sản phẩm hiển thị
                    </div>
                )}
            </div>

            {totalPages > 1 && (
                <div className="pagination">
                    <button
                        onClick={() => goToPage(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                    >
                        Prev
                    </button>

                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                        <button
                            key={n}
                            onClick={() => goToPage(n)}
                            aria-current={n === currentPage ? "page" : undefined}
                            style={n === currentPage ? { fontWeight: "700" } : {}}
                        >
                            {n}
                        </button>
                    ))}

                    <button
                        onClick={() => goToPage(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
                    >
                        Next
                    </button>
                </div>
            )}

            {totalItems > 0 && (
                <div className="pagination-summary">
                    Hiển thị {startIndex + 1} - {Math.min(startIndex + pageSize, totalItems)} trên {totalItems} sản phẩm
                </div>
            )}
        </section>
    );
}
