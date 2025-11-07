"use client";

import { useEffect, useState } from "react";
import "../admin.css";

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
                <form onSubmit={submitSearch} style={{ display: "flex", gap: 12, marginBottom: 16 }}>
                    <input value={q} onChange={(e) => setQ(e.target.value)} className="form-input" placeholder="Tìm theo email / tên / SĐT" style={{ maxWidth: 360 }} />
                    <button className="action-btn" type="submit"><i className="fa-solid fa-search" /> Tìm</button>
                </form>

                <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                        <thead>
                            <tr style={{ background: "#f1f2f6" }}>
                                <th style={{ padding: 12, textAlign: "left" }}>Email</th>
                                <th style={{ padding: 12, textAlign: "left" }}>Họ tên</th>
                                <th style={{ padding: 12, textAlign: "left" }}>SĐT</th>
                                <th style={{ padding: 12, textAlign: "left" }}>Địa chỉ</th>
                                <th style={{ padding: 12, textAlign: "center" }}>Trạng thái</th>
                                <th style={{ padding: 12, textAlign: "center" }}>Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? <tr><td colSpan={6} style={{ padding: 20, textAlign: "center" }}>Đang tải...</td></tr> :
                                items.length === 0 ? <tr><td colSpan={6} style={{ padding: 20, textAlign: "center" }}>Không có dữ liệu</td></tr> :
                                    items.map(u => (
                                        <tr key={u.id} style={{ borderBottom: "1px solid #eee" }}>
                                            <td style={{ padding: 12 }}>{u.email}</td>
                                            <td style={{ padding: 12 }}>{u.full_name || "-"}</td>
                                            <td style={{ padding: 12 }}>{u.phone || "-"}</td>
                                            <td style={{ padding: 12 }}>{u.address || "-"}</td>
                                            <td style={{ padding: 12, textAlign: "center" }}>
                                                <span style={{ padding: "4px 8px", borderRadius: 6, color: "#fff", background: u.active ? "#27ae60" : "#7f8c8d", fontSize: 12 }}>
                                                    {u.active ? "Đang hoạt động" : "Đã khoá"}
                                                </span>
                                            </td>
                                            <td style={{ padding: 12, textAlign: "center" }}>
                                                <button className="action-btn" onClick={() => toggleActive(u)}>
                                                    <i className="fa-solid fa-user-lock" /> {u.active ? "Khoá" : "Mở"}
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
}
