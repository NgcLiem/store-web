// src/app/admin/users/page.jsx
"use client";

import { useEffect, useState } from "react";
import "../admin.css";
import "./users.css";

export default function AdminUsersPage() {
    const [items, setItems] = useState([]);
    const [q, setQ] = useState("");
    const [loading, setLoading] = useState(true);

    const load = async () => {
        setLoading(true);
        const res = await fetch(`/api/users?q=${encodeURIComponent(q)}`);
        const text = await res.text(); let data = null; try { data = JSON.parse(text); } catch { }
        setItems(Array.isArray(data) ? data : data?.items || []);
        setLoading(false);
    };
    useEffect(() => { load(); }, []);

    const submitSearch = (e) => { e.preventDefault(); load(); };

    const toggleActive = async (u) => {
        const next = !u.active;
        if (!confirm(`${next ? "Mở" : "Khoá"} tài khoản ${u.email}?`)) return;
        const res = await fetch(`/api/users/${u.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ active: next }) });
        if (!res.ok) { alert("Cập nhật thất bại"); return; }
        setItems(prev => prev.map(it => it.id === u.id ? { ...it, active: next } : it));
    };

    return (
        <>
            <div className="admin-header">
                <h1>Quản lý Người dùng</h1>
            </div>

            <div className="admin-content">
                <form onSubmit={submitSearch} className="search-form-row">
                    <input
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                        className="form-input search-input-narrow"
                        placeholder="Tìm theo email / tên / SĐT"
                    />
                    <button className="action-btn" type="submit"><i className="fa-solid fa-search" /> </button>
                </form>

                <div className="table-responsive-wrapper">
                    <table className="data-table">
                        <thead>
                            <tr className="table-header-row">
                                <th className="table-header-cell text-left">Email</th>
                                <th className="table-header-cell text-left">Họ tên</th>
                                <th className="table-header-cell text-left">SĐT</th>
                                <th className="table-header-cell text-left">Địa chỉ</th>
                                <th className="table-header-cell text-center">Trạng thái</th>
                                <th className="table-header-cell text-center">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ?
                                <tr><td colSpan={6} className="table-cell table-cell-center">Đang tải...</td></tr> :
                                items.length === 0 ?
                                    <tr><td colSpan={6} className="table-cell table-cell-center">Không có dữ liệu</td></tr> :
                                    items.map(u => (
                                        <tr key={u.id} className="table-body-row">
                                            <td className="table-cell">{u.email}</td>
                                            <td className="table-cell">{u.full_name || "-"}</td>
                                            <td className="table-cell">{u.phone || "-"}</td>
                                            <td className="table-cell">{u.address || "-"}</td>
                                            <td className="table-cell text-center">
                                                <span className={`status-badge ${u.active ? 'status-active' : 'status-inactive'}`}>
                                                    {u.active ? "Đang hoạt động" : "Đã khoá"}
                                                </span>
                                            </td>
                                            <td className="table-cell table-actions-cell">
                                                <button className="action-btn" onClick={() => toggleActive(u)}>
                                                    <i className="fa-solid fa-user-lock" /> {u.active ? "Khoá" : "Mở"}
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                            }
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
}