"use client";

import Image from "next/image"; // dùng Next.js Image để tối ưu
import { useState } from "react";

export default function Products() {
    const [currentPage, setCurrentPage] = useState(1);

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    return (
        <section className="products" id="products">
            <div className="container">
                <div className="section-header">
                    <h2 className="section-title">Sản phẩm mới</h2>
                    <a href="/newProducts" className="view-all">
                        Xem tất cả &raquo;
                    </a>
                </div>
            </div>

            <div className="products-grid-top">
                {/* Trang 1 */}
                <div className={`product-page page-1 ${currentPage === 1 ? "active" : ""}`}>
                    <div className="product-card">
                        <div className="product-badge">Sale</div>
                        <div className="containProduct">
                            <img src="/images/image 203.png" className="product-image" alt="Nike Air Max 270" />
                        </div>
                        <div className="product-info">
                            <h3>Nike Air Max 270</h3>
                            <div className="product-price">2.500.000đ</div>
                        </div>
                    </div>

                    <div className="product-card">
                        <div className="product-badge">Sale</div>
                        <div className="containProduct">
                            <img
                                src="/images/image 204.png"
                                className="product-image"
                                alt="Adidas Ultraboost 22"
                                style={{ background: "linear-gradient(45deg, #667eea, #764ba2)" }}
                            />
                        </div>
                        <div className="product-info">
                            <h3>Adidas Ultraboost 22</h3>
                            <div className="product-price">3.200.000đ</div>
                        </div>
                    </div>

                    <div className="product-card">
                        <div className="product-badge">Sale</div>
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

                    <div className="product-badge">Sale</div>
                    <div className="product-card">
                        <div className="product-badge">Sale</div>
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

                {/* Trang 2 */}
                <div className={`product-page page-2 ${currentPage === 2 ? "active" : ""}`}>
                    <div className="product-card">
                        <img
                            src="/images/image 217.png"
                            className="product-image"
                            alt="Nike Dunk Low"
                            style={{ background: "linear-gradient(45deg, #43e97b, #38f9d7)" }}
                        />
                        <div className="product-info">
                            <h3>Nike Dunk Low</h3>
                            <div className="product-price">2.800.000đ</div>
                        </div>
                    </div>

                    <div className="product-card">
                        <img
                            src="/images/image 228.png"
                            className="product-image"
                            alt="Adidas Stan Smith"
                            style={{ background: "linear-gradient(45deg, #fa709a, #fee140)" }}
                        />
                        <div className="product-info">
                            <h3>Adidas Stan Smith</h3>
                            <div className="product-price">1.900.000đ</div>
                        </div>
                    </div>

                    <div className="product-card">
                        <img
                            src="/images/image 230.png"
                            className="product-image"
                            alt="Adidas Stan Smith"
                            style={{ background: "linear-gradient(45deg, #737585, #2a1c8a)" }}
                        />
                        <div className="product-info">
                            <h3>Adidas Stan Smith</h3>
                            <div className="product-price">2.000.000đ</div>
                        </div>
                    </div>

                    <div className="product-card">
                        <img
                            src="/images/image 232.png"
                            className="product-image"
                            alt="Adidas Stan Smith"
                            style={{ background: "linear-gradient(45deg, #719718, #fee140)" }}
                        />
                        <div className="product-info">
                            <h3>Adidas Stan Smith</h3>
                            <div className="product-price">3.000.000đ</div>
                        </div>
                    </div>
                </div>

                {/* Trang 3 */}
                <div className={`product-page page-3 ${currentPage === 3 ? "active" : ""}`}>
                    <div className="product-card">
                        <div
                            className="product-image"
                            style={{ background: "linear-gradient(45deg, #43e97b, #38f9d7)" }}
                        ></div>
                        <div className="product-info">
                            <h3>Nike Dunk Low</h3>
                            <div className="product-price">2.800.000đ</div>
                        </div>
                    </div>

                    <div className="product-card">
                        <div
                            className="product-image"
                            style={{ background: "linear-gradient(45deg, #fa709a, #fee140)" }}
                        ></div>
                        <div className="product-info">
                            <h3>Adidas Stan Smith</h3>
                            <div className="product-price">1.900.000đ</div>
                        </div>
                    </div>

                    <div className="product-card">
                        <div
                            className="product-image"
                            style={{ background: "linear-gradient(45deg, #737585, #2a1c8a)" }}
                        ></div>
                        <div className="product-info">
                            <h3>Adidas Stan Smith</h3>
                            <div className="product-price">2.000.000đ</div>
                        </div>
                    </div>

                    <div className="product-card">
                        <div
                            className="product-image"
                            style={{ background: "linear-gradient(45deg, #9da58a, #fee140)" }}
                        ></div>
                        <div className="product-info">
                            <h3>Adidas Stan Smith</h3>
                            <div className="product-price">3.000.000đ</div>
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
                <button
                    onClick={() => handlePageChange(3)}
                    className={currentPage === 3 ? "active" : ""}
                >
                    3
                </button>
            </div>
        </section>
    );
}
