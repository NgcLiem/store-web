"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "../../contexts/AuthContexts";
import { useRouter } from "next/navigation";
import "./admin.css";

import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    LineElement,
    PointElement,
    Tooltip,
    Legend,
    Title,
} from "chart.js";
import { Bar, Line } from "react-chartjs-2";

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    LineElement,
    PointElement,
    Tooltip,
    Legend,
    Title
);

function RevenueChart() {
    const labels = ["T1", "T2", "T3", "T4", "T5", "T6", "T7", "T8", "T9", "T10", "T11", "T12"];
    const revenueByMonth = [2.5, 3.2, 4.1, 3.8, 4.6, 5.2, 6.0, 5.5, 6.8, 7.2, 6.7, 8.1]; // triệu VND (demo)
    const ordersByMonth = [12, 18, 24, 20, 30, 32, 40, 36, 45, 48, 44, 55]; // số đơn (demo)

    const barData = {
        labels,
        datasets: [
            {
                label: "Doanh thu (triệu VND)",
                data: revenueByMonth,
                borderRadius: 12,
                backgroundColor: (context) => {
                    const chart = context.chart;
                    const { ctx, chartArea } = chart;
                    if (!chartArea) return "#ffd27d";

                    const gradient = ctx.createLinearGradient(
                        0,
                        chartArea.bottom,
                        0,
                        chartArea.top
                    );
                    gradient.addColorStop(0, "#ffd27d"); // vàng nhạt
                    gradient.addColorStop(1, "#ff9f43"); // cam đậm

                    return gradient;
                },
                hoverBackgroundColor: "#ff9f43",
            },
        ],
    };


    const lineData = {
        labels,
        datasets: [
            {
                label: "Số đơn hàng",
                data: ordersByMonth,
                tension: 0.4,
                pointRadius: 4,
                pointHoverRadius: 6,
                borderWidth: 3,
                borderColor: "#6c63ff",
                pointBackgroundColor: "#6c63ff",
                backgroundColor: (context) => {
                    const chart = context.chart;
                    const { ctx, chartArea } = chart;
                    if (!chartArea) return "rgba(108,99,255,0.15)";

                    const gradient = ctx.createLinearGradient(
                        0,
                        chartArea.top,
                        0,
                        chartArea.bottom
                    );
                    gradient.addColorStop(0, "rgba(108,99,255,0.35)");
                    gradient.addColorStop(1, "rgba(108,99,255,0.05)");
                    return gradient;
                },
                fill: true,
            },
        ],
    };


    const commonOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { position: "top" },
            title: { display: false },
            tooltip: { enabled: true },
        },
        scales: {
            y: { beginAtZero: true },
        },
    };

    return (
        <div className="chart-container revenue-chart">
            <div className="chart-header">
                <h3>Biểu đồ doanh thu sản phẩm trong năm</h3>
                <span className="chart-menu">☰</span>
            </div>

            {/* ✅ layout 2 biểu đồ giống dashboard */}
            <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 18 }}>
                <div style={{ height: 320, background: "#fff", borderRadius: 14, padding: 14 }}>
                    <div style={{ fontWeight: 600, marginBottom: 10 }}>Doanh thu theo tháng</div>
                    <Bar data={barData} options={commonOptions} />
                </div>

                <div style={{ height: 320, background: "#fff", borderRadius: 14, padding: 14 }}>
                    <div style={{ fontWeight: 600, marginBottom: 10 }}>Số đơn theo tháng</div>
                    <Line data={lineData} options={commonOptions} />
                </div>
            </div>
        </div>
    );
}

function AdminContent() {
    const { logout } = useAuth();
    const router = useRouter();

    const handleLogout = () => {
        logout();
        router.push("/login");
    };

    // ✅ hard-code stats (theo đúng UI của bạn)
    const stats = [
        { value: "42,250,088 VND", label: "Tổng doanh thu", iconComponent: "💰", bgColor: "#ffcc66" },
        { value: "13,064,345 VND", label: "Doanh thu tháng này", iconComponent: "📄", bgColor: "#a3c7ff" },
        { value: "41", label: "Tổng số sản phẩm bán được", iconComponent: "📈", bgColor: "#ff99cc" },
        { value: "27", label: "Tổng số sản phẩm mới", iconComponent: "🏷️", bgColor: "#f7a39e" },
    ];

    return (
        <>
            <div className="admin-header">
                <div className="header1" style={{ display: "flex" }}>
                    <h1>Trang chủ</h1>
                </div>
            </div>

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

            <div className="dashboard-layout">
                <RevenueChart />
            </div>

            {/* nếu bạn muốn nút logout ở đây */}
            {/* <button onClick={handleLogout}>Đăng xuất</button> */}
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
