"use client";
import { useState, useEffect } from "react";
import "../assets/css/productSection.css"
import { formatPrice } from "@/lib/format";

export default function Products() {
    const [products, setProducts] = useState([]);
    useEffect(() => {
        fetch("/api/products")
            .then((res) => {
                if (!res.ok) throw new Error('Network response was not ok');
                return res.json();
            })
            .then((data) => {
                // API should return an array of products. Be defensive in case it returns an object (error message etc.)
                if (Array.isArray(data)) {
                    setProducts(data);
                } else if (data && Array.isArray(data.rows)) {
                    setProducts(data.rows);
                } else {
                    console.error('Unexpected /api/products response:', data);
                    setProducts([]);
                }
            })
            .catch((err) => {
                console.error("Fetch error:", err);
                setProducts([]);
            });
    }, []);

    return (
        <section className="products" id="products">
            <div className="container">
                <div className="section-header">
                    <h2 className="section-title">Sản phẩm mới</h2>
                </div>
            </div>

            <div className="products-grid">
                {Array.isArray(products) && products.length > 0 ? products.map(p => (
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
                            <div className="product-price">{formatPrice(p.price)}</div>
                        </div>
                    </div>
                )) : (
                    <div style={{gridColumn: '1/-1', textAlign: 'center', color: '#666'}}>Không có sản phẩm hiển thị</div>
                )}
            </div>
        </section>
    );
}
