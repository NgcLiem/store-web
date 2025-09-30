"use client";
import Hero from "@/components/Hero";
import React, { useState } from "react";
import "./nike.css";

// Giả sử đây là dữ liệu sản phẩm
const products = [
    {
        name: "Nike Air Zoom Pegasus 40",
        price: "2.990.000₫",
        priceValue: 2990000,
        img: "/nike-shoe.jpg",
        sale: true,
        addedAt: new Date("2024-09-01").getTime()
    },
    {
        name: "Nike Revolution 6",
        price: "1.590.000₫",
        priceValue: 1590000,
        img: "/nike-revolution.jpg",
        sale: false,
        addedAt: new Date("2024-09-10").getTime()
    },
    {
        name: "Nike InfinityRN 4",
        price: "3.490.000₫",
        priceValue: 3490000,
        img: "/nike-infinity.jpg",
        sale: true,
        addedAt: new Date("2024-09-15").getTime()
    }
];
export default function NikePage() {
    const [sort, setSort] = useState("default");

    // Giả sử products có sẵn
    let sortedProducts = [...products];
    if (sort === "price-asc") sortedProducts.sort((a, b) => a.priceValue - b.priceValue);
    if (sort === "price-desc") sortedProducts.sort((a, b) => b.priceValue - a.priceValue);
    if (sort === "newest") sortedProducts.sort((a, b) => b.addedAt - a.addedAt);
    if (sort === "sale") sortedProducts = sortedProducts.filter((p) => p.sale);

    return (
        <main>
            <Hero />
            <section className="products" id="nike-products">
                <div className="container">
                    <div className="page-layout">
                        {/* Sidebar */}
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

                        {/* Product grid */}
                        <div className="content">
                            <h2>Giày Nike</h2>
                            <div className="products-grid">
                                {sortedProducts.map((product, index) => (
                                    <div key={index} className="product-card">
                                        {product.sale && <div className="product-badge">Sale</div>}
                                        <div className="containProduct">
                                            <img src={product.img} alt={product.name} className="product-image" />
                                        </div>
                                        <div className="product-info">
                                            <h3>{product.name}</h3>
                                            <div className="product-price">{product.price}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
}