"use client";

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

function isBrowser() {
    return typeof window !== "undefined" && typeof localStorage !== "undefined";
}

export function getLocalCart() {
    if (!isBrowser()) return [];
    try {
        const raw = localStorage.getItem("localCart");
        return raw ? JSON.parse(raw) : [];
    } catch (e) {
        console.warn("getLocalCart parse error", e);
        return [];
    }
}

export function saveLocalCart(items) {
    if (!isBrowser()) return;
    try {
        localStorage.setItem("localCart", JSON.stringify(items));
    } catch (e) {
        console.warn("saveLocalCart error", e);
    }
}

export function clearLocalCart() {
    if (!isBrowser()) return;
    try {
        localStorage.removeItem("localCart");
    } catch (e) {
        console.warn("clearLocalCart error", e);
    }
}

export function addItemToLocalCart({ product_id, quantity = 1, size = null }) {
    const pid = Number(product_id);
    const qty = Math.max(1, Number(quantity || 1));
    const sz = size ?? null;

    const cart = getLocalCart();

    const idx = cart.findIndex(
        (it) => Number(it.product_id) === pid && (it.size ?? null) === sz
    );

    if (idx >= 0) {
        cart[idx] = { ...cart[idx], quantity: Number(cart[idx].quantity || 0) + qty };
    } else {
        cart.push({ product_id: pid, quantity: qty, size: sz });
    }

    saveLocalCart(cart);
}


export async function mergeLocalCart(token) {
    if (!isBrowser()) return { ok: true, merged: 0 };

    const items = getLocalCart();
    if (!items?.length) return { ok: true, merged: 0 };

    let merged = 0;

    for (const it of items) {
        try {
            await fetch(`${API_BASE}/cart/items`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: JSON.stringify({
                    product_id: it.product_id,
                    quantity: it.quantity,
                    size: it.size ?? null,
                }),
            });
            merged++;
        } catch (e) {
            console.warn("mergeLocalCart item error", e);
        }
    }

    clearLocalCart();
    return { ok: true, merged };
}
