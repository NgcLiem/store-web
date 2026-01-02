"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "../../contexts/AuthContexts";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
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
    Title,
);

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

const formatVND = (n) =>
    new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
    }).format(Number(n || 0));

function ChartCard({ title, children }) {
    return (
        <div className="admin-chart-card">
            <div className="admin-chart-card-title">{title}</div>
            <div className="admin-chart-card-body">{children}</div>
        </div>
    );
}

function AdminContent() {
    const { logout } = useAuth();
    const router = useRouter();

    const [summary, setSummary] = useState(null);
    const [daily, setDaily] = useState([]);
    const [monthly, setMonthly] = useState([]);
    const [yearly, setYearly] = useState([]);
    const [loading, setLoading] = useState(true);

    const handleLogout = () => {
        logout();
        router.push("/login");
    };

    useEffect(() => {
        (async () => {
            try {
                setLoading(true);

                const res = await fetch(
                    `${API_BASE}/admin-stats/dashboard?days=14&months=12&years=5`,
                    { cache: "no-store" },
                );
                const data = await res.json().catch(() => null);

                setSummary(data?.summary || null);
                setDaily(Array.isArray(data?.daily) ? data.daily : []);
                setMonthly(Array.isArray(data?.monthly) ? data.monthly : []);
                setYearly(Array.isArray(data?.yearly) ? data.yearly : []);
            } catch (e) {
                console.error("Admin stats fetch error:", e);
                setSummary(null);
                setDaily([]);
                setMonthly([]);
                setYearly([]);
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    const commonOptions = useMemo(
        () => ({
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: "top" },
                title: { display: false },
                tooltip: { enabled: true },
            },
            scales: { y: { beginAtZero: true } },
        }),
        [],
    );

    // DAILY
    const dailyLabels = daily.map((x) => x.label);
    const dailyRevenue = daily.map((x) => x.revenue);
    const dailyOrders = daily.map((x) => x.orders);

    const dailyBarData = useMemo(
        () => ({
            labels: dailyLabels,
            datasets: [
                {
                    label: "Doanh thu (VND)",
                    data: dailyRevenue,
                    borderRadius: 12,
                },
            ],
        }),
        [dailyLabels, dailyRevenue],
    );

    const dailyLineData = useMemo(
        () => ({
            labels: dailyLabels,
            datasets: [
                {
                    label: "Số đơn (ngày)",
                    data: dailyOrders,
                    tension: 0.35,
                    borderWidth: 3,
                    pointRadius: 3,
                    fill: false,
                },
            ],
        }),
        [dailyLabels, dailyOrders],
    );

    // MONTHLY
    const monthlyLabels = monthly.map((x) => x.label);
    const monthlyRevenue = monthly.map((x) => x.revenue);

    const monthlyLineData = useMemo(
        () => ({
            labels: monthlyLabels,
            datasets: [
                {
                    label: "Doanh thu theo tháng (VND)",
                    data: monthlyRevenue,
                    tension: 0.35,
                    borderWidth: 3,
                    pointRadius: 3,
                    fill: false,
                },
            ],
        }),
        [monthlyLabels, monthlyRevenue],
    );

    // YEARLY
    const yearlyLabels = yearly.map((x) => x.label);
    const yearlyRevenue = yearly.map((x) => x.revenue);

    const yearlyBarData = useMemo(
        () => ({
            labels: yearlyLabels,
            datasets: [
                {
                    label: "Doanh thu theo năm (VND)",
                    data: yearlyRevenue,
                    borderRadius: 12,
                },
            ],
        }),
        [yearlyLabels, yearlyRevenue],
    );

    const stats = useMemo(() => {
        const totalRevenue = summary?.totalRevenue ?? 0;
        const revenueThisMonth = summary?.revenueThisMonth ?? 0;
        const totalSold = summary?.totalSold ?? 0;
        const newProducts = summary?.newProducts ?? 0;

        return [
            {
                value: formatVND(totalRevenue),
                label: "Tổng doanh thu",
                iconComponent: "💰",
                bgColor: "#ffcc66",
            },
            {
                value: formatVND(revenueThisMonth),
                label: "Doanh thu tháng này",
                iconComponent: "📄",
                bgColor: "#a3c7ff",
            },
            {
                value: String(totalSold),
                label: "Tổng số sản phẩm bán được",
                iconComponent: "📈",
                bgColor: "#ff99cc",
            },
            {
                value: String(newProducts),
                label: "Tổng số sản phẩm mới",
                iconComponent: "🏷️",
                bgColor: "#f7a39e",
            },
        ];
    }, [summary]);

    return (
        <>
            <div className="admin-header">
                <div className="header1 admin-header-flex">
                    <h1>Trang chủ</h1>
                </div>
            </div>

            <div className="admin-stats-row">
                {stats.map((stat) => (
                    <div
                        className="stat-card large-stat-card"
                        key={stat.label}
                        style={{ "--bg-color": stat.bgColor }}
                    >
                        <div className="card-icon-wrapper">
                            <span className="card-icon">
                                {stat.iconComponent}
                            </span>
                        </div>
                        <div className="card-info">
                            <h3 className="stat-value">
                                {loading ? "..." : stat.value}
                            </h3>
                            <p className="stat-label">{stat.label}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="dashboard-layout">
                <div className="chart-container revenue-chart">
                    <div className="chart-header">
                        <h3>Thống kê doanh thu</h3>
                        <span className="chart-menu">☰</span>
                    </div>

                    <div className="admin-charts-grid-2">
                        <ChartCard title="Doanh thu theo ngày (14 ngày gần nhất)">
                            <div className="admin-chart-h320">
                                <Bar
                                    data={dailyBarData}
                                    options={commonOptions}
                                />
                            </div>
                        </ChartCard>

                        <ChartCard title="Số đơn theo ngày (14 ngày gần nhất)">
                            <div className="admin-chart-h320">
                                <Line
                                    data={dailyLineData}
                                    options={commonOptions}
                                />
                            </div>
                        </ChartCard>

                        <div className="admin-charts-full">
                            <div className="admin-charts-grid-2">
                                <ChartCard title="Doanh thu theo tháng (12 tháng)">
                                    <div className="admin-chart-h320">
                                        <Line
                                            data={monthlyLineData}
                                            options={commonOptions}
                                        />
                                    </div>
                                </ChartCard>

                                <ChartCard title="Doanh thu theo năm (2 năm)">
                                    <div className="admin-chart-h320">
                                        <Bar
                                            data={yearlyBarData}
                                            options={commonOptions}
                                        />
                                    </div>
                                </ChartCard>
                            </div>
                        </div>
                    </div>
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
