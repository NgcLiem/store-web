"use client";

import { useState } from "react";
import Link from "next/link";
import "../assets/css/header.css"

export default function Header() {
    const [query, setQuery] = useState("");

    const handleSearch = (e) => {
        e.preventDefault();
        if (query.trim()) {
            window.location.href = `/search?query=${encodeURIComponent(query)}`;
        }
    };
    return (
        <header className="header">
            <nav className="nav">
                <div className="logo">
                    <img src="/images/logo.jpg" alt="DONIDG" />
                </div>
                <ul className="nav-menu">
                    <li><Link href="/">Trang chủ</Link></li>
                    <li><Link href="/nike">Nike</Link></li>
                    <li><Link href="/adidas">Adidas</Link></li>
                    <li><Link href="/otherBrand">Hãng khác</Link></li>
                    <li><Link href="/accessories">Phụ kiện</Link></li>
                    <li><Link href="/contact">Liên hệ</Link></li>
                </ul>
                <div className="nav-icons">
                    <form onSubmit={handleSearch} className="search-bar">
                        <input
                            type="text"
                            placeholder="Bạn đang tìm gì?"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                        />
                        <button type="submit">
                            <i className="fa-solid fa-search"></i>
                        </button>
                    </form>
                    <Link href="/login" onClick={() => {
                        if (typeof window !== "undefined") {
                            localStorage.setItem("redirectAfterLogin", window.location.pathname);
                        }
                    }
                    }>
                        <i className="fa-regular fa-user"></i>
                    </Link>
                    <Link href="/cart">
                        <i className="fa-solid fa-cart-shopping"></i>
                    </Link>
                </div>
            </nav>
        </header>
    );
}
