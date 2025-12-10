"use client";

import { useAuth } from "@/contexts/AuthContexts";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";

export default function OrderDetailPage() {
    const { user, token } = useAuth();
    const router = useRouter();
    const params = useParams();
    const orderId = params.id;
    
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        (async () => {
            if (!token || !orderId) return;
            setLoading(true);
            setError("");
            try {
                const res = await fetch(`/api/orders?order_id=${orderId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                    cache: "no-store",
                });
                
                if (!res.ok) {
                    setError("Không tìm thấy đơn hàng");
                    return;
                }
                
                const data = await res.json();
                const orders = Array.isArray(data) ? data : data?.orders || [];
                if (orders.length > 0) {
                    setOrder(orders[0]);
                } else {
                    setError("Không tìm thấy đơn hàng");
                }
            } catch (err) {
                console.error("Fetch order error:", err);
                setError("Lỗi khi tải đơn hàng");
            } finally {
                setLoading(false);
            }
        })();
    }, [token, orderId]);

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
                style={{
                    display: "inline-block",
                    padding: "8px 16px",
                    borderRadius: "4px",
                    backgroundColor: colors[status] || "#6C757D",
                    color: "white",
                    fontSize: "14px",
                    fontWeight: "bold",
                }}
            >
                {labels[status] || status}
            </span>
        );
    };

    if (loading) {
        return (
            <div className="customer-content" style={{ textAlign: "center", padding: "40px" }}>
                <p>Đang tải chi tiết đơn hàng…</p>
            </div>
        );
    }

    if (error || !order) {
        return (
            <div className="customer-content" style={{ textAlign: "center", padding: "40px" }}>
                <p style={{ color: "#dc3545" }}>{error || "Không tìm thấy đơn hàng"}</p>
                <button
                    onClick={() => router.back()}
                    style={{
                        marginTop: "16px",
                        padding: "10px 20px",
                        backgroundColor: "#0066cc",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                    }}
                >
                    Quay lại
                </button>
            </div>
        );
    }

    const items = order?.items ? (Array.isArray(order.items) ? order.items : []) : [];
    const subtotal = items.reduce((sum, item) => sum + (Number(item.price) * Number(item.quantity)), 0);
    const total = Number(order?.total_amount || subtotal);

    return (
        <>
            <div className="customer-header">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                        <h1>Chi tiết đơn hàng</h1>
                        <p>Mã đơn: <strong>{order?.code || `#${order?.id}`}</strong></p>
                    </div>
                    <button
                        onClick={() => router.back()}
                        style={{
                            padding: "10px 20px",
                            backgroundColor: "#6C757D",
                            color: "white",
                            border: "none",
                            borderRadius: "4px",
                            cursor: "pointer",
                        }}
                    >
                        ← Quay lại
                    </button>
                </div>
            </div>

            <div className="customer-content">
                <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "24px" }}>
                    {/* Main Content */}
                    <div>
                        {/* Status */}
                        <div style={{ background: "#f8f9fa", padding: "16px", borderRadius: "8px", marginBottom: "24px" }}>
                            <h3 style={{ marginTop: 0, marginBottom: "12px" }}>Trạng thái đơn hàng</h3>
                            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                {getStatusBadge(order?.status)}
                                <span style={{ color: "#666", fontSize: "14px" }}>
                                    Cập nhật: {new Date(order?.updated_at || order?.created_at).toLocaleString()}
                                </span>
                            </div>
                        </div>

                        {/* Items */}
                        <div style={{ marginBottom: "24px" }}>
                            <h3>Sản phẩm đã đặt</h3>
                            <div style={{ overflowX: "auto" }}>
                                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                                    <thead>
                                        <tr style={{ background: "#f1f2f6" }}>
                                            <th style={{ padding: 12, textAlign: "left" }}>Sản phẩm</th>
                                            <th style={{ padding: 12, textAlign: "center" }}>Số lượng</th>
                                            <th style={{ padding: 12, textAlign: "right" }}>Giá</th>
                                            <th style={{ padding: 12, textAlign: "right" }}>Tổng</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {items.length > 0 ? (
                                            items.map((item, idx) => (
                                                <tr key={idx} style={{ borderBottom: "1px solid #eee" }}>
                                                    <td style={{ padding: 12 }}>{item.product_name || item.name || "Sản phẩm"}</td>
                                                    <td style={{ padding: 12, textAlign: "center" }}>{item.quantity}</td>
                                                    <td style={{ padding: 12, textAlign: "right" }}>{formatPrice(Number(item.price))}</td>
                                                    <td style={{ padding: 12, textAlign: "right", fontWeight: "bold" }}>
                                                        {formatPrice(Number(item.price) * Number(item.quantity))}
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr><td colSpan={4} style={{ padding: 12, textAlign: "center", color: "#999" }}>Không có sản phẩm</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Delivery Info */}
                        <div style={{ background: "#f8f9fa", padding: "16px", borderRadius: "8px" }}>
                            <h3 style={{ marginTop: 0, marginBottom: "12px" }}>Thông tin giao hàng</h3>
                            <div style={{ lineHeight: "1.8", color: "#555", fontSize: "14px" }}>
                                <p><strong>Người nhận:</strong> {order?.customer_name || user?.full_name || "N/A"}</p>
                                <p><strong>Số điện thoại:</strong> {order?.customer_phone || user?.phone || "N/A"}</p>
                                <p><strong>Địa chỉ:</strong> {order?.shipping_address || user?.address || "N/A"}</p>
                                {order?.notes && <p><strong>Ghi chú:</strong> {order.notes}</p>}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div>
                        <div style={{ background: "#f8f9fa", padding: "16px", borderRadius: "8px", position: "sticky", top: "20px" }}>
                            <h3 style={{ marginTop: 0, marginBottom: "16px" }}>Tổng hợp đơn hàng</h3>
                            
                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px", paddingBottom: "12px", borderBottom: "1px solid #ddd" }}>
                                <span>Tạm tính:</span>
                                <span>{formatPrice(subtotal)}</span>
                            </div>

                            {order?.shipping_fee && (
                                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px", paddingBottom: "12px", borderBottom: "1px solid #ddd" }}>
                                    <span>Phí vận chuyển:</span>
                                    <span>{formatPrice(Number(order.shipping_fee))}</span>
                                </div>
                            )}

                            {order?.discount && (
                                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px", paddingBottom: "12px", borderBottom: "1px solid #ddd", color: "#28a745" }}>
                                    <span>Giảm giá:</span>
                                    <span>-{formatPrice(Number(order.discount))}</span>
                                </div>
                            )}

                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px", fontSize: "18px", fontWeight: "bold" }}>
                                <span>Tổng cộng:</span>
                                <span style={{ color: "#0066cc" }}>{formatPrice(total)}</span>
                            </div>

                            <div style={{ background: "white", padding: "12px", borderRadius: "4px", marginTop: "16px", fontSize: "12px", color: "#666" }}>
                                <p><strong>Ngày đặt:</strong></p>
                                <p>{new Date(order?.created_at).toLocaleString()}</p>
                                {order?.delivery_date && (
                                    <>
                                        <p style={{ marginTop: "8px" }}><strong>Ngày giao dự kiến:</strong></p>
                                        <p>{new Date(order.delivery_date).toLocaleString()}</p>
                                    </>
                                )}
                            </div>

                            {order?.status === "pending" && (
                                <button
                                    onClick={() => {
                                        if (confirm("Bạn có chắc chắn muốn hủy đơn hàng này?")) {
                                            // TODO: Implement cancel order API call
                                            alert("Chức năng hủy đơn hàng sẽ được cập nhật sớm");
                                        }
                                    }}
                                    style={{
                                        width: "100%",
                                        marginTop: "12px",
                                        padding: "10px",
                                        backgroundColor: "#dc3545",
                                        color: "white",
                                        border: "none",
                                        borderRadius: "4px",
                                        cursor: "pointer",
                                        fontWeight: "bold",
                                    }}
                                >
                                    Hủy đơn hàng
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
