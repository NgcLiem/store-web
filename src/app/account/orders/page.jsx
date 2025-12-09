"use client";

import { useAuth } from "@/contexts/AuthContexts";
import { useEffect, useState } from "react";

export default function MyOrdersPage() {
    const { user, token } = useAuth();
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [q, setQ] = useState("");

    useEffect(() => {
        (async () => {
            if (!token) return;
            setLoading(true);
            try {
                const res = await fetch(
                    `/api/orders?userId=${user?.id}&q=${encodeURIComponent(q)}`,
                    {
                        headers: { Authorization: `Bearer ${token}` },
                        cache: "no-store",
                    }
                );
                const data = await res.json().catch(() => []);
                setItems(Array.isArray(data) ? data : data?.items || []);
            } finally {
                setLoading(false);
            }
        })();
    }, [token, user?.id, q]);

    const getStatusClass = (status) => {
        if (!status) return "order-status-badge";
        const s = String(status).toLowerCase();
        if (["pending", "confirmed", "processing"].includes(s))
            return "order-status-badge status-pending";
        if (["delivered", "completed"].includes(s))
            return "order-status-badge status-success";
        if (["cancelled", "canceled", "failed"].includes(s))
            return "order-status-badge status-cancel";
        return "order-status-badge";
    };

    return (
        <>
            <div className="customer-header">
                <h1>Đơn hàng của tôi</h1>
                <p>Theo dõi lịch sử đặt hàng và trạng thái giao hàng</p>
            </div>

            <div className="customer-content">
                <form
                    onSubmit={(e) => e.preventDefault()}
                    style={{ display: "flex", gap: 12, marginBottom: 16 }}
                >
                    <input
                        className="form-input-customer"
                        placeholder="Tìm theo mã đơn / ngày"
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                        style={{ maxWidth: 320 }}
                    />
                </form>

                <div className="orders-table-wrapper">
                    <table className="orders-table">
                        <thead>
                            <tr>
                                <th>Mã đơn</th>
                                <th>Ngày đặt</th>
                                <th style={{ textAlign: "right" }}>Tổng tiền</th>
                                <th style={{ textAlign: "center" }}>Trạng thái</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={4} style={{ padding: 20, textAlign: "center" }}>
                                        Đang tải…
                                    </td>
                                </tr>
                            ) : items.length === 0 ? (
                                <tr>
                                    <td colSpan={4} style={{ padding: 20, textAlign: "center" }}>
                                        Chưa có đơn hàng
                                    </td>
                                </tr>
                            ) : (
                                items.map((o) => (
                                    <tr key={o.id}>
                                        <td>{o.code || `#${o.id}`}</td>
                                        <td>
                                            {new Date(
                                                o.order_date || o.created_at
                                            ).toLocaleString()}
                                        </td>
                                        <td style={{ textAlign: "right" }}>
                                            {Number(o.total || o.total_amount || 0).toLocaleString()}₫
                                        </td>
                                        <td style={{ textAlign: "center" }}>
                                            <span className={getStatusClass(o.status)}>
                                                {o.status}
                                            </span>
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
