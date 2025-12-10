"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContexts";
import { useToast } from "@/components/Toast";

export default function PaymentsPage() {
    const { showToast } = useToast();
    const { token } = useAuth();
    const [methods, setMethods] = useState([]);
    const [loading, setLoading] = useState(true);

    const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";


    useEffect(() => {
        if (!token) return;
        (async () => {
            setLoading(true);
            try {
                const res = await fetch(`${API_BASE}/payments`, {
                    headers: { Authorization: `Bearer ${token}` },
                    cache: "no-store",
                });
                const data = await res.json();
                setMethods(Array.isArray(data) ? data : []);
            } catch (e) {
                console.error(e);
                showToast("Không tải được phương thức thanh toán", "error");
            } finally {
                setLoading(false);
            }
        })();
    }, [token]);


    const setDefault = async (id) => {
        try {
            const res = await fetch(`${API_BASE}/payments/${id}/default`, {
                method: "PATCH",
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) throw new Error();
            const updated = await res.json();
            setMethods((prev) =>
                prev.map((m) => ({ ...m, is_default: m.id === updated.id ? 1 : 0 })),
            );
            showToast("Đã đặt phương thức mặc định", "success");
        } catch {
            showToast("Không đặt được mặc định", "error");
        }
    };


    const remove = async (id) => {
        try {
            const res = await fetch(`${API_BASE}/payments/${id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) throw new Error();
            setMethods((prev) => prev.filter((m) => m.id !== id));
            showToast("Đã xoá phương thức thanh toán", "success");
        } catch {
            showToast("Xoá phương thức thanh toán thất bại", "error");
        }
    };


    return (
        <>
            <div className="customer-header">
                <h1>Phương thức thanh toán</h1>
                <p>Quản lý thẻ và tài khoản dùng để thanh toán đơn hàng.</p>
            </div>

            <div className="customer-content" style={{ display: "grid", gap: 16 }}>
                <div className="panel">
                    <h3>Danh sách phương thức</h3>
                    {methods.length === 0 ? (
                        <p style={{ fontSize: 14, color: "#6b7280" }}>
                            Bạn chưa thêm phương thức thanh toán nào.
                        </p>
                    ) : (
                        <div style={{ display: "grid", gap: 10 }}>
                            {methods.map((m) => (
                                <div
                                    key={m.id}
                                    style={{
                                        borderRadius: 12,
                                        border: "1px solid #e5e7eb",
                                        padding: 12,
                                        display: "flex",
                                        justifyContent: "space-between",
                                        gap: 10,
                                        alignItems: "center",
                                    }}
                                >
                                    <div>
                                        <div style={{ fontSize: 14, fontWeight: 600 }}>
                                            {m.brand} •••• {m.last4}
                                        </div>
                                        <div
                                            style={{ fontSize: 12, color: "#6b7280", marginTop: 2 }}
                                        >
                                            Chủ thẻ: {m.holder}
                                        </div>
                                        {m.is_default && (
                                            <div
                                                style={{
                                                    fontSize: 11,
                                                    marginTop: 4,
                                                    padding: "2px 8px",
                                                    borderRadius: 999,
                                                    background: "#ecfdf5",
                                                    color: "#047857",
                                                    display: "inline-block",
                                                    textTransform: "uppercase",
                                                    letterSpacing: ".08em",
                                                }}
                                            >
                                                Mặc định
                                            </div>
                                        )}
                                    </div>
                                    <div
                                        style={{ display: "flex", flexDirection: "column", gap: 6 }}
                                    >
                                        {!m.is_default && (
                                            <button
                                                className="action-btn"
                                                type="button"
                                                onClick={() => setDefault(m.id)}
                                                style={{
                                                    background: "#f9fafb",
                                                    color: "#111827",
                                                    borderColor: "#e5e7eb",
                                                }}
                                            >
                                                Đặt làm mặc định
                                            </button>
                                        )}
                                        <button
                                            className="action-btn"
                                            type="button"
                                            onClick={() => remove(m.id)}
                                            style={{
                                                background: "#fee2e2",
                                                color: "#b91c1c",
                                                borderColor: "#fecaca",
                                            }}
                                        >
                                            Xoá
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="panel">
                    <h3>Thêm phương thức mới</h3>
                    <p style={{ fontSize: 13, color: "#6b7280" }}>
                        (Phần này bạn có thể tích hợp cổng thanh toán thật như VNPay, MoMo,
                        ZaloPay… sau)
                    </p>
                    <button
                        className="action-btn"
                        type="button"
                        onClick={() =>
                            showToast(
                                "Demo UI: phần này sẽ mở form/thao tác với cổng thanh toán sau",
                                "info"
                            )
                        }
                    >
                        Thêm thẻ / tài khoản mới
                    </button>
                </div>
            </div>
        </>
    );
}
