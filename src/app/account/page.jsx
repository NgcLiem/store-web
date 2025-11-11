"use client";

import { useAuth } from "@/contexts/AuthContexts";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function CustomerDashboard() {
    const { user, token } = useAuth();
    const [summary, setSummary] = useState({ orders: 0, pending: 0, delivered: 0, spending: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            if (!token) return;
            try {
                setLoading(true);
                // Backend: lọc theo user id hoặc token. Tuỳ API của bạn:
                const res = await fetch(`/api/orders?userId=${user?.id}`, {
                    headers: { Authorization: `Bearer ${token}` },
                    cache: "no-store",
                });
                const data = await res.json().catch(() => []);
                const items = Array.isArray(data) ? data : data?.items || [];

                const s = {
                    orders: items.length,
                    pending: items.filter((o) => ["pending", "confirmed", "processing"].includes(o.status)).length,
                    delivered: items.filter((o) => ["delivered", "completed"].includes(o.status)).length,
                    spending: items
                        .filter((o) => ["delivered", "completed"].includes(o.status))
                        .reduce((t, o) => t + Number(o.total || o.total_amount || 0), 0),
                };
                setSummary(s);
            } finally {
                setLoading(false);
            }
        })();
    }, [token, user?.id]);

    return (
        <>
            <div className="customer-header">
                <h1>Xin chào, {user?.full_name || user?.email} 👋</h1>
                <p>Trang tổng quan tài khoản của bạn</p>
            </div>

            <div className="customer-stats">
                <div className="stat-card">
                    <i className="fa-solid fa-clipboard-list" />
                    <div>
                        <h3>{loading ? "…" : summary.orders}</h3>
                        <p>Tổng đơn hàng</p>
                    </div>
                </div>
                <div className="stat-card">
                    <i className="fa-solid fa-clock" />
                    <div>
                        <h3>{loading ? "…" : summary.pending}</h3>
                        <p>Đang chờ xử lý</p>
                    </div>
                </div>
                <div className="stat-card">
                    <i className="fa-solid fa-check-circle" />
                    <div>
                        <h3>{loading ? "…" : summary.delivered}</h3>
                        <p>Đã giao</p>
                    </div>
                </div>
                <div className="stat-card">
                    <i className="fa-solid fa-sack-dollar" />
                    <div>
                        <h3>{loading ? "…" : summary.spending.toLocaleString()}₫</h3>
                        <p>Tổng chi tiêu</p>
                    </div>
                </div>
            </div>

            <div className="customer-content">
                <div className="panel">
                    <h3>Hành động nhanh</h3>
                    <div className="quick-actions">
                        <Link className="action-btn" href="/account/orders">Xem đơn hàng</Link>
                        <Link className="action-btn" href="/account/profile">Xem hồ sơ</Link>
                        <Link className="action-btn" href="/cart">Xem giỏ hàng</Link>
                    </div>
                </div>
            </div>
        </>
    );
}
