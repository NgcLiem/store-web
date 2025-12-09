"use client";

import { useAuth } from "@/contexts/AuthContexts";

export default function AccountDashboardPage() {
    const { user } = useAuth();

    return (
        <>
            <div className="customer-header">
                <h1>Xin chào, {user?.full_name || user?.email || "bạn"}</h1>
                <p>Quản lý thông tin tài khoản, đơn hàng và ưu đãi của bạn.</p>
            </div>

            <div className="customer-stats">
                <div className="stat-card">
                    <i className="fa-solid fa-receipt" />
                    <div>
                        <h3>12</h3>
                        <p>Đơn hàng đã mua</p>
                    </div>
                </div>

                <div className="stat-card">
                    <i className="fa-solid fa-box" />
                    <div>
                        <h3>2</h3>
                        <p>Đơn đang giao</p>
                    </div>
                </div>

                <div className="stat-card">
                    <i className="fa-solid fa-ticket" />
                    <div>
                        <h3>3</h3>
                        <p>Voucher khả dụng</p>
                    </div>
                </div>

                <div className="stat-card">
                    <i className="fa-solid fa-heart" />
                    <div>
                        <h3>15</h3>
                        <p>Sản phẩm yêu thích</p>
                    </div>
                </div>
            </div>

            <div className="customer-content">
                <div className="panel">
                    <h3>Hành động nhanh</h3>
                    <div className="quick-actions">
                        <a href="/account/orders" className="action-btn-customer">
                            Xem đơn hàng gần đây
                        </a>
                        <a href="/account/profile" className="action-btn-customer">
                            Cập nhật hồ sơ
                        </a>
                        <a href="/account/addresses" className="action-btn-customer">
                            Quản lý địa chỉ
                        </a>
                        <a href="/account/vouchers" className="action-btn-customer">
                            Xem voucher
                        </a>
                    </div>
                </div>
            </div>
        </>
    );
}
