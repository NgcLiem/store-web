"use client";

export function getLocalCart() {
    try {
        const raw = localStorage.getItem("localCart");
        return raw ? JSON.parse(raw) : [];
    } catch (e) {
        console.warn('getLocalCart parse error', e);
        return [];
    }
}

export function saveLocalCart(items) {
    try {
        localStorage.setItem("localCart", JSON.stringify(items));
    } catch (e) {
        console.warn('saveLocalCart error', e);
    }
}

export function clearLocalCart() {
    try {
        localStorage.removeItem("localCart");
    } catch (e) {
        console.warn('clearLocalCart error', e);
    }
}

export function addItemToLocalCart({ product_id, quantity = 1, size = null }) {
    const items = getLocalCart();

    // merge by product_id + size
    const idx = items.findIndex(it => it.product_id === product_id && (it.size || null) === (size || null));
    if (idx >= 0) {
        items[idx].quantity = (items[idx].quantity || 0) + quantity;
    } else {
        items.push({ product_id, quantity, size });
    }

    saveLocalCart(items);
}

export async function mergeLocalCart(userId, token) {
    const items = getLocalCart();
    if (!items || !items.length) return { ok: true, merged: 0 };

    let merged = 0;
    for (const it of items) {
        try {
            await fetch('/api/cart', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: JSON.stringify({ user_id: userId, product_id: it.product_id, quantity: it.quantity, size: it.size }),
            });
            merged++;
        } catch (e) {
            // continue merging others
            console.warn('mergeLocalCart item error', e);
        }
    }

    clearLocalCart();
    return { ok: true, merged };
}
