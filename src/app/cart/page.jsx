"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import "./cart.css";

export default function CartPage() {
    const router = useRouter();
    // Demo giỏ hàng (bạn có thể thay bằng data từ props hoặc context)
    const [cartItems, setCartItems] = useState([
        { id: 1, name: "Dép Cao Gót Nữ Đông Hải Quai Đan Đế Ánh Kim", price: 620000, qty: 1, image: "/shoes1.jpg", size: "36", color: "Kem" },
        // Thêm sản phẩm khác nếu muốn
    ]);

    // Xóa sản phẩm khỏi giỏ
    const handleRemove = (id) => {
        setCartItems(cartItems.filter(item => item.id !== id));
    };

    // Hàm format tiền theo chuẩn VNĐ
    const formatPrice = (price) => {
        return new Intl.NumberFormat("vi-VN").format(price) + "đ";
    };

    // Tổng tiền
    const totalPrice = cartItems.reduce(
        (acc, item) => acc + item.price * item.qty,
        0
    );

    return (
        <div className="cart-popup">
            {/* Header */}
            <div className="cart-header">
                <div className="cart-title">Giỏ Hàng{cartItems.length > 0 && <span className="cart-title-count">({cartItems.length} sản phẩm)</span>}</div>
                <button className="cart-close" title="Đóng">×</button>
            </div>
            {/* Nội dung */}
            {cartItems.length === 0 ? (
                <>
                    <div className="cart-empty">Giỏ hàng của bạn hiện đang trống. Hãy mua sắm ngay nhé!</div>
                    <div className="cart-empty-btn-wrap">
                        <button className="cart-btn cart-btn-continue" onClick={() => router.push("/")}>Tiếp Tục Mua Sắm</button>
                    </div>
                </>
            ) : (
                <>
                    <div className="cart-list">
                        {cartItems.map((item) => (
                            <div key={item.id} className="cart-item">
                                <img src={item.image} alt={item.name} className="cart-item-img" />
                                <div className="cart-item-info">
                                    <div className="cart-item-name">{item.name}</div>
                                    <div className="cart-item-desc">{item.color} / {item.size}</div>
                                    <div className="cart-item-qty-wrap">
                                        <button className="cart-item-qty-btn">-</button>
                                        <span className="cart-item-qty">{item.qty}</span>
                                        <button className="cart-item-qty-btn">+</button>
                                    </div>
                                </div>
                                <div className="cart-item-total">{formatPrice(item.price * item.qty)}</div>
                                <button onClick={() => handleRemove(item.id)} className="cart-item-remove">Xoá</button>
                            </div>
                        ))}
                    </div>
                    <div className="cart-total-wrap">
                        <div className="cart-total-row">
                            <div className="cart-total-label">Tổng</div>
                            <div className="cart-total-value">{formatPrice(totalPrice)} VND</div>
                        </div>
                        <div className="cart-total-btns">
                            <button className="cart-btn cart-btn-cod">
                                Nhận Hàng Thanh Toán
                                <div className="cart-btn-desc">(Phí Giao Hàng: 30.000đ)</div>
                            </button>
                            <button className="cart-btn cart-btn-pay">
                                Thanh Toán Trước
                                <div className="cart-btn-desc">(Miễn Phí Giao Hàng)</div>
                            </button>
                        </div>
                    </div>
                </>
            )}
            <div style={{ textAlign: 'center', marginTop: 24 }}>
                <button className="continue-shopping-btn" onClick={handleContinueShopping}>
                    Tiếp Tục Mua Sắm
                </button>
            </div>
        </div>

    );
    // Function to handle continue shopping
    function handleContinueShopping() {
        router.push("/");
    }
}