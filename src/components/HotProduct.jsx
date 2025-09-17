"use client";

import { useState } from "react";

const productsHot = [
    { id: 1, name: "Nike Pegasus Trail", price: "3.600.000 ₫" },
    { id: 2, name: "Nike Quest 5", price: "2.500.000 ₫" },
    { id: 3, name: "Adidas Gazalas Cloud White", price: "3.800.000 ₫" },
    { id: 4, name: "Puma Slipstream Green", price: "2.800.000 ₫" },
    // Bạn có thể thêm nhiều sản phẩm nữa cho các trang 2, 3, 4, 5
];

export default function ProductsHot() {
    const [currentPage, setCurrentPage] = useState(1);

    const productsPerPage = 4;
    const totalPages = 5; // giả sử bạn có 5 trang sản phẩm hot

    // Chia sản phẩm theo page
    const startIndex = (currentPage - 1) * productsPerPage;
    const visibleProducts = productsHot.slice(
        startIndex,
        startIndex + productsPerPage
    );

    return (
        <section className="products-hot">
            <div className="products-grid-bottom">
                {visibleProducts.map((p) => (
                    <div key={p.id} className={`product-card-hot product-${p.id}`}>
                        <div className="product-badge">Sale</div>
                        <div className="product-image">
                            <div className="shoe-placeholder">👟</div>
                        </div>
                        <div className="product-info">
                            <div className="product-name">{p.name}</div>
                            <div className="product-price">{p.price}</div>
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
