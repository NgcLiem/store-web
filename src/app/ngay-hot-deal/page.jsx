"use client";
import { useEffect, useState } from "react";
import "./hotdeal.css";

export default function HotDeal() {
    // Countdown Timer
    const [timeLeft, setTimeLeft] = useState({
        hours: 0,
        minutes: 0,
        seconds: 0,
    });

    useEffect(() => {
        const targetTime = new Date();
        targetTime.setHours(23, 59, 59, 999); // hết ngày hôm nay

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

    // Danh sách sản phẩm hot deal
    const deals = [
        {
            id: 1,
            name: "Adidas Ultraboost 22",
            oldPrice: 3500000,
            newPrice: 1990000,
            img: "/images/shoes/ultraboost.jpg",
        },
        {
            id: 2,
            name: "Nike Air Force 1",
            oldPrice: 3000000,
            newPrice: 1790000,
            img: "/images/shoes/airforce1.jpg",
        },
        {
            id: 3,
            name: "Converse Chuck Taylor",
            oldPrice: 2200000,
            newPrice: 1290000,
            img: "/images/shoes/converse.jpg",
        },
    ];

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
                </div>
            </div>

            {/* Danh sách sản phẩm */}
            <div className="deal-list">
                {deals.map((deal) => (
                    <div className="deal-item" key={deal.id}>
                        <img src={deal.img} alt={deal.name} />
                        <h3>{deal.name}</h3>
                        <p className="old-price">{deal.oldPrice.toLocaleString()}đ</p>
                        <p className="new-price">{deal.newPrice.toLocaleString()}đ</p>
                        <p className="discount">
                            -{Math.round(((deal.oldPrice - deal.newPrice) / deal.oldPrice) * 100)}%
                        </p>
                        <button className="buy-btn">Mua Ngay</button>
                    </div>
                ))}
            </div>
        </div>
    );
}
