"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/contexts/AuthContexts";
import { usePathname, useRouter } from "next/navigation";
import "./admin.css";
import Link from "next/link";

export default function AdminLayout({ children }) {
    const { user, logout } = useAuth();
    const pathname = usePathname();
    const router = useRouter();

    const isActive = (href) => (pathname === href ? "menu-item active" : "menu-item");

    return (
        <ProtectedRoute allowedRoles={["admin"]}>
            <div className="admin-container">
                <aside className="admin-sidebar">
                    <div className="sidebar-header">
                        <h2>👑 ADMIN</h2>
                        <p>{user?.email}</p>
                    </div>

                    <nav className="sidebar-menu">
                        <Link href="/admin" className={isActive("/admin")}><i className="fa-solid fa-clock"></i> <span>Trang chủ</span></Link>
                        <Link href="/admin/products" className={isActive("/admin/products")}><i className="fa-solid fa-box"></i> <span>Quản lý sản phẩm</span></Link>
                        <Link href="/admin/orders" className={isActive("/admin/orders")}><i className="fa-solid fa-cart-shopping"></i> <span>Quản lý đơn hàng</span></Link>
                        <Link href="/admin/users" className={isActive("/admin/users")}><i className="fa-solid fa-users"></i> <span>Quản lý người dùng</span></Link>
                        <Link href="/admin/staff" className={isActive("/admin/staff")}><i className="fa-solid fa-user-tie"></i> <span>Quản lý nhân viên</span></Link>
                        <Link href="/admin/statistics" className={isActive("/admin/statistics")}><i className="fa-solid fa-chart-line"></i> <span>Thống kê</span></Link>
                    </nav>

                    <div className="sidebar-footer">
                        <button className="logout-btn" onClick={() => { logout(); router.push("/login"); }}>
                            <i className="fa-solid fa-sign-out"></i> Đăng xuất
                        </button>
                    </div>
                </aside>

                <main className="admin-main">{children}</main>
            </div>
        </ProtectedRoute>
    );
}
