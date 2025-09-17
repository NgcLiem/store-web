import React from "react";
import ProductCard from "../components/ProductCard";

function Home() {
    return (
        <div className="home">
            <h2>Sản phẩm mới</h2>
            <div className="products-grid">
                <ProductCard name="Nike Air Max 270" price="2.500.000₫" />
                <ProductCard name="Adidas Ultraboost 22" price="3.200.000₫" />
            </div>
        </div>
    );
}

export default Home;
