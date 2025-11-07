"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/contexts/AuthContexts";
import { useEffect, useMemo, useState } from "react";
import "../staff.css";

function OrdersPageContent() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [orders, setOrders] = useState([]);
    const [q, setQ] = useState("");
    const [status, setStatus] = useState("all"); // all | pending | processing | completed | canceled
    const [page, setPage] = useState(1);
    const pageSize = 10;

    // Tải danh sách đơn
    const fetchOrders = async () => {
        try {
            setLoading(true);
            const res = await fetch(`/api/orders?status=${status === "all" ? "" : status}&q=${encodeURIComponent(q)}`);
            const data = await res.json();
            if (!res.ok) throw new Error(data?.message || "Không tải được đơn hàng");
            setOrders(data?.items || data || []);
        } catch (e) {
            console.error(e);
            setOrders([]);
            alert(e.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [status]);

    const submitSearch = (e) => {
        e.preventDefault();
        setPage(1);
        fetchOrders();
    };

    const paged = useMemo(() => {
        const start = (page - 1) * pageSize;
        return orders.slice(start, start + pageSize);
    }, [orders, page]);

    const totalPages = Math.max(1, Math.ceil(orders.length / pageSize));

    const updateStatus = async (id, newStatus) => {
        if (!confirm(`Xác nhận cập nhật đơn #${id} sang trạng thái "${newStatus}"?`)) return;
        try {
            const res = await fetch(`/api/orders/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: newStatus }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data?.message || "Cập nhật thất bại");
            // Optimistic update
            setOrders((prev) =>
                prev.map((o) => (o.id === id ? { ...o, status: newStatus } : o))
            );
        } catch (e) {
            alert(e.message);
        }
    };

    return (
        <div className="staff-main">
            <div className="staff-header">
                <h1>Quản lý Đơn hàng</h1>
                <div className="staff-stats">
                    <div className="stat-card"><i className="fa-solid fa-clock" /><div><h3>
                        {orders.filter(o => o.status === "pending").length}
                    </h3><p>Chờ xử lý</p></div></div>
                    <div className="stat-card"><i className="fa-solid fa-gear" /><div><h3>
                        {orders.filter(o => o.status === "processing").length}
                    </h3><p>Đang xử lý</p></div></div>
                    <div className="stat-card"><i className="fa-solid fa-check" /><div><h3>
                        {orders.filter(o => o.status === "completed").length}
                    </h3><p>Hoàn thành</p></div></div>
                </div>
            </div>

            <div className="staff-content">
                <form onSubmit={submitSearch} style={{ display: "flex", gap: 12, marginBottom: 16 }}>
                    <input
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                        className="form-input"
                        placeholder="Tìm theo mã đơn / email / SĐT"
                        style={{ maxWidth: 360 }}
                    />
                    <select className="form-input" value={status} onChange={(e) => setStatus(e.target.value)} style={{ maxWidth: 220 }}>
                        <option value="all">Tất cả trạng thái</option>
                        <option value="pending">Chờ xử lý</option>
                        <option value="processing">Đang xử lý</option>
                        <option value="completed">Hoàn thành</option>
                        <option value="canceled">Đã hủy</option>
                    </select>
                    <button className="action-btn" type="submit"><i className="fa-solid fa-search" /> Tìm</button>
                </form>

                <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                        <thead>
                            <tr style={{ background: "#f1f2f6" }}>
                                <th style={{ padding: 12, borderBottom: "1px solid #eee", textAlign: "left" }}>Mã đơn</th>
                                <th style={{ padding: 12, borderBottom: "1px solid #eee", textAlign: "left" }}>Khách hàng</th>
                                <th style={{ padding: 12, borderBottom: "1px solid #eee", textAlign: "right" }}>Tổng tiền</th>
                                <th style={{ padding: 12, borderBottom: "1px solid #eee" }}>Trạng thái</th>
                                <th style={{ padding: 12, borderBottom: "1px solid #eee" }}>Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={5} style={{ padding: 20, textAlign: "center" }}>Đang tải...</td></tr>
                            ) : paged.length === 0 ? (
                                <tr><td colSpan={5} style={{ padding: 20, textAlign: "center" }}>Không có dữ liệu</td></tr>
                            ) : (
                                paged.map((o) => (
                                    <tr key={o.id} style={{ borderBottom: "1px solid #f0f0f0" }}>
                                        <td style={{ padding: 12 }}>{o.code || `#${o.id}`}</td>
                                        <td style={{ padding: 12 }}>{o.customer_email || o.customer_name || "-"}</td>
                                        <td style={{ padding: 12, textAlign: "right" }}>{(o.total || 0).toLocaleString()}₫</td>
                                        <td style={{ padding: 12, textTransform: "capitalize", textAlign: "center" }}>{o.status}</td>
                                        <td style={{ padding: 12, display: "flex", gap: 8, justifyContent: "center" }}>
                                            {o.status !== "processing" && <button className="action-btn" onClick={() => updateStatus(o.id, "processing")}><i className="fa-solid fa-gear" /> Xử lý</button>}
                                            {o.status !== "completed" && <button className="action-btn" onClick={() => updateStatus(o.id, "completed")}><i className="fa-solid fa-check" /> Hoàn thành</button>}
                                            {o.status !== "canceled" && <button className="action-btn" onClick={() => updateStatus(o.id, "canceled")}><i className="fa-solid fa-ban" /> Hủy</button>}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 16 }}>
                    <button className="action-btn" disabled={page === 1} onClick={() => setPage(p => Math.max(1, p - 1))}>←</button>
                    <div style={{ padding: "8px 12px" }}>{page}/{totalPages}</div>
                    <button className="action-btn" disabled={page === totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))}>→</button>
                </div>
            </div>
        </div>
    );
}

export default function OrdersPage() {
    return (
        <ProtectedRoute allowedRoles={["staff"]}>
            <OrdersPageContent />
        </ProtectedRoute>
    );
}
