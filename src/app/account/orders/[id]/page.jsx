"use client";

import "./orderDetail.css";

import { useAuth } from "@/contexts/AuthContexts";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useToast } from "@/components/Toast";

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

export default function OrderDetailPage() {
    const { user, token } = useAuth();
    const router = useRouter();
    const params = useParams();
    const orderId = params.id;
    const { showToast } = useToast();

    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [cancelLoading, setCancelLoading] = useState(false);
    const [showCancelConfirm, setShowCancelConfirm] = useState(false);

    const canCancel = order && order.status === "pending";

    const handleCancelOrder = async () => {
        try {
            setCancelLoading(true);
            setError("");

            const res = await fetch(`${API_BASE}/orders/${orderId}/cancel`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });

            const data = await res.json().catch(() => ({}));

            if (!res.ok) {
                showToast(data?.message || "Hủy đơn thất bại", "error");
                return;
            }

            showToast("Đã hủy đơn hàng", "success");
            setShowCancelConfirm(false);

            // cập nhật UI luôn khỏi reload
            setOrder((prev) => (prev ? { ...prev, status: "cancelled" } : prev));
        } catch (e) {
            console.error(e);
            showToast("Hủy đơn thất bại", "error");
        } finally {
            setCancelLoading(false);
        }
    };

    useEffect(() => {
        if (!token) {
            router.push("/login?callback=/account/orders");
        }
    }, [token, router]);

    useEffect(() => {
        (async () => {
            if (!token || !orderId) return;
            setLoading(true);
            setError("");
            try {
                const res = await fetch(`${API_BASE}/orders/${orderId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                    cache: "no-store",
                });

                if (!res.ok) {
                    setError("Không tìm thấy đơn hàng");
                    return;
                }
                const data = await res.json();
                setOrder(data);
            } catch (err) {
                console.error("Fetch order error:", err);
                setError("Lỗi khi tải đơn hàng");
            } finally {
                setLoading(false);
            }
        })();
    }, [token, orderId]);

    const formatPrice = (price) =>
        new Intl.NumberFormat("vi-VN").format(price) + "₫";

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
                className="order-detail-status-badge"
                style={{ backgroundColor: colors[status] || "#6C757D" }}
            >
                {labels[status] || status}
            </span>
        );
    };

    if (loading) {
        return (
            <div className="customer-content order-detail-loading">
                <p>Đang tải chi tiết đơn hàng…</p>
            </div>
        );
    }

    if (error || !order) {
        return (
            <div className="customer-content order-detail-loading">
                <p className="order-detail-error">
                    {error || "Không tìm thấy đơn hàng"}
                </p>
                <button
                    onClick={() => router.back()}
                    className="order-detail-back-btn"
                >
                    Quay lại
                </button>
            </div>
        );
    }

    const items = Array.isArray(order.items) ? order.items : [];
    const subtotal = items.reduce(
        (sum, item) =>
            sum + Number(item.price || 0) * Number(item.quantity || 0),
        0,
    );
    const shippingFee = Number(order.shipping_fee || 0);
    const discount = Number(order.discount || 0);
    const total = Number(order.total_amount || subtotal + shippingFee - discount);

    return (
        <>
            <div className="customer-header">
                <div className="order-detail-header">
                    <div>
                        <h1>Chi tiết đơn hàng</h1>
                        <p>
                            Mã đơn:{" "}
                            <strong>{order.code || `#${order.id}`}</strong>
                        </p>
                    </div>
                    <button
                        onClick={() => router.back()}
                        className="order-detail-back-btn"
                    >
                        ← Quay lại
                    </button>
                </div>
            </div>

            <div className="customer-content">
                <div className="order-detail-grid">
                    {/* Main Content */}
                    <div>
                        {/* Status */}
                        <div className="order-status-card">
                            <h3>Trạng thái đơn hàng</h3>
                            <div className="order-status-row">
                                {getStatusBadge(order.status)}

                            </div>
                        </div>

                        {/* Items */}
                        <div className="order-items-section">
                            <h3>Sản phẩm đã đặt</h3>
                            <div className="order-items-table-wrapper">
                                <table className="order-items-table">
                                    <thead>
                                        <tr>
                                            <th>Sản phẩm</th>
                                            <th className="text-center">
                                                Số lượng
                                            </th>
                                            <th className="text-right">Giá</th>
                                            <th className="text-right">Tổng</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {items.length > 0 ? (
                                            items.map((item, idx) => (
                                                <tr key={idx}>
                                                    <td>
                                                        {item.product_name ||
                                                            item.name ||
                                                            "Sản phẩm"}
                                                    </td>
                                                    <td className="">
                                                        {item.quantity}
                                                    </td>
                                                    <td className="">
                                                        {formatPrice(
                                                            Number(
                                                                item.price,
                                                            ),
                                                        )}
                                                    </td>
                                                    <td className=" order-item-total">
                                                        {formatPrice(
                                                            Number(
                                                                item.price,
                                                            ) *
                                                            Number(
                                                                item.quantity,
                                                            ),
                                                        )}
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td
                                                    colSpan={4}
                                                    className="order-items-empty"
                                                >
                                                    Không có sản phẩm
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div className="order-shipping-card">
                            <h3>Thông tin giao hàng</h3>
                            <div className="order-shipping-info">
                                <p>
                                    <strong>Người nhận:</strong>{" "}
                                    {order.customer_name ||
                                        user?.full_name ||
                                        "N/A"}
                                </p>
                                <p>
                                    <strong>Số điện thoại:</strong>{" "}
                                    {order.customer_phone ||
                                        user?.phone ||
                                        "N/A"}
                                </p>
                                <p>
                                    <strong>Địa chỉ:</strong>{" "}
                                    {order.shipping_address ||
                                        user?.address ||
                                        "N/A"}
                                </p>
                                {order.notes && (
                                    <p>
                                        <strong>Ghi chú:</strong>{" "}
                                        {order.notes}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div>
                        <div className="order-summary-card">
                            <h3>Tổng hợp đơn hàng</h3>

                            <div className="order-summary-line">
                                <span>Tạm tính:</span>
                                <span>{formatPrice(subtotal)}</span>
                            </div>

                            {shippingFee > 0 && (
                                <div className="order-summary-line">
                                    <span>Phí vận chuyển:</span>
                                    <span>{formatPrice(shippingFee)}</span>
                                </div>
                            )}

                            {discount > 0 && (
                                <div className="order-summary-line order-summary-discount">
                                    <span>Giảm giá:</span>
                                    <span>-{formatPrice(discount)}</span>
                                </div>
                            )}

                            <div className="order-summary-total">
                                <span>Tổng cộng:</span>
                                <span>{formatPrice(total)}</span>
                            </div>

                            <div className="order-summary-extra">
                                <p>
                                    <strong>Ngày đặt:</strong>
                                </p>
                                <p>
                                    {new Date(
                                        order.order_date,
                                    ).toLocaleString()}
                                </p>
                            </div>

                            {canCancel && (
                                <button
                                    className="order-cancel-btn"
                                    onClick={() => setShowCancelConfirm(true)}
                                    disabled={cancelLoading}
                                >
                                    {cancelLoading
                                        ? "Đang hủy..."
                                        : "Hủy đơn hàng"}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal xác nhận hủy đơn hàng */}
            {showCancelConfirm && (
                <div className="order-cancel-modal-backdrop">
                    <div className="order-cancel-modal">
                        <h3>Hủy đơn hàng?</h3>
                        <p>
                            Bạn có chắc chắn muốn hủy đơn <strong>#{order.id}</strong> không?
                            Hành động này không thể hoàn tác.
                        </p>
                        <div className="order-cancel-modal-actions">
                            <button
                                type="button"
                                className="btn-outline"
                                onClick={() => setShowCancelConfirm(false)}
                                disabled={cancelLoading}
                            >
                                Không, quay lại
                            </button>
                            <button
                                type="button"
                                className="btn-danger"
                                onClick={handleCancelOrder}
                                disabled={cancelLoading}
                            >
                                {cancelLoading ? "Đang hủy..." : "Có, hủy đơn"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
