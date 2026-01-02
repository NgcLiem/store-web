"use client";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "../../contexts/AuthContexts";
import { useRouter } from "next/navigation";
import Link from "next/link";
import "./staff.css";

function StaffContent() {
    const { user, logout } = useAuth();
    const router = useRouter();

    const handleLogout = () => {
        logout();
        router.push("/login");
    };

    return (
        <main className="staff-main">
            <div className="staff-header">
                <h1>Dashboard Nhân Viên</h1>
                <div className="staff-stats">
                    <div className="stat-card">
                        <i className="fa-solid fa-shopping-cart"></i>
                        <div>
                            <h3>45</h3>
                            <p>Đơn hàng hôm nay</p>
                        </div>
                    </div>
                    <div className="stat-card">
                        <i className="fa-solid fa-clock"></i>
                        <div>
                            <h3>12</h3>
                            <p>Chờ xử lý</p>
                        </div>
                    </div>
                    <div className="stat-card">
                        <i className="fa-solid fa-check"></i>
                        <div>
                            <h3>33</h3>
                            <p>Đã hoàn thành</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="staff-content">
                <h2>Chào mừng Nhân Viên!</h2>
                <p>Đây là trang làm việc dành cho bạn.</p>
                <Link href="/staff/orders" className="quick-actions">
                    <button className="action-btn">
                        <i className="fa-solid fa-search"></i> Tra cứu đơn hàng
                    </button>
                </Link>
            </div>
        </main>

    );
}

export default function StaffPage() {
    return (
        <ProtectedRoute allowedRoles={["staff"]}>
            <StaffContent />
        </ProtectedRoute>
    );
}