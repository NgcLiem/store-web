"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import "../assets/css/header.css"
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
    const { user, logout, isAuthenticated } = useAuth();

    // Load lịch sử tìm kiếm khi component mount
    useEffect(() => {
        const history = JSON.parse(localStorage.getItem("searchHistory") || "[]");
        setSearchHistory(history);
    }, []);

    // Đóng dropdown khi click bên ngoài
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

    // Fetch gợi ý khi user gõ
    useEffect(() => {
        if (query.trim().length < 2) {
            setSuggestions([]);
            setShowDropdown(query.length > 0); // Hiện history nếu có input
            return;
        }

        // Debounce để tránh gọi API liên tục
        if (debounceTimer.current) {
            clearTimeout(debounceTimer.current);
        }

        debounceTimer.current = setTimeout(async () => {
            setIsLoading(true);
            try {
                const res = await fetch(`/api/products/autocomplete?query=${encodeURIComponent(query)}`);
                const data = await res.json();
                setSuggestions(data);
                setShowDropdown(true);
            } catch (error) {
                console.error("Error fetching suggestions:", error);
            } finally {
                setIsLoading(false);
            }
        }, 300); // Đợi 300ms sau khi user ngừng gõ

        return () => {
            if (debounceTimer.current) {
                clearTimeout(debounceTimer.current);
            }
        };
    }, [query]);

    // Lưu lịch sử tìm kiếm
    const saveToHistory = (searchTerm) => {
        const trimmed = searchTerm.trim();
        if (!trimmed) return;

        let history = JSON.parse(localStorage.getItem("searchHistory") || "[]");

        // Xóa duplicate nếu có
        history = history.filter(item => item !== trimmed);

        // Thêm vào đầu danh sách
        history.unshift(trimmed);

        // Giữ tối đa 10 mục
        if (history.length > 10) {
            history = history.slice(0, 10);
        }

        localStorage.setItem("searchHistory", JSON.stringify(history));
        setSearchHistory(history);
    };

    // Xóa một mục trong lịch sử
    const removeFromHistory = (e, term) => {
        e.stopPropagation();
        const updated = searchHistory.filter(item => item !== term);
        localStorage.setItem("searchHistory", JSON.stringify(updated));
        setSearchHistory(updated);
    };

    // Xóa toàn bộ lịch sử
    const clearHistory = (e) => {
        e.stopPropagation();
        localStorage.removeItem("searchHistory");
        setSearchHistory([]);
    };

    const handleSearch = (e, searchTerm = query) => {
        e?.preventDefault();
        const term = searchTerm.trim();
        if (term) {
            saveToHistory(term);
            setShowDropdown(false);
            setQuery("");
            router.push(`/search?query=${encodeURIComponent(term)}`);
        }
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
                    <img src="/images/logo1.png" alt="DONIDG" width={120} height={60} />
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

                        {/* Dropdown gợi ý và lịch sử */}
                        {showDropdown && (
                            <div className="search-dropdown">
                                {/* Hiển thị loading */}
                                {isLoading && (
                                    <div className="dropdown-loading">
                                        <i className="fa-solid fa-spinner fa-spin"></i>
                                        Đang tìm kiếm...
                                    </div>
                                )}

                                {/* Hiển thị gợi ý */}
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
                                                {item.product_code && (
                                                    <span className="item-code">#{item.product_code}</span>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Hiển thị lịch sử */}
                                {!isLoading && suggestions.length === 0 && searchHistory.length > 0 && (
                                    <div className="dropdown-section">
                                        <div className="dropdown-header">
                                            <span>Tìm kiếm gần đây</span>
                                            <button
                                                className="clear-history-btn"
                                                onClick={clearHistory}
                                            >
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
                                                <button
                                                    className="remove-item-btn"
                                                    onClick={(e) => removeFromHistory(e, item)}
                                                >
                                                    <i className="fa-solid fa-xmark"></i>
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Không có kết quả */}
                                {!isLoading && suggestions.length === 0 && searchHistory.length === 0 && query.length >= 2 && (
                                    <div className="dropdown-empty">
                                        Không tìm thấy kết quả
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {isAuthenticated() ? (
                        <div className="user-menu-container" ref={userMenuRef}>
                            <button
                                className="user-btn"
                                onClick={() => setShowUserMenu(!showUserMenu)}
                            >
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
                                        <Link href="/orders" className="user-menu-item">
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
                        <Link href="/login" onClick={() => {
                            if (typeof window !== "undefined") {
                                localStorage.setItem("redirectAfterLogin", window.location.pathname);
                            }
                        }}>
                            <i className="fa-icon fa-regular fa-user"></i>
                        </Link>
                    )}
                    <Link href="/cart">
                        <i className="fa-icon fa-solid fa-cart-shopping"></i>
                    </Link>
                </div>
            </nav>
        </header >
    );
}
