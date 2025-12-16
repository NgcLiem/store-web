// src/app/admin/orders/page.jsx ĐÃ SỬA ĐỔI
"use client";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useEffect, useMemo, useState } from "react";
import "../admin.css"; // Giữ nguyên, chỉ import CSS
import "./orders.css"
import { apiGet, apiSend } from "@/lib/api";

function AdminOrdersPage() {
    const [orders, setOrders] = useState([]);
    const [q, setQ] = useState("");
    const [status, setStatus] = useState("all");
    const [page, setPage] = useState(1);
    const pageSize = 10;
    const [loading, setLoading] = useState(true);

    const load = async () => {
        setLoading(true);

        const params = new URLSearchParams();
        if (status !== "all") params.set("status", status);

        try {
            const res = await fetch(`/api/orders?${params.toString()}`);
            const data = await res.json();

            if (data.success && Array.isArray(data.orders)) {
                // Filter by search query on client side
                let filtered = data.orders;
                if (q) {
                    const lowerQ = q.toLowerCase();
                    filtered = filtered.filter(o =>
                        o.id.toString().includes(lowerQ) ||
                        o.customer_email?.toLowerCase().includes(lowerQ) ||
                        o.customer_phone?.includes(lowerQ) ||
                        o.customer_name?.toLowerCase().includes(lowerQ)
                    );
                }
                setOrders(filtered);
            } else {
                setOrders([]);
            }
        } catch (err) {
            console.error(err);
            alert("Không thể tải danh sách đơn hàng");
            setOrders([]);
        }
        setLoading(false);
    };

    useEffect(() => { load(); }, [status, q]);

    const submitSearch = (e) => { e.preventDefault(); load(); };

    const paged = useMemo(() => {
        const start = (page - 1) * pageSize;
        return orders.slice(start, start + pageSize);
    }, [orders, page]);

    const totalPages = Math.max(1, Math.ceil(orders.length / pageSize));

    const updateStatus = async (order, newStatus) => {
        try {
            const res = await fetch('/api/orders', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ order_id: order.id, status: newStatus })
            });

            const data = await res.json();

            if (data.success) {
                setOrders((prev) =>
                    prev.map((o) =>
                        o.id === order.id ? { ...o, status: newStatus } : o
                    )
                );
            } else {
                alert("Cập nhật trạng thái thất bại: " + data.message);
            }
        } catch (e) {
            console.error(e);
            alert("Cập nhật trạng thái thất bại");
        }
    };

    const remove = async (order) => {
        if (!confirm(`Xoá đơn #${order.id}?`)) return;
        try {
            await apiSend(`/orders/${order.id}`, "DELETE");
            setOrders((prev) => prev.filter((o) => o.id !== order.id));
        } catch (e) {
            alert("Xoá đơn thất bại");
        }
    };

    return (
        <>
            <div className="admin-header">
                <h1>Quản lý Đơn hàng</h1>
            </div>

            <div className="admin-content">
                <form onSubmit={submitSearch} className="order-search-form">
                    <input value={q} onChange={(e) => setQ(e.target.value)} className="form-input-admin  search-input-narrow" placeholder="Tìm mã đơn / email / SĐT" />

                    <select className="form-input-admin  status-select" value={status} onChange={(e) => setStatus(e.target.value)}>
                        <option value="all">Tất cả</option>
                        <option value="pending">Chờ xử lý</option>
                        <option value="processing">Đang xử lý</option>
                        <option value="completed">Hoàn thành</option>
                        <option value="canceled">Đã huỷ</option>
                    </select>
                    <button className="action-btn" type="submit"><i className="fa-solid fa-search" /></button>
                </form>

                <div className="table-wrapper">
                    <table className="order-table">
                        <thead>
                            <tr className="table-header-row">
                                <th className="table-header-cell text-left">Mã đơn</th>
                                <th className="table-header-cell text-left">Khách hàng</th>
                                <th className="table-header-cell text-left">Ngày đặt hàng</th>
                                <th className="table-header-cell text-right">Tổng tiền</th>
                                <th className="table-header-cell text-center">Trạng thái</th>
                                <th className="table-header-cell text-center">Phương thức thanh toán</th>
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
                                            <td className="table-cell">#{o.id}</td>
                                            <td className="table-cell">
                                                <div><strong>{o.customer_name}</strong></div>
                                                <div style={{ fontSize: '12px', color: '#666' }}>{o.customer_email}</div>
                                                <div style={{ fontSize: '12px', color: '#666' }}>{o.customer_phone}</div>
                                            </td>
                                            <td>{o.created_at
                                                ? new Date(o.created_at).toLocaleString("vi-VN")
                                                : "-"}
                                            </td>
                                            <td className="table-cell text-right">{(Number(o.total_amount || 0)).toLocaleString()}₫</td>
                                            <td className="table-cell order-status-cell">{o.status}</td>
                                            <td className="table-cell text-center">{o.payment_method}</td>
                                            <td className="table-cell table-actions-cell">
                                                <select
                                                    value={o.status}
                                                    onChange={(e) => updateStatus(o, e.target.value)}
                                                    className="form-input-admin"
                                                    style={{ maxWidth: 140, marginRight: 8 }}
                                                >
                                                    <option value="pending">Chờ xử lý</option>
                                                    <option value="processing">Đang xử lý</option>
                                                    <option value="shipped">Đã giao</option>
                                                    <option value="delivered">Hoàn thành</option>
                                                    <option value="cancelled">Đã hủy</option>
                                                </select>
                                                <button
                                                    className="action-btn"
                                                    onClick={() => remove(o)}
                                                >
                                                    Xoá
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                            }
                        </tbody>
                    </table>
                </div>

                <div className="pagination-controls">
                    <button className="action-btn pagination-btn" disabled={page === 1} onClick={() => setPage(p => Math.max(1, p - 1))}>←</button>
                    <div className="page-info">{page}/{totalPages}</div>
                    <button className="action-btn pagination-btn" disabled={page === totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))}>→</button>
                </div>
            </div>
        </>
    );
}

export default function OrdersPage() {
    return (
        <ProtectedRoute allowedRoles={["admin"]}>
            <AdminOrdersPage />
        </ProtectedRoute>
    );
}