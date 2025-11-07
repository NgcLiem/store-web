// src/app/admin/page.jsx
"use client";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "../../contexts/AuthContexts";
import { useRouter } from "next/navigation";
import "./admin.css";

function AdminContent() {
    const { user, logout } = useAuth();
    const router = useRouter();

    const handleLogout = () => {
        logout();
        router.push("/login");
    };

    return (
        <div className="admin-container">
            <aside className="admin-sidebar">
                <div className="sidebar-header">
                    <h2>👑 ADMIN</h2>
                    <p>{user?.email}</p>
                </div>
                <nav className="sidebar-menu">
                    <a href="/admin" className="menu-item active">
                        <i className="fa-solid fa-dashboard"></i> Dashboard
                    </a>
                    <a href="/admin/products" className="menu-item">
                        <i className="fa-solid fa-box"></i> Quản lý sản phẩm
                    </a>
                    <a href="/admin/orders" className="menu-item">
                        <i className="fa-solid fa-shopping-cart"></i> Quản lý đơn hàng
                    </a>
                    <a href="/admin/users" className="menu-item">
                        <i className="fa-solid fa-users"></i> Quản lý người dùng
                    </a>
                    <a href="/admin/staff" className="menu-item">
                        <i className="fa-solid fa-user-tie"></i> Quản lý nhân viên
                    </a>
                    <a href="/admin/statistics" className="menu-item">
                        <i className="fa-solid fa-chart-line"></i> Thống kê
                    </a>
                </nav>
                <div className="sidebar-footer">
                    <button onClick={handleLogout} className="logout-btn">
                        <i className="fa-solid fa-sign-out"></i> Đăng xuất
                    </button>
                </div>
            </aside>

            <main className="admin-main">
                <div className="admin-header">
                    <h1>Dashboard</h1>
                    <div className="admin-stats">
                        <div className="stat-card">
                            <i className="fa-solid fa-box"></i>
                            <div>
                                <h3>1,234</h3>
                                <p>Sản phẩm</p>
                            </div>
                        </div>
                        <div className="stat-card">
                            <i className="fa-solid fa-shopping-cart"></i>
                            <div>
                                <h3>567</h3>
                                <p>Đơn hàng</p>
                            </div>
                        </div>
                        <div className="stat-card">
                            <i className="fa-solid fa-users"></i>
                            <div>
                                <h3>890</h3>
                                <p>Khách hàng</p>
                            </div>
                        </div>
                        <div className="stat-card">
                            <i className="fa-solid fa-dollar-sign"></i>
                            <div>
                                <h3>123.4M</h3>
                                <p>Doanh thu</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="admin-content">
                    <h2>Chào mừng Admin!</h2>
                    <p>Đây là trang quản trị dành riêng cho Admin.</p>
                </div>
            </main>
        </div>
    );
}

export default function AdminPage() {
    return (
        <ProtectedRoute allowedRoles={["admin"]}>
            <AdminContent />
        </ProtectedRoute>
    );
}