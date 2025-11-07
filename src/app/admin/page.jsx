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
        <>
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
        </>

    );
}

export default function AdminPage() {
    return (
        <ProtectedRoute allowedRoles={["admin"]}>
            <AdminContent />
        </ProtectedRoute>
    );
}