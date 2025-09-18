"use client"; // để dùng useState, useEffect trong Next.js App Router

import { useState, useEffect } from "react";
import Image from "next/image"; // dùng Next.js Image để tối ưu
import Link from "next/link";

const slides = [
    { src: "/images/DONIDG.jpg", alt: "Slide 1" },
    { src: "/images/giay3.jpg", alt: "Slide 2" },
    { src: "/images/DONIDG STUDIO.jpg", alt: "Slide 3" },
    { src: "/images/giay.jpg", alt: "Slide 4" },
    { src: "/images/giay2.jpg", alt: "Slide 5" },
];

export default function Hero() {
    const [current, setCurrent] = useState(0);

    // Tự động chuyển slide mỗi 5s
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrent((prev) => (prev + 1) % slides.length);
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    return (
        <section className="hero" id="home">
            {/* Slider */}
            <div className="hero-slider">
                {slides.map((slide, index) => (
                    <div
                        key={index}
                        className={`slide ${index === current ? "active" : ""}`}
                    >
                        <Image
                            src={slide.src}
                            alt={slide.alt}
                            width={1200}
                            height={600}
                            priority={index === 0}
                            style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        />
                    </div>
                ))}
            </div>

            {/* Hero content */}
            <div className="hero-content">
                <h1>DONIDG</h1>
                <p>Chuyên cung cấp giày sneaker chính hãng với chất lượng tốt nhất</p>
                <Link href="#products" className="btn">
                    Khám Phá Ngay
                </Link>
            </div>

            {/* Indicator dots */}
            <div className="slider-dots">
                {slides.map((_, index) => (
                    <span
                        key={index}
                        className={`dot ${index === current ? "active" : ""}`}
                        onClick={() => setCurrent(index)}
                    ></span>
                ))}
            </div>
        </section>
    );
}