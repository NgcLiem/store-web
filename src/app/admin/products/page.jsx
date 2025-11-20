// src/app/admin/products/page.jsx ĐÃ SỬA ĐỔI
"use client";

import { useEffect, useState } from "react";
import "../admin.css";
import "./products.css";

export default function AdminProductsPage() {
    const [items, setItems] = useState([]);
    const [q, setQ] = useState("");
    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState({
        product_code: "",
        name: "",
        price: "",
        stock: "",
        category_id: "",
        image_url: ""
    });
    const [loading, setLoading] = useState(true);

    const load = async () => {
        setLoading(true);
        const res = await fetch(`/api/products?q=${encodeURIComponent(q)}`);
        const text = await res.text();
        let data = null;
        try {
            data = JSON.parse(text);
        } catch { }
        setItems(Array.isArray(data) ? data : data?.items || []);
        setLoading(false);
    };

    useEffect(() => { load(); }, []);

    const submitSearch = (e) => { e.preventDefault(); load(); };

    const openCreate = () => {
        setEditing(null);
        setForm({
            product_code: "",
            name: "",
            price: "",
            stock: "",
            category_id: "",
            image_url: ""
        });
        setModalOpen(true);
    };

    const openEdit = (p) => {
        setEditing(p);
        setForm({
            product_code: p.product_code || "",
            name: p.name || "",
            price: p.price || "",
            stock: p.stock || "",
            category_id: p.category_id || "",
            image_url: p.image_url || ""
        });
        setModalOpen(true);
    };

    const save = async (e) => {
        e.preventDefault();
        const payload = {
            product_code: form.product_code?.trim() || null,
            name: form.name?.trim(),
            price: Number(form.price || 0),
            stock: Number(form.stock || 0),
            category_id: form.category_id ? Number(form.category_id) : null,
            image_url: form.image_url?.trim() || null
        };
        const url = editing ? `/api/products/${editing.id}` : `/api/products`;
        const method = editing ? "PUT" : "POST";
        const res = await fetch(url, {
            method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });
        const data = await res.json().catch(() => null);
        if (!res.ok) { alert(data?.message || "Lưu thất bại"); return; }
        if (editing)
            setItems(prev => prev.map(it => it.id === editing.id ? { ...it, ...payload } : it));
        else
            setItems(prev => [data?.item || { id: Date.now(), ...payload }, ...prev]);
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
                    <button className="action-btn primary-btn" onClick={openCreate}>
                        <i className="fa-solid fa-plus" /> Thêm sản phẩm
                    </button>
                </div>
            </div>

            <div className="admin-content">
                <form
                    onSubmit={submitSearch}
                    className="product-search-form" // Dùng className thay cho style inline
                >
                    <input
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                        className="form-input search-input-wide" // Dùng className thay cho style inline
                        placeholder="Tìm tên / mã SP"
                    />
                    <button className="action-btn" type="submit">
                        <i className="fa-solid fa-search" /> Tìm
                    </button>
                </form>

                <div className="table-wrapper"> {/* Dùng className thay cho style inline */}
                    <table className="product-table">
                        <thead>
                            <tr className="table-header-row"> {/* Dùng className thay cho style inline */}
                                <th className="table-header-cell text-left">Mã</th>
                                <th className="table-header-cell text-left product-image-header">Ảnh</th> {/* Thêm className */}
                                <th className="table-header-cell text-left">Tên</th>
                                <th className="table-header-cell text-right">Giá</th>
                                <th className="table-header-cell text-right">Tồn kho</th>
                                <th className="table-header-cell text-center">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr className="table-body-row">
                                    <td colSpan={6} className="table-cell table-cell-center">
                                        Đang tải...
                                    </td>
                                </tr>
                            ) : items.length === 0 ? (
                                <tr className="table-body-row">
                                    <td colSpan={6} className="table-cell table-cell-center">
                                        Không có dữ liệu
                                    </td>
                                </tr>
                            ) : (
                                items.map(p => (
                                    <tr key={p.id} className="table-body-row">
                                        <td className="table-cell">
                                            {p.product_code || `#${p.id}`}
                                        </td>
                                        <td className="table-cell product-image-cell"> {/* Thêm className */}
                                            {p.image_url ? (
                                                <img
                                                    src={p.image_url}
                                                    alt={p.name}
                                                    className="product-thumb"
                                                />
                                            ) : (
                                                <span className="no-image-text"> {/* Thêm className */}
                                                    Không có
                                                </span>
                                            )}
                                        </td>
                                        <td className="table-cell">{p.name}</td>
                                        <td className="table-cell text-right">
                                            {Number(p.price || 0).toLocaleString()}₫
                                        </td>
                                        <td className="table-cell text-right">
                                            {p.stock ?? 0}
                                        </td>
                                        <td className="table-cell table-actions-cell"> {/* Dùng className thay cho style inline */}
                                            <button
                                                className="action-btn"
                                                onClick={() => openEdit(p)}
                                            >
                                                <i className="fa-solid fa-pen" /> Sửa
                                            </button>
                                            <button
                                                className="action-btn btn-danger" // Dùng btn-danger cho nút xoá
                                                onClick={() => remove(p)}
                                            >
                                                <i className="fa-solid fa-trash" /> Xoá
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            {modalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content-wrapper">
                        <h3>{editing ? "Sửa sản phẩm" : "Thêm sản phẩm"}</h3>
                        <form
                            onSubmit={save}
                            className="modal-form"
                        >
                            <div className="floating-group">
                                <input
                                    type="text"
                                    placeholder=" "
                                    value={form.product_code}
                                    onChange={(e) =>
                                        setForm({ ...form, product_code: e.target.value })
                                    }
                                    required
                                />
                                <label>Mã sản phẩm</label>
                            </div>

                            <div className="floating-group">
                                <input
                                    type="text"
                                    placeholder=" "
                                    value={form.name}
                                    onChange={(e) =>
                                        setForm({ ...form, name: e.target.value })
                                    }
                                    required
                                />
                                <label>Tên sản phẩm</label>
                            </div>

                            <div className="floating-group">
                                <input
                                    type="text"
                                    placeholder=" "
                                    value={form.image_url}
                                    onChange={(e) =>
                                        setForm({ ...form, image_url: e.target.value })
                                    }
                                />
                                <label>URL hình ảnh (tuỳ chọn)</label>
                            </div>

                            <div className="floating-group">
                                <input
                                    type="number"
                                    placeholder=" "
                                    value={form.price}
                                    onChange={(e) =>
                                        setForm({ ...form, price: e.target.value })
                                    }
                                    required
                                />
                                <label>Giá</label>
                            </div>

                            <div className="floating-group">
                                <input
                                    type="number"
                                    placeholder=" "
                                    value={form.stock}
                                    onChange={(e) =>
                                        setForm({ ...form, stock: e.target.value })
                                    }
                                    required
                                />
                                <label>Tồn kho</label>
                            </div>

                            <div className="floating-group">
                                <input
                                    type="number"
                                    placeholder=" "
                                    value={form.category_id}
                                    onChange={(e) =>
                                        setForm({ ...form, category_id: e.target.value })
                                    }
                                />
                                <label>ID danh mục (tuỳ chọn)</label>
                            </div>

                            <div className="modal-actions"> {/* Dùng className thay cho style inline */}
                                <button
                                    type="button"
                                    className="action-btn btn-secondary" // Thêm className để định kiểu nút Huỷ
                                    onClick={() => setModalOpen(false)}
                                >
                                    Huỷ
                                </button>
                                <button type="submit" className="action-btn">
                                    <i className="fa-solid fa-save" /> Lưu
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}