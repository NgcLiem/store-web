"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/contexts/AuthContexts";
import { usePathname, useRouter } from "next/navigation";
import "./admin.css";
import Link from "next/link";
import { useState } from "react";

const EditAdminInfoModal = ({ isOpen, onClose, currentEmail, onSave }) => {

    const [email, setEmail] = useState(currentEmail);
    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(email);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content-wrapper">
                <h3>Sửa thông tin cá nhân</h3>
                <form onSubmit={handleSubmit} className="modal-form">
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

    const [isAdminInfoModalOpen, setIsAdminInfoModalOpen] = useState(false);
    const [adminInfo, setAdminInfo] = useState({
        email: user?.email || "admin@example.com",
        logoUrl: ".././public/images/nike-aj1.png"
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
                    <div className="sidebar-header clickable-header" onClick={() => setIsAdminInfoModalOpen(true)}>
                        <div className="logo-section">
                            {adminInfo.logoUrl ? (
                                <div alt="Admin Logo" className="" />
                            ) : (
                                <div className="logo-placeholder admin-logo-text">
                                    <i className="fa-solid fa-user-gear"></i>
                                </div>
                            )}
                            <h2>👔 QUẢN LÝ</h2>
                            <span className="admin-email">{adminInfo.email}</span>
                        </div>
                    </div>

                    <nav className="sidebar-menu">
                        <Link href="/admin" className={isActive("/admin")}><i className="fa-solid fa-clock"></i> <span>Trang chủ</span></Link>
                        <Link href="/admin/products" className={isActive("/admin/products")}><i className="fa-solid fa-box"></i> <span>Quản lý sản phẩm</span></Link>
                        <Link href="/admin/orders" className={isActive("/admin/orders")}><i className="fa-solid fa-cart-shopping"></i> <span>Quản lý đơn hàng</span></Link>
                        <Link href="/admin/users" className={isActive("/admin/users")}><i className="fa-solid fa-users"></i> <span>Quản lý người dùng</span></Link>
                        <Link href="/admin/staff" className={isActive("/admin/staff")}><i className="fa-solid fa-user-tie"></i> <span>Quản lý nhân viên</span></Link>
                    </nav>

                    <div className="sidebar-footer">
                        <button className="logout-btn" onClick={() => { logout(); router.push("/login"); }}>
                            <i className="fa-solid fa-sign-out"></i> Đăng xuất
                        </button>
                    </div>
                </aside>

                <main className="admin-main">{children}</main>
            </div>

            <EditAdminInfoModal
                isOpen={isAdminInfoModalOpen}
                onClose={() => setIsAdminInfoModalOpen(false)}
                currentEmail={adminInfo.email}
                onSave={handleSaveAdminInfo}
            />
        </ProtectedRoute>
    );
}