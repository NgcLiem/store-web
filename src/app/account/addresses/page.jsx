"use client";

import { useEffect, useState } from "react";
import { useToast } from "@/components/Toast";
import { useAuth } from "@/contexts/AuthContexts";

export default function AddressBookPage() {
    const { user, token } = useAuth();
    const [items, setItems] = useState([]);
    const [form, setForm] = useState({ name: "", phone: "", line: "" });
    const [editing, setEditing] = useState(null);
    const { showToast } = useToast();
    const [loading, setLoading] = useState(true);

    const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

    useEffect(() => {
        if (!token) return;
        (async () => {
            setLoading(true);
            try {
                const res = await fetch(`${API_BASE}/addresses`, {
                    headers: { Authorization: `Bearer ${token}` },
                    cache: "no-store",
                });
                const data = await res.json();
                setItems(Array.isArray(data) ? data : []);
            } catch (e) {
                console.error(e);
                showToast("Không tải được sổ địa chỉ", "error");
            } finally {
                setLoading(false);
            }
        })();
    }, [token]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.name || !form.phone || !form.line) {
            showToast("Vui lòng nhập đầy đủ thông tin địa chỉ", "error");
            return;
        }
        try {
            const method = editing ? "PATCH" : "POST";
            const url = editing
                ? `${API_BASE}/addresses/${editing}`
                : `${API_BASE}/addresses`;

            const res = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    full_name: form.name,
                    phone: form.phone,
                    address_line: form.line,
                    is_default: items.length === 0,
                }),
            });

            if (!res.ok) throw new Error();
            showToast(
                editing ? "Cập nhật địa chỉ thành công" : "Thêm địa chỉ thành công",
                "success",
            );
            // reload danh sách
            const updated = await res.json();
            if (editing) {
                setItems((prev) => prev.map((a) => (a.id === editing ? updated : a)));
            } else {
                setItems((prev) => [updated, ...prev]);
            }

            setForm({ name: "", phone: "", line: "" });
            setEditing(null);
        } catch {
            showToast("Lưu địa chỉ thất bại", "error");
        }
    };


    const startEdit = (addr) => {
        setEditing(addr.id);
        setForm({
            name: addr.name,
            phone: addr.phone,
            line: addr.line,
        });
    };

    const setDefault = async (id) => {
        try {
            const res = await fetch(`${API_BASE}/addresses/${id}/default`, {
                method: "PATCH",
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) throw new Error();
            const updated = await res.json();
            setItems((prev) =>
                prev.map((a) => ({ ...a, is_default: a.id === updated.id ? 1 : 0 })),
            );
            showToast("Đã đặt làm địa chỉ mặc định", "success");
        } catch {
            showToast("Không đặt được địa chỉ mặc định", "error");
        }
    };


    const remove = async (id) => {
        try {
            const res = await fetch(`${API_BASE}/addresses/${id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) throw new Error();
            setItems((prev) => prev.filter((a) => a.id !== id));
            showToast("Đã xoá địa chỉ", "success");
        } catch {
            showToast("Xoá địa chỉ thất bại", "error");
        }
    };


    return (
        <>
            <div className="customer-header">
                <h1>Sổ địa chỉ</h1>
                <p>Lưu và quản lý địa chỉ giao hàng của bạn.</p>
            </div>

            <div className="customer-content" style={{ display: "grid", gap: 16 }}>
                <div className="panel">
                    <h3>{editing ? "Cập nhật địa chỉ" : "Thêm địa chỉ mới"}</h3>
                    <form
                        onSubmit={handleSubmit}
                        className="profile-form"
                        style={{ maxWidth: 600 }}
                    >
                        <label>
                            Họ tên người nhận
                            <input
                                className="form-input-customer"
                                value={form.name}
                                onChange={(e) =>
                                    setForm({ ...form, name: e.target.value })
                                }
                            />
                        </label>
                        <label>
                            Số điện thoại
                            <input
                                className="form-input-customer"
                                value={form.phone}
                                onChange={(e) =>
                                    setForm({ ...form, phone: e.target.value })
                                }
                            />
                        </label>
                        <label>
                            Địa chỉ chi tiết
                            <input
                                className="form-input-customer"
                                placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành phố"
                                value={form.line}
                                onChange={(e) =>
                                    setForm({ ...form, line: e.target.value })
                                }
                            />
                        </label>

                        <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
                            <button type="submit" className="action-btn">
                                {editing ? "Lưu thay đổi" : "Thêm địa chỉ"}
                            </button>
                            {editing && (
                                <button
                                    type="button"
                                    className="action-btn"
                                    onClick={() => {
                                        setEditing(null);
                                        setForm({ name: "", phone: "", line: "" });
                                    }}
                                    style={{
                                        background: "#e5e7eb",
                                        color: "#111827",
                                        borderColor: "#e5e7eb",
                                    }}
                                >
                                    Huỷ
                                </button>
                            )}
                        </div>
                    </form>
                </div>

                <div className="panel">
                    <h3>Danh sách địa chỉ</h3>
                    {items.length === 0 ? (
                        <p style={{ fontSize: 14, color: "#6b7280" }}>
                            Bạn chưa lưu địa chỉ nào.
                        </p>
                    ) : (
                        <div style={{ display: "grid", gap: 10 }}>
                            {items.map((addr) => (
                                <div
                                    key={addr.id}
                                    style={{
                                        border: "1px solid #e5e7eb",
                                        borderRadius: 12,
                                        padding: 12,
                                        display: "flex",
                                        justifyContent: "space-between",
                                        gap: 10,
                                        alignItems: "flex-start",
                                    }}
                                >
                                    <div>
                                        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                                            <strong style={{ fontSize: 14 }}>{addr.name}</strong>
                                            {addr.is_default && (
                                                <span
                                                    style={{
                                                        fontSize: 11,
                                                        padding: "2px 8px",
                                                        borderRadius: 999,
                                                        background: "#ecfdf5",
                                                        color: "#047857",
                                                        textTransform: "uppercase",
                                                        letterSpacing: ".08em",
                                                    }}
                                                >
                                                    Mặc định
                                                </span>
                                            )}
                                        </div>
                                        <div
                                            style={{
                                                marginTop: 4,
                                                fontSize: 13,
                                                color: "#4b5563",
                                            }}
                                        >
                                            <div>{addr.phone}</div>
                                            <div>{addr.line}</div>
                                        </div>
                                    </div>
                                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                                        {!addr.is_default && (
                                            <button
                                                className="action-btn"
                                                type="button"
                                                onClick={() => setDefault(addr.id)}
                                                style={{
                                                    background: "#f9fafb",
                                                    color: "#111827",
                                                    borderColor: "#e5e7eb",
                                                }}
                                            >
                                                Đặt làm mặc định
                                            </button>
                                        )}
                                        <button
                                            className="action-btn"
                                            type="button"
                                            onClick={() => startEdit(addr)}
                                            style={{
                                                background: "#ffffff",
                                                color: "#111827",
                                                borderColor: "#e5e7eb",
                                            }}
                                        >
                                            Sửa
                                        </button>
                                        <button
                                            className="action-btn"
                                            type="button"
                                            onClick={() => remove(addr.id)}
                                            style={{
                                                background: "#fee2e2",
                                                color: "#b91c1c",
                                                borderColor: "#fecaca",
                                            }}
                                        >
                                            Xoá
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
