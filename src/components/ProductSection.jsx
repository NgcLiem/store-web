"use client";
import { useState, useEffect } from "react";
import "../assets/css/productSection.css"

export default function Products() {
    const [products, setProducts] = useState([]);
    useEffect(() => {
        fetch("/api/products")
            .then((res) => res.json())
            .then((data) => setProducts(data))
            .catch((err) => console.error("Fetch error:", err));
    }, []);

    return (
        <section className="products" id="products">
            <div className="container">
                <div className="section-header">
                    <h2 className="section-title">Sản phẩm mới</h2>
                </div>
            </div>

            <div className="products-grid">
                {products.map(p => (
                    <div key={p.id} className="product-card">
                        <div className="product-badge">Sale</div>
                        <div className="containProduct">
                            <img
                                src={p.image}
                                alt={p.name}
                                className="product-image"
                            />
                        </div>
                        <div className="product-info">
                            <h3>{p.name}</h3>
                            <div className="product-price">{p.price}</div>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}
