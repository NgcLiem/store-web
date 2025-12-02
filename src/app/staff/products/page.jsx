"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/contexts/AuthContexts";
import { useEffect, useState } from "react";
import "../staff.css";
import "./products.css";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

function ProductsPageContent() {
    const { user, token } = useAuth();
    const [loading, setLoading] = useState(true);
    const [items, setItems] = useState([]);
    const [q, setQ] = useState("");
    const [category, setCategory] = useState("all");
    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [dragActive, setDragActive] = useState(false);

    const [form, setForm] = useState({
        product_code: "",
        name: "",
        price: "",
        stock: "",
        category_id: "",
        image_url: ""
    });

    const load = async () => {
        try {
            setLoading(true);

            const params = new URLSearchParams();
            if (q) params.set("q", q);
            if (category !== "all") params.set("category", category);

            const res = await fetch(`${API_BASE}/staff/products?${params.toString()}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!res.ok) {
                const text = await res.text();
                console.error("Load error:", res.status, text);
                throw new Error("Không tải được danh sách sản phẩm");
            }

            const data = await res.json().catch(() => null);
            setItems(Array.isArray(data) ? data : data?.items || []);
        } catch (err) {
            console.error(err);
            alert("Không thể kết nối server. Vui lòng thử lại.");
        } finally {
            setLoading(false);
        }
    };


    useEffect(() => {
        load();
    }, [category]);

    const submitSearch = (e) => {
        e.preventDefault();
        load();
    };

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

        if (!editing) {
            alert("Staff không có quyền tạo sản phẩm");
            return;
        }

        const payload = {
            stock: Number(form.stock || 0),
        };

        const url = `${API_BASE}/staff/products/${editing.id}/stock`;

        const res = await fetch(url, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(payload),
        });


        const data = await res.json().catch(() => null);

        if (!res.ok) {
            alert(data?.message || "Cập nhật tồn kho thất bại");
            return;
        }

        setItems(prev =>
            prev.map(it => (it.id === editing.id ? { ...it, stock: payload.stock } : it))
        );
        setModalOpen(false);
    };

    const remove = async (p) => {
        alert("Staff không có quyền xoá sản phẩm");
    };

    const uploadImage = async (file) => {
        if (!file) return;
        setUploading(true);
        try {
            const formData = new FormData();
            formData.append("file", file);

            const res = await fetch(`${API_BASE}/upload`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: formData,
            });

            const data = await res.json().catch(() => null);
            if (!res.ok) {
                throw new Error(data?.message || "Upload ảnh thất bại");
            }

            const url = data?.url || data?.image_url;
            if (url) {
                setForm((prev) => ({ ...prev, image_url: url }));
            } else {
                throw new Error("Không nhận được URL ảnh từ server");
            }
        } catch (e) {
            alert(e.message);
        } finally {
            setUploading(false);
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        if (file) uploadImage(file);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setDragActive(false);
        const file = e.dataTransfer.files?.[0];
        if (file) uploadImage(file);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setDragActive(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setDragActive(false);
    };


    return (
        <div className="staff-main">
            <div className="staff-header">
                <h1>Quản lý Sản phẩm</h1>
                <div className="quick-actions">
                    <button className="action-btn" onClick={openCreate}>
                        <i className="fa-solid fa-plus" /> Thêm sản phẩm
                    </button>
                </div>
            </div>

            <div className="staff-content">
                <form onSubmit={submitSearch} className="product-search-form">
                    <input
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                        className="form-input search-input-narrow"
                        placeholder="Tìm theo tên / mã sản phẩm"
                    />
                    <select
                        className="form-input category-select"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                    >
                        <option value="all">Tất cả danh mục</option>
                    </select>
                    <button className="action-btn" type="submit">
                        <i className="fa-solid fa-search" />
                    </button>
                </form>

                <div className="table-wrapper">
                    <table className="product-table">
                        <thead>
                            <tr className="table-header-row">
                                <th className="table-header-cell text-left">Mã</th>
                                <th className="table-header-cell text-left product-image-header">Ảnh</th>
                                <th className="table-header-cell text-center">Tên</th>
                                <th className="table-header-cell text-center">Giá</th>
                                <th className="table-header-cell text-center">Tồn kho</th>
                                <th className="table-header-cell text-center">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="table-cell-center">Đang tải...</td>
                                </tr>
                            ) : items.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="table-cell-center">Không có dữ liệu</td>
                                </tr>
                            ) : (
                                items.map(p => (
                                    <tr key={p.id} className="table-body-row">
                                        <td className="table-cell">
                                            {p.product_code || `#${p.id}`}
                                        </td>
                                        <td className="table-cell product-image-cell">
                                            {p.image_url ? (
                                                <img
                                                    src={p.image_url}
                                                    alt={p.name}
                                                    className="product-thumb"
                                                />
                                            ) : (
                                                <span className="no-image-text">
                                                    Không có
                                                </span>
                                            )}
                                        </td>
                                        <td className="table-cell text-center">{p.name}</td>
                                        <td className="table-cell text-center">
                                            {Number(p.price || 0).toLocaleString()}₫
                                        </td>
                                        <td className="table-cell text-center">
                                            {p.stock ?? 0}
                                        </td>
                                        <td className="table-cell table-actions-cell">
                                            <button
                                                className="action-btn"
                                                onClick={() => openEdit(p)}
                                            >
                                                <i className="fa-solid fa-pen" /> Sửa
                                            </button>
                                            <button
                                                className="action-btn btn-danger"
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

            {/* Modal tạo/sửa */}
            {modalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content-wrapper">
                        <h3>{editing ? "Sửa sản phẩm" : "Thêm sản phẩm"}</h3>
                        <form onSubmit={save} className="modal-form">
                            <div className="floating-group">
                                <input
                                    type="text"
                                    placeholder=" "
                                    value={form.product_code}
                                    onChange={(e) =>
                                        setForm({ ...form, product_code: e.target.value })
                                    }
                                    required
                                    readOnly
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
                                    readOnly
                                />
                                <label>Tên sản phẩm</label>
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
                                    readOnly
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
                                    readOnly
                                />
                                <label>ID danh mục (tuỳ chọn)</label>
                            </div>

                            <div className="image-input-group">
                                <label className="image-label">Hình ảnh sản phẩm</label>

                                <div className="image-input-row">
                                    <input
                                        type="text"
                                        className="form-input"
                                        placeholder="https://image.jpg"
                                        value={form.image_url || ""}
                                        onChange={(e) =>
                                            setForm({ ...form, image_url: e.target.value })
                                        }
                                        readOnly
                                    />

                                    <button
                                        type="button"
                                        className="action-btn btn-preview"
                                        disabled={true}
                                    >
                                        Xem
                                    </button>

                                    {form.image_url && (
                                        <button
                                            type="button"
                                            className="action-btn btn-danger"
                                            disabled={true}
                                        >
                                            Xóa
                                        </button>
                                    )}
                                </div>

                                <div
                                    className={`image-dropzone ${dragActive ? "drag-active" : ""}`}
                                    onDragOver={handleDragOver}
                                    onDragLeave={handleDragLeave}
                                    onDrop={handleDrop}
                                >
                                    <input
                                        id="product-image-input"
                                        type="file"
                                        accept="image/*"
                                        style={{ display: "none" }}
                                        onChange={handleFileChange}
                                    />

                                    <p>
                                        Kéo & thả ảnh vào đây, hoặc{" "}
                                        <button
                                            type="button"
                                            className="link-button"
                                            onClick={() => document.getElementById("product-image-input").click()}
                                        >
                                            chọn từ máy
                                        </button>
                                    </p>

                                    {uploading && <p className="uploading-text">Đang upload...</p>}
                                </div>

                                {/* Preview ảnh */}
                                {form.image_url ? (
                                    <div className="image-preview">
                                        <img src={form.image_url} alt="Preview" />
                                    </div>
                                ) : (
                                    <p className="image-placeholder">Chưa có ảnh nào được chọn</p>
                                )}
                            </div>
                            <button
                                type="button"
                                className="action-btn btn-secondary"
                                onClick={() => setModalOpen(false)}
                            >
                                Huỷ
                            </button>
                            <button type="submit" className="action-btn">
                                <i className="fa-solid fa-save" /> Lưu
                            </button>

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
