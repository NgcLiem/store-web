"use client";

import { useAuth } from "@/contexts/AuthContexts";
import { useState } from "react";
import { useToast } from "@/components/Toast";

export default function ProfilePage() {
    const { user, token } = useAuth();
    const { showToast } = useToast();

    const [form, setForm] = useState({
        full_name: user?.full_name || "",
        phone: user?.phone || "",
        address: user?.address || "",
    });
    const [saving, setSaving] = useState(false);

    const save = async (e) => {
        e.preventDefault();
        if (!user?.id) return;

        setSaving(true);
        try {
            const res = await fetch(`http://localhost:3001/users/${user.id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(form),
            });

            if (res.ok) {
                showToast("Cập nhật hồ sơ thành công!", "success");
            } else {
                showToast("Cập nhật hồ sơ thất bại!", "error");
            }
        } catch (error) {
            console.error("Update profile error:", error);
            showToast("Cập nhật hồ sơ thất bại!", "error");
        } finally {
            setSaving(false);
        }
    };

    return (
        <>
            <div className="customer-header">
                <h1>Hồ sơ cá nhân</h1>
                <p>Cập nhật thông tin liên hệ và địa chỉ giao hàng của bạn</p>
            </div>

            <div className="customer-content">
                <form onSubmit={save} className="profile-form">
                    <label>
                        Họ tên
                        <input
                            className="form-input-customer"
                            value={form.full_name}
                            onChange={(e) =>
                                setForm({ ...form, full_name: e.target.value })
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
                        Địa chỉ
                        <input
                            className="form-input-customer"
                            value={form.address}
                            onChange={(e) =>
                                setForm({ ...form, address: e.target.value })
                            }
                        />
                    </label>

                    <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
                        <button className="action-btn" type="submit" disabled={saving}>
                            {saving ? "Đang lưu…" : "Lưu thay đổi"}
                        </button>
                        <a className="action-btn" href="/reset-password">
                            Đổi mật khẩu
                        </a>
                    </div>
                </form>
            </div>
        </>
    );
}
