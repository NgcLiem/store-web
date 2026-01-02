"use client";

import { useAuth } from "@/contexts/AuthContexts";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

export default function CustomerDashboard() {
    const { user, token } = useAuth();
    const router = useRouter();
    const [summary, setSummary] = useState({ orders: 0, pending: 0, delivered: 0, spending: 0 });
    const [recentOrders, setRecentOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!token) {
            router.push("/login?callback=/account");
        }
    }, [token, router]);

    useEffect(() => {
        (async () => {
            if (!token || !user?.id) return;
            try {
                setLoading(true);
                const res = await fetch(`${API_BASE}/orders?user_id=${user.id}`, {
                    headers: { Authorization: `Bearer ${token}` },
                    cache: "no-store",
                });

                const data = await res.json().catch(() => []);
                const items = Array.isArray(data) ? data : data?.items || data?.orders || [];

                const s = {
                    orders: items.length,
                    pending: items.filter((o) => ["pending", "processing"].includes(o.status)).length,
                    delivered: items.filter((o) => ["delivered", "completed"].includes(o.status)).length,
                    spending: items
                        .filter((o) => ["delivered", "completed"].includes(o.status))
                        .reduce((t, o) => t + Number(o.total_amount || o.total || 0), 0),
                };
                setSummary(s);
                setRecentOrders(items.slice(0, 3));
            } finally {
                setLoading(false);
            }
        })();
    }, [token, user?.id]);

    const formatPrice = (price) => new Intl.NumberFormat("vi-VN").format(price) + "₫";

    const getStatusBadge = (status) => {
        const colors = {
            pending: "#FFC107",
            confirmed: "#17A2B8",
            processing: "#17A2B8",
            delivered: "#28A745",
            completed: "#28A745",
            cancelled: "#DC3545",
        };
        return (
            <span
                style={{
                    display: "inline-block",
                    padding: "4px 12px",
                    borderRadius: "4px",
                    backgroundColor: colors[status] || "#6C757D",
                    color: "white",
                    fontSize: "12px",
                    fontWeight: "bold",
                    textTransform: "capitalize",
                }}
            >
                {status === "pending" && "Chờ xác nhận"}
                {status === "confirmed" && "Đã xác nhận"}
                {status === "processing" && "Đang xử lý"}
                {status === "delivered" && "Đã giao"}
                {status === "completed" && "Hoàn thành"}
                {status === "cancelled" && "Đã hủy"}
            </span>
        );
    };

    return (
        <>
            <div className="customer-header">
                <h1>Xin chào, {user?.full_name || user?.email} 👋</h1>
                <p>Trang tổng quan tài khoản của bạn</p>
            </div>

            <div className="customer-stats">
                <div
                    className="stat-card"
                    onClick={() => router.push("/account/orders")}
                    style={{ cursor: "pointer" }}
                >
                    <i className="fa-solid fa-clipboard-list" />
                    <div>
                        <h3>{loading ? "…" : summary.orders}</h3>
                        <p>Tổng đơn hàng</p>
                    </div>
                </div>
                <div
                    className="stat-card"
                    onClick={() => router.push("/account/orders?status=pending")}
                    style={{ cursor: "pointer" }}
                >
                    <i className="fa-solid fa-clock" />
                    <div>
                        <h3>{loading ? "…" : summary.pending}</h3>
                        <p>Đang chờ xử lý</p>
                    </div>
                </div>
                <div
                    className="stat-card"
                    onClick={() => router.push("/account/orders?status=delivered")}
                    style={{ cursor: "pointer" }}
                >
                    <i className="fa-solid fa-check-circle" />
                    <div>
                        <h3>{loading ? "…" : summary.delivered}</h3>
                        <p>Đã giao</p>
                    </div>
                </div>
                <div className="stat-card">
                    <i className="fa-solid fa-sack-dollar" />
                    <div>
                        <h3>{loading ? "…" : formatPrice(summary.spending)}</h3>
                        <p>Tổng chi tiêu</p>
                    </div>
                </div>
            </div>

            <div className="customer-content">
                <div className="panel">
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            marginBottom: "16px",
                        }}
                    >
                        <h3>Đơn hàng gần đây</h3>
                        <Link
                            href="/account/orders"
                            style={{ color: "#0066cc", textDecoration: "none", fontSize: "14px" }}
                        >
                            Xem tất cả →
                        </Link>
                    </div>

                    {loading ? (
                        <p>Đang tải…</p>
                    ) : recentOrders.length === 0 ? (
                        <p style={{ color: "#999" }}>Chưa có đơn hàng nào</p>
                    ) : (
                        <div style={{ overflowX: "auto" }}>
                            <table style={{ width: "100%", borderCollapse: "collapse" }}>
                                <thead>
                                    <tr style={{ background: "#f1f2f6" }}>
                                        <th style={{ padding: 12, textAlign: "left" }}>Mã đơn</th>
                                        <th style={{ padding: 12, textAlign: "left" }}>Ngày đặt</th>
                                        <th style={{ padding: 12, textAlign: "right" }}>Tổng tiền</th>
                                        <th style={{ padding: 12, textAlign: "center" }}>Trạng thái</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recentOrders.map((o) => (
                                        <tr
                                            key={o.id}
                                            style={{ borderBottom: "1px solid #eee", cursor: "pointer" }}
                                            onClick={() => router.push(`/account/orders/${o.id}`)}
                                        >
                                            <td style={{ padding: 12 }}>{o.code || `#${o.id}`}</td>
                                            <td style={{ padding: 12 }}>
                                                {new Date(o.order_date || o.created_at).toLocaleString()}
                                            </td>
                                            <td style={{ padding: 12, textAlign: "right" }}>
                                                {formatPrice(Number(o.total || o.total_amount || 0))}
                                            </td>
                                            <td style={{ padding: 12, textAlign: "center" }}>
                                                {getStatusBadge(o.status)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                <div className="panel" style={{ marginTop: "24px" }}>
                    <h3>Hành động nhanh</h3>
                    <div className="quick-actions">
                        <Link className="action-btn-customer" href="/account/orders">
                            Xem lịch sử đơn hàng
                        </Link>
                        <Link className="action-btn-customer" href="/account/profile">
                            Xem/Chỉnh sửa hồ sơ
                        </Link>
                        <Link className="action-btn-customer" href="/cart">
                            Xem giỏ hàng
                        </Link>
                    </div>
                </div>
            </div>
        </>
    );
}
