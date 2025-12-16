"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContexts";
import { useToast } from "@/components/Toast";
import { getLocalCart, clearLocalCart } from "@/lib/localCart";
import "./checkout.css";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export default function CheckoutPage() {
    const router = useRouter();
    const { user, token } = useAuth();
    const { showToast } = useToast();

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
        if (!user || !token) {
            showToast("Vui lòng đăng nhập trước khi thanh toán", "info");
            router.push("/login?callback=/checkout");
        }
    }, [user, token, router, showToast]);

    useEffect(() => {
        const cart = getLocalCart();
        setCartItems(cart || []);
    }, []);

    useEffect(() => {
        if (!token) return;

        (async () => {
            try {
                setLoading(true);

                const [addrRes, payRes] = await Promise.all([
                    fetch(`${API_BASE}/addresses`, {
                        headers: { Authorization: `Bearer ${token}` },
                        cache: "no-store",
                    }),
                    fetch(`${API_BASE}/payments`, {
                        headers: { Authorization: `Bearer ${token}` },
                        cache: "no-store",
                    }),
                ]);

                const addrData = await addrRes.json();
                const payData = await payRes.json();

                const addrList = Array.isArray(addrData) ? addrData : [];
                const payList = Array.isArray(payData) ? payData : [];

                setAddresses(addrList);
                setPayments(payList);
                h
                const defaultAddr =
                    addrList.find((a) => a.is_default === 1 || a.is_default === true) ||
                    addrList[0];
                const defaultPay =
                    payList.find((p) => p.is_default === 1 || p.is_default === true) ||
                    payList[0];

                setSelectedAddressId(defaultAddr ? defaultAddr.id : null);
                setSelectedPaymentId(defaultPay ? defaultPay.id : null);
            } catch (err) {
                console.error(err);
                showToast("Không tải được dữ liệu thanh toán", "error");
            } finally {
                setLoading(false);
            }
        })();
    }, [token, showToast]);

    const subTotal = cartItems.reduce(
        (sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 1),
        0
    );
    const shippingFee = 0;
    const total = subTotal - discount + shippingFee;

    const handleApplyVoucher = async () => {
        if (!voucherCode.trim()) return;

        try {
            const res = await fetch(`${API_BASE}/me/vouchers/apply`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    code: voucherCode.trim(),
                    total: subTotal,
                }),
            });

            const data = await res.json();
            if (!res.ok) {
                showToast(data.message || "Voucher không hợp lệ", "error");
                setAppliedVoucher(null);
                setDiscount(0);
                return;
            }

            setAppliedVoucher({ code: voucherCode.trim(), ...data });
            setDiscount(data.discount || 0);
            showToast("Áp dụng voucher thành công", "success");
        } catch (err) {
            console.error(err);
            showToast("Không áp dụng được voucher", "error");
        }
    };

    const handleCheckout = async () => {
        if (!cartItems.length) {
            showToast("Giỏ hàng trống", "error");
            return;
        }
        if (!selectedAddressId) {
            showToast("Vui lòng chọn địa chỉ giao hàng", "error");
            return;
        }
        if (!selectedPaymentId) {
            showToast("Vui lòng chọn phương thức thanh toán", "error");
            return;
        }

        try {
            setSubmitting(true);

            const body = {
                address_id: selectedAddressId,
                payment_method_id: selectedPaymentId,
                items: cartItems.map((item) => ({
                    product_id: item.id || item.product_id,
                    quantity: item.quantity || 1,
                    size: item.size || null,
                })),
                voucher_code: appliedVoucher?.code || null,
            };

            const res = await fetch(`${API_BASE}/orders/checkout`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(body),
            });

            const data = await res.json();
            if (!res.ok) {
                console.error(data);
                showToast(data.message || "Đặt hàng thất bại", "error");
                return;
            }

            clearLocalCart();
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

    return (
        <div className="checkout-container">
            <h1 className="checkout-title">Thanh toán</h1>

            {loading ? (
                <div className="checkout-loading">Đang tải dữ liệu...</div>
            ) : (
                <div className="checkout-content">
                    <div className="checkout-left">
                        {/* Địa chỉ giao hàng */}
                        <section className="checkout-section">
                            <h2>Địa chỉ giao hàng</h2>
                            {addresses.length === 0 ? (
                                <p>
                                    Bạn chưa có địa chỉ. Vui lòng thêm ở trang{" "}
                                    <a href="/account/addresses">Sổ địa chỉ</a>.
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
                                                    {addr.is_default ? (
                                                        <span className="badge-default">Mặc định</span>
                                                    ) : null}
                                                </span>
                                            </label>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </section>

                        <section className="checkout-section">
                            <h2>Phương thức thanh toán</h2>
                            {payments.length === 0 ? (
                                <p>
                                    Bạn chưa thêm phương thức thanh toán. Quản lý tại{" "}
                                    <a href="/account/payments">Tài khoản &gt; Thanh toán</a>.
                                </p>
                            ) : (
                                <ul className="checkout-payment-list">
                                    {payments.map((pm) => (
                                        <li key={pm.id} className="checkout-payment-item">
                                            <label>
                                                <input
                                                    type="radio"
                                                    name="payment"
                                                    checked={selectedPaymentId === pm.id}
                                                    onChange={() => setSelectedPaymentId(pm.id)}
                                                />
                                                <span>
                                                    <strong>{pm.brand || pm.type}</strong>{" "}
                                                    {pm.last4 ? `•••• ${pm.last4}` : ""}
                                                    {pm.is_default ? (
                                                        <span className="badge-default">Mặc định</span>
                                                    ) : null}
                                                </span>
                                            </label>
                                        </li>
                                    ))}
                                </ul>
                            )}
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

                    {/* Tóm tắt đơn hàng */}
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
