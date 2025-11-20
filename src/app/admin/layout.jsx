// src/app/admin/layout.jsx
"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/contexts/AuthContexts";
import { usePathname, useRouter } from "next/navigation";
import "./admin.css";
import Link from "next/link";
// 💡 BỔ SUNG: Import useState để quản lý trạng thái
import { useState } from "react";

// =========================================================
// 💡 COMPONENT MỚI: Modal chỉnh sửa thông tin Admin
// =========================================================
const EditAdminInfoModal = ({ isOpen, onClose, currentEmail, onSave }) => {
    const [email, setEmail] = useState(currentEmail);

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(email); // Lưu email mới
        onClose();
    };

    if (!isOpen) return null;

    // Dùng các class CSS chung cho Modal và Form
    return (
        <div className="modal-overlay">
            <div className="modal-content-wrapper">
                <h3>Sửa thông tin cá nhân</h3>
                <form onSubmit={handleSubmit} className="modal-form">
                    {/* Phần input để chỉnh sửa Email */}
                    <div className="floating-group">
                        <input
                            type="email"
                            placeholder=" "
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                        <label>Email Admin</label>
                    </div>

                    {/* Bạn có thể thêm input cho Logo/Avatar URL nếu cần */}
                    {/* <div className="floating-group">...<label>URL Logo</label></div> */}

                    <div className="modal-actions">
                        <button type="button" className="action-btn btn-secondary" onClick={onClose}>Huỷ</button>
                        <button type="submit" className="action-btn"><i className="fa-solid fa-save"></i> Lưu</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default function AdminLayout({ children }) {
    const { user, logout } = useAuth();
    const pathname = usePathname();
    const router = useRouter();

    // 💡 STATE MỚI: Quản lý trạng thái Modal và Thông tin Admin
    const [isAdminInfoModalOpen, setIsAdminInfoModalOpen] = useState(false);
    const [adminInfo, setAdminInfo] = useState({
        // Lấy email từ user context, nếu không có thì dùng mặc định
        email: user?.email || "admin@example.com",
        // Đường dẫn logo cá nhân của bạn. Dùng một URL ảnh hoặc để trống nếu muốn dùng chữ/icon.
        logoUrl: "./public/images/nike-aj1.png"
    });

    const handleSaveAdminInfo = (newEmail) => {
        setAdminInfo(prev => ({ ...prev, email: newEmail }));
        console.log(`Email Admin đã được cập nhật thành: ${newEmail}`);
    };

    const isActive = (href) => (pathname === href ? "menu-item active" : "menu-item");

    return (
        <ProtectedRoute allowedRoles={["admin"]}>
            <div className="admin-container">
                <aside className="admin-sidebar">

                    {/* 💡 THAY ĐỔI: Thêm class clickable-header và onClick để mở Modal */}
                    <div className="sidebar-header clickable-header" onClick={() => setIsAdminInfoModalOpen(true)}>
                        <div className="logo-section">
                            {/* Hiển thị logo/avatar cá nhân */}
                            {adminInfo.logoUrl ? (
                                <img src={adminInfo.logoUrl} alt="Admin Logo" className="admin-logo-img" />
                            ) : (
                                // Hiển thị chữ/icon nếu không có logo
                                <div className="logo-placeholder admin-logo-text">
                                    <i className="fa-solid fa-user-gear"></i>
                                </div>
                            )}
                            {/* Hiển thị email Admin */}
                            <span className="admin-email">{adminInfo.email}</span>
                        </div>
                    </div>

                    <nav className="sidebar-menu">
                        <Link href="/admin" className={isActive("/admin")}><i className="fa-solid fa-clock"></i> <span>Trang chủ</span></Link>
                        <Link href="/admin/products" className={isActive("/admin/products")}><i className="fa-solid fa-box"></i> <span>Quản lý sản phẩm</span></Link>
                        <Link href="/admin/orders" className={isActive("/admin/orders")}><i className="fa-solid fa-cart-shopping"></i> <span>Quản lý đơn hàng</span></Link>
                        <Link href="/admin/users" className={isActive("/admin/users")}><i className="fa-solid fa-users"></i> <span>Quản lý người dùng</span></Link>
                        <Link href="/admin/staff" className={isActive("/admin/staff")}><i className="fa-solid fa-user-tie"></i> <span>Quản lý nhân viên</span></Link>
                        <Link href="/admin/statistics" className={isActive("/admin/statistics")}><i className="fa-solid fa-chart-line"></i> <span>Thống kê</span></Link>
                    </nav>

                    <div className="sidebar-footer">
                        <button className="logout-btn" onClick={() => { logout(); router.push("/login"); }}>
                            <i className="fa-solid fa-sign-out"></i> Đăng xuất
                        </button>
                    </div>
                </aside>

                <main className="admin-main">{children}</main>
            </div>

            {/* 💡 THÊM: Component Modal chỉnh sửa */}
            <EditAdminInfoModal
                isOpen={isAdminInfoModalOpen}
                onClose={() => setIsAdminInfoModalOpen(false)}
                currentEmail={adminInfo.email}
                onSave={handleSaveAdminInfo}
            />
        </ProtectedRoute>
    );
}