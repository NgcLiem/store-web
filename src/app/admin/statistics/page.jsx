"use client";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "../../../contexts/AuthContexts";
import { useRouter } from "next/navigation";
import "../admin.css";
import "./statistic.css";

// Dựa trên ảnh, đây là component hiển thị biểu đồ
const RevenueChart = () => (
    <div className="chart-container revenue-chart">
        <div className="chart-header">
            <h3>Biểu đồ doanh thu sản phẩm trong năm</h3>
            <span className="chart-menu">☰</span>
        </div>
        {/* Đã loại bỏ inline style, sử dụng class chart-placeholder-style */}
        <div className="chart-placeholder chart-placeholder-style">
            {/* Placeholder cho Biểu đồ Cột */}
            <p>Biểu đồ Cột (Minimus T9 BOA, Tân Lạc Chính Hãng, v.v...)</p>
        </div>
    </div>
);

// Dựa trên ảnh, đây là component Khách hàng tiềm năng
const PotentialCustomers = () => (
    <div className="potential-customers-container">
        <div className="header">
            <i className="fa-solid fa-users"></i>
            <h3>Khách hàng tiềm năng</h3>
        </div>
        <div className="detail-section">
            <p className="detail-title">Doanh thu chi tiết</p>
            <p className="status">comming soon</p>
        </div>
    </div>
);

function AdminContent() {
    const { user } = useAuth();
    // Dữ liệu giả định cho thẻ thống kê lớn, dựa trên hình ảnh
    const stats = [
        { value: "242,250,088 VNĐ", label: "Tổng doanh thu", iconComponent: <i className="fa-solid fa-sack-dollar"></i>, bgColor: '#ffc107' },
        { value: "203,064,145 VNĐ", label: "Doanh thu tháng này", iconComponent: <i className="fa-solid fa-file-invoice"></i>, bgColor: '#007bff' },
        { value: "41", label: "Tổng số sản phẩm bán được", iconComponent: <i className="fa-solid fa-tags"></i>, bgColor: '#e83e8c' },
        { value: "27", label: "Tổng số sản phẩm mới", iconComponent: <i className="fa-solid fa-shop"></i>, bgColor: '#fd7e14' },
    ];

    return (
        <>
            {/* Cấu trúc Header (Search & Profile) dựa trên ảnh */}
            <div className="admin-page-header">
                <div className="search-bar-wrapper">
                    <input type="text" placeholder="Search" className="search-input" />
                    <i className="fa-solid fa-magnifying-glass search-icon"></i>
                </div>
                {/* Profile Avatar và Tên */}
                <div className="user-profile">
                    {/* Dùng div placeholder thay cho img và class đã có sẵn trong admin.css */}
                    <div className="avatar-placeholder"></div>
                    <div className="user-info">
                        <p className="user-name">test</p>
                        <p className="user-role">Super Admin</p>
                    </div>
                    <i className="fa-solid fa-caret-down user-dropdown-icon"></i>
                </div>
            </div>

            <div className="admin-stats-row">
                {stats.map((stat, index) => (
                    // Giữ lại style inline cho card-icon-wrapper để tùy chỉnh màu sắc linh hoạt
                    <div className="stat-card large-stat-card" key={index}>
                        <div className="card-icon-wrapper" style={{ backgroundColor: stat.bgColor + '1A', color: stat.bgColor }}>
                            <span className="card-icon">{stat.iconComponent}</span>
                        </div>
                        <div className="card-info">
                            <h3 className="stat-value">{stat.value}</h3>
                            <p className="stat-label">{stat.label}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="dashboard-layout">
                <RevenueChart />
                <PotentialCustomers />
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