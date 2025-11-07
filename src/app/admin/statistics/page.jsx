// src/app/admin/statistics/page.jsx
"use client";

import { useEffect, useState } from "react";
import "../admin.css";

export default function AdminStatisticsPage() {
    const [summary, setSummary] = useState({ orders: 0, revenue: 0, customers: 0, products: 0 });

    useEffect(() => {
        (async () => {
            // Bạn có thể gọi nhiều API rồi tổng hợp lại
            try {
                const res = await fetch("/api/statistics");
                const data = await res.json().catch(() => null);
                if (res.ok && data) setSummary(data);
            } catch { }
        })();
    }, []);

    return (
        <>
            <div className="admin-header">
                <h1>Thống kê</h1>
                <div className="admin-stats">
                    <div className="stat-card"><i className="fa-solid fa-shopping-cart" /><div><h3>{summary.orders}</h3><p>Đơn hàng</p></div></div>
                    <div className="stat-card"><i className="fa-solid fa-dollar-sign" /><div><h3>{(summary.revenue || 0).toLocaleString()}₫</h3><p>Doanh thu</p></div></div>
                    <div className="stat-card"><i className="fa-solid fa-users" /><div><h3>{summary.customers}</h3><p>Khách hàng</p></div></div>
                    <div className="stat-card"><i className="fa-solid fa-box" /><div><h3>{summary.products}</h3><p>Sản phẩm</p></div></div>
                </div>
            </div>

            <div className="admin-content">
                <h2>Bảng biểu</h2>
                <p>Tuỳ bạn tích hợp chart (Recharts/Chart.js) — phần layout đã sẵn sàng.</p>
            </div>
        </>
    );
}
