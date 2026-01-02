"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import "../assets/css/hero.css";

const slides = [
    { src: "/images/DONIDG.jpg", alt: "DONIDG Studio" },
    { src: "/images/giay3.jpg", alt: "Sneaker collection" },
    { src: "/images/DONIDG STUDIO.jpg", alt: "Showroom DONIDG" },
    { src: "/images/giay.jpg", alt: "Hot sneaker" },
    { src: "/images/giay2.jpg", alt: "New arrivals" },
];

export default function Hero() {
    const [current, setCurrent] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrent((prev) => (prev + 1) % slides.length);
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    return (
        <section className="hero" id="home">
            <div className="hero-slider">
                {slides.map((slide, index) => (
                    <div
                        key={index}
                        className={`slide ${index === current ? "active" : ""}`}
                    >
                        <Image
                            src={slide.src}
                            alt={slide.alt}
                            width={1600}
                            height={700}
                            priority={index === 0}
                            className="hero-image"
                        />
                    </div>
                ))}
            </div>

            <div className="hero-content">
                <div className="hero-inner">
                    <span className="hero-badge">NEW SEASON • 2025</span>
                    <h1 className="hero-title">DONIDG STUDIO</h1>
                    <p className="hero-subtitle">
                        Nâng tầm phong cách của bạn với những đôi sneaker chính hãng, được
                        tuyển chọn kỹ lưỡng từ các thương hiệu hàng đầu.
                    </p>
                    <button
                        className="hero-btn"
                        onClick={() => {
                            const section = document.getElementById("products");
                            if (section) section.scrollIntoView({ behavior: "smooth" });
                        }}
                    >
                        Khám phá bộ sưu tập
                    </button>

                </div>
            </div>

            <div className="slider-dots">
                {slides.map((_, index) => (
                    <button
                        key={index}
                        className={`dot ${index === current ? "active" : ""}`}
                        onClick={() => setCurrent(index)}
                        aria-label={`Chuyển đến slide ${index + 1}`}
                    />
                ))}
            </div>
        </section>
    );
}
