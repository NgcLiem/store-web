"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContexts";

export default function VoucherPage() {
    const { token } = useAuth();
    const [vouchers, setVouchers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [items, setItems] = useState([]);


    const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

    useEffect(() => {
        if (!token) return;
        (async () => {
            setLoading(true);
            try {
                const res = await fetch(`${API_BASE}/me/vouchers`, {
                    headers: { Authorization: `Bearer ${token}` },
                    cache: "no-store",
                });
                const data = await res.json();
                setVouchers(Array.isArray(data) ? data : []);
            } catch (e) {
                console.error(e);
                showToast("Không tải được voucher", "error");
            } finally {
                setLoading(false);
            }
        })();
    }, [token]);

    return (
        <>
            <div className="customer-header">
                <h1>Voucher của tôi</h1>
                <p>Các mã giảm giá hiện có trong tài khoản của bạn.</p>
            </div>

            <div className="customer-content">
                <div className="panel">
                    <h3>Danh sách voucher</h3>
                    {items.length === 0 ? (
                        <p style={{ fontSize: 14, color: "#6b7280" }}>
                            Hiện bạn chưa có voucher nào.
                        </p>
                    ) : (
                        <div style={{ display: "grid", gap: 10 }}>
                            {items.map((v) => (
                                <div
                                    key={v.id}
                                    style={{
                                        borderRadius: 12,
                                        border: "1px solid #e5e7eb",
                                        padding: 12,
                                        display: "flex",
                                        justifyContent: "space-between",
                                        gap: 10,
                                    }}
                                >
                                    <div>
                                        <div
                                            style={{
                                                fontSize: 16,
                                                fontWeight: 700,
                                                letterSpacing: ".08em",
                                                textTransform: "uppercase",
                                            }}
                                        >
                                            {v.code}
                                        </div>
                                        <div
                                            style={{
                                                fontSize: 13,
                                                color: "#4b5563",
                                                marginTop: 4,
                                            }}
                                        >
                                            {v.desc}
                                        </div>
                                        <div
                                            style={{
                                                fontSize: 12,
                                                color: "#6b7280",
                                                marginTop: 4,
                                            }}
                                        >
                                            Hạn sử dụng:{" "}
                                            {new Date(v.expiry).toLocaleDateString("vi-VN")}
                                        </div>
                                    </div>
                                    <div style={{ textAlign: "right" }}>
                                        <VoucherStatus status={v.status} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

function VoucherStatus({ status }) {
    const s = String(status).toLowerCase();
    let label = "Đang khả dụng";
    let style = {
        background: "#ecfdf5",
        color: "#047857",
    };

    if (s === "used") {
        label = "Đã sử dụng";
        style = {
            background: "#e5e7eb",
            color: "#374151",
        };
    } else if (s === "expired") {
        label = "Hết hạn";
        style = {
            background: "#fee2e2",
            color: "#b91c1c",
        };
    }

    return (
        <span
            style={{
                fontSize: 12,
                padding: "4px 10px",
                borderRadius: 999,
                textTransform: "capitalize",
                ...style,
            }}
        >
            {label}
        </span>
    );
}
