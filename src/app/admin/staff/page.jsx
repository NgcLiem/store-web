"use client";

import { useEffect, useState } from "react";
import "../admin.css";
import "./staff.css";

export default function AdminStaffPage() {
    const [items, setItems] = useState([]);
    const [q, setQ] = useState("");
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState({ email: "", full_name: "", password: "" });

    const load = async () => {
        setLoading(true);
        const res = await fetch(`/api/staffs?q=${encodeURIComponent(q)}`);
        const text = await res.text(); let data = null; try { data = JSON.parse(text); } catch { }
        setItems(Array.isArray(data) ? data : data?.items || []);
        setLoading(false);
    };
    useEffect(() => { load(); }, []);

    const submitSearch = (e) => { e.preventDefault(); load(); };

    const openCreate = () => { setEditing(null); setForm({ email: "", full_name: "", password: "" }); setModalOpen(true); };
    const openEdit = (s) => { setEditing(s); setForm({ email: s.email || "", full_name: s.full_name || "" }); setModalOpen(true); };

    const save = async (e) => {
        e.preventDefault();
        const payload = { email: form.email.trim(), full_name: form.full_name.trim(), password: form.password.trim(), role: "staff" };
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
                <form onSubmit={submitSearch} className="search-form-row">
                    <input value={q} onChange={(e) => setQ(e.target.value)} className="form-input search-input-narrow" placeholder="Tìm theo email / tên" />
                    <button className="action-btn" type="submit"><i className="fa-solid fa-search" /> Tìm</button>
                </form>

                <div className="table-responsive-wrapper">
                    <table className="staff-table">
                        <thead>
                            <tr className="table-header-row">
                                <th className="table-header-cell text-left">Email</th>
                                <th className="table-header-cell text-left">Họ tên</th>
                                <th className="table-header-cell text-center">Trạng thái</th>
                                <th className="table-header-cell text-center">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? <tr><td colSpan={4} className="table-cell table-cell-center">Đang tải...</td></tr> :
                                items.length === 0 ? <tr><td colSpan={4} className="table-cell table-cell-center">Không có dữ liệu</td></tr> :
                                    items.map(s => (
                                        <tr key={s.id} className="table-body-row">
                                            <td className="table-cell">{s.email}</td>
                                            <td className="table-cell">{s.full_name || "-"}</td>
                                            <td className="table-cell text-center">
                                                <span className={`status-badge ${s.active ? 'status-active' : 'status-inactive'}`}>
                                                    {s.active ? "Đang hoạt động" : "Đã khoá"}
                                                </span>
                                            </td>
                                            <td className="table-cell table-actions-cell">
                                                <button className="action-btn" onClick={() => openEdit(s)}><i className="fa-solid fa-pen" /> Sửa</button>
                                                <button className="action-btn btn-danger" onClick={() => remove(s)}><i className="fa-solid fa-trash" /> Xoá</button>
                                            </td>
                                        </tr>
                                    ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            {modalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content-wrapper">
                        <h3>{editing ? "Sửa nhân viên" : "Thêm nhân viên"}</h3>
                        <form onSubmit={save} className="modal-form">
                            <div className="floating-group">
                                <input type="text" placeholder=" " required value={form.email || ""} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                                <label >Email</label>
                            </div>
                            <div className="floating-group">
                                <input type="text" placeholder=" " required value={form.full_name || ""} onChange={(e) => setForm({ ...form, full_name: e.target.value })} />
                                <label >Họ và Tên</label>
                            </div>
                            <div className="floating-group">
                                <input type="text" placeholder=" " required value={form.password || ""} onChange={(e) => setForm({ ...form, password: e.target.value })} />
                                <label >Mật khẩu</label>
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="action-btn btn-secondary" onClick={() => setModalOpen(false)}>Huỷ</button>
                                <button type="submit" className="action-btn"><i className="fa-solid fa-save" /> Lưu</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}