import React from "react";

function ProductCard({ name, price }) {
  return (
    <div className="product-card">
      <img src="/images/sample-shoe.png" alt={name} />
      <h3>{name}</h3>
      <p className="price">{price}</p>
    </div>
  );
}

export default ProductCard;
