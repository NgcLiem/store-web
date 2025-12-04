"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import "../assets/css/productSection.css";
import { formatPrice } from "@/lib/format";

// ✅ GỌI BACKEND NEST
const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

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

                if (Array.isArray(data)) {
                    setProducts(data);
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
    const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

    useEffect(() => {
        if (currentPage > totalPages) setCurrentPage(totalPages);
        if (currentPage < 1) setCurrentPage(1);
    }, [currentPage, totalPages]);

    const startIndex = (currentPage - 1) * pageSize;
    const paginated = Array.isArray(products)
        ? products.slice(startIndex, startIndex + pageSize)
        : [];

    const goToPage = (n) => setCurrentPage(n);

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
                                        p.image_url
                                            ? p.image_url
                                            : p.image && !p.image.startsWith("http")
                                                ? `/images/${p.image}`
                                                : p.image
                                    }
                                    alt={p.name}
                                    className="product-image"
                                    onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = "/images/no-image.png";
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

            <div
                className="pagination"
            >
                <button
                    onClick={() => goToPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    aria-label="Previous page"
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
                    aria-label="Next page"
                >
                    Next
                </button>
            </div>

            <div
                className="pagination-summary"
            >
                Hiển thị {totalItems === 0 ? 0 : startIndex + 1} -{" "}
                {Math.min(startIndex + pageSize, totalItems)} trên {totalItems} sản phẩm
            </div>
        </section>
    );
}
