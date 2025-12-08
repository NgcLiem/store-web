"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContexts";
import { getLocalCart, clearLocalCart } from "@/lib/localCart";
import "./checkout.css";

export default function CheckoutPage() {
    const router = useRouter();
    const { user, loading } = useAuth();
    const [cartItems, setCartItems] = useState([]);
    const [loadingCart, setLoadingCart] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    // Form data
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        country: "Việt Nam",
        address: "",
        city: "",
        phone: "",
        email: "",
        notes: "",
        paymentMethod: "COD" // COD hoặc PREPAY
    });

    // Load cart items
    useEffect(() => {
        if (loading) return;

        // Guest cart
        if (!user) {
            (async () => {
                try {
                    const local = getLocalCart();
                    if (!local.length) {
                        setCartItems([]);
                        setLoadingCart(false);
                        return;
                    }

                    const fetched = await Promise.all(local.map(async (it) => {
                        try {
                            const res = await fetch(`http://localhost:3001/products/${it.product_id}`);
                            if (!res.ok) return null;
                            const prod = await res.json();
                            return {
                                product_id: it.product_id,
                                name: prod.name,
                                price: prod.price,
                                image_url: prod.image_url,
                                quantity: it.quantity,
                                size: it.size
                            };
                        } catch (e) {
                            return null;
                        }
                    }));

                    setCartItems(fetched.filter(Boolean));
                } catch (e) {
                    console.error('Load local cart error', e);
                    setCartItems([]);
                } finally {
                    setLoadingCart(false);
                }
            })();
            return;
        }

        // User cart from server
        fetch(`/api/cart?user_id=${user.id}`)
            .then((res) => res.json())
            .then((data) => {
                const items = Array.isArray(data) ? data : (data.products || data.rows || []);
                setCartItems(items);
                setLoadingCart(false);
            })
            .catch((err) => {
                console.error("Fetch cart error:", err);
                setCartItems([]);
                setLoadingCart(false);
            });
    }, [loading, user]);

    // Auto-fill form if user logged in
    useEffect(() => {
        if (user) {
            setFormData(prev => ({
                ...prev,
                email: user.email || "",
                phone: user.phone || "",
                firstName: user.full_name?.split(' ')[0] || "",
                lastName: user.full_name?.split(' ').slice(1).join(' ') || "",
                address: user.address || ""
            }));
        }
    }, [user]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const formatPrice = (price) => new Intl.NumberFormat("vi-VN").format(price) + "đ";

    const subtotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const shippingFee = formData.paymentMethod === "COD" ? 35000 : 0;
    const total = subtotal + shippingFee;

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (cartItems.length === 0) {
            alert("Giỏ hàng trống!");
            return;
        }

        // Validate form
        if (!formData.firstName || !formData.lastName || !formData.phone || !formData.address || !formData.city || !formData.email) {
            alert("Vui lòng điền đầy đủ thông tin!");
            return;
        }

        setSubmitting(true);

        try {
            const orderData = {
                user_id: user?.id || null,
                customer_name: `${formData.firstName} ${formData.lastName}`,
                customer_email: formData.email,
                customer_phone: formData.phone,
                shipping_address: `${formData.address}, ${formData.city}, ${formData.country}`,
                payment_method: formData.paymentMethod,
                notes: formData.notes,
                total_amount: total,
                items: cartItems.map(item => ({
                    product_id: item.product_id,
                    quantity: item.quantity,
                    price: item.price,
                    size: item.size
                }))
            };

            const res = await fetch('/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(orderData)
            });

            const result = await res.json();

            if (!res.ok) {
                throw new Error(result.message || 'Lỗi tạo đơn hàng');
            }

            // Clear cart
            if (!user) {
                clearLocalCart();
            } else {
                // Clear server cart (optional - có thể xóa sau khi xác nhận đơn)
                await fetch('/api/cart', {
                    method: 'DELETE',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ user_id: user.id, clear_all: true })
                });
            }

            alert(`Đặt hàng thành công! Mã đơn hàng: ${result.order_id}`);
            router.push('/');

        } catch (err) {
            console.error('Order error:', err);
            alert('Lỗi: ' + err.message);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading || loadingCart) return <div className="checkout-loading">Đang tải...</div>;

    if (cartItems.length === 0) {
        return (
            <div className="checkout-empty">
                <h2>Giỏ hàng trống</h2>
                <p>Vui lòng thêm sản phẩm vào giỏ hàng trước khi thanh toán.</p>
                <button onClick={() => router.push('/')}>Tiếp tục mua sắm</button>
            </div>
        );
    }

    return (
        <div className="checkout-container">
            <div className="checkout-left">
                <h2>THANH TOÁN VÀ GIAO HÀNG</h2>
                
                {!user && (
                    <div className="checkout-login-hint">
                        Bạn đã có tài khoản? <a href="/login">Bấm vào đây để đăng nhập</a>
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="form-row">
                        <div className="form-group">
                            <label>Họ *</label>
                            <input type="text" name="lastName" value={formData.lastName} onChange={handleInputChange} required />
                        </div>
                        <div className="form-group">
                            <label>Tên *</label>
                            <input type="text" name="firstName" value={formData.firstName} onChange={handleInputChange} required />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Quốc gia/Khu vực *</label>
                        <input type="text" name="country" value={formData.country} onChange={handleInputChange} required />
                    </div>

                    <div className="form-group">
                        <label>Địa chỉ *</label>
                        <input type="text" name="address" placeholder="Số nhà, tên đường" value={formData.address} onChange={handleInputChange} required />
                    </div>

                    <div className="form-group">
                        <label>Thị trấn / Thành phố *</label>
                        <input type="text" name="city" placeholder="Chọn tỉnh/thành phố" value={formData.city} onChange={handleInputChange} required />
                    </div>

                    <div className="form-group">
                        <label>Số điện thoại *</label>
                        <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} required />
                    </div>

                    <div className="form-group">
                        <label>Địa chỉ email *</label>
                        <input type="email" name="email" value={formData.email} onChange={handleInputChange} required />
                    </div>

                    <h3>THÔNG TIN BỔ SUNG</h3>
                    <div className="form-group">
                        <label>Ghi chú đơn hàng (tùy chọn)</label>
                        <textarea name="notes" rows="4" placeholder="Ghi chú về đơn hàng, ví dụ: thời gian hay chỉ dẫn địa điểm giao hàng chi tiết hơn." value={formData.notes} onChange={handleInputChange}></textarea>
                    </div>

                    <button type="submit" className="btn-submit-order" disabled={submitting}>
                        {submitting ? 'Đang xử lý...' : 'ĐẶT HÀNG'}
                    </button>
                </form>
            </div>

            <div className="checkout-right">
                <h3>ĐƠN HÀNG CỦA BẠN</h3>
                
                <div className="order-summary">
                    <div className="summary-header">
                        <span>SẢN PHẨM</span>
                        <span>TẠM TÍNH</span>
                    </div>

                    {cartItems.map((item, idx) => (
                        <div key={idx} className="summary-item">
                            <div className="item-info">
                                <img src={item.image_url || '/no-image.png'} alt={item.name} />
                                <div>
                                    <div>{item.name} {item.size && `/ ${item.size}`} × {item.quantity}</div>
                                </div>
                            </div>
                            <div className="item-price">{formatPrice(item.price * item.quantity)}</div>
                        </div>
                    ))}

                    <div className="summary-row">
                        <span>Tạm tính</span>
                        <span>{formatPrice(subtotal)}</span>
                    </div>

                    <div className="summary-row">
                        <span>Giao hàng</span>
                        <span>Tiêu chuẩn (3-4 ngày): {formatPrice(shippingFee)}</span>
                    </div>

                    <div className="summary-total">
                        <span>Tổng</span>
                        <span>{formatPrice(total)}</span>
                    </div>
                </div>

                <div className="payment-method">
                    <label>
                        <input type="radio" name="paymentMethod" value="COD" checked={formData.paymentMethod === "COD"} onChange={handleInputChange} />
                        Thanh toán khi nhận hàng (COD)
                    </label>
                    <label>
                        <input type="radio" name="paymentMethod" value="PREPAY" checked={formData.paymentMethod === "PREPAY"} onChange={handleInputChange} />
                        Thanh toán trước (Miễn phí ship)
                    </label>
                </div>

                <div className="terms">
                    <p style={{fontSize: '12px', color: '#666'}}>
                        For security, use of Google's reCAPTCHA service is required which is subject to the Google Privacy Policy and Terms of Use.
                    </p>
                </div>
            </div>
        </div>
    );
}
