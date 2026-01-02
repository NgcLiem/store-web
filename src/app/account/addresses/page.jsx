"use client";

import { useEffect, useMemo, useState } from "react";
import { useToast } from "@/components/Toast";
import { useAuth } from "@/contexts/AuthContexts";
import "./addresses.css";

export default function AddressBookPage() {
    const { token } = useAuth();
    const { showToast } = useToast();

    const API_BASE = useMemo(
        () => process.env.NEXT_PUBLIC_API_URL,
        []
    );

    const [items, setItems] = useState([]);
    const [form, setForm] = useState({ name: "", phone: "", line: "" });
    const [editing, setEditing] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchList = async (signal) => {
        if (!token) return;
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE}/addresses`, {
                headers: { Authorization: `Bearer ${token}` },
                cache: "no-store",
                signal,
            });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();
            setItems(Array.isArray(data) ? data : []);
        } catch (e) {
            if (e?.name !== "AbortError") {
                console.error(e);
                showToast("Không tải được địa chỉ của bạn", "error");
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!token) return;
        const ac = new AbortController();
        fetchList(ac.signal);
        return () => ac.abort();
    }, [token]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        const name = form.name.trim();
        const phone = form.phone.trim();
        const line = form.line.trim();

        if (!name || !phone || !line) {
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
                    fullName: name,
                    phone,
                    addressLine: line,
                    ...(editing ? {} : { isDefault: items.length === 0 }),
                }),
            });

            if (!res.ok) throw new Error(`HTTP ${res.status}`);

            const updated = await res.json().catch(() => null);

            if (editing && updated) {
                setItems((prev) => prev.map((a) => (a.id === editing ? updated : a)));
            } else if (updated) {
                setItems((prev) => [updated, ...prev]);
            } else {
                // fallback: reload nếu backend không trả object
                await fetchList();
            }

            showToast(editing ? "Cập nhật địa chỉ thành công" : "Thêm địa chỉ thành công", "success");

            setForm({ name: "", phone: "", line: "" });
            setEditing(null);
        } catch (e) {
            console.error(e);
            showToast("Lưu địa chỉ thất bại", "error");
        }
    };

    const startEdit = (addr) => {
        setEditing(addr.id);
        setForm({
            name: addr.name ?? addr.full_name ?? "",
            phone: addr.phone ?? "",
            line: addr.line ?? addr.address_line ?? "",
        });
    };

    const setDefault = async (id) => {
        try {
            const res = await fetch(`${API_BASE}/addresses/${id}/default`, {
                method: "PATCH",
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const updated = await res.json().catch(() => ({ id }));
            setItems((prev) => prev.map((a) => ({ ...a, is_default: a.id === updated.id ? 1 : 0 })));
            showToast("Đã đặt làm địa chỉ mặc định", "success");
        } catch (e) {
            console.error(e);
            showToast("Không đặt được địa chỉ mặc định", "error");
        }
    };

    const remove = async (id) => {
        try {
            const res = await fetch(`${API_BASE}/addresses/${id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            setItems((prev) => prev.filter((a) => a.id !== id));
            showToast("Đã xoá địa chỉ", "success");
        } catch (e) {
            console.error(e);
            showToast("Xoá địa chỉ thất bại", "error");
        }
    };

    return (
        <>
            <div className="customer-header">
                <h1>Địa chỉ của bạn</h1>
                <p>Lưu và quản lý địa chỉ giao hàng của bạn.</p>
            </div>

            <div className="customer-content customerContentGrid">
                <div className="panel">
                    <h3 className="panelTitle">{editing ? "Cập nhật địa chỉ" : "Thêm địa chỉ mới"}</h3>

                    <form onSubmit={handleSubmit} className="profile-form formWrap">
                        <label>
                            Họ tên người nhận
                            <input
                                className="form-input-customer"
                                value={form.name}
                                onChange={(e) => setForm({ ...form, name: e.target.value })}
                            />
                        </label>

                        <label>
                            Số điện thoại
                            <input
                                className="form-input-customer"
                                value={form.phone}
                                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                            />
                        </label>

                        <label>
                            Địa chỉ chi tiết
                            <input
                                className="form-input-customer"
                                placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành phố"
                                value={form.line}
                                onChange={(e) => setForm({ ...form, line: e.target.value })}
                            />
                        </label>

                        <div className="formActions">
                            <button type="submit" className="action-btn actionBtnPrimary">
                                {editing ? "Lưu thay đổi" : "Thêm địa chỉ"}
                            </button>

                            {editing && (
                                <button
                                    type="button"
                                    className="action-btn actionBtnNeutral"
                                    onClick={() => {
                                        setEditing(null);
                                        setForm({ name: "", phone: "", line: "" });
                                    }}
                                >
                                    Huỷ
                                </button>
                            )}
                        </div>
                    </form>
                </div>

                <div className="panel">
                    <h3 className="panelTitle">Danh sách địa chỉ</h3>

                    {loading ? (
                        <p className="emptyHint">Đang tải…</p>
                    ) : items.length === 0 ? (
                        <p className="emptyHint">Bạn chưa lưu địa chỉ nào.</p>
                    ) : (
                        <div className="addressList">
                            {items.map((addr) => (
                                <div key={addr.id} className="addressCard">
                                    <div className="addressMain">
                                        <div className="addressHeader">
                                            <strong className="addressName">
                                                {addr.name ?? addr.full_name ?? "Không tên"}
                                            </strong>

                                            {!!addr.is_default && <span className="badgeDefault">Mặc định</span>}
                                        </div>

                                        <div className="addressMeta">
                                            <div className="addressPhone">{addr.phone}</div>
                                            <div className="addressLine" title={addr.line ?? addr.address_line}>
                                                {addr.line ?? addr.address_line}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="addressActions">
                                        {!addr.is_default && (
                                            <button
                                                className="action-btn actionBtnSoft"
                                                type="button"
                                                onClick={() => setDefault(addr.id)}
                                            >
                                                Đặt làm mặc định
                                            </button>
                                        )}

                                        <button
                                            className="action-btn actionBtnOutline"
                                            type="button"
                                            onClick={() => startEdit(addr)}
                                        >
                                            Sửa
                                        </button>

                                        <button
                                            className="action-btn actionBtnDanger"
                                            type="button"
                                            onClick={() => remove(addr.id)}
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
