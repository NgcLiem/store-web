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
                // gợi ý: backend nên đọc userId từ token; tạm thời gửi userId qua query
                const res = await fetch(`/api/orders?userId=${user?.id}&q=${encodeURIComponent(q)}`, {
                    headers: { Authorization: `Bearer ${token}` },
                    cache: "no-store",
                });
                const data = await res.json().catch(() => []);
                setItems(Array.isArray(data) ? data : data?.items || []);
            } finally {
                setLoading(false);
            }
        })();
    }, [token, user?.id, q]);

    return (
        <>
            <div className="customer-header">
                <h1>Đơn hàng của tôi</h1>
            </div>

            <div className="customer-content">
                <form onSubmit={(e) => e.preventDefault()} style={{ display: "flex", gap: 12, marginBottom: 16 }}>
                    <input
                        className="form-input"
                        placeholder="Tìm theo mã đơn / ngày"
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                        style={{ maxWidth: 320 }}
                    />
                </form>

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
                            {loading ? (
                                <tr><td colSpan={4} style={{ padding: 20, textAlign: "center" }}>Đang tải…</td></tr>
                            ) : items.length === 0 ? (
                                <tr><td colSpan={4} style={{ padding: 20, textAlign: "center" }}>Chưa có đơn hàng</td></tr>
                            ) : (
                                items.map((o) => (
                                    <tr key={o.id} style={{ borderBottom: "1px solid #eee" }}>
                                        <td style={{ padding: 12 }}>{o.code || `#${o.id}`}</td>
                                        <td style={{ padding: 12 }}>{new Date(o.order_date || o.created_at).toLocaleString()}</td>
                                        <td style={{ padding: 12, textAlign: "right" }}>{Number(o.total || o.total_amount || 0).toLocaleString()}₫</td>
                                        <td style={{ padding: 12, textAlign: "center", textTransform: "capitalize" }}>
                                            {o.status}
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
