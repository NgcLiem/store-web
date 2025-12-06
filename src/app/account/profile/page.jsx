"use client";

import { useAuth } from "@/contexts/AuthContexts";
import { useState } from "react";

export default function ProfilePage() {
    const { user, token } = useAuth();
    const [form, setForm] = useState({
        full_name: user?.full_name || "",
        phone: user?.phone || "",
        address: user?.address || "",
    });
    const [saving, setSaving] = useState(false);

    const save = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const res = await fetch(`http://localhost:3001/users/${user?.id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(form),
            });
            const ok = res.ok;
            alert(ok ? "Cập nhật thành công!" : "Cập nhật thất bại!");
        } catch (error) {
            console.error('Update profile error:', error);
            alert("Cập nhật thất bại!");
        } finally {
            setSaving(false);
        }
    };

    return (
        <>
            <div className="customer-header">
                <h1>Hồ sơ cá nhân</h1>
            </div>

            <div className="customer-content">
                <form onSubmit={save} className="profile-form">
                    <label>
                        Họ tên
                        <input className="form-input" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} />
                    </label>
                    <label>
                        Số điện thoại
                        <input className="form-input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                    </label>
                    <label>
                        Địa chỉ
                        <input className="form-input" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
                    </label>

                    <div style={{ display: "flex", gap: 8 }}>
                        <button className="action-btn" type="submit" disabled={saving}>
                            {saving ? "Đang lưu…" : "Lưu thay đổi"}
                        </button>
                        <a className="action-btn" href="/reset-password">Đổi mật khẩu</a>
                    </div>
                </form>
            </div>
        </>
    );
}
