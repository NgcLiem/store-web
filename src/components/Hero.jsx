"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import "../assets/css/hero.css";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

// Fallback images if DB is empty
const FALLBACK_SLIDES = [
    { image_id: 1, image_url: "/images/DONIDG.jpg" },
    { image_id: 2, image_url: "/images/giay3.jpg" },
    { image_id: 3, image_url: "/images/DONIDG STUDIO.jpg" },
    { image_id: 4, image_url: "/images/giay.jpg" },
    { image_id: 5, image_url: "/images/giay2.jpg" },
];

export default function Hero() {
    const [slides, setSlides] = useState([]);
    const [current, setCurrent] = useState(0);
    const [loading, setLoading] = useState(true);

    // Fetch images from database
    useEffect(() => {
        const fetchImages = async () => {
            try {
                const res = await fetch(`${API_BASE}/images`, {
                    cache: "no-store",
                });
                
                if (res.ok) {
                    const data = await res.json();
                    const images = data.data || [];
                    
                    // Use fetched images or fallback
                    setSlides(images.length > 0 ? images : FALLBACK_SLIDES);
                } else {
                    // Use fallback if API fails
                    setSlides(FALLBACK_SLIDES);
                }
            } catch (err) {
                console.error("Failed to fetch images:", err);
                // Use fallback on error
                setSlides(FALLBACK_SLIDES);
            } finally {
                setLoading(false);
            }
        };

        fetchImages();
    }, []);

    // Auto-slide effect
    useEffect(() => {
        if (slides.length === 0) return;

        const interval = setInterval(() => {
            setCurrent((prev) => (prev + 1) % slides.length);
        }, 5000);

        return () => clearInterval(interval);
    }, [slides.length]);

    if (loading || slides.length === 0) {
        return (
            <section className="hero" id="home">
                <div className="hero-slider">
                    <div className="slide active">
                        <div style={{ width: "100%", height: "700px", backgroundColor: "#f0f0f0" }} />
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className="hero" id="home">
            <div className="hero-slider">
                {slides.map((slide, index) => (
                    <div
                        key={slide.image_id}
                        className={`slide ${index === current ? "active" : ""}`}
                    >
                        <Image
                            src={slide.image_url}
                            alt={`Slide ${index + 1}`}
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
