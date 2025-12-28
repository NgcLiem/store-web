"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContexts";
import { useToast } from "@/components/Toast";
import "./vouchers.css";

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

export default function VoucherPage() {
    const { token } = useAuth();
    const { showToast } = useToast();

    const [vouchers, setVouchers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!token) return;

        const ac = new AbortController();

        (async () => {
            setLoading(true);
            try {
                const res = await fetch(`${API_BASE}/me/vouchers`, {
                    headers: { Authorization: `Bearer ${token}` },
                    cache: "no-store",
                    signal: ac.signal,
                });

                const data = await res.json().catch(() => []);
                setVouchers(Array.isArray(data) ? data : []);
            } catch (e) {
                if (e?.name !== "AbortError") {
                    console.error(e);
                    showToast("Không tải được voucher", "error");
                }
            } finally {
                setLoading(false);
            }
        })();

        return () => ac.abort();
    }, [token, showToast]);

    return (
        <>
            <div className="customer-header">
                <h1>Voucher của tôi</h1>
                <p>Các mã giảm giá hiện có trong tài khoản của bạn.</p>
            </div>

            <div className="customer-content">
                <div className="panel">
                    <h3 className="panelTitle">Danh sách voucher</h3>

                    {loading ? (
                        <p className="mutedText">Đang tải…</p>
                    ) : vouchers.length === 0 ? (
                        <p className="mutedText">Hiện bạn chưa có voucher nào.</p>
                    ) : (
                        <div className="voucherList">
                            {vouchers.map((v) => (
                                <div key={v.id ?? v.code} className="voucherCard">
                                    <div className="voucherMain">
                                        <div className="voucherCode">{v.code}</div>
                                        <div className="voucherDesc">{v.desc}</div>
                                        <div className="voucherExpiry">
                                            Hạn sử dụng:{" "}
                                            {v.expiry
                                                ? new Date(v.expiry).toLocaleDateString("vi-VN")
                                                : "N/A"}
                                        </div>
                                    </div>

                                    <div className="voucherRight">
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
    const s = String(status || "").toLowerCase();

    let label = "Đang khả dụng";
    let cls = "badge badgeOk";

    if (s === "used") {
        label = "Đã sử dụng";
        cls = "badge badgeMuted";
    } else if (s === "expired") {
        label = "Hết hạn";
        cls = "badge badgeDanger";
    }

    return <span className={cls}>{label}</span>;
}
