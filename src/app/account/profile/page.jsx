"use client";

import { useAuth } from "@/contexts/AuthContexts";
import { useState } from "react";
import Link from "next/link";

export default function ProfilePage() {
    const { user, token } = useAuth();
    const [form, setForm] = useState({
        full_name: user?.full_name || "",
        email: user?.email || "",
        phone: user?.phone || "",
        address: user?.address || "",
    });
    const [saving, setSaving] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");

    const save = async (e) => {
        e.preventDefault();
        setSaving(true);
        setSuccessMessage("");
        try {
            const res = await fetch(`http://localhost:3001/users/${user?.id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(form),
            });
            
            if (res.ok) {
                setSuccessMessage("Cập nhật thông tin thành công!");
                setTimeout(() => setSuccessMessage(""), 3000);
            } else {
                alert("Cập nhật thất bại!");
            }
        } catch (error) {
            console.error('Update profile error:', error);
            alert("Lỗi khi cập nhật!");
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
                <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "24px" }}>
                    {/* Profile Form */}
                    <div>
                        <form onSubmit={save} className="profile-form" style={{ background: "#f8f9fa", padding: "24px", borderRadius: "8px" }}>
                            <h3 style={{ marginTop: 0, marginBottom: "20px" }}>Thông tin cá nhân</h3>

                            {successMessage && (
                                <div style={{
                                    padding: "12px",
                                    marginBottom: "16px",
                                    backgroundColor: "#d4edda",
                                    color: "#155724",
                                    borderRadius: "4px",
                                    border: "1px solid #c3e6cb"
                                }}>
                                    ✓ {successMessage}
                                </div>
                            )}

                            <label style={{ display: "block", marginBottom: "16px" }}>
                                <span style={{ display: "block", marginBottom: "8px", fontWeight: "bold" }}>Email <span style={{ color: "red" }}>*</span></span>
                                <input
                                    className="form-input"
                                    type="email"
                                    value={form.email}
                                    disabled
                                    style={{ backgroundColor: "#e9ecef", cursor: "not-allowed" }}
                                />
                                <small style={{ color: "#666" }}>Email không thể thay đổi</small>
                            </label>

                            <label style={{ display: "block", marginBottom: "16px" }}>
                                <span style={{ display: "block", marginBottom: "8px", fontWeight: "bold" }}>Họ tên <span style={{ color: "red" }}>*</span></span>
                                <input
                                    className="form-input"
                                    value={form.full_name}
                                    onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                                    placeholder="Nhập họ tên đầy đủ"
                                    required
                                />
                            </label>

                            <label style={{ display: "block", marginBottom: "16px" }}>
                                <span style={{ display: "block", marginBottom: "8px", fontWeight: "bold" }}>Số điện thoại</span>
                                <input
                                    className="form-input"
                                    type="tel"
                                    value={form.phone}
                                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                                    placeholder="VD: 0912345678"
                                />
                            </label>

                            <label style={{ display: "block", marginBottom: "24px" }}>
                                <span style={{ display: "block", marginBottom: "8px", fontWeight: "bold" }}>Địa chỉ</span>
                                <textarea
                                    className="form-input"
                                    value={form.address}
                                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                                    placeholder="Nhập địa chỉ đầy đủ"
                                    rows={3}
                                    style={{ resize: "vertical" }}
                                />
                            </label>

                            <div style={{ display: "flex", gap: 12 }}>
                                <button
                                    className="action-btn"
                                    type="submit"
                                    disabled={saving}
                                    style={{
                                        backgroundColor: "#0066cc",
                                        color: "white",
                                        padding: "12px 24px",
                                        border: "none",
                                        borderRadius: "4px",
                                        cursor: saving ? "not-allowed" : "pointer",
                                        opacity: saving ? 0.7 : 1,
                                    }}
                                >
                                    {saving ? "Đang lưu…" : "Lưu thay đổi"}
                                </button>
                                <Link
                                    href="/reset-password"
                                    className="action-btn"
                                    style={{
                                        display: "inline-block",
                                        backgroundColor: "#6C757D",
                                        color: "white",
                                        padding: "12px 24px",
                                        borderRadius: "4px",
                                        textDecoration: "none",
                                        textAlign: "center",
                                    }}
                                >
                                    Đổi mật khẩu
                                </Link>
                            </div>
                        </form>
                    </div>

                    {/* Sidebar */}
                    <div>
                        <div style={{ background: "#f8f9fa", padding: "20px", borderRadius: "8px", position: "sticky", top: "20px" }}>
                            <h3 style={{ marginTop: 0, marginBottom: "16px" }}>Tài khoản của tôi</h3>
                            
                            <div style={{ marginBottom: "16px", paddingBottom: "16px", borderBottom: "1px solid #ddd" }}>
                                <p style={{ margin: "0 0 4px 0", color: "#666", fontSize: "14px" }}>Trạng thái:</p>
                                <p style={{ margin: "0", fontWeight: "bold", color: "#28a745" }}>✓ Đang hoạt động</p>
                            </div>

                            <div style={{ marginBottom: "16px", paddingBottom: "16px", borderBottom: "1px solid #ddd" }}>
                                <p style={{ margin: "0 0 4px 0", color: "#666", fontSize: "14px" }}>Loại thành viên:</p>
                                <p style={{ margin: "0", fontWeight: "bold" }}>Khách hàng thường xuyên</p>
                            </div>

                            <div style={{ marginBottom: "24px" }}>
                                <p style={{ margin: "0 0 4px 0", color: "#666", fontSize: "14px" }}>Tham gia từ:</p>
                                <p style={{ margin: "0", fontWeight: "bold" }}>
                                    {user?.created_at ? new Date(user.created_at).toLocaleDateString('vi-VN') : "N/A"}
                                </p>
                            </div>

                            <Link
                                href="/account/orders"
                                style={{
                                    display: "block",
                                    padding: "12px",
                                    textAlign: "center",
                                    backgroundColor: "#0066cc",
                                    color: "white",
                                    borderRadius: "4px",
                                    textDecoration: "none",
                                    fontWeight: "bold",
                                    marginBottom: "8px",
                                }}
                            >
                                Xem lịch sử đơn hàng
                            </Link>

                            <Link
                                href="/account"
                                style={{
                                    display: "block",
                                    padding: "12px",
                                    textAlign: "center",
                                    backgroundColor: "#6C757D",
                                    color: "white",
                                    borderRadius: "4px",
                                    textDecoration: "none",
                                    fontWeight: "bold",
                                }}
                            >
                                Quay lại dashboard
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
