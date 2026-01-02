"use client";

import "./profile.css";
import { useAuth } from "@/contexts/AuthContexts";
import { useToast } from "@/components/Toast";
import { useState, useEffect } from "react";
import Link from "next/link";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3003";

export default function ProfilePage() {
    const { user, token } = useAuth();
    const { showToast } = useToast();

    const [form, setForm] = useState({
        full_name: user?.full_name || "",
        email: user?.email || "",
        phone: user?.phone || "",
        address: user?.address || "",
    });

    // Cập nhật form khi user data thay đổi
    useEffect(() => {
        if (user) {
            setForm({
                full_name: user.full_name || "",
                email: user.email || "",
                phone: user.phone || "",
                address: user.address || "",
            });
        }
    }, [user]);

    const [saving, setSaving] = useState(false);

    const [showChangePassword, setShowChangePassword] = useState(false);
    const [passwordForm, setPasswordForm] = useState({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
    });
    const [changingPassword, setChangingPassword] = useState(false);

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

    const handleChangePassword = async (e) => {
        e.preventDefault();

        const { oldPassword, newPassword, confirmPassword } = passwordForm;

        if (!oldPassword || !newPassword || !confirmPassword) {
            showToast("Vui lòng nhập đầy đủ thông tin", "error");
            return;
        }

        if (newPassword !== confirmPassword) {
            showToast("Mật khẩu mới không khớp", "error");
            return;
        }

        if (newPassword.length < 6) {
            showToast("Mật khẩu mới phải có ít nhất 6 ký tự", "error");
            return;
        }

        setChangingPassword(true);

        try {
            const res = await fetch(`${API_BASE}/auth/change-password`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ oldPassword, newPassword }),
            });

            const data = await res.json().catch(() => null);

            if (!res.ok) {
                showToast(data?.message || "Đổi mật khẩu thất bại", "error");
                return;
            }

            showToast("Đổi mật khẩu thành công!", "success");
            setPasswordForm({ oldPassword: "", newPassword: "", confirmPassword: "" });
            setShowChangePassword(false);
        } catch (err) {
            console.error(err);
            showToast("Có lỗi xảy ra khi đổi mật khẩu", "error");
        } finally {
            setChangingPassword(false);
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

                        

                        <div className="profile-actions">
                            <button className="btn-primary" type="submit" disabled={saving}>
                                {saving ? "Đang lưu…" : "Lưu thay đổi"}
                            </button>

                            <button 
                                type="button" 
                                className="btn-primary-profile"
                                onClick={() => setShowChangePassword(true)}
                            >
                                Đổi mật khẩu
                            </button>
                        </div>
                    </form>

                    {/* Sidebar Info */}
                    <aside className="profile-side-card">
                        <h3>Tài khoản của tôi</h3>

                        <div className="profile-side-block">
                            <p className="label">Họ tên:</p>
                            <p className="value">{form.full_name || "Chưa cập nhật"}</p>
                        </div>

                        <div className="profile-side-block">
                            <p className="label">Số điện thoại:</p>
                            <p className="value">{form.phone || "Chưa cập nhật"}</p>
                        </div>

                        <div className="profile-side-block">
                            <p className="label">Trạng thái:</p>
                            <p className="value-active">✓ Đang hoạt động</p>
                        </div>

                        <div className="profile-side-block">
                            <p className="label">Loại thành viên:</p>
                            <p className="value">Khách hàng thường xuyên</p>
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

            {/* Change Password Modal */}
            {showChangePassword && (
                <div className="profile-modal-backdrop" onClick={() => setShowChangePassword(false)}>
                    <div className="profile-modal" onClick={(e) => e.stopPropagation()}>
                        <h3>Đổi mật khẩu</h3>

                        <form onSubmit={handleChangePassword}>
                            <label>
                                <span>Mật khẩu hiện tại <span className="required">*</span></span>
                                <input
                                    className="form-input-customer"
                                    type="password"
                                    value={passwordForm.oldPassword}
                                    onChange={(e) => setPasswordForm({ ...passwordForm, oldPassword: e.target.value })}
                                    required
                                    placeholder="Nhập mật khẩu hiện tại"
                                />
                            </label>

                            <label>
                                <span>Mật khẩu mới <span className="required">*</span></span>
                                <input
                                    className="form-input-customer"
                                    type="password"
                                    value={passwordForm.newPassword}
                                    onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                                    required
                                    placeholder="Nhập mật khẩu mới"
                                />
                            </label>

                            <label>
                                <span>Xác nhận mật khẩu mới <span className="required">*</span></span>
                                <input
                                    className="form-input-customer"
                                    type="password"
                                    value={passwordForm.confirmPassword}
                                    onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                                    required
                                    placeholder="Nhập lại mật khẩu mới"
                                />
                            </label>

                            <div className="profile-modal-actions">
                                <button
                                    type="button"
                                    className="btn-outline"
                                    onClick={() => setShowChangePassword(false)}
                                    disabled={changingPassword}
                                >
                                    Hủy
                                </button>
                                <button
                                    type="submit"
                                    className="btn-primary"
                                    disabled={changingPassword}
                                >
                                    {changingPassword ? "Đang đổi..." : "Đổi mật khẩu"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
