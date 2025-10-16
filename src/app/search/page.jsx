"use client";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import "./search.css"

export default function SearchPage() {
    const params = useSearchParams();
    const query = params.get("query") || "";
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!query) return;
        setLoading(true);

        fetch(`/api/products/search?query=${encodeURIComponent(query)}`)
            .then((res) => res.json())
            .then((data) => {
                setResults(data);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, [query]);

    return (
        <main className="search-page">
            <h2>Kết quả tìm kiếm cho: “{query}”</h2>

            {loading ? (
                <p>Đang tìm kiếm...</p>
            ) : results.length > 0 ? (
                <div className="products-grid">
                    {results.map((p) => (
                        <div key={p.id} className="product-card">
                            {p.sale && <div className="product-badge">Sale</div>}
                            <div className="containProduct">
                                <img src={p.img} alt={p.name} className="product-image" />
                            </div>
                            <div className="product-info">
                                <h3>{p.name}</h3>
                                <div className="product-price">
                                    <p>{p.price.toLocaleString()}₫</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <p>Không tìm thấy sản phẩm nào.</p>
            )}
        </main>
    );
}
