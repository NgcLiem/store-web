"use client";

import "./orders.css";

import { useAuth } from "@/contexts/AuthContexts";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

export default function MyOrdersPage() {
    const { user, token } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [q, setQ] = useState("");
    const [statusFilter, setStatusFilter] = useState(searchParams.get("status") || "");

    useEffect(() => {
        if (!token) {
            router.push("/login?callback=/account/orders");
        }
    }, [token, router]);

    useEffect(() => {
        (async () => {
            if (!token || !user?.id) return;
            setLoading(true);
            try {
                let url = `${API_BASE}/orders?user_id=${user.id}`;
                if (q) url += `&q=${encodeURIComponent(q)}`;
                if (statusFilter) url += `&status=${encodeURIComponent(statusFilter)}`;

                const res = await fetch(url, {
                    headers: { Authorization: `Bearer ${token}` },
                    cache: "no-store",
                });

                const data = await res.json().catch(() => []);
                let ordersList = Array.isArray(data) ? data : data?.items || data?.orders || [];

                if (statusFilter && !Array.isArray(data)) {
                    ordersList = ordersList.filter((o) => o.status === statusFilter);
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
                className="order-status-badge"
                style={{ backgroundColor: colors[status] || "#6C757D" }}
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
                <div className="orders-filters">
                    <input
                        className="orders-search-input"
                        placeholder="Tìm theo mã đơn / ngày"
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                    />
                    <select
                        className="orders-status-select"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        {statuses.map((s) => (
                            <option key={s.value} value={s.value}>
                                {s.label}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="orders-table-wrapper">
                    <table className="orders-table">
                        <thead>
                            <tr>
                                <th>Mã đơn</th>
                                <th>Ngày đặt</th>
                                <th className="text-center">Tổng tiền</th>
                                <th className="text-center">Trạng thái</th>
                                <th className="text-center">Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="orders-empty">
                                        Đang tải…
                                    </td>
                                </tr>
                            ) : items.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="orders-empty">
                                        Chưa có đơn hàng
                                    </td>
                                </tr>
                            ) : (
                                items.map((o) => (
                                    <tr key={o.id}>
                                        <td>
                                            <strong>{o.code || `#${o.id}`}</strong>
                                        </td>
                                        <td>{new Date(o.order_date || o.created_at).toLocaleString()}</td>
                                        <td className=" orders-amount">
                                            {formatPrice(Number(o.total || o.total_amount || 0))}
                                        </td>
                                        <td className="">{getStatusBadge(o.status)}</td>
                                        <td className="">
                                            <button
                                                className="orders-detail-btn"
                                                onClick={() => router.push(`/account/orders/${o.id}`)}
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
