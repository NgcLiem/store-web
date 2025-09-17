import React from "react";

function ProductList({ page }) {
    const products = [
        { id: 1, name: "Giày A", page: 1 },
        { id: 2, name: "Giày B", page: 1 },
        { id: 3, name: "Giày C", page: 2 },
        { id: 4, name: "Giày D", page: 2 },
        { id: 5, name: "Giày E", page: 3 },
        { id: 6, name: "Giày F", page: 3 },
    ];

    return (
        <div className="products-grid">
            {products.filter(p => p.page === page).map(p => (
                <div key={p.id} className="product-card">
                    {p.name}
                </div>
            ))}
        </div>
    );
}

export default ProductList;
