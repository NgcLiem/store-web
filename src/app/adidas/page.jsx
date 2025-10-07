"use client";
import React, { useState } from "react";
import "./adidas.css";

const products = [
  {
    name: "Adidas Ultraboost 22",
    price: "3.200.000₫",
    priceValue: 3200000,
    img: "/adidas-ultraboost.jpg",
    sale: true,
    addedAt: new Date("2024-09-01").getTime()
  },
  {
    name: "Adidas Stan Smith",
    price: "1.900.000₫",
    priceValue: 1900000,
    img: "/adidas-stansmith.jpg",
    sale: false,
    addedAt: new Date("2024-09-10").getTime()
  },
  {
    name: "Adidas Forum Low",
    price: "2.500.000₫",
    priceValue: 2500000,
    img: "/adidas-forumlow.jpg",
    sale: true,
    addedAt: new Date("2024-09-15").getTime()
  },
  {
    name: "Adidas Superstar",
    price: "2.200.000₫",
    priceValue: 2200000,
    img: "/adidas-superstar.jpg",
    sale: false,
    addedAt: new Date("2024-09-18").getTime()
  },
  {
    name: "Adidas NMD_R1",
    price: "3.000.000₫",
    priceValue: 3000000,
    img: "/adidas-nmdr1.jpg",
    sale: true,
    addedAt: new Date("2024-09-20").getTime()
  },
  {
    name: "Adidas Gazelle",
    price: "2.100.000₫",
    priceValue: 2100000,
    img: "/adidas-gazelle.jpg",
    sale: false,
    addedAt: new Date("2024-09-22").getTime()
  }
];
export default function AdidasPage() {
  const [sort, setSort] = useState("default");

  // Giả sử products có sẵn
  let sortedProducts = [...products];
  if (sort === "price-asc") sortedProducts.sort((a, b) => a.priceValue - b.priceValue);
  if (sort === "price-desc") sortedProducts.sort((a, b) => b.priceValue - a.priceValue);
  if (sort === "newest") sortedProducts.sort((a, b) => b.addedAt - a.addedAt);
  if (sort === "sale") sortedProducts = sortedProducts.filter((p) => p.sale);

  return (
    <section className="products" id="adidas-products">
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
            <h2>Giày Adidas</h2>
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
  );
}
