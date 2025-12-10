"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContexts";
import { getLocalCart, saveLocalCart, clearLocalCart } from "@/lib/localCart";
import "./cart.css";

export default function CartPage() {
    const router = useRouter();
    const { user, loading } = useAuth();
    const [cartItems, setCartItems] = useState([]);
    const [loadingCart, setLoadingCart] = useState(true);

    useEffect(() => {
        if (loading) return; // wait until auth is resolved

        // Guest: load from localStorage and fetch product details
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
                            if (!res.ok) return { cart_id: null, product_id: it.product_id, name: '(Không tìm thấy)', price: 0, image_url: '/no-image.png', quantity: it.quantity };
                            const prod = await res.json();
                            return {
                                cart_id: null,
                                product_id: it.product_id,
                                name: prod.name,
                                price: prod.price,
                                image_url: prod.image_url || (prod.image ? `/images/${prod.image}` : '/no-image.png'),
                                quantity: it.quantity,
                            };
                        } catch (e) {
                            return { cart_id: null, product_id: it.product_id, name: '(Lỗi)', price: 0, image_url: '/no-image.png', quantity: it.quantity };
                        }
                    }));

                    setCartItems(fetched);
                } catch (e) {
                    console.error('Load local cart error', e);
                    setCartItems([]);
                } finally {
                    setLoadingCart(false);
                }
            })();

            return;
        }

        fetch(`/api/cart?user_id=${user.id}`)
            .then((res) => res.json())
            .then((data) => {
                if (Array.isArray(data)) {
                    setCartItems(data);
                } else if (data && Array.isArray(data.rows)) {
                    setCartItems(data.rows);
                } else {
                    setCartItems([]);
                }
                setLoadingCart(false);
            })
            .catch((err) => {
                console.error("Fetch cart error:", err);
                setCartItems([]);
                setLoadingCart(false);
            });
    }, [loading, user]);

    // Xoá sản phẩm khỏi giỏ
    const handleRemove = async (productId) => {
        if (!user) {
            // remove from local cart
            const local = getLocalCart().filter(it => it.product_id !== productId);
            saveLocalCart(local);
            setCartItems(cartItems.filter((item) => item.product_id !== productId));
            return;
        }
        await fetch("/api/cart", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ user_id: user.id, product_id: productId }),
        });
        setCartItems(cartItems.filter((item) => item.product_id !== productId));
    };

    // Cập nhật số lượng
    const updateQuantity = async (productId, newQty) => {
        if (newQty < 1) return;
        if (!user) {
            const local = getLocalCart().map(it => it.product_id === productId ? { ...it, quantity: newQty } : it);
            saveLocalCart(local);
            setCartItems(cartItems.map((item) =>
                item.product_id === productId ? { ...item, quantity: newQty } : item
            ));
            return;
        }
        await fetch("/api/cart", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ user_id: user.id, product_id: productId, quantity: newQty }),
        });
        setCartItems(cartItems.map((item) =>

            item.product_id === productId ? { ...item, quantity: newQty } : item
        ));
    };

    const formatPrice = (price) => new Intl.NumberFormat("vi-VN").format(price) + "đ";

    const totalPrice = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

    if (loading || loadingCart) return <p>Đang tải giỏ hàng...</p>;

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
                            <div key={item.product_id}
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
                            <button className="cart-btn cart-btn-cod" onClick={() => router.push('/checkout')}>
                                Nhận Hàng Thanh Toán
                                <div className="cart-btn-desc">(Phí Giao Hàng: 30.000đ)</div>
                            </button>
                            <button className="cart-btn cart-btn-pay" onClick={() => router.push('/checkout')}>
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