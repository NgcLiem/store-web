"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import "../assets/css/header.css";
import { useRouter } from "next/navigation";
import { useAuth } from "../contexts/AuthContexts";

export default function Header() {
    const [query, setQuery] = useState("");
    const [suggestions, setSuggestions] = useState([]);
    const [searchHistory, setSearchHistory] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);

    const router = useRouter();
    const dropdownRef = useRef(null);
    const userMenuRef = useRef(null);
    const debounceTimer = useRef(null);

    // ✅ FIX: lấy token từ context (trước bạn quên)
    const { user, token, logout, isAuthenticated } = useAuth();
    const API_BASE = process.env.NEXT_PUBLIC_API_URL;

    const [cartCount, setCartCount] = useState(0);

    // ✅ Load cart count khi token đổi
    useEffect(() => {
        if (!token) {
            setCartCount(0);
            return;
        }

        let cancelled = false;

        fetch(`${API_BASE}/cart`, {
            headers: { Authorization: `Bearer ${token}` },
            cache: "no-store",
        })
            .then((res) => res.json())
            .then((data) => {
                if (cancelled) return;
                const items = Array.isArray(data?.items) ? data.items : [];
                const totalQty = items.reduce((sum, it) => sum + Number(it.quantity || 1), 0);
                setCartCount(totalQty);
            })
            .catch(() => {
                if (!cancelled) setCartCount(0);
            });

        return () => {
            cancelled = true;
        };
    }, [token, API_BASE]);

    useEffect(() => {
        const history = JSON.parse(localStorage.getItem("searchHistory") || "[]");
        setSearchHistory(history);
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
            if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
                setShowUserMenu(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        if (query.trim().length < 2) {
            setSuggestions([]);
            setShowDropdown(query.length > 0);
            return;
        }

        if (debounceTimer.current) clearTimeout(debounceTimer.current);

        debounceTimer.current = setTimeout(async () => {
            setIsLoading(true);
            try {
                const res = await fetch(
                    `${API_BASE}/products/autocomplete?query=${encodeURIComponent(query)}`,
                    { cache: "no-store" }
                );
                const data = await res.json();
                setSuggestions(Array.isArray(data) ? data : []);
                setShowDropdown(true);
            } catch (error) {
                console.error("Error fetching suggestions:", error);
            } finally {
                setIsLoading(false);
            }
        }, 300);

        return () => {
            if (debounceTimer.current) clearTimeout(debounceTimer.current);
        };
    }, [query, API_BASE]);

    const saveToHistory = (searchTerm) => {
        const trimmed = searchTerm.trim();
        if (!trimmed) return;

        let history = JSON.parse(localStorage.getItem("searchHistory") || "[]");
        history = history.filter((item) => item !== trimmed);
        history.unshift(trimmed);
        if (history.length > 10) history = history.slice(0, 10);

        localStorage.setItem("searchHistory", JSON.stringify(history));
        setSearchHistory(history);
    };

    const removeFromHistory = (e, term) => {
        e.stopPropagation();
        const updated = searchHistory.filter((item) => item !== term);
        localStorage.setItem("searchHistory", JSON.stringify(updated));
        setSearchHistory(updated);
    };

    const clearHistory = (e) => {
        e.stopPropagation();
        localStorage.removeItem("searchHistory");
        setSearchHistory([]);
    };

    const handleSearch = (e, searchTerm = query) => {
        e?.preventDefault();
        const term = searchTerm.trim();
        if (!term) return;

        saveToHistory(term);
        setShowDropdown(false);
        setQuery(term);
        router.push(`/search?query=${encodeURIComponent(term)}`);
    };

    const handleSuggestionClick = (name) => {
        setQuery(name);
        handleSearch(null, name);
    };

    const handleLogout = () => {
        logout();
        setShowUserMenu(false);
        router.push("/");
    };

    const getUserDashboard = () => {
        if (user?.role === "admin") return "/admin";
        if (user?.role === "staff") return "/staff";
        return "/account";
    };

    return (
        <header className="header">
            <nav className="nav">
                <Link href="/" className="logo">
                    <Image src="/images/logo1_vsnvgr.png" alt="DONIDG" width={120} height={60} />
                </Link>

                <ul className="nav-menu">
                    <li><Link href="/">Trang chủ</Link></li>
                    <li><Link href="/nike">Nike</Link></li>
                    <li><Link href="/adidas">Adidas</Link></li>
                    <li><Link href="/otherBrand">Hãng khác</Link></li>
                    <li><Link href="/accessories">Phụ kiện</Link></li>
                    <li><Link href="/ngay-hot-deal">Ngày Hot Deal</Link></li>
                </ul>

                <div className="nav-icons">
                    <div className="search-container" ref={dropdownRef}>
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

                        {showDropdown && (
                            <div className="search-dropdown">
                                {isLoading && (
                                    <div className="dropdown-loading">
                                        <i className="fa-solid fa-spinner fa-spin"></i>
                                        Đang tìm kiếm...
                                    </div>
                                )}

                                {!isLoading && suggestions.length > 0 && (
                                    <div className="dropdown-section">
                                        <div className="dropdown-header">Gợi ý</div>
                                        {suggestions.map((item) => (
                                            <div
                                                key={item.id}
                                                className="dropdown-item"
                                                onClick={() => handleSuggestionClick(item.name)}
                                            >
                                                <i className="fa-solid fa-search"></i>
                                                <span>{item.name}</span>
                                                {item.product_code && <span className="item-code">#{item.product_code}</span>}
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {!isLoading && suggestions.length === 0 && searchHistory.length > 0 && (
                                    <div className="dropdown-section">
                                        <div className="dropdown-header">
                                            <span>Tìm kiếm gần đây</span>
                                            <button className="clear-history-btn" onClick={clearHistory}>
                                                Xóa tất cả
                                            </button>
                                        </div>

                                        {searchHistory.map((item, index) => (
                                            <div
                                                key={index}
                                                className="dropdown-item"
                                                onClick={(e) => handleSearch(e, item)}
                                            >
                                                <i className="fa-solid fa-clock-rotate-left"></i>
                                                <span>{item}</span>
                                                <button className="remove-item-btn" onClick={(e) => removeFromHistory(e, item)}>
                                                    <i className="fa-solid fa-xmark"></i>
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {!isLoading && suggestions.length === 0 && searchHistory.length === 0 && query.length >= 2 && (
                                    <div className="dropdown-empty">Không tìm thấy kết quả</div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* ✅ USER ICON: login vs menu */}
                    {isAuthenticated() ? (
                        <div className="user-menu-container" ref={userMenuRef}>
                            <button className="icon-btn" onClick={() => setShowUserMenu(!showUserMenu)} aria-label="Tài khoản">
                                <i className="fa-icon fa-regular fa-user"></i>
                            </button>

                            {showUserMenu && (
                                <div className="user-dropdown">
                                    <div className="user-info">
                                        <i className="fa-solid fa-user-circle"></i>
                                        <div>
                                            <p className="user-email">{user?.email}</p>
                                            <p className="user-role">
                                                {user?.role === "admin" && "Admin"}
                                                {user?.role === "staff" && "Nhân viên"}
                                                {user?.role === "customer" && "Khách hàng"}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="user-menu-divider"></div>

                                    <Link href={getUserDashboard()} className="user-menu-item">
                                        <i className="fa-solid fa-dashboard"></i>
                                        Trang chủ
                                    </Link>

                                    {user?.role === "customer" && (
                                        <Link href="/account/orders" className="user-menu-item">
                                            <i className="fa-solid fa-shopping-bag"></i>
                                            Đơn hàng của tôi
                                        </Link>
                                    )}

                                    <div className="user-menu-divider"></div>

                                    <button onClick={handleLogout} className="user-menu-item logout">
                                        <i className="fa-solid fa-sign-out"></i>
                                        Đăng xuất
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <Link
                            href="/login"
                            className="icon-btn"
                            onClick={() => {
                                if (typeof window !== "undefined") {
                                    localStorage.setItem("redirectAfterLogin", window.location.pathname);
                                }
                            }}
                            aria-label="Đăng nhập"
                            title="Đăng nhập"
                        >
                            <i className="fa-icon fa-regular fa-user"></i>
                        </Link>
                    )}

                    {/* ✅ CART ICON + BADGE */}
                    <Link href="/cart" className="cart-icon-wrap" aria-label="Giỏ hàng" title="Giỏ hàng">
                        <i className="fa-icon fa-solid fa-cart-shopping"></i>
                        {cartCount > 0 && <span className="cart-badge">{cartCount > 99 ? "99+" : cartCount}</span>}
                    </Link>
                </div>
            </nav>
        </header>
    );
}
