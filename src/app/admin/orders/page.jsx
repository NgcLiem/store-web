// src/app/admin/orders/page.jsx ĐÃ SỬA ĐỔI
"use client";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useEffect, useMemo, useState } from "react";
import "../admin.css"; // Giữ nguyên, chỉ import CSS
import "./orders.css"

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
                {/* Dùng className order-search-form thay cho style inline */}
                <form onSubmit={submitSearch} className="order-search-form">
                    {/* Dùng className order-filter-input thay cho style inline */}
                    <input value={q} onChange={(e) => setQ(e.target.value)} className="form-input order-filter-input search-input-wide" placeholder="Tìm mã đơn / email / SĐT" />
                    <select className="form-input order-filter-input status-select" value={status} onChange={(e) => setStatus(e.target.value)}>
                        <option value="all">Tất cả</option>
                        <option value="pending">Chờ xử lý</option>
                        <option value="processing">Đang xử lý</option>
                        <option value="completed">Hoàn thành</option>
                        <option value="canceled">Đã huỷ</option>
                    </select>
                    <button className="action-btn" type="submit"><i className="fa-solid fa-search" /> Tìm</button>
                </form>

                {/* Dùng className table-wrapper thay cho style inline */}
                <div className="table-wrapper">
                    <table className="order-table">
                        <thead>
                            <tr className="table-header-row">
                                {/* Dùng className table-header-cell thay cho style inline */}
                                <th className="table-header-cell text-left">Mã đơn</th>
                                <th className="table-header-cell text-left">Khách hàng</th>
                                <th className="table-header-cell text-right">Tổng tiền</th>
                                <th className="table-header-cell text-center">Trạng thái</th>
                                <th className="table-header-cell text-center">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ?
                                <tr className="table-row-loading"><td colSpan={5} className="table-cell-center">Đang tải...</td></tr> :
                                paged.length === 0 ?
                                    <tr className="table-row-loading"><td colSpan={5} className="table-cell-center">Không có dữ liệu</td></tr> :
                                    paged.map(o => (
                                        <tr key={o.id} className="table-body-row">
                                            <td className="table-cell">{o.code || `#${o.id}`}</td>
                                            <td className="table-cell">{o.customer_email || o.customer_name || "-"}</td>
                                            <td className="table-cell text-right">{(o.total || 0).toLocaleString()}₫</td>
                                            {/* Dùng className order-status-cell thay cho style inline */}
                                            <td className="table-cell order-status-cell">{o.status}</td>
                                            {/* Dùng className table-actions-cell thay cho style inline */}
                                            <td className="table-cell table-actions-cell">
                                                {o.status !== "processing" && <button className="action-btn" onClick={() => updateStatus(o.id, "processing")}><i className="fa-solid fa-gear" /> Xử lý</button>}
                                                {o.status !== "completed" && <button className="action-btn" onClick={() => updateStatus(o.id, "completed")}><i className="fa-solid fa-check" /> Hoàn thành</button>}
                                                {o.status !== "canceled" && <button className="action-btn btn-danger" onClick={() => updateStatus(o.id, "canceled")}><i className="fa-solid fa-ban" /> Huỷ</button>}
                                            </td>
                                        </tr>
                                    ))
                            }
                        </tbody>
                    </table>
                </div>

                {/* Dùng className pagination-controls thay cho style inline */}
                <div className="pagination-controls">
                    <button className="action-btn pagination-btn" disabled={page === 1} onClick={() => setPage(p => Math.max(1, p - 1))}>←</button>
                    {/* Dùng className page-info thay cho style inline */}
                    <div className="page-info">{page}/{totalPages}</div>
                    <button className="action-btn pagination-btn" disabled={page === totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))}>→</button>
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