"use client";
import Hero from "@/components/Hero";
import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import "./adidas.css";
import { formatPrice } from "@/lib/format";

export default function AdidasPage() {
    const router = useRouter();
    const [products, setProducts] = useState([]);
    const [sort, setSort] = useState("default");
    const [loading, setLoading] = useState(true);

    const sortedProducts = useMemo(() => {
        // Make sure products is an array
        const items = Array.isArray(products) ? products : [];
        let result = [...items];
        
        if (sort === "price-asc") result.sort((a, b) => a.price - b.price);
        if (sort === "price-desc") result.sort((a, b) => b.price - a.price);
        if (sort === "newest") result.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        if (sort === "sale") result = result.filter((p) => p.is_hot === 1);
        return result;
    }, [products, sort]);

    useEffect(() => {
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/products`) // ← Template literal với ${}
            .then((res) => res.json())
            .then((data) => {
                // Filter Adidas products (category_id = 2)
                const adidasProducts = Array.isArray(data) ? data.filter(p => p.category_id === 2) : [];
                setProducts(adidasProducts);
                setLoading(false);
            })
            .catch((err) => {
                console.error("Fetch error:", err);
                setProducts([]);
                setLoading(false);
            });
    }, []);

    return (
        <main>
            <Hero />
            <section className="products" id="adidas-products">
                <div className="container">
                    <div className="page-layout">
                        <aside className="sidebar">
                            <h3>Bộ lọc & Sắp xếp</h3>
                            <div>
                                <label>
                                    <input type="radio" checked={sort === "default"} onChange={() => setSort("default")} /> Mặc định
                                </label>
                            </div>
                            <div>
                                <label>
                                    <input type="radio" checked={sort === "price-asc"} onChange={() => setSort("price-asc")} /> Giá tăng dần
                                </label>
                            </div>
                            <div>
                                <label>
                                    <input type="radio" checked={sort === "price-desc"} onChange={() => setSort("price-desc")} /> Giá giảm dần
                                </label>
                            </div>
                            <div>
                                <label>
                                    <input type="radio" checked={sort === "newest"} onChange={() => setSort("newest")} /> Mới nhất
                                </label>
                            </div>
                            <div>
                                <label>
                                    <input type="radio" checked={sort === "sale"} onChange={() => setSort("sale")} /> Đang Sale
                                </label>
                            </div>
                        </aside>

                        <div className="content">
                            <h2>Giày Adidas</h2>

                            {loading ? (
                                <p>Đang tải sản phẩm...</p>
                            ) : (
                                <div className="products-grid">
                                    {sortedProducts.length > 0 ? (
                                        sortedProducts.map((p) => (
                                            <div key={p.id} className="product-card" onClick={() => router.push(`/product/${p.id}`)} style={{ cursor: 'pointer' }}>
                                                {p.is_hot === 1 && (
                                                    <div className="product-badge">Hot</div>)}
                                                <div className="containProduct">
                                                    <img src={p.image_url} alt={p.name} className="product-image" />
                                                </div>
                                                <div className="product-info">
                                                    <h3>{p.name}</h3>
                                                    <div className="product-price">{formatPrice(p.price)}</div>
                                                </div>
                                            </div>
                                        ))) : (
                                        <p> Không có sản phẩm nào.</p>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
}
