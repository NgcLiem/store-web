"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContexts";
import { useToast } from "@/components/Toast";
import "./checkout.css";

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

export default function CheckoutPage() {
    const router = useRouter();
    const { user, token } = useAuth();
    const { showToast } = useToast();
    const warnedRef = useRef(false);

    const [cartItems, setCartItems] = useState([]);
    const [addresses, setAddresses] = useState([]);
    const [payments, setPayments] = useState([]);
    const [selectedAddressId, setSelectedAddressId] = useState(null);
    const [selectedPaymentId, setSelectedPaymentId] = useState(null);

    const [voucherCode, setVoucherCode] = useState("");
    const [appliedVoucher, setAppliedVoucher] = useState(null);
    const [discount, setDiscount] = useState(0);

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (!loading && (!user || !token)) {
            showToast("Vui lòng đăng nhập trước khi thanh toán", "info");
            router.push("/login?callback=/checkout");
        }
    }, [user, token, router, showToast]);

    useEffect(() => {
        if (!token) return;

        const ac = new AbortController();

        (async () => {
            try {
                const res = await fetch(`${API_BASE}/cart`, {
                    headers: { Authorization: `Bearer ${token}` },
                    signal: ac.signal,
                    cache: "no-store",
                });

                const data = await res.json().catch(() => ({}));
                setCartItems(Array.isArray(data?.items) ? data.items : []);
            } catch (e) {
                if (e?.name !== "AbortError") {
                    console.error(e);
                    showToast("Không tải được giỏ hàng", "error");
                    setCartItems([]);
                }
            }
        })();

        return () => ac.abort();
    }, [token, showToast]);


    useEffect(() => {
        if (!token) return;

        const ac = new AbortController();

        (async () => {
            try {
                setLoading(true);

                const [addrRes, payRes] = await Promise.all([
                    fetch(`${API_BASE}/addresses`, {
                        headers: { Authorization: `Bearer ${token}` },
                        cache: "no-store",
                        signal: ac.signal,
                    }),
                    fetch(`${API_BASE}/payments`, {
                        headers: { Authorization: `Bearer ${token}` },
                        cache: "no-store",
                        signal: ac.signal,
                    }),
                ]);

                const addrData = await addrRes.json().catch(() => []);
                const payData = await payRes.json().catch(() => []);

                const addrList = Array.isArray(addrData) ? addrData : [];
                const payList = Array.isArray(payData) ? payData : [];

                setAddresses(addrList);
                setPayments(payList);

                const defaultAddr =
                    addrList.find((a) => a.is_default === 1 || a.is_default === true) || addrList[0];
                const defaultPay =
                    payList.find((p) => p.is_default === 1 || p.is_default === true) || payList[0];

                setSelectedAddressId(defaultAddr?.id ?? null);
                setSelectedPaymentId(defaultPay?.id ?? null);
            } catch (err) {
                if (err?.name !== "AbortError") {
                    console.error(err);
                    showToast("Không tải được dữ liệu thanh toán", "error");
                }
            } finally {
                setLoading(false);
            }
        })();

        return () => ac.abort();
    }, [token, showToast]);

    const subTotal = useMemo(
        () =>
            cartItems.reduce(
                (sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 1),
                0
            ),
        [cartItems]
    );

    const shippingFee = 0;
    const total = subTotal - discount + shippingFee;

    const handleApplyVoucher = async () => {
        if (!token) return;
        if (!voucherCode.trim()) return;

        try {
            const res = await fetch(`${API_BASE}/me/vouchers/apply`, {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: JSON.stringify({ code: voucherCode.trim(), total: subTotal }),
            });

            const data = await res.json().catch(() => ({}));
            if (!res.ok) {
                showToast(data.message || "Voucher không hợp lệ", "error");
                setAppliedVoucher(null);
                setDiscount(0);
                return;
            }

            setAppliedVoucher({ code: voucherCode.trim(), ...data });
            setDiscount(Number(data.discount || 0));
            showToast("Áp dụng voucher thành công", "success");
        } catch (err) {
            console.error(err);
            showToast("Không áp dụng được voucher", "error");
        }
    };

    const isMomoSelected = useMemo(() => {
        const pm = payments.find((p) => Number(p?.id) === Number(selectedPaymentId));
        if (!pm) return false;
        return String(pm.type).toUpperCase() === "WALLET" && String(pm.brand || "").toUpperCase() === "MOMO";
    }, [payments, selectedPaymentId]);

    const handleCheckout = async () => {
        if (!token) return;

        if (!cartItems.length) return showToast("Giỏ hàng trống", "error");
        if (!selectedAddressId) return showToast("Vui lòng chọn địa chỉ giao hàng", "error");
        if (!selectedPaymentId) return showToast("Vui lòng chọn phương thức thanh toán", "error");

        try {
            setSubmitting(true);

            const body = {
                address_id: selectedAddressId,
                payment_method_id: selectedPaymentId,
                items: cartItems.map((item) => ({
                    product_id: item.product_id ?? item.productId ?? item.product?.id ?? item.id,
                    quantity: item.quantity || 1,
                    size: item.size ?? null,
                })),
                voucher_code: appliedVoucher?.code || null,
            };

            const res = await fetch(`${API_BASE}/orders/checkout`, {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: JSON.stringify(body),
            });

            const data = await res.json().catch(() => ({}));
            if (!res.ok) {
                console.error(data);
                showToast(data.message || "Đặt hàng thất bại", "error");
                return;
            }

            // ✅ Nếu chọn MoMo thì gọi /momo/create để lấy payUrl
            if (isMomoSelected) {
                const momoRes = await fetch(`${API_BASE}/momo/create-payment`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                    body: JSON.stringify({ orderId: data.id }),
                });

                const momoData = await momoRes.json().catch(() => ({}));
                if (!momoRes.ok) {
                    console.error(momoData);
                    showToast(momoData.message || "Không tạo được link thanh toán MoMo", "error");
                    return;
                }

                if (momoData?.payUrl) {
                    window.location.href = momoData.payUrl;
                    return;
                }

                showToast("MoMo không trả về payUrl", "error");
                return;
            }

            //  Không phải MoMo: đi như cũ
            await fetch(`${API_BASE}/cart/clear`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });

            setCartItems([]);
            showToast(`Đặt hàng thành công! Mã đơn: #${data.id}`, "success");
            router.push("/account/orders");
        } catch (err) {
            console.error(err);
            showToast("Có lỗi xảy ra khi tạo đơn hàng", "error");
        } finally {
            setSubmitting(false);
        }
    };


    const addMomo = async () => {
        const existing = payments.find(
            (p) => String(p?.type).toUpperCase() === "WALLET" && String(p?.brand || "").toUpperCase() === "MOMO"
        );
        if (existing?.id) {
            setSelectedPaymentId(existing.id);
            showToast("Đã chọn MoMo", "success");
            return;
        }

        try {
            // Tạo payment method MoMo (WALLET/MOMO)
            const res = await fetch(`${API_BASE}/payments`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    type: "WALLET",
                    brand: "MOMO",
                    is_default: 1,
                }),
            });

            const created = await res.json().catch(() => ({}));
            if (!res.ok) {
                console.error(created);
                showToast(created?.message || "Thêm MoMo thất bại", "error");
                return;
            }

            setPayments((prev) => [created, ...(Array.isArray(prev) ? prev : [])]);
            setSelectedPaymentId(created.id);
            showToast("Đã thêm & chọn MoMo", "success");
        } catch (e) {
            console.error(e);
            showToast("Thêm MoMo thất bại", "error");
        }
    };

    const addCod = async () => {
        // Nếu đã có COD thì chỉ cần chọn
        const existing = payments.find((p) => String(p?.type).toUpperCase() === "COD");
        if (existing?.id) {
            setSelectedPaymentId(existing.id);
            showToast("Đã chọn COD", "success");
            return;
        }

        try {
            // Tạo payment method COD
            const res = await fetch(`${API_BASE}/payments`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    type: "COD",
                    brand: null,
                    is_default: 1,
                }),
            });

            const created = await res.json().catch(() => ({}));
            if (!res.ok) {
                console.error(created);
                showToast(created?.message || "Thêm COD thất bại", "error");
                return;
            }

            setPayments((prev) => [created, ...(Array.isArray(prev) ? prev : [])]);
            setSelectedPaymentId(created.id);
            showToast("Đã bật thanh toán khi nhận hàng (COD)", "success");
        } catch (e) {
            console.error(e);
            showToast("Thêm COD thất bại", "error");
        }
    };

    if (!token) return null;

    return (
        <div className="checkout-container">
            <h1 className="checkout-title">Thanh toán</h1>

            {loading ? (
                <div className="checkout-loading">Đang tải dữ liệu...</div>
            ) : (
                <div className="checkout-content">
                    <div className="checkout-left">
                        <section className="checkout-section">
                            <h2>Địa chỉ giao hàng</h2>
                            {addresses.length === 0 ? (
                                <p>
                                    Bạn chưa có địa chỉ. Vui lòng thêm ở trang <a href="/account/addresses">Địa chỉ của bạn</a>.
                                </p>
                            ) : (
                                <ul className="checkout-address-list">
                                    {addresses.map((addr) => (
                                        <li key={addr.id} className="checkout-address-item">
                                            <label>
                                                <input
                                                    type="radio"
                                                    name="address"
                                                    checked={selectedAddressId === addr.id}
                                                    onChange={() => setSelectedAddressId(addr.id)}
                                                />
                                                <span className="checkout-address-text">
                                                    <strong>{addr.full_name}</strong> | {addr.phone}
                                                    <br />
                                                    {addr.address_line}
                                                    {addr.is_default ? <span className="badge-default">Mặc định</span> : null}
                                                </span>
                                            </label>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </section>

                        <section className="checkout-section">
                            <h2>Phương thức thanh toán</h2>

                            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                                <button
                                    className="actionBtn actionBtnPrimary"
                                    type="button"
                                    onClick={addMomo}
                                    disabled={!token}
                                    title="Chọn hoặc thêm phương thức MoMo"
                                >
                                    Thanh toán bằng MoMo
                                </button>

                                <button
                                    className="actionBtn actionBtnPrimary"
                                    type="button"
                                    onClick={addCod}
                                    disabled={!token}
                                    title="Thanh toán khi nhận hàng"
                                >
                                    Thanh toán khi nhận hàng (COD)
                                </button>
                            </div>

                            {selectedPaymentId ? (
                                <p style={{ marginTop: 8, opacity: 0.85 }}>
                                    Đang chọn:{" "}
                                    <b>
                                        {(() => {
                                            const pm = payments.find((p) => Number(p?.id) === Number(selectedPaymentId));
                                            if (!pm) return `#${selectedPaymentId}`;
                                            const t = String(pm?.type || "").toUpperCase();
                                            const b = String(pm?.brand || "").toUpperCase();
                                            return t === "WALLET" && b === "MOMO" ? "MoMo" : t;
                                        })()}
                                    </b>
                                </p>
                            ) : null}
                        </section>

                        <section className="checkout-section">
                            <h2>Mã giảm giá</h2>
                            <div className="checkout-voucher">
                                <input
                                    type="text"
                                    value={voucherCode}
                                    onChange={(e) => setVoucherCode(e.target.value)}
                                    placeholder="Nhập mã voucher"
                                />
                                <button type="button" onClick={handleApplyVoucher}>
                                    Áp dụng
                                </button>
                            </div>

                            {appliedVoucher && (
                                <p className="checkout-voucher-info">
                                    Đã áp dụng: <strong>{appliedVoucher.code}</strong> (-{" "}
                                    {discount.toLocaleString("vi-VN")} đ)
                                </p>
                            )}
                        </section>
                    </div>

                    <div className="checkout-right">
                        <section className="checkout-section summary">
                            <h2>Tóm tắt đơn hàng</h2>
                            <div className="summary-line">
                                <span>Tạm tính</span>
                                <span>{subTotal.toLocaleString("vi-VN")} đ</span>
                            </div>
                            <div className="summary-line">
                                <span>Voucher</span>
                                <span>- {discount.toLocaleString("vi-VN")} đ</span>
                            </div>
                            <div className="summary-line">
                                <span>Phí vận chuyển</span>
                                <span>{shippingFee.toLocaleString("vi-VN")} đ</span>
                            </div>
                            <div className="summary-total">
                                <span>Thành tiền</span>
                                <span>{total.toLocaleString("vi-VN")} đ</span>
                            </div>

                            <button
                                className="checkout-submit-btn"
                                type="button"
                                disabled={submitting || !cartItems.length}
                                onClick={handleCheckout}
                            >
                                {submitting ? "Đang xử lý..." : "Đặt hàng"}
                            </button>
                        </section>
                    </div>
                </div>
            )}
        </div>
    );
}
