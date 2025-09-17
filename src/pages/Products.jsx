import React from "react";
import ProductCard from "../components/ProductCard";
import Pagination from "../components/Pagination";

function Products() {
    return (
        <div className="products-page">
            <h2>Tất cả sản phẩm</h2>
            <div className="products-grid">
                <ProductCard name="Jordan 1 Retro High" price="4.500.000₫" />
                <ProductCard name="Yeezy Boost 350 V2" price="5.800.000₫" />
            </div>
            <Pagination totalPages={5} onChange={(page) => console.log("Page:", page)} />
        </div>
    );
}

export default Products;
