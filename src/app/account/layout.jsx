"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContexts";
import "./customer.css";

export default function AccountLayout({ children }) {
    const pathname = usePathname();
    const { user, logout } = useAuth();
    const router = useRouter();

    const menu = [
        { href: "/account", icon: "fa-house", label: "Tổng quan" },
        { href: "/account/profile", icon: "fa-user", label: "Hồ sơ cá nhân" },
        { href: "/account/orders", icon: "fa-receipt", label: "Đơn hàng của bạn" },
        { href: "/account/addresses", icon: "fa-location-dot", label: "Địa chỉ của bạn" },
        { href: "/account/vouchers", icon: "fa-ticket", label: "Voucher của bạn" },
        { href: "/account/payments", icon: "fa-credit-card", label: "Thanh toán" },
    ];

    const firstChar = (user?.full_name || user?.email || "GUEST")
        .trim()
        .charAt(0)
        .toUpperCase();

    const handleLogout = () => {
        logout();
        router.push("/login");
    };

    return (
        <ProtectedRoute allowedRoles={["customer"]}>
            <div className="customer-container">
                <aside className="customer-sidebar">
                    <div className="sidebar-header-customer">
                        <div className="sidebar-avatar">{firstChar}</div>
                        <div>
                            <h2>Tài khoản</h2>
                            <p>{user?.full_name || user?.email || "Khách"}</p>
                        </div>
                    </div>

                    <nav className="sidebar-menu-customer">
                        {menu.map((item) => {
                            const active =
                                pathname === item.href ||
                                (item.href !== "/account" &&
                                    pathname?.startsWith(item.href));
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`menu-item-customer ${active ? "active" : ""}`}
                                >
                                    <i className={`fa-solid ${item.icon}`} />
                                    <span>{item.label}</span>
                                </Link>
                            );
                        })}
                    </nav>

                    <div className="sidebar-footer">
                        <button
                            className="logout-btn-customer"
                            type="button"
                            onClick={handleLogout}
                        >
                            <i className="fa-solid fa-arrow-right-from-bracket" />
                            Đăng xuất
                        </button>
                    </div>
                </aside>

                <section className="customer-main">{children}</section>
            </div>
        </ProtectedRoute>
    );
}
