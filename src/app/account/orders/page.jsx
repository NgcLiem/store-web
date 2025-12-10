"use client";

import { useAuth } from "@/contexts/AuthContexts";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function MyOrdersPage() {
    const { user, token } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [q, setQ] = useState("");
    const [statusFilter, setStatusFilter] = useState(searchParams.get("status") || "");

    useEffect(() => {
        (async () => {
            if (!token) return;
            setLoading(true);
            try {
                // gợi ý: backend nên đọc user_id từ token; tạm thời gửi user_id qua query
                let url = `/api/orders?user_id=${user?.id}`;
                if (q) url += `&q=${encodeURIComponent(q)}`;
                if (statusFilter) url += `&status=${encodeURIComponent(statusFilter)}`;
                
                const res = await fetch(url, {
                    headers: { Authorization: `Bearer ${token}` },
                    cache: "no-store",
                });
                const data = await res.json().catch(() => []);
                let ordersList = Array.isArray(data) ? data : data?.items || data?.orders || [];
                
                // Nếu backend không hỗ trợ lọc trạng thái, tự lọc ở frontend
                if (statusFilter && !Array.isArray(data)) {
                    ordersList = ordersList.filter(o => o.status === statusFilter);
                }
                
                setItems(ordersList);
            } finally {
                setLoading(false);
            }
        })();
    }, [token, user?.id, q, statusFilter]);

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
        const labels = {
            pending: "Chờ xác nhận",
            confirmed: "Đã xác nhận",
            processing: "Đang xử lý",
            delivered: "Đã giao",
            completed: "Hoàn thành",
            cancelled: "Đã hủy",
        };
        return (
            <span
                style={{
                    display: "inline-block",
                    padding: "6px 12px",
                    borderRadius: "4px",
                    backgroundColor: colors[status] || "#6C757D",
                    color: "white",
                    fontSize: "12px",
                    fontWeight: "bold",
                }}
            >
                {labels[status] || status}
            </span>
        );
    };

    const statuses = [
        { value: "", label: "Tất cả" },
        { value: "pending", label: "Chờ xác nhận" },
        { value: "confirmed", label: "Đã xác nhận" },
        { value: "processing", label: "Đang xử lý" },
        { value: "delivered", label: "Đã giao" },
        { value: "completed", label: "Hoàn thành" },
        { value: "cancelled", label: "Đã hủy" },
    ];

    return (
        <>
            <div className="customer-header">
                <h1>Lịch sử đơn hàng</h1>
                <p>Quản lý và theo dõi các đơn hàng của bạn</p>
            </div>

            <div className="customer-content">
                <div style={{ display: "flex", gap: 12, marginBottom: 16, flexWrap: "wrap", alignItems: "center" }}>
                    <input
                        className="form-input"
                        placeholder="Tìm theo mã đơn / ngày"
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                        style={{ flex: 1, minWidth: 200 }}
                    />
                    <select
                        className="form-input"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        style={{ minWidth: 150 }}
                    >
                        {statuses.map(s => (
                            <option key={s.value} value={s.value}>{s.label}</option>
                        ))}
                    </select>
                </div>

                <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                        <thead>
                            <tr style={{ background: "#f1f2f6" }}>
                                <th style={{ padding: 12, textAlign: "left" }}>Mã đơn</th>
                                <th style={{ padding: 12, textAlign: "left" }}>Ngày đặt</th>
                                <th style={{ padding: 12, textAlign: "right" }}>Tổng tiền</th>
                                <th style={{ padding: 12, textAlign: "center" }}>Trạng thái</th>
                                <th style={{ padding: 12, textAlign: "center" }}>Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={5} style={{ padding: 20, textAlign: "center" }}>Đang tải…</td></tr>
                            ) : items.length === 0 ? (
                                <tr><td colSpan={5} style={{ padding: 20, textAlign: "center" }}>Chưa có đơn hàng</td></tr>
                            ) : (
                                items.map((o) => (
                                    <tr key={o.id} style={{ borderBottom: "1px solid #eee" }}>
                                        <td style={{ padding: 12 }}><strong>{o.code || `#${o.id}`}</strong></td>
                                        <td style={{ padding: 12 }}>{new Date(o.order_date || o.created_at).toLocaleString()}</td>
                                        <td style={{ padding: 12, textAlign: "right", fontWeight: "bold" }}>{formatPrice(Number(o.total || o.total_amount || 0))}</td>
                                        <td style={{ padding: 12, textAlign: "center" }}>
                                            {getStatusBadge(o.status)}
                                        </td>
                                        <td style={{ padding: 12, textAlign: "center" }}>
                                            <button
                                                onClick={() => router.push(`/account/orders/${o.id}`)}
                                                style={{
                                                    padding: "6px 12px",
                                                    backgroundColor: "#0066cc",
                                                    color: "white",
                                                    border: "none",
                                                    borderRadius: "4px",
                                                    cursor: "pointer",
                                                    fontSize: "12px",
                                                }}
                                            >
                                                Chi tiết
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
}
