"use client";

import { useState } from "react";

const accessories = [
    { id: 5, name: "Dây giày flat đen", price: "90.000 ₫", icon: "👟" },
    { id: 6, name: "Crep Mark On | Bút Tô Đế Giày", price: "480.000 ₫", icon: "🖊️" },
    { id: 7, name: "Crep Eraser | Gôm Tẩy Vệ Sinh", price: "320.000 ₫", icon: "🧽" },
    { id: 8, name: "Crep Cure Kit | Bộ Kit Khử", price: "450.000 ₫", icon: "🧴" },
    // 👉 bạn có thể thêm nhiều phụ kiện khác vào đây
];

export default function Accessories() {
    const [currentPage, setCurrentPage] = useState(1);

    const itemsPerPage = 4;
    const totalPages = 5; // giả định có 5 trang phụ kiện

    const startIndex = (currentPage - 1) * itemsPerPage;
    const visibleAccessories = accessories.slice(
        startIndex,
        startIndex + itemsPerPage
    );

    return (
        <section className="accessories" id="other">
            <div className="container">
                <div className="section-header">
                    <h2 className="section-title">Phụ kiện</h2>
                    <a href="/tat-ca-phu-kien" className="view-all">
                        Xem tất cả &raquo;
                    </a>
                </div>
            </div>

            <div className="accessories-grid">
                {visibleAccessories.map((item) => (
                    <div key={item.id} className={`product-card-hot product-${item.id}`}>
                        <div className="product-image">
                            <div className="accessory-icon">{item.icon}</div>
                        </div>
                        <div className="product-info">
                            <div className="product-name">{item.name}</div>
                            <div className="product-price">{item.price}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Pagination */}
            <div className="pagination">
                {Array.from({ length: totalPages }, (_, i) => (
                    <button
                        key={i + 1}
                        onClick={() => setCurrentPage(i + 1)}
                        className={currentPage === i + 1 ? "active" : ""}
                    >
                        {i + 1}
                    </button>
                ))}
                <button disabled>...</button>
            </div>
        </section>
    );
}
