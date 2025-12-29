"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import "./hotdeal.css";
import { formatPrice } from "@/lib/format";

export default function HotDeal() {
    const router = useRouter();
    const [timeLeft, setTimeLeft] = useState({
        hours: 0,
        minutes: 0,
        seconds: 0,
    });

    useEffect(() => {
        const targetTime = new Date();
        targetTime.setHours(23, 59, 59, 999);

        const interval = setInterval(() => {
            const now = new Date();
            const diff = targetTime - now;

            if (diff <= 0) {
                clearInterval(interval);
                setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
            } else {
                setTimeLeft({
                    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
                    minutes: Math.floor((diff / (1000 * 60)) % 60),
                    seconds: Math.floor((diff / 1000) % 60),
                });
            }
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    const [products, setProducts] = useState([]);

    useEffect(() => {
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/products`) // ← Template literal với ${}
            .then((res) => res.json())
            .then((data) => {
                // Filter only hot deal products (is_hot = 1)
                const hotProducts = Array.isArray(data) ? data.filter(p => p.is_hot === 1) : [];
                setProducts(hotProducts);
            })
            .catch((err) => {
                console.error("Fetch error:", err);
                setProducts([]);
            });
    }, []);

    return (
        <div className="hotdeal-container">
            {/* Banner */}
            <div className="hotdeal-banner">
                <h1>🔥 Hot Deal Hôm Nay</h1>
                <p>Giảm giá sốc – chỉ trong hôm nay!</p>
                <div className="countdown">
                    <span>{String(timeLeft.hours).padStart(2, "0")}giờ</span> :
                    <span>{String(timeLeft.minutes).padStart(2, "0")}phút</span> :
                    <span>{String(timeLeft.seconds).padStart(2, "0")}giây</span>

                    <div className="container">
                        <div className="products-grid">
                            {products.map((p) => (
                                <div key={p.id} className="product-card" onClick={() => router.push(`/product/${p.id}`)} style={{ cursor: 'pointer' }}>
                                    <div className="containProduct">
                                        <img src={p.image_url} alt={p.name} className="product-image" />
                                    </div>
                                    <div className="product-info">
                                        <h3>{p.name}</h3>
                                        <p>{p.description}</p>
                                        <div className="product-price">{formatPrice(p.price || p.priceValue)}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
