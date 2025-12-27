"use client";

import "./profile.css"; // 🆕 file CSS riêng
import { useAuth } from "@/contexts/AuthContexts";
import { useToast } from "@/components/Toast"; // 🆕 dùng toast
import { useState } from "react";
import Link from "next/link";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export default function ProfilePage() {
    const { user, token } = useAuth();
    const { showToast } = useToast(); // 🆕

    const [form, setForm] = useState({
        full_name: user?.full_name || "",
        email: user?.email || "",
        phone: user?.phone || "",
        address: user?.address || "",
    });
    const [saving, setSaving] = useState(false);

    const save = async (e) => {
        e.preventDefault();
        setSaving(true);

        try {
            const res = await fetch(`${API_BASE}/users/${user?.id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(form),
            });

            if (!res.ok) {
                showToast("Cập nhật thất bại!", "error");
                return;
            }

            showToast("Cập nhật thông tin thành công!", "success");
        } catch (err) {
            console.error(err);
            showToast("Có lỗi xảy ra khi cập nhật", "error");
        } finally {
            setSaving(false);
        }
    };

    return (
        <>
            <div className="customer-header">
                <h1>Hồ sơ cá nhân</h1>
                <p>Quản lý thông tin tài khoản của bạn</p>
            </div>

            <div className="customer-content">
                <div className="profile-grid">
                    {/* Form */}
                    <form onSubmit={save} className="profile-card">
                        <h3>Thông tin cá nhân</h3>

                        <label>
                            <span>Email <span className="required">*</span></span>
                            <input
                                className="form-input-customer"
                                type="email"
                                value={form.email}
                                disabled
                            />
                            <small className="muted">Email không thể thay đổi</small>
                        </label>

                        <label>
                            <span>Họ tên <span className="required">*</span></span>
                            <input
                                className="form-input-customer"
                                value={form.full_name}
                                onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                                required
                            />
                        </label>

                        <label>
                            <span>Số điện thoại</span>
                            <input
                                className="form-input-customer"
                                type="tel"
                                value={form.phone}
                                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                            />
                        </label>

                        <label>
                            <span>Địa chỉ</span>
                            <textarea
                                className="form-input-customer"
                                rows={3}
                                value={form.address}
                                onChange={(e) => setForm({ ...form, address: e.target.value })}
                            />
                        </label>

                        <div className="profile-actions">
                            <button className="btn-primary" type="submit" disabled={saving}>
                                {saving ? "Đang lưu…" : "Lưu thay đổi"}
                            </button>

                            <Link href="/reset-password" className="btn-primary-profile">
                                Đổi mật khẩu
                            </Link>
                        </div>
                    </form>

                    {/* Sidebar Info */}
                    <aside className="profile-side-card">
                        <h3>Tài khoản của tôi</h3>

                        <div className="profile-side-block">
                            <p className="label">Trạng thái:</p>
                            <p className="value-active">✓ Đang hoạt động</p>
                        </div>

                        <div className="profile-side-block">
                            <p className="label">Loại thành viên:</p>
                            <p className="value">Khách hàng thường xuyên</p>
                        </div>

                        <div className="profile-side-block">
                            <p className="label">Tham gia từ:</p>
                            <p className="value">
                                {user?.created_at
                                    ? new Date(user.created_at).toLocaleDateString("vi-VN")
                                    : "N/A"}
                            </p>
                        </div>

                        <Link href="/account/orders" className="btn-primary-history full">
                            Xem lịch sử đơn hàng
                        </Link>

                        <Link href="/account" className="btn-secondary full">
                            Quay lại dashboard
                        </Link>
                    </aside>
                </div>
            </div>
        </>
    );
}
