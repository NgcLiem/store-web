"use client";

import { useEffect, useMemo, useState } from "react";
import "../admin.css";
import "./orders.css";
import { useAuth } from "../../../contexts/AuthContexts"; // chỉnh path nếu khác
import { useToast } from "@/components/Toast"; // nếu bạn dùng toast kiểu này

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

export default function AdminOrdersPage() {
    const { token, user } = useAuth();
    const { showToast } = useToast();

    const [orders, setOrders] = useState([]);
    const [q, setQ] = useState("");
    const [status, setStatus] = useState("all");
    const [page, setPage] = useState(1);
    const pageSize = 10;

    const [loading, setLoading] = useState(true);

    // ===== auth headers =====
    const withAuthHeaders = (headers = {}) => {
        return token ? { ...headers, Authorization: `Bearer ${token}` } : headers;
    };

    // ===== chọn endpoint theo role (giống products) =====
    const getOrdersPathByRole = () => {
        // ✅ bạn muốn gắn role như products
        if (user?.role === "admin") return "/admin/orders";
        if (user?.role === "staff") return "/staff/orders";

        // Nếu không phải admin/staff thì chặn luôn
        return null;
    };

    // ===== load =====
    const load = async () => {
        setLoading(true);

        try {
            const path = getOrdersPathByRole();
            if (!path) {
                setOrders([]);
                setLoading(false);
                showToast("Bạn không có quyền truy cập trang này", "error");
                return;
            }

            const params = new URLSearchParams();
            if (status !== "all") params.set("status", status);

            // Nếu muốn search phía backend: gửi q lên backend
            // (khuyến nghị) => backend tự search theo id/email/phone/name
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
                // backend trả text/html => in ra để debug
                console.error("Không parse được JSON:", text);
            }

            if (!res.ok) {
                const msg = data?.message || data?.error || `Không thể tải đơn hàng (HTTP ${res.status})`;
                showToast(msg, "error");
                setOrders([]);
                setLoading(false);
                return;
            }

            // ✅ chấp nhận 2 kiểu response:
            // 1) backend trả mảng trực tiếp
            // 2) backend trả { items } hoặc { orders } hoặc { success, orders }
            const list =
                Array.isArray(data) ? data :
                    Array.isArray(data?.items) ? data.items :
                        Array.isArray(data?.orders) ? data.orders :
                            [];

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

    // ===== pagination =====
    const totalPages = Math.max(1, Math.ceil(orders.length / pageSize));
    const paged = useMemo(() => {
        const start = (page - 1) * pageSize;
        return orders.slice(start, start + pageSize);
    }, [orders, page]);

    // ===== update status =====
    const updateStatus = async (order, newStatus) => {
        try {
            const path = getOrdersPathByRole();
            if (!path) return;

            // endpoint update status: /admin/orders/:id/status (gợi ý)
            // Nếu backend bạn khác, sửa ở đây cho khớp.
            const url = `${API_BASE}${path}/${order.id}/status`;

            const res = await fetch(url, {
                method: "PATCH",
                headers: withAuthHeaders({ "Content-Type": "application/json" }),
                body: JSON.stringify({ status: newStatus }),
            });

            const data = await res.json().catch(() => null);

            if (!res.ok) {
                showToast(data?.message || data?.error || "Cập nhật trạng thái thất bại", "error");
                return;
            }

            setOrders((prev) => prev.map((o) => (o.id === order.id ? { ...o, status: newStatus } : o)));
            showToast("Cập nhật trạng thái thành công", "success");
        } catch (e) {
            console.error(e);
            showToast("Cập nhật trạng thái thất bại (lỗi mạng)", "error");
        }
    };

    // ===== delete =====
    const removeOrder = async (order) => {
        try {
            const path = getOrdersPathByRole();
            if (!path) {
                showToast("Bạn không có quyền xoá đơn hàng", "error");
                return;
            }

            const url = `${API_BASE}${path}/${order.id}`;

            const res = await fetch(url, {
                method: "DELETE",
                headers: withAuthHeaders({ "Content-Type": "application/json" }),
            });

            const data = await res.json().catch(() => null);

            if (!res.ok) {
                showToast(
                    data?.message || data?.error || "Xoá đơn thất bại",
                    "error"
                );
                return;
            }

            // cập nhật UI
            setOrders((prev) => prev.filter((o) => o.id !== order.id));

            showToast(`Đã xoá đơn #${order.id}`, "success");
        } catch (e) {
            console.error(e);
            showToast("Xoá đơn thất bại (lỗi mạng)", "error");
        }
    };


    return (
        <>
            <div className="admin-header">
                <h1>Quản lý Đơn hàng</h1>
            </div>

            <div className="admin-content">
                <form onSubmit={submitSearch} className="order-search-form">
                    <input
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                        className="form-input-admin search-input-narrow"
                        placeholder="Tìm mã đơn / email / SĐT"
                    />

                    <select
                        className="form-input-admin status-select"
                        value={status}
                        onChange={(e) => {
                            setStatus(e.target.value);
                            setPage(1);
                        }}
                    >
                        <option value="all">Tất cả</option>
                        <option value="pending">Chờ xử lý</option>
                        <option value="processing">Đang xử lý</option>
                        <option value="shipped">Đã giao</option>
                        <option value="delivered">Hoàn thành</option>
                        <option value="cancelled">Đã huỷ</option>
                    </select>

                    <button className="action-btn" type="submit">
                        <i className="fa-solid fa-search" />
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
                                    <td colSpan={7} className="table-cell-center">
                                        Đang tải...
                                    </td>
                                </tr>
                            ) : paged.length === 0 ? (
                                <tr className="table-row-loading">
                                    <td colSpan={7} className="table-cell-center">
                                        Không có dữ liệu
                                    </td>
                                </tr>
                            ) : (
                                paged.map((o) => (
                                    <tr key={o.id} className="table-body-row">
                                        <td className="table-cell">#{o.id}</td>

                                        <td className="table-cell">
                                            <div>
                                                <strong>{o.customer_name || o.user_full_name || "-"}</strong>
                                            </div>
                                            <div className="order-customer-sub">{o.customer_email || o.user_email || "-"}</div>
                                            <div className="order-customer-sub">{o.customer_phone || o.user_phone || "-"}</div>
                                        </td>

                                        <td className="table-cell">
                                            {o.created_at || o.order_date
                                                ? new Date(o.created_at || o.order_date).toLocaleString("vi-VN")
                                                : "-"}
                                        </td>

                                        <td className="table-cell text-right">
                                            {(Number(o.total_amount || 0)).toLocaleString("vi-VN")}₫
                                        </td>

                                        <td className="table-cell order-status-cell">{o.status}</td>

                                        <td className="table-cell text-center">{o.payment_method || "-"}</td>

                                        <td className="table-cell table-actions-cell">
                                            <select
                                                value={o.status}
                                                onChange={(e) => updateStatus(o, e.target.value)}
                                                className="form-input-admin order-status-select"
                                            >
                                                <option value="pending">Chờ xử lý</option>
                                                <option value="shipped">Đang giao</option>
                                                <option value="delivered">Hoàn thành</option>
                                                <option value="cancelled">Đã hủy</option>
                                            </select>

                                            <button className="action-btn btn-danger" onClick={() => removeOrder(o)}>
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
                    <button
                        className="action-btn pagination-btn"
                        disabled={page === 1}
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                    >
                        ←
                    </button>

                    <div className="page-info">
                        {page}/{totalPages}
                    </div>

                    <button
                        className="action-btn pagination-btn"
                        disabled={page === totalPages}
                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    >
                        →
                    </button>
                </div>
            </div>
        </>
    );
}
