"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "../../contexts/AuthContexts";
import { useRouter } from "next/navigation";
import "./admin.css";          // CSS gốc của bạn

const RevenueChart = () => (
    <div className="chart-container revenue-chart">
        <div className="chart-header">
            <h3>Biểu đồ doanh thu sản phẩm trong năm</h3>
            <span className="chart-menu">☰</span>
        </div>

        <div className="chart-placeholder">
            <p>Biểu đồ Cột (Minimus T9 BOA, Tăng Lực Chính Hãng,...)</p>
        </div>
    </div>
);

function AdminContent() {
    const { logout } = useAuth();
    const router = useRouter();

    const handleLogout = () => {
        logout();
        router.push("/login");
    };

    const stats = [
        {
            value: "242,250,088 VND",
            label: "Tổng doanh thu",
            iconComponent: "💰",
            bgColor: "#ffcc66"
        },
        {
            value: "203,064,345 VND",
            label: "Doanh thu tháng này",
            iconComponent: "📄",
            bgColor: "#a3c7ff"
        },
        {
            value: "41",
            label: "Tổng số sản phẩm bán được",
            iconComponent: "📈",
            bgColor: "#ff99cc"
        },
        {
            value: "27",
            label: "Tổng số sản phẩm mới",
            iconComponent: "🏷️",
            bgColor: "#f7a39e"
        }
    ];

    return (
        <>
            <div className="admin-header">
                <div className="header1" style={{ display: "flex" }}>
                    <h1>Trang chủ</h1>
                    {/* SEARCH BAR */}
                    <div className="search-bar-wrapper">
                        <input type="text" placeholder="Search" className="search-input" />
                        <i className="fa-solid fa-magnifying-glass search-icon"
                            style={{ top: "25px" }}
                        ></i>
                    </div>
                </div>

                {/* STATS */}
                <div className="admin-stats-row">
                    {stats.map((stat, index) => (
                        <div
                            className="stat-card large-stat-card"
                            key={index}
                            style={{ "--bg-color": stat.bgColor }}
                        >
                            <div className="card-icon-wrapper">
                                <span className="card-icon">{stat.iconComponent}</span>
                            </div>

                            <div className="card-info">
                                <h3 className="stat-value">{stat.value}</h3>
                                <p className="stat-label">{stat.label}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* CHART */}
                <div className="dashboard-layout">
                    <RevenueChart />
                </div>

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
