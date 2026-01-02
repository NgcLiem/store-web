"use client";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContexts";
import { getLocalCart, saveLocalCart } from "@/lib/localCart";
import "./cart.css";

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

export default function CartPage() {
    const router = useRouter();
    const { user, token, loading } = useAuth();
    const [cartItems, setCartItems] = useState([]);
    const [loadingCart, setLoadingCart] = useState(true);

    const makeKey = (item, idx) => {
        if (item.cart_item_id) return `ci-${item.cart_item_id}`;
        const pid = item.product_id ?? "noid";
        const sz = item.size ?? "nosize";
        return `g-${pid}-${sz}-${idx}`;
    };

    useEffect(() => {
        if (loading) return;

        if (!user || !token) {
            (async () => {
                try {
                    const local = getLocalCart();
                    if (!local.length) {
                        setCartItems([]);
                        return;
                    }

                    const fetched = await Promise.all(
                        local.map(async (it) => {
                            const res = await fetch(`${API_BASE}/products/${it.product_id}`);
                            const prod = await res.json().catch(() => null);
                            return {
                                cart_item_id: null,
                                product_id: it.product_id,
                                size: it.size ?? null,
                                quantity: it.quantity,
                                name: prod?.name ?? "(Không tìm thấy)",
                                price: prod?.price ?? 0,
                                image_url: prod?.image_url ?? "/no-image.png",
                            };
                        })
                    );

                    setCartItems(fetched);
                } catch (e) {
                    console.error(e);
                    setCartItems([]);
                } finally {
                    setLoadingCart(false);
                }
            })();
            return;
        }

        (async () => {
            try {
                const res = await fetch(`${API_BASE}/cart`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const data = await res.json();
                const items = data?.items ?? [];
                setCartItems(items);
            } catch (e) {
                console.error(e);
                setCartItems([]);
            } finally {
                setLoadingCart(false);
            }
        })();
    }, [loading, user, token]);

    const sameGuestLine = (a, product_id, size) =>
        Number(a.product_id) === Number(product_id) && (a.size ?? null) === (size ?? null);

    const removeGuest = (product_id, size) => {
        const local = getLocalCart().filter((it) => !sameGuestLine(it, product_id, size));
        saveLocalCart(local);
        setCartItems((prev) => prev.filter((it) => !sameGuestLine(it, product_id, size)));
    };

    const updateGuestQty = (product_id, size, newQty) => {
        const qty = Math.max(1, Number(newQty || 1));
        const local = getLocalCart().map((it) =>
            sameGuestLine(it, product_id, size) ? { ...it, quantity: qty } : it
        );
        saveLocalCart(local);
        setCartItems((prev) =>
            prev.map((it) => (sameGuestLine(it, product_id, size) ? { ...it, quantity: qty } : it))
        );
    };

    const handleRemove = async (item) => {
        if (!user || !token || !item.cart_item_id) {
            removeGuest(item.product_id, item.size);
            return;
        }

        await fetch(`${API_BASE}/cart/items/${item.cart_item_id}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
        });

        setCartItems((prev) => prev.filter((x) => x.cart_item_id !== item.cart_item_id));
    };

    const updateQuantity = async (item, newQty) => {
        const qty = Math.max(1, Number(newQty || 1));

        if (!user || !token || !item.cart_item_id) {
            updateGuestQty(item.product_id, item.size, qty);
            return;
        }

        await fetch(`${API_BASE}/cart/items/${item.cart_item_id}`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ quantity: qty }),
        });

        setCartItems((prev) =>
            prev.map((x) => (x.cart_item_id === item.cart_item_id ? { ...x, quantity: qty } : x))
        );
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
                    Giỏ hàng trống. <div className="buy-now"><button onClick={() => router.push("/")}>Mua ngay</button></div>
                </div>
            ) : (
                <>
                    <div className="cart-list">
                        {cartItems.map((item, idx) => (
                            <div key={makeKey(item, idx)} className="cart-item">
                                <img src={item.image_url} alt={item.name} className="cart-item-img" />

                                <div className="cart-item-info">
                                    <div className="cart-item-name">{item.name}</div>

                                    <div className="cart-item-qty-wrap">
                                        <button className="btn-remove" onClick={() => updateQuantity(item, item.quantity - 1)}>
                                            -
                                        </button>
                                        <span>{item.quantity}</span>
                                        <button className="btn-add" onClick={() => updateQuantity(item, item.quantity + 1)}>
                                            +
                                        </button>
                                    </div>
                                </div>

                                <div className="cart-item-total">{formatPrice(item.price * item.quantity)}</div>

                                <button onClick={() => handleRemove(item)} className="cart-item-remove">
                                    Xoá
                                </button>
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
                            <button className="cart-btn continue-shopping-btn" onClick={handleContinueShopping}>
                                Tiếp Tục Mua Sắm
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div >

    );

    function handleContinueShopping() {
        router.push("/");
    }
}