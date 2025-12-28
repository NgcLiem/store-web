"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContexts";
import { useToast } from "@/components/Toast";
import "./payments.css";

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

export default function PaymentsPage() {
    const { showToast } = useToast();
    const { token } = useAuth();

    const [methods, setMethods] = useState([]);
    const [loading, setLoading] = useState(true);

    const loadMethods = useCallback(async () => {
        if (!token) return;

        setLoading(true);
        try {
            const res = await fetch(`${API_BASE}/payments`, {
                headers: { Authorization: `Bearer ${token}` },
                cache: "no-store",
            });

            if (!res.ok) throw new Error();
            const data = await res.json();
            setMethods(Array.isArray(data) ? data : []);
        } catch (e) {
            console.error(e);
            showToast("Không tải được phương thức thanh toán", "error");
            setMethods([]);
        } finally {
            setLoading(false);
        }
    }, [token, showToast]);

    useEffect(() => {
        loadMethods();
    }, [loadMethods]);

    const setDefault = async (id) => {
        try {
            const res = await fetch(`${API_BASE}/payments/${id}/default`, {
                method: "PATCH",
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) throw new Error();

            const updated = await res.json();

            setMethods((prev) =>
                prev.map((m) => ({
                    ...m,
                    is_default: m.id === updated.id ? 1 : 0,
                }))
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

    const addMomo = async () => {
        try {
            const res = await fetch(`${API_BASE}/momo`, {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) throw new Error();
            const created = await res.json();

            setMethods((prev) => [created, ...prev]);
            showToast("Đã thêm phương thức MoMo", "success");
        } catch (e) {
            showToast("Thêm MoMo thất bại", "error");
        }
    };

    return (
        <>
            <div className="customer-header">
                <h1>Phương thức thanh toán</h1>
                <p>Quản lý thẻ và tài khoản dùng để thanh toán đơn hàng.</p>
            </div>

            <div className="customer-content paymentsGrid">
                <div className="panel">
                    <div className="panelHead">
                        <h3 className="panelTitle">Danh sách phương thức</h3>
                        <button
                            className="btnGhost"
                            type="button"
                            onClick={loadMethods}
                            disabled={!token || loading}
                            title="Tải lại"
                        >
                            ↻
                        </button>
                    </div>

                    {loading ? (
                        <p className="emptyHint">Đang tải...</p>
                    ) : methods.length === 0 ? (
                        <p className="emptyHint">Bạn chưa thêm phương thức thanh toán nào.</p>
                    ) : (
                        <div className="paymentList">
                            {methods.map((m) => (
                                <div key={m.id} className="paymentCard">
                                    <div className="paymentInfo">
                                        <div className="paymentTitle">
                                            {m.brand || "CARD"} <span className="dot">•</span> •••• {m.last4}
                                        </div>
                                        <div className="paymentSub">Chủ thẻ: {m.holder || "—"}</div>

                                        {(m.is_default === 1 || m.is_default === true) && (
                                            <span className="badgeDefault">Mặc định</span>
                                        )}
                                    </div>

                                    <div className="paymentActions">
                                        {!(m.is_default === 1 || m.is_default === true) && (
                                            <button
                                                className="actionBtn actionBtnSoft"
                                                type="button"
                                                onClick={() => setDefault(m.id)}
                                                disabled={!token}
                                            >
                                                Đặt mặc định
                                            </button>
                                        )}

                                        <button
                                            className="actionBtn actionBtnDanger"
                                            type="button"
                                            onClick={() => remove(m.id)}
                                            disabled={!token}
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
                    <h3 className="panelTitle">Thêm phương thức mới</h3>

                    <button
                        className="actionBtn actionBtnPrimary"
                        type="button"
                        onClick={addMomo}
                        disabled={!token}
                    >
                        Thanh toán bằng MoMo
                    </button>

                    {!token && (
                        <p className="hintLogin">Bạn cần đăng nhập để quản lý phương thức thanh toán.</p>
                    )}
                </div>

            </div>
        </>
    );
}
