"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/contexts/AuthContexts";
import { useEffect, useMemo, useState } from "react";
import "../staff.css";

function ProductsPageContent() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [items, setItems] = useState([]);
    const [q, setQ] = useState("");
    const [category, setCategory] = useState("all");
    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState({ name: "", price: "", stock: "", category_id: "", product_code: "" });

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const res = await fetch(`/api/products?q=${encodeURIComponent(q)}&category=${category === "all" ? "" : category}`);
            const data = await res.json();
            if (!res.ok) throw new Error(data?.message || "Không tải được sản phẩm");
            setItems(data?.items || data || []);
        } catch (e) {
            console.error(e);
            setItems([]);
            alert(e.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, [category]);

    const submitSearch = (e) => {
        e.preventDefault();
        fetchProducts();
    };

    const openCreate = () => {
        setEditing(null);
        setForm({ name: "", price: "", stock: "", category_id: "", product_code: "" });
        setModalOpen(true);
    };

    const openEdit = (p) => {
        setEditing(p);
        setForm({
            name: p.name || "",
            price: p.price || "",
            stock: p.stock || "",
            category_id: p.category_id || "",
            product_code: p.product_code || "",
        });
        setModalOpen(true);
    };

    const saveProduct = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                name: form.name.trim(),
                price: Number(form.price),
                stock: Number(form.stock || 0),
                category_id: form.category_id ? Number(form.category_id) : null,
                product_code: form.product_code?.trim(),
            };
            const url = editing ? `/api/products/${editing.id}` : `/api/products`;
            const method = editing ? "PUT" : "POST";
            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data?.message || "Lưu sản phẩm thất bại");

            // Optimistic update
            if (editing) {
                setItems((prev) => prev.map((it) => (it.id === editing.id ? { ...it, ...payload } : it)));
            } else {
                const created = data?.item || { id: data?.id, ...payload };
                setItems((prev) => [created, ...prev]);
            }
            setModalOpen(false);
        } catch (e) {
            alert(e.message);
        }
    };

    const deleteProduct = async (p) => {
        if (!confirm(`Xóa sản phẩm "${p.name}"?`)) return;
        try {
            const res = await fetch(`/api/products/${p.id}`, { method: "DELETE" });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(data?.message || "Xóa thất bại");
            setItems((prev) => prev.filter((it) => it.id !== p.id));
        } catch (e) {
            alert(e.message);
        }
    };

    return (
        <div className="staff-main">
            <div className="staff-header">
                <h1>Quản lý Sản phẩm</h1>
                <div className="quick-actions">
                    <button className="action-btn" onClick={openCreate}><i className="fa-solid fa-plus" /> Thêm sản phẩm</button>
                </div>
            </div>

            <div className="staff-content">
                <form onSubmit={submitSearch} style={{ display: "flex", gap: 12, marginBottom: 16 }}>
                    <input
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                        className="form-input"
                        placeholder="Tìm theo tên / mã sản phẩm"
                        style={{ maxWidth: 360 }}
                    />
                    <select className="form-input" value={category} onChange={(e) => setCategory(e.target.value)} style={{ maxWidth: 220 }}>
                        <option value="all">Tất cả danh mục</option>
                        {/* Option danh mục: load từ API categories nếu có */}
                    </select>
                    <button className="action-btn" type="submit"><i className="fa-solid fa-search" /> Tìm</button>
                </form>

                <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                        <thead>
                            <tr style={{ background: "#f1f2f6" }}>
                                <th style={{ padding: 12, borderBottom: "1px solid #eee", textAlign: "left" }}>Mã</th>
                                <th style={{ padding: 12, borderBottom: "1px solid #eee", textAlign: "left" }}>Tên sản phẩm</th>
                                <th style={{ padding: 12, borderBottom: "1px solid #eee", textAlign: "right" }}>Giá</th>
                                <th style={{ padding: 12, borderBottom: "1px solid #eee", textAlign: "right" }}>Tồn kho</th>
                                <th style={{ padding: 12, borderBottom: "1px solid #eee" }}>Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={5} style={{ padding: 20, textAlign: "center" }}>Đang tải...</td></tr>
                            ) : items.length === 0 ? (
                                <tr><td colSpan={5} style={{ padding: 20, textAlign: "center" }}>Không có dữ liệu</td></tr>
                            ) : (
                                items.map((p) => (
                                    <tr key={p.id} style={{ borderBottom: "1px solid #f0f0f0" }}>
                                        <td style={{ padding: 12 }}>{p.product_code || `#${p.id}`}</td>
                                        <td style={{ padding: 12 }}>{p.name}</td>
                                        <td style={{ padding: 12, textAlign: "right" }}>{Number(p.price || 0).toLocaleString()}₫</td>
                                        <td style={{ padding: 12, textAlign: "right" }}>{p.stock ?? 0}</td>
                                        <td style={{ padding: 12, display: "flex", gap: 8, justifyContent: "center" }}>
                                            <button className="action-btn" onClick={() => openEdit(p)}><i className="fa-solid fa-pen" /> Sửa</button>
                                            <button className="action-btn" onClick={() => deleteProduct(p)}><i className="fa-solid fa-trash" /> Xóa</button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal tạo/sửa */}
            {modalOpen && (
                <div style={{
                    position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)",
                    display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50
                }}>
                    <div style={{ background: "#fff", padding: 20, borderRadius: 10, width: 520, maxWidth: "95%" }}>
                        <h3 style={{ marginBottom: 12 }}>{editing ? "Sửa sản phẩm" : "Thêm sản phẩm"}</h3>
                        <form onSubmit={saveProduct} style={{ display: "grid", gap: 10 }}>
                            <input className="form-input" placeholder="Mã sản phẩm" value={form.product_code} onChange={(e) => setForm({ ...form, product_code: e.target.value })} />
                            <input className="form-input" placeholder="Tên sản phẩm" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                            <input className="form-input" placeholder="Giá" type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
                            <input className="form-input" placeholder="Tồn kho" type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} />
                            <input className="form-input" placeholder="ID danh mục (tùy chọn)" type="number" value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value })} />
                            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 6 }}>
                                <button className="action-btn" type="button" onClick={() => setModalOpen(false)}>Hủy</button>
                                <button className="action-btn" type="submit"><i className="fa-solid fa-save" /> Lưu</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function ProductsPage() {
    return (
        <ProtectedRoute allowedRoles={["staff"]}>
            <ProductsPageContent />
        </ProtectedRoute>
    );
}
