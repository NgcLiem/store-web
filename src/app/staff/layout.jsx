"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/contexts/AuthContexts";
import { usePathname, useRouter } from "next/navigation";
import "./staff.css";
import Link from "next/link";

export default function StaffLayout({ children }) {
    const { user, logout } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    const handleLogout = () => {
        logout();
        router.push("/login");
    };

    const isActive = (href) => (pathname === href ? "menu-item active" : "menu-item");

    return (
        <ProtectedRoute allowedRoles={["staff"]}>
            <div className="staff-container">
                <aside className="staff-sidebar">
                    <div className="sidebar-header">
                        <h2>👔 NHÂN VIÊN</h2>
                        <p>{user?.email}</p>
                    </div>

                    <nav className="sidebar-menu">
                        <Link href="/staff" className={isActive("/staff")}>
                            <i className="fa-solid fa-gauge"></i> <span>Trang chủ</span>
                        </Link>
                        {/* <Link href="/admin" className={isActive("/admin")}><i className="fa-solid fa-clock"></i> <span>Trang chủ</span></Link> */}
                        <Link href="/staff/orders" className={isActive("/staff/orders")}>
                            <i className="fa-solid fa-cart-shopping"></i> <span>Quản lý đơn hàng</span>
                        </Link>
                        <Link href="/staff/products" className={isActive("/staff/products")}>
                            <i className="fa-solid fa-box"></i> <span>Sản phẩm</span>
                        </Link>
                        <Link href="/staff/customers" className={isActive("/staff/customers")}>
                            <i className="fa-solid fa-users"></i> <span>Khách hàng</span>
                        </Link>
                    </nav>

                    <div className="sidebar-footer">
                        <button onClick={handleLogout} className="logout-btn">
                            <i className="fa-solid fa-right-from-bracket"></i> Đăng xuất
                        </button>
                    </div>
                </aside>

                {children}
            </div>
        </ProtectedRoute>
    );
}
