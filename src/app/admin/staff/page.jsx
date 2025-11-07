// src/app/admin/staff/page.jsx
"use client";

import { useEffect, useState } from "react";
import "../admin.css";

export default function AdminStaffPage() {
    const [items, setItems] = useState([]);
    const [q, setQ] = useState("");
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState({ email: "", full_name: "" });

    const load = async () => {
        setLoading(true);
        const res = await fetch(`/api/staffs?q=${encodeURIComponent(q)}`);
        const text = await res.text(); let data = null; try { data = JSON.parse(text); } catch { }
        setItems(Array.isArray(data) ? data : data?.items || []);
        setLoading(false);
    };
    useEffect(() => { load(); }, []);

    const submitSearch = (e) => { e.preventDefault(); load(); };

    const openCreate = () => { setEditing(null); setForm({ email: "", full_name: "" }); setModalOpen(true); };
    const openEdit = (s) => { setEditing(s); setForm({ email: s.email || "", full_name: s.full_name || "" }); setModalOpen(true); };

    const save = async (e) => {
        e.preventDefault();
        const payload = { email: form.email.trim(), full_name: form.full_name.trim(), role: "staff" };
        const url = editing ? `/api/staffs/${editing.id}` : `/api/staffs`;
        const method = editing ? "PUT" : "POST";
        const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
        if (!res.ok) { alert("Lưu thất bại"); return; }
        if (editing) setItems(prev => prev.map(it => it.id === editing.id ? { ...it, ...payload } : it));
        else setItems(prev => [{ id: Date.now(), active: true, ...payload }, ...prev]);
        setModalOpen(false);
    };

    const remove = async (s) => {
        if (!confirm(`Xoá nhân viên ${s.email}?`)) return;
        const res = await fetch(`/api/staffs/${s.id}`, { method: "DELETE" });
        if (!res.ok) { alert("Xoá thất bại"); return; }
        setItems(prev => prev.filter(it => it.id !== s.id));
    };

    return (
        <>
            <div className="admin-header">
                <h1>Quản lý Nhân viên</h1>
                <div className="quick-actions">
                    <button className="action-btn" onClick={openCreate}><i className="fa-solid fa-user-plus" /> Thêm nhân viên</button>
                </div>
            </div>

            <div className="admin-content">
                <form onSubmit={submitSearch} style={{ display: "flex", gap: 12, marginBottom: 16 }}>
                    <input value={q} onChange={(e) => setQ(e.target.value)} className="form-input" placeholder="Tìm theo email / tên" style={{ maxWidth: 360 }} />
                    <button className="action-btn" type="submit"><i className="fa-solid fa-search" /> Tìm</button>
                </form>

                <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                        <thead>
                            <tr style={{ background: "#f1f2f6" }}>
                                <th style={{ padding: 12, textAlign: "left" }}>Email</th>
                                <th style={{ padding: 12, textAlign: "left" }}>Họ tên</th>
                                <th style={{ padding: 12, textAlign: "center" }}>Trạng thái</th>
                                <th style={{ padding: 12, textAlign: "center" }}>Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? <tr><td colSpan={4} style={{ padding: 20, textAlign: "center" }}>Đang tải...</td></tr> :
                                items.length === 0 ? <tr><td colSpan={4} style={{ padding: 20, textAlign: "center" }}>Không có dữ liệu</td></tr> :
                                    items.map(s => (
                                        <tr key={s.id} style={{ borderBottom: "1px solid #eee" }}>
                                            <td style={{ padding: 12 }}>{s.email}</td>
                                            <td style={{ padding: 12 }}>{s.full_name || "-"}</td>
                                            <td style={{ padding: 12, textAlign: "center" }}>
                                                <span style={{ padding: "4px 8px", borderRadius: 6, color: "#fff", background: s.active ? "#27ae60" : "#7f8c8d", fontSize: 12 }}>
                                                    {s.active ? "Đang hoạt động" : "Đã khoá"}
                                                </span>
                                            </td>
                                            <td style={{ padding: 12, textAlign: "center", display: "flex", gap: 8, justifyContent: "center" }}>
                                                <button className="action-btn" onClick={() => openEdit(s)}><i className="fa-solid fa-pen" /> Sửa</button>
                                                <button className="action-btn" onClick={() => remove(s)}><i className="fa-solid fa-trash" /> Xoá</button>
                                            </td>
                                        </tr>
                                    ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            {modalOpen && (
                <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.35)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <div style={{ background: "#fff", padding: 20, borderRadius: 12, width: 520, maxWidth: "95%" }}>
                        <h3>{editing ? "Sửa nhân viên" : "Thêm nhân viên"}</h3>
                        <form onSubmit={save} style={{ display: "grid", gap: 10, marginTop: 10 }}>
                            <input className="form-input" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                            <input className="form-input" placeholder="Họ tên" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} />
                            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                                <button type="button" className="action-btn" onClick={() => setModalOpen(false)}>Huỷ</button>
                                <button type="submit" className="action-btn"><i className="fa-solid fa-save" /> Lưu</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
