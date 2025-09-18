"use client";

import { useState } from "react";
import Image from "next/image"; // hoặc accessories.css nếu bạn tách riêng

export default function Accessories() {
    const [currentPage, setCurrentPage] = useState(1);

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

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

            {/* Accessories Grid */}
            <div className="accessories-grid">
                {/* Trang 1 */}
                <div className={`product-page ${currentPage === 1 ? "active" : ""}`}>
                    <div className="product-card-hot">
                        <div className="containProduct">
                            <img src="/images/image 203.png" className="product-image" alt="Nike Air Max 270" />
                        </div>
                        <div className="product-info">
                            <div className="product-name">Dây giày flat đen</div>
                            <div className="product-price">90.000 ₫</div>
                        </div>
                    </div>

                    <div className="product-card-hot">
                        <div className="containProduct">
                            <img src="/images/image 203.png" className="product-image" alt="Nike Air Max 270" />
                        </div>
                        <div className="product-info">
                            <div className="product-name">Crep Mark On | Bút Tô Đế Giày</div>
                            <div className="product-price">480.000 ₫</div>
                        </div>
                    </div>

                    <div className="product-card-hot">
                        <div className="containProduct">
                            <img src="/images/image 203.png" className="product-image" alt="Nike Air Max 270" />
                        </div>
                        <div className="product-info">
                            <div className="product-name">Crep Eraser | Gôm Tẩy Vệ Sinh</div>
                            <div className="product-price">320.000 ₫</div>
                        </div>
                    </div>

                    <div className="product-card-hot">
                        <div className="containProduct">
                            <img src="/images/image 203.png" className="product-image" alt="Nike Air Max 270" />
                        </div>
                        <div className="product-info">
                            <div className="product-name">Crep Cure Kit | Bộ Kit Khử</div>
                            <div className="product-price">450.000 ₫</div>
                        </div>
                    </div>
                </div>

                {/* Trang 2 (demo thêm, bạn thay dữ liệu khác) */}
                <div className={`product-page ${currentPage === 2 ? "active" : ""}`}>
                    <div className="product-card-hot">
                        <div className="product-image">
                            <div className="accessory-icon">🎒</div>
                        </div>
                        <div className="product-info">
                            <div className="product-name">Balo Sneaker</div>
                            <div className="product-price">700.000 ₫</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Pagination */}
            <div className="pagination">
                <button
                    onClick={() => handlePageChange(1)}
                    className={currentPage === 1 ? "active" : ""}
                >
                    1
                </button>
                <button
                    onClick={() => handlePageChange(2)}
                    className={currentPage === 2 ? "active" : ""}
                >
                    2
                </button>
                <button>3</button>
                <button>4</button>
                <button>5</button>
                <button>...</button>
            </div>
        </section>
    );
}
