"use client";
import { useEffect, useState } from "react";
import { formatPrice } from "@/lib/format";

export default function BrandProducts({ brand }) {
  const [products, setProducts] = useState([]);
  const [sort, setSort] = useState("default");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams();
    if (brand) params.set('brand', brand);

    fetch(`/api/products?${params.toString()}`)
      .then((r) => r.json())
      .then((data) => {
        let list = Array.isArray(data) ? data : data.rows || [];
        setProducts(list);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setProducts([]);
        setLoading(false);
      });
  }, [brand]);

  let displayProducts = [...products];
  if (sort === "price-asc") {
    displayProducts.sort((a, b) => a.price - b.price);
  }
  if (sort === "price-desc") {
    displayProducts.sort((a, b) => b.price - a.price);
  }
  if (sort === "newest") {
    displayProducts.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }
  if (sort === "sale") {
    displayProducts = displayProducts.filter(p => p.is_sale);
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!products.length) {
    return (
      <div className="text-center py-10">
        <p className="text-xl text-gray-600">Không tìm thấy sản phẩm nào của {brand}</p>
      </div>
    );
  }

  return (
    <div className="page-layout">
      <aside className="sidebar">
        <h3>Bộ lọc & Sắp xếp</h3>
        <div className="space-y-2">
          <label className="flex items-center space-x-2">
            <input
              type="radio"
              checked={sort === "default"}
              onChange={() => setSort("default")}
              className="form-radio"
            />
            <span>Mặc định</span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="radio"
              checked={sort === "price-asc"}
              onChange={() => setSort("price-asc")}
              className="form-radio"
            />
            <span>Giá tăng dần</span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="radio"
              checked={sort === "price-desc"}
              onChange={() => setSort("price-desc")}
              className="form-radio"
            />
            <span>Giá giảm dần</span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="radio"
              checked={sort === "newest"}
              onChange={() => setSort("newest")}
              className="form-radio"
            />
            <span>Mới nhất</span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="radio"
              checked={sort === "sale"}
              onChange={() => setSort("sale")}
              className="form-radio"
            />
            <span>Đang Sale</span>
          </label>
        </div>
      </aside>

      <div className="content">
        <div className="products-grid">
          {displayProducts.map((product) => (
            <div key={product.id} className="product-card">
              {product.is_sale && <div className="product-badge">Sale</div>}
              <div className="containProduct">
                <img 
                  src={product.image_url || product.image} 
                  alt={product.name} 
                  className="product-image" 
                />
              </div>
              <div className="product-info">
                <h3>{product.name}</h3>
                <div className="product-price">{formatPrice(product.price)}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}