"use client";

import { useState } from "react";

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
                    <a href="/accessories" className="view-all">
                        Xem tất cả &raquo;
                    </a>
                </div>
            </div>

            {/* Accessories Grid */}
            <div className="accessories-grid">
                {/* Trang 1 */}
                <div className={`product-page page-1 ${currentPage === 1 ? "active" : ""}`}>
                    <div className="product-card">
                        <div className="containProduct">
                            <img src="/images/image 203.png" className="product-image" alt="Nike Air Max 270" />
                        </div>
                        <div className="product-info">
                            <h3>Nike Air Max 270</h3>
                            <div className="product-price">2.500.000đ</div>
                        </div>
                    </div>

                    <div className="product-card">
                        <div className="containProduct">
                            <img src="/images/image 204.png" className="product-image" alt="Adidas Ultraboost 22" />
                        </div>
                        <div className="product-info">
                            <h3>Adidas Ultraboost 22</h3>
                            <div className="product-price">3.200.000đ</div>
                        </div>
                    </div>

                    <div className="product-card">
                        <div className="containProduct">
                            <img
                                src="/images/image 205.png"
                                className="product-image"
                                alt="Jordan 1 Retro High"
                                style={{ background: "linear-gradient(45deg, #f093fb, #f5576c)" }}
                            />
                        </div>

                        <div className="product-info">
                            <h3>Jordan 1 Retro High</h3>
                            <div className="product-price">4.500.000đ</div>
                        </div>
                    </div>

                    <div className="product-card">
                        <div className="containProduct">
                            <img
                                src="/images/image 206.png"
                                className="product-image"
                                alt="Yeezy Boost 350 V2"
                                style={{ background: "linear-gradient(45deg, #4facfe, #00f2fe)" }}
                            />
                        </div>

                        <div className="product-info">
                            <h3>Yeezy Boost 350 V2</h3>
                            <div className="product-price">5.800.000đ</div>
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
                </div>
            </div>
        </section>
    );
}
