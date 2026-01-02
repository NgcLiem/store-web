"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import { useEffect, useMemo, useState } from "react";
import "../staff.css";
import "./orders.css";
import { useAuth } from "@/contexts/AuthContexts";
import { useToast } from "@/components/Toast";

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

export default function StaffOrdersPage() {
    return (
        <ProtectedRoute allowedRoles={["staff"]}>
            <StaffOrdersPageContent />
        </ProtectedRoute>
    );
}

function StaffOrdersPageContent() {
    const { token, user } = useAuth();
    const { showToast } = useToast();

    const [orders, setOrders] = useState([]);
    const [q, setQ] = useState("");
    const [status, setStatus] = useState("all");
    const [page, setPage] = useState(1);
    const pageSize = 10;
    const [loading, setLoading] = useState(true);

    // modal xác nhận xoá (thay cho window.confirm)
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [confirmOrder, setConfirmOrder] = useState(null);

    const withAuthHeaders = (headers = {}) => {
        return token ? { ...headers, Authorization: `Bearer ${token}` } : headers;
    };

    const getOrdersPathByRole = () => {
        // staff gọi /staff/orders giống hệt cách admin gọi /admin/orders
        if (user?.role === "staff") return "/staff/orders";
        return null;
    };

    const load = async () => {
        setLoading(true);
        try {
            const path = getOrdersPathByRole();
            if (!path) {
                setOrders([]);
                showToast("Bạn không có quyền truy cập trang này", "error");
                return;
            }

            const params = new URLSearchParams();
            if (status !== "all") params.set("status", status);
            if (q.trim()) params.set("q", q.trim());

            const url = `${API_BASE}${path}?${params.toString()}`;

            const res = await fetch(url, {
                method: "GET",
                headers: withAuthHeaders({ "Content-Type": "application/json" }),
                cache: "no-store",
            });

            const text = await res.text();
            let data = null;
            try {
                data = JSON.parse(text);
            } catch {
                console.error("Không parse được JSON:", text);
            }

            if (!res.ok) {
                showToast(data?.message || data?.error || `Không thể tải đơn hàng (HTTP ${res.status})`, "error");
                setOrders([]);
                return;
            }

            const list =
                Array.isArray(data) ? data
                    : Array.isArray(data?.items) ? data.items
                        : Array.isArray(data?.orders) ? data.orders
                            : [];

            setOrders(list);
        } catch (e) {
            console.error(e);
            showToast("Không thể tải đơn hàng (lỗi mạng / failed to fetch)", "error");
            setOrders([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [status, user?.role, token]);

    const submitSearch = (e) => {
        e.preventDefault();
        setPage(1);
        load();
    };

    const totalPages = Math.max(1, Math.ceil(orders.length / pageSize));
    const paged = useMemo(() => {
        const start = (page - 1) * pageSize;
        return orders.slice(start, start + pageSize);
    }, [orders, page]);

    const updateStatus = async (order, newStatus) => {
        try {
            const path = getOrdersPathByRole();
            if (!path) return;

            const id = Number(order?.id);
            if (!id || Number.isNaN(id)) {
                showToast("Order id không hợp lệ (phải là số)", "error");
                return;
            }

            // ✅ chọn 1 trong 2 kiểu endpoint (tùy backend bạn đang có):
            // 1) PUT /staff/orders/:id  body {status}
            const url = `${API_BASE}${path}/${id}`;

            // 2) nếu backend bạn dùng /:id/status thì đổi sang:
            // const url = `${API_BASE}${path}/${id}/status`;

            const res = await fetch(url, {
                method: "PUT", // hoặc PATCH tùy backend
                headers: withAuthHeaders({ "Content-Type": "application/json" }),
                body: JSON.stringify({ status: newStatus }),
            });

            const data = await res.json().catch(() => null);

            if (!res.ok) {
                showToast(data?.message || data?.error || "Cập nhật trạng thái thất bại", "error");
                return;
            }

            setOrders((prev) => prev.map((o) => (Number(o.id) === id ? { ...o, status: newStatus } : o)));
            showToast("Cập nhật trạng thái thành công", "success");
        } catch (e) {
            console.error(e);
            showToast("Cập nhật trạng thái thất bại (lỗi mạng)", "error");
        }
    };

    // mở modal xoá
    const askRemove = (order) => {
        setConfirmOrder(order);
        setConfirmOpen(true);
    };

    // xoá thật
    const removeOrder = async () => {
        const order = confirmOrder;
        setConfirmOpen(false);

        try {
            const path = getOrdersPathByRole();
            if (!path) return;

            const id = Number(order?.id);
            if (!id || Number.isNaN(id)) {
                showToast("Order id không hợp lệ (phải là số)", "error");
                return;
            }

            const url = `${API_BASE}${path}/${id}`;

            const res = await fetch(url, {
                method: "DELETE",
                headers: withAuthHeaders({ "Content-Type": "application/json" }),
            });

            const data = await res.json().catch(() => null);
            if (!res.ok) {
                showToast(data?.message || data?.error || "Xoá đơn thất bại", "error");
                return;
            }

            setOrders((prev) => prev.filter((o) => Number(o.id) !== id));
            showToast("Xoá đơn thành công", "success");
            setConfirmOrder(null);
        } catch (e) {
            console.error(e);
            showToast("Xoá đơn thất bại (lỗi mạng)", "error");
        }
    };

    const pendingCount = orders.filter((o) => o.status === "pending").length;
    const processingCount = orders.filter((o) => o.status === "processing").length;
    const deliveredCount = orders.filter((o) => o.status === "delivered").length;

    return (
        <div className="staff-main">
            <div className="staff-header">
                <h1>Quản lý Đơn hàng</h1>

                <div className="staff-stats">
                    <div className="stat-card">
                        <i className="fa-solid fa-clock" />
                        <div>
                            <h3>{pendingCount}</h3>
                            <p>Chờ xử lý</p>
                        </div>
                    </div>

                    <div className="stat-card">
                        <i className="fa-solid fa-gear" />
                        <div>
                            <h3>{processingCount}</h3>
                            <p>Đang xử lý</p>
                        </div>
                    </div>

                    <div className="stat-card">
                        <i className="fa-solid fa-check" />
                        <div>
                            <h3>{deliveredCount}</h3>
                            <p>Hoàn thành</p>
                        </div>
                    </div>
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

                    <select
                        className="form-input status-select"
                        value={status}
                        onChange={(e) => {
                            setStatus(e.target.value);
                            setPage(1);
                        }}
                    >
                        <option value="all">Tất cả trạng thái</option>
                        <option value="pending">Chờ xử lý</option>
                        <option value="processing">Đang xử lý</option>
                        <option value="shipped">Đã giao</option>
                        <option value="delivered">Hoàn thành</option>
                        <option value="cancelled">Đã huỷ</option>
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
                                <th className="table-header-cell text-center">Thanh toán</th>
                                <th className="table-header-cell text-center">Thao tác</th>
                            </tr>
                        </thead>

                        <tbody>
                            {loading ? (
                                <tr className="table-row-loading">
                                    <td colSpan={7} className="table-cell-center">Đang tải...</td>
                                </tr>
                            ) : paged.length === 0 ? (
                                <tr className="table-row-loading">
                                    <td colSpan={7} className="table-cell-center">Không có dữ liệu</td>
                                </tr>
                            ) : (
                                paged.map((o) => (
                                    <tr key={o.id} className="table-body-row">
                                        <td className="table-cell">#{o.id}</td>

                                        <td className="table-cell">
                                            <div><strong>{o.customer_name || o.user_full_name || "-"}</strong></div>
                                            <div className="order-customer-sub">{o.customer_email || o.user_email || "-"}</div>
                                            <div className="order-customer-sub">{o.customer_phone || o.user_phone || "-"}</div>
                                        </td>

                                        <td className="table-cell">
                                            {o.created_at || o.order_date
                                                ? new Date(o.created_at || o.order_date).toLocaleString("vi-VN")
                                                : "-"}
                                        </td>

                                        <td className="table-cell text-right">
                                            {Number(o.total_amount || 0).toLocaleString("vi-VN")}₫
                                        </td>

                                        <td className="table-cell order-status-cell">{o.status}</td>

                                        <td className="table-cell text-center">{o.payment_method || "-"}</td>

                                        <td className="table-cell table-actions-cell">
                                            <select
                                                value={o.status}
                                                onChange={(e) => updateStatus(o, e.target.value)}
                                                className="form-input"
                                                style={{ maxWidth: 160, marginRight: 8 }}
                                            >
                                                <option value="pending">pending</option>
                                                <option value="shipped">shipped</option>
                                                <option value="delivered">delivered</option>
                                                <option value="cancelled">cancelled</option>
                                            </select>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="pagination-controls">
                    <button
                        className="action-btn pagination-btn"
                        disabled={page === 1}
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                    >
                        ←
                    </button>

                    <div className="page-info">{page}/{totalPages}</div>

                    <button
                        className="action-btn pagination-btn"
                        disabled={page === totalPages}
                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    >
                        →
                    </button>
                </div>
            </div>

            {/* ✅ Modal confirm xoá */}
            {confirmOpen && (
                <div className="modal-overlay">
                    <div className="modal-content-wrapper confirm-modal">
                        <h3 className="confirm-title">Xoá đơn hàng</h3>
                        <p className="confirm-text">
                            Bạn có chắc muốn xoá đơn <b>#{confirmOrder?.id}</b> không?
                        </p>

                        <div className="confirm-actions">
                            <button
                                type="button"
                                className="action-btn btn-secondary"
                                onClick={() => {
                                    setConfirmOpen(false);
                                    setConfirmOrder(null);
                                }}
                            >
                                Huỷ
                            </button>
                            <button
                                type="button"
                                className="action-btn btn-danger"
                                onClick={removeOrder}
                            >
                                <i className="fa-solid fa-trash" /> Xoá
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
