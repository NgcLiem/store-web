"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/contexts/AuthContexts";
import { useEffect, useMemo, useState } from "react";
import "./orders.css";
import "../staff.css";

function OrdersPageContent() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [orders, setOrders] = useState([]);
    const [q, setQ] = useState("");
    const [status, setStatus] = useState("all");
    const [page, setPage] = useState(1);
    const pageSize = 10;

    const fetchOrders = async () => {
        setLoading(true);

        const params = new URLSearchParams();
        if (q) params.set("q", q);
        if (status !== "all") params.set("status", status);

        try {
            const data = await apiGet(`/orders?${params.toString()}`);
            setOrders(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error(err);
            alert("Không thể tải danh sách đơn hàng");
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchOrders();
    }, [status]);

    const submitSearch = (e) => { e.preventDefault(); load(); };

    const paged = useMemo(() => {
        const start = (page - 1) * pageSize;
        return orders.slice(start, start + pageSize);
    }, [orders, page]);

    const totalPages = Math.max(1, Math.ceil(orders.length / pageSize));

    const updateStatus = async (order, newStatus) => {
        try {
            await apiSend(`/orders/${order.id}`, "PUT", { status: newStatus });
            setOrders((prev) =>
                prev.map((o) =>
                    o.id === order.id ? { ...o, status: newStatus } : o
                )
            );
        } catch (e) {
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
                <form onSubmit={submitSearch} className="order-search-form">
                    <input
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                        className="form-input search-input-narrow"
                        placeholder="Tìm theo mã đơn / email / SĐT"
                    />

                    <select className="form-input status-select" value={status} onChange={(e) => setStatus(e.target.value)}>
                        <option value="all">Tất cả trạng thái</option>
                        <option value="pending">Chờ xử lý</option>
                        <option value="processing">Đang xử lý</option>
                        <option value="completed">Hoàn thành</option>
                        <option value="canceled">Đã hủy</option>
                    </select>

                    <button className="action-btn" type="submit">
                        <i className="fa-solid fa-search" /> Tìm
                    </button>
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
                            {loading ? (
                                <tr className="table-row-loading">
                                    <td colSpan={5} className="table-cell-center">Đang tải...</td>

                                </tr>
                            ) : paged.length === 0 ? (
                                <tr className="table-row-loading">
                                    <td colSpan={5} className="table-cell-center">Không có dữ liệu</td>
                                </tr>
                            ) : (
                                paged.map((o) => (
                                    <tr key={o.id} className="table-body-row">
                                        <td className="table-cell">{o.id}</td>
                                        <td className="table-cell">{o.user_id}</td>
                                        <td>{o.order_date
                                            ? new Date(o.order_date).toLocaleString("vi-VN")
                                            : "-"}
                                        </td>
                                        <td className="table-cell text-right">{(Number(o.total_amount || 0)).toLocaleString()}₫</td>
                                        <td className="table-cell order-status-cell">{o.status}</td>
                                        <td className="table-cell text-center">{o.payment_method}</td>
                                        <td className="table-cell table-actions-cell">
                                            <select
                                                value={o.status}
                                                onChange={(e) => updateStatus(o, e.target.value)}
                                                className="form-input"
                                                style={{ maxWidth: 140, marginRight: 8 }}
                                            >
                                                <option value="pending">pending</option>
                                                <option value="confirmed">confirmed</option>
                                                <option value="shipped">shipped</option>
                                                <option value="delivered">delivered</option>
                                                <option value="cancelled">cancelled</option>
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
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="pagination-controls">
                    <button className="action-btn pagination-btn" disabled={page === 1} onClick={() => setPage(p => Math.max(1, p - 1))}>←</button>
                    <div className="page-info">{page}/{totalPages}</div>
                    <button className="action-btn pagination-btn" disabled={page === totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))}>→</button>
                </div>

            </div>
        </div >
    );
}

export default function OrdersPage() {
    return (
        <ProtectedRoute allowedRoles={["staff"]}>
            <OrdersPageContent />
        </ProtectedRoute>
    );
}
