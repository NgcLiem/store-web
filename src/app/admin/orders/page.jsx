"use client";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useEffect, useMemo, useState } from "react";
import "../admin.css";

function AdminOrdersPage() {
    const [orders, setOrders] = useState([]);
    const [q, setQ] = useState("");
    const [status, setStatus] = useState("all");
    const [page, setPage] = useState(1);
    const pageSize = 10;
    const [loading, setLoading] = useState(true);

    const load = async () => {
        setLoading(true);
        const url = `/api/orders?status=${status === "all" ? "" : status}&q=${encodeURIComponent(q)}`;
        const res = await fetch(url);
        const text = await res.text(); let data = null; try { data = JSON.parse(text); } catch { }
        setOrders(Array.isArray(data) ? data : data?.items || []);
        setLoading(false);
    };
    useEffect(() => { load(); }, [status]);

    const submitSearch = (e) => { e.preventDefault(); setPage(1); load(); };

    const paged = useMemo(() => {
        const start = (page - 1) * pageSize;
        return orders.slice(start, start + pageSize);
    }, [orders, page]);

    const totalPages = Math.max(1, Math.ceil(orders.length / pageSize));

    const updateStatus = async (id, s) => {
        if (!confirm(`Cập nhật đơn #${id} → ${s}?`)) return;
        const res = await fetch(`/api/orders/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: s }) });
        if (!res.ok) { alert("Cập nhật thất bại"); return; }
        setOrders(prev => prev.map(o => o.id === id ? { ...o, status: s } : o));
    };

    return (
        <div className="admin-header">
            <h1>Quản lý Đơn hàng</h1>

            <div className="admin-content">
                <form onSubmit={submitSearch} style={{ display: "flex", gap: 12, marginBottom: 16 }}>
                    <input value={q} onChange={(e) => setQ(e.target.value)} className="form-input" placeholder="Tìm mã đơn / email / SĐT" style={{ maxWidth: 360 }} />
                    <select className="form-input" value={status} onChange={(e) => setStatus(e.target.value)} style={{ maxWidth: 220 }}>
                        <option value="all">Tất cả</option>
                        <option value="pending">Chờ xử lý</option>
                        <option value="processing">Đang xử lý</option>
                        <option value="completed">Hoàn thành</option>
                        <option value="canceled">Đã huỷ</option>
                    </select>
                    <button className="action-btn" type="submit"><i className="fa-solid fa-search" /> Tìm</button>
                </form>

                <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                        <thead>
                            <tr style={{ background: "#f1f2f6" }}>
                                <th style={{ padding: 12, textAlign: "left" }}>Mã đơn</th>
                                <th style={{ padding: 12, textAlign: "left" }}>Khách hàng</th>
                                <th style={{ padding: 12, textAlign: "right" }}>Tổng tiền</th>
                                <th style={{ padding: 12 }}>Trạng thái</th>
                                <th style={{ padding: 12 }}>Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? <tr><td colSpan={5} style={{ padding: 20, textAlign: "center" }}>Đang tải...</td></tr> :
                                paged.length === 0 ? <tr><td colSpan={5} style={{ padding: 20, textAlign: "center" }}>Không có dữ liệu</td></tr> :
                                    paged.map(o => (
                                        <tr key={o.id} style={{ borderBottom: "1px solid #eee" }}>
                                            <td style={{ padding: 12 }}>{o.code || `#${o.id}`}</td>
                                            <td style={{ padding: 12 }}>{o.customer_email || o.customer_name || "-"}</td>
                                            <td style={{ padding: 12, textAlign: "right" }}>{(o.total || 0).toLocaleString()}₫</td>
                                            <td style={{ padding: 12, textTransform: "capitalize", textAlign: "center" }}>{o.status}</td>
                                            <td style={{ padding: 12, display: "flex", gap: 8, justifyContent: "center" }}>
                                                {o.status !== "processing" && <button className="action-btn" onClick={() => updateStatus(o.id, "processing")}><i className="fa-solid fa-gear" /> Xử lý</button>}
                                                {o.status !== "completed" && <button className="action-btn" onClick={() => updateStatus(o.id, "completed")}><i className="fa-solid fa-check" /> Hoàn thành</button>}
                                                {o.status !== "canceled" && <button className="action-btn" onClick={() => updateStatus(o.id, "canceled")}><i className="fa-solid fa-ban" /> Huỷ</button>}
                                            </td>
                                        </tr>
                                    ))
                            }
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
        <ProtectedRoute allowedRoles={["admin"]}>
            <AdminOrdersPage />
        </ProtectedRoute>
    );
}