"use client";

import { useEffect, useState } from "react";
import "../admin.css";

export default function AdminProductsPage() {
    const [items, setItems] = useState([]);
    const [q, setQ] = useState("");
    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState({ product_code: "", name: "", price: "", stock: "", category_id: "" });
    const [loading, setLoading] = useState(true);

    const load = async () => {
        setLoading(true);
        const res = await fetch(`/api/products?q=${encodeURIComponent(q)}`);
        const text = await res.text(); let data = null;
        try { data = JSON.parse(text); } catch { }
        setItems(Array.isArray(data) ? data : data?.items || []);
        setLoading(false);
    };

    useEffect(() => { load(); }, []); // lần đầu

    const submitSearch = (e) => { e.preventDefault(); load(); };

    const openCreate = () => { setEditing(null); setForm({ product_code: "", name: "", price: "", stock: "", category_id: "" }); setModalOpen(true); };
    const openEdit = (p) => { setEditing(p); setForm({ product_code: p.product_code || "", name: p.name || "", price: p.price || "", stock: p.stock || "", category_id: p.category_id || "" }); setModalOpen(true); };

    const save = async (e) => {
        e.preventDefault();
        const payload = {
            product_code: form.product_code?.trim() || null,
            name: form.name?.trim(),
            price: Number(form.price || 0),
            stock: Number(form.stock || 0),
            category_id: form.category_id ? Number(form.category_id) : null,
        };
        const url = editing ? `/api/products/${editing.id}` : `/api/products`;
        const method = editing ? "PUT" : "POST";
        const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
        const data = await res.json().catch(() => null);
        if (!res.ok) { alert(data?.message || "Lưu thất bại"); return; }
        if (editing) setItems(prev => prev.map(it => it.id === editing.id ? { ...it, ...payload } : it));
        else setItems(prev => [data?.item || { id: Date.now(), ...payload }, ...prev]);
        setModalOpen(false);
    };

    const remove = async (p) => {
        if (!confirm(`Xoá sản phẩm "${p.name}"?`)) return;
        const res = await fetch(`/api/products/${p.id}`, { method: "DELETE" });
        if (!res.ok) { alert("Xoá thất bại"); return; }
        setItems(prev => prev.filter(it => it.id !== p.id));
    };

    return (
        <>
            <div className="admin-header">
                <h1>Quản lý Sản phẩm</h1>
                <div className="quick-actions">
                    <button className="action-btn" onClick={openCreate}><i className="fa-solid fa-plus" /> Thêm sản phẩm</button>
                </div>
            </div>

            <div className="admin-content">
                <form onSubmit={submitSearch} style={{ display: "flex", gap: 12, marginBottom: 16 }}>
                    <input value={q} onChange={(e) => setQ(e.target.value)} className="form-input" placeholder="Tìm tên / mã SP" style={{ maxWidth: 360 }} />
                    <button className="action-btn" type="submit"><i className="fa-solid fa-search" /> Tìm</button>
                </form>

                <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                        <thead>
                            <tr style={{ background: "#f1f2f6" }}>
                                <th style={{ padding: 12, textAlign: "left" }}>Mã</th>
                                <th style={{ padding: 12, textAlign: "left" }}>Tên</th>
                                <th style={{ padding: 12, textAlign: "right" }}>Giá</th>
                                <th style={{ padding: 12, textAlign: "right" }}>Tồn kho</th>
                                <th style={{ padding: 12 }}>Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? <tr><td colSpan={5} style={{ padding: 20, textAlign: "center" }}>Đang tải...</td></tr> :
                                items.length === 0 ? <tr><td colSpan={5} style={{ padding: 20, textAlign: "center" }}>Không có dữ liệu</td></tr> :
                                    items.map(p => (
                                        <tr key={p.id} style={{ borderBottom: "1px solid #eee" }}>
                                            <td style={{ padding: 12 }}>{p.product_code || `#${p.id}`}</td>
                                            <td style={{ padding: 12 }}>{p.name}</td>
                                            <td style={{ padding: 12, textAlign: "right" }}>{Number(p.price || 0).toLocaleString()}₫</td>
                                            <td style={{ padding: 12, textAlign: "right" }}>{p.stock ?? 0}</td>
                                            <td style={{ padding: 12, display: "flex", gap: 8, justifyContent: "center" }}>
                                                <button className="action-btn" onClick={() => openEdit(p)}><i className="fa-solid fa-pen" /> Sửa</button>
                                                <button className="action-btn" onClick={() => remove(p)}><i className="fa-solid fa-trash" /> Xoá</button>
                                            </td>
                                        </tr>
                                    ))
                            }
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            {modalOpen && (
                <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.35)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <div style={{ background: "#fff", padding: 20, borderRadius: 12, width: 520, maxWidth: "95%" }}>
                        <h3>{editing ? "Sửa sản phẩm" : "Thêm sản phẩm"}</h3>
                        <form onSubmit={save} style={{ display: "grid", gap: 10, marginTop: 10 }}>
                            <input className="form-input" placeholder="Mã SP" value={form.product_code} onChange={(e) => setForm({ ...form, product_code: e.target.value })} />
                            <input className="form-input" placeholder="Tên" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                            <input className="form-input" placeholder="Giá" type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
                            <input className="form-input" placeholder="Tồn kho" type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} />
                            <input className="form-input" placeholder="ID danh mục (tuỳ chọn)" type="number" value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value })} />
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
