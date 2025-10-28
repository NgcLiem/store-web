"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import "./cart.css";

export default function CartPage() {
    const router = useRouter();
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const userId = 3; // giả sử user_id = 3 (tạm thời)

    useEffect(() => {
        fetch(`/api/cart?user_id=${userId}`)
            .then((res) => res.json())
            .then((data) => {
                // Always set cartItems as array
                if (Array.isArray(data)) {
                    setCartItems(data);
                } else if (data && Array.isArray(data.rows)) {
                    setCartItems(data.rows);
                } else {
                    setCartItems([]);
                }
                setLoading(false);
            })
            .catch((err) => {
                console.error("Fetch cart error:", err);
                setCartItems([]);
                setLoading(false);
            });
    }, []);

    // Xoá sản phẩm khỏi giỏ
    const handleRemove = async (productId) => {
        await fetch("/api/cart", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ user_id: userId, product_id: productId }),
        });
        setCartItems(cartItems.filter((item) => item.product_id !== productId));
    };

    // Cập nhật số lượng
    const updateQuantity = async (productId, newQty) => {
        if (newQty < 1) return;
        await fetch("/api/cart", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ user_id: userId, product_id: productId, quantity: newQty }),
        });
        setCartItems(cartItems.map((item) =>

            item.product_id === productId ? { ...item, quantity: newQty } : item
        ));
    };

    const formatPrice = (price) => new Intl.NumberFormat("vi-VN").format(price) + "đ";

    const totalPrice = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

    if (loading) return <p>Đang tải giỏ hàng...</p>;

    return (
        <div className="cart-popup">
            <div className="cart-header">
                <div className="cart-title">
                    Giỏ Hàng {cartItems.length > 0 && <span>({cartItems.length} sản phẩm)</span>}
                </div>
                <button className="cart-close" title="Đóng" onClick={() => router.push("/")}>×</button>
            </div>
            {cartItems.length === 0 ? (
                <div className="cart-empty">
                    Giỏ hàng trống. <button onClick={() => router.push("/")}>Mua ngay</button>
                </div>
            ) : (
                <>
                    <div className="cart-list">
                        {cartItems.map((item) => (
                            <div key={`${item.cart_id}-${item.product_id}`}
                                className="cart-item">
                                <img src={item.image_url} alt={item.name} className="cart-item-img" />
                                <div className="cart-item-info">
                                    <div className="cart-item-name">{item.name}</div>
                                    <div className="cart-item-qty-wrap">
                                        <button className="btn-remove" onClick={() => updateQuantity(item.product_id, item.quantity - 1)}>-</button>
                                        <span>{item.quantity}</span>
                                        <button className="btn-add" onClick={() => updateQuantity(item.product_id, item.quantity + 1)}>+</button>
                                    </div>
                                </div>
                                <div className="cart-item-total">{formatPrice(item.price * item.quantity)}</div>
                                <button onClick={() => handleRemove(item.product_id)} className="cart-item-remove">Xoá</button>
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
            <div style={{ textAlign: 'center', padding: 24 }}>
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