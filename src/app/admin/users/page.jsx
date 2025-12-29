"use client";

import { useEffect, useState } from "react";
import "../admin.css";
import "./users.css";

export default function AdminUsersPage() {
    const [items, setItems] = useState([]);
    const [u, setU] = useState([]);
    const [loading, setLoading] = useState([]);
    const [confirmUser, setConfirmUser] = useState(null);
    const [statusModal, setStatusModal] = useState(null);

    const load = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users?q=${encodeURIComponent(u)}`);
            const data = await res.json();
            setItems(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Load users error:', error);
            setItems([]);
        }
        setLoading(false);
    };
    useEffect(() => { load(); }, []);

    useEffect(() => {
        if (!statusModal) return;

        const timer = setTimeout(() => {
            setStatusModal(null);
        }, 3000);

        return () => clearTimeout(timer);
    }, [statusModal]);


    const submitSearch = (e) => { e.preventDefault(); load(); };

    const toggleActive = async () => {
        if (!confirmUser) return;

        const u = confirmUser;
        const isActive = u.status === "active";
        const nextStatus = isActive ? "inactive" : "active";

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${u.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: nextStatus }),
            });

            const data = await res.json().catch(() => null);

            if (!res.ok) {
                setStatusModal({
                    type: "error",
                    message: data?.message || "Cập nhật thất bại. Vui lòng thử lại.",
                });
                return;
            }

            setItems((prev) =>
                prev.map((it) =>
                    it.id === u.id ? { ...it, status: nextStatus } : it
                )
            );

            setStatusModal({
                type: "success",
                message:
                    nextStatus === "active"
                        ? "Mở khoá tài khoản thành công."
                        : "Khoá tài khoản thành công.",
            });
        } catch (error) {
            console.error("Update user error:", error);
            setStatusModal({
                type: "error",
                message: "Có lỗi xảy ra khi cập nhật tài khoản.",
            });
        } finally {
            setConfirmUser(null);
        }
    };

    return (
        <>
            <div className="admin-header">
                <h1>Quản lý Người dùng</h1>
            </div>

            <div className="admin-content">
                <form onSubmit={submitSearch} className="search-form-row">
                    <input
                        value={u}
                        onChange={(e) => setU(e.target.value)}
                        className="form-input-admin search-input-narrow"
                        placeholder="Tìm theo email / tên / SĐT"
                    />
                    <button className="action-btn" type="submit"><i className="fa-solid fa-search" /> </button>
                </form>

                <div className="table-responsive-wrapper">
                    <table className="data-table">
                        <thead>
                            <tr className="table-header-row">
                                <th className="table-header-cell text-left">STT</th>
                                <th className="table-header-cell text-left">Email</th>
                                <th className="table-header-cell text-left">Họ tên</th>
                                <th className="table-header-cell text-left">SĐT</th>
                                <th className="table-header-cell text-left">Địa chỉ</th>
                                <th className="table-header-cell text-center">Trạng thái</th>
                                <th className="table-header-cell text-center">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((u) => {
                                const isActive = u.status === "active";

                                return (
                                    <tr key={u.id} className="table-body-row">
                                        <td className="table-cell">{u.id}</td>
                                        <td className="table-cell">{u.email}</td>
                                        <td className="table-cell">{u.full_name}</td>
                                        <td className="table-cell">{u.phone}</td>
                                        <td className="table-cell">{u.address}</td>

                                        <td className="table-cell text-center">
                                            <span
                                                className={`status-badge ${isActive ? "status-active" : "status-inactive"
                                                    }`}
                                            >
                                                {isActive ? "Đang hoạt động" : "Đã khoá"}
                                            </span>
                                        </td>

                                        <td className="table-cell table-actions-cell">
                                            <button
                                                className={`action-btn ${isActive ? "status-open" : "status-close"
                                                    }`}
                                                onClick={() => setConfirmUser(u)}
                                            >
                                                <i className="fa-solid fa-user-lock" />{" "}
                                                {isActive ? "Khoá" : "Mở"}
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                            {confirmUser && (
                                <div className="modal-overlay">
                                    <div className="modal-content-wrapper confirm-modal">
                                        <h3 className="confirm-title">
                                            {confirmUser.active ? "Khoá tài khoản" : "Mở khoá tài khoản"}
                                        </h3>

                                        <p className="confirm-text">
                                            Bạn có chắc muốn {confirmUser.active ? "khoá" : "mở khoá"} tài khoản
                                            <span className="confirm-highlight"> {confirmUser.email} </span>?
                                        </p>

                                        <div className="confirm-actions">
                                            <button
                                                type="button"
                                                className="action-btn btn-secondary"
                                                onClick={() => setConfirmUser(null)}
                                            >
                                                Huỷ
                                            </button>

                                            <button
                                                type="button"
                                                className="action-btn"
                                                onClick={toggleActive}
                                            >
                                                <i className="fa-solid fa-user-lock" /> Xác nhận
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {statusModal && (
                                <div className="modal-overlay">
                                    <div
                                        className={
                                            "modal-content-wrapper status-modal " +
                                            (statusModal.type === "success"
                                                ? "status-modal--success"
                                                : "status-modal--error")
                                        }
                                    >
                                        <h3 className="status-title">
                                            {statusModal.type === "success" ? "Thành công" : "Có lỗi xảy ra"}
                                        </h3>

                                        <p className="status-text">{statusModal.message}</p>

                                        <div className="confirm-actions">
                                            <button
                                                type="button"
                                                className="action-btn btn-secondary"
                                                onClick={() => setStatusModal(null)}
                                            >
                                                Đóng
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}


                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
}