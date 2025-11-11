"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/contexts/AuthContexts";
import { useRouter } from "next/navigation";
import "./staff.css";
import Link from "next/link";

export default function StaffLayout({ children }) {
    const { user, logout } = useAuth();
    const router = useRouter();

    const handleLogout = () => {
        logout();
        router.push("/login");
    };

    return (
        <ProtectedRoute allowedRoles={["staff"]}>
            <div className="staff-container">
                <aside className="staff-sidebar">
                    <div className="sidebar-header">
                        <h2>👔 NHÂN VIÊN</h2>
                        <p>{user?.email}</p>
                    </div>

                    <nav className="sidebar-menu">
                        <Link href="/staff" className="menu-item">
                            <i className="fa-solid fa-gauge"></i> <span>Trang chủ</span>
                        </Link>
                        <Link href="/staff/orders" className="menu-item">
                            <i className="fa-solid fa-cart-shopping"></i> <span>Quản lý đơn hàng</span>
                        </Link>
                        <Link href="/staff/products" className="menu-item">
                            <i className="fa-solid fa-box"></i> <span>Sản phẩm</span>
                        </Link>
                        <Link href="/staff/customers" className="menu-item">
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
