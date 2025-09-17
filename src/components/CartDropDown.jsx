"use client"; // để có thể dùng sự kiện onClick trong App Router

import { useState } from "react";

export default function CartDropdown() {
    const [items, setItems] = useState([]); // mảng sản phẩm trong giỏ

    // Hàm xử lý thanh toán
    const checkout = () => {
        alert("Đi tới trang thanh toán...");
        // Ở đây bạn có thể dùng router.push("/checkout") hoặc gọi API
    };

    // Tính tổng tiền
    const total = items.reduce((acc, item) => acc + item.price * item.quantity, 0);

    return (
        <div className="cart-dropdown">
            {/* Header */}
            <div className="cart-header">Giỏ Hàng Của Bạn</div>

            {/* Items */}
            <div className="cart-items">
                {items.length === 0 ? (
                    <div className="empty-cart">
                        <i className="fa-solid fa-cart-shopping"></i>
                        <p>Giỏ hàng trống</p>
                    </div>
                ) : (
                    items.map((item, index) => (
                        <div key={index} className="cart-item">
                            <span>{item.name}</span>
                            <span>{item.price}₫</span>
                        </div>
                    ))
                )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
                <div className="cart-footer">
                    <div className="cart-total">
                        <span>Tổng cộng:</span>
                        <span>{total.toLocaleString()}₫</span>
                    </div>
                    <button className="checkout-btn" onClick={checkout}>
                        Thanh Toán
                    </button>
                </div>
            )}
        </div>
    );
}
