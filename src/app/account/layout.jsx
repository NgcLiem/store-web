"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/contexts/AuthContexts";
import { usePathname, useRouter } from "next/navigation";
import "./customer.css";
import Link from "next/link";

export default function CustomerLayout({ children }) {
    const { user, logout } = useAuth();
    const pathname = usePathname();
    const router = useRouter();

    const isActive = (href) => (pathname === href ? "menu-item active" : "menu-item");

    const handleLogout = () => {
        logout();
        router.push("/login");
    };

    return (
        <ProtectedRoute allowedRoles={["customer"]}>
            <div className="customer-container">
                <aside className="customer-sidebar">
                    <div className="sidebar-header">
                        <h2>👤 TÀI KHOẢN</h2>
                        <p>{user?.email}</p>
                    </div>

                    <nav className="sidebar-menu">
                        <Link href="/account" className={isActive("/account")}>
                            <i className="fa-solid fa-gauge"></i> <span>Tổng quan</span>
                        </Link>
                        <Link href="/account/orders" className={isActive("/account/orders")}>
                            <i className="fa-solid fa-receipt"></i> <span>Đơn hàng của tôi</span>
                        </Link>
                        <Link href="/account/profile" className={isActive("/account/profile")}>
                            <i className="fa-solid fa-id-card"></i> <span>Hồ sơ</span>
                        </Link>
                    </nav>

                    <div className="sidebar-footer">
                        <button className="logout-btn" onClick={handleLogout}>
                            <i className="fa-solid fa-right-from-bracket"></i> Đăng xuất
                        </button>
                    </div>
                </aside>

                <main className="customer-main">{children}</main>
            </div>
        </ProtectedRoute>
    );
}
