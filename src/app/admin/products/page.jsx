"use client";

import { useEffect, useState } from "react";
import "./products.css";
import { useAuth } from "../../../contexts/AuthContexts";

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

export default function AdminProductsPage() {
    const { token, user } = useAuth();

    const [items, setItems] = useState([]);
    const [q, setQ] = useState("");
    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState(null);
    const [confirmProduct, setConfirmProduct] = useState(null);

    const [form, setForm] = useState({
        product_code: "",
        name: "",
        price: "",
        image_url: "",
        sizes: [{ size_id: "", stock: "" }],
    });
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [dragActive, setDragActive] = useState(false);

    const withAuthHeaders = (headers = {}) => {
        return token
            ? { ...headers, Authorization: `Bearer ${token}` }
            : headers;
    };

    const load = async () => {
        setLoading(true);
        try {
            const path =
                user?.role === "admin"
                    ? "/admin/products"
                    : user?.role === "staff"
                        ? "/staff/products"
                        : "/products";

            const url = (`${API_BASE}${path}?q=${encodeURIComponent(q)}`);

            const res = await fetch(url, {
                headers: withAuthHeaders(),
            });

            const text = await res.text();
            let data = null;
            try {
                data = JSON.parse(text);
            } catch {
                console.error("Không parse được JSON:", text);
            }

            if (!res.ok) {
                console.error("Lỗi tải sản phẩm:", data || text);
                setItems([]);
            } else {
                setItems(Array.isArray(data) ? data : data?.items || []);
            }
        } catch (e) {
            console.error("Lỗi load sản phẩm:", e);
            setItems([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, []);

    const submitSearch = (e) => {
        e.preventDefault();
        load();
    };

    // ====== MODAL ======
    const openCreate = () => {
        setEditing(null);
        setForm({
            product_code: "",
            name: "",
            price: "",
            stock: "",
            category_id: "",
            image_url: "",
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
            image_url: p.image_url || "",
        });
        setModalOpen(true);
    };

    // ====== SAVE (CREATE / UPDATE) ======
    const save = async (e) => {
        e.preventDefault();

        const payload = {
            product_code: form.product_code?.trim() || null,
            name: form.name?.trim(),
            price: Number(form.price || 0),
            image_url: form.image_url?.trim() || null,
            sizes: (form.sizes || [])
                .map(s => ({ size_id: Number(s.size_id), stock: Number(s.stock || 0) }))
                .filter(s => Number.isInteger(s.size_id) && s.size_id > 0),
        };

        const basePath =
            user?.role === "staff" ? "/staff/products" : "/admin/products";
        const method = editing ? "PUT" : "POST";
        const url = `${API_BASE}${basePath}${editing ? `/${editing.id}` : ""}`;

        try {
            const res = await fetch(url, {
                method,
                headers: withAuthHeaders({
                    "Content-Type": "application/json",
                }),
                body: JSON.stringify(payload),
            });

            const data = await res.json().catch(() => null);
            if (!res.ok) {
                alert(data?.message || "Lưu thất bại");
                return;
            }

            await load();
            setModalOpen(false);
        } catch (err) {
            console.error("Lỗi lưu sản phẩm:", err);
            alert("Lưu thất bại, thử lại sau.");
        }
    };

    const remove = async () => {
        if (!confirmProduct) return;
        const p = confirmProduct;

        const basePath =
            user?.role === "staff" ? "/staff/products" : "/admin/products";
        const url = `${API_BASE}${basePath}/${p.id}`;

        try {
            const res = await fetch(url, {
                method: "DELETE",
                headers: withAuthHeaders(),
            });

            if (!res.ok) {
                const data = await res.json().catch(() => null);
                alert(data?.message || "Xoá thất bại");
                return;
            }

            setItems((prev) => prev.filter((it) => it.id !== p.id));
        } catch (err) {
            console.error("Lỗi xoá sản phẩm:", err);
            alert("Xoá thất bại, thử lại sau.");
        } finally {
            setConfirmProduct(null);
        }
    };

    const uploadImage = async (file) => {
        if (!file) return;
        setUploading(true);

        try {
            const formData = new FormData();
            formData.append("file", file);

            console.log('Uploading file:', file.name, file.size);

            const headers = {};
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            const res = await fetch(
                `${API_BASE}/upload/cloudinary`,
                {
                    method: "POST",
                    headers: headers,
                    body: formData,
                }
            );

            console.log('Response status:', res.status);

            const data = await res.json().catch(() => null);

            if (!res.ok) {
                throw new Error(data?.message || "Upload ảnh thất bại");
            }

            const url = data?.url || data?.image_url;
            if (!url) throw new Error("Không nhận được URL ảnh từ server");

            setForm((prev) => ({ ...prev, image_url: url }));
            alert('Upload ảnh thành công!');
        } catch (e) {
            console.error("Upload image error:", e);
            alert(e.message || "Upload ảnh thất bại");
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
                <form onSubmit={submitSearch} className="product-search-form">
                    <input
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                        className="form-input-admin search-input-narrow"
                        placeholder="Tìm tên / mã SP"
                    />
                    <button className="action-btn" type="submit">
                        <i className="fa-solid fa-search" />
                    </button>
                </form>

                <div className="table-wrapper">
                    <table className="product-table">
                        <thead>
                            <tr className="table-header-row">
                                <th className="table-header-cell text-left">Mã</th>
                                <th className="table-header-cell text-left product-image-header">
                                    Ảnh
                                </th>
                                <th className="table-header-cell text-center">Tên</th>
                                <th className="table-header-cell text-center">Giá</th>
                                <th className="table-header-cell text-center">Tồn kho</th>
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
                                items.map((p) => (
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
                                                <span className="no-image-text">Không có</span>
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
                                                onClick={() => setConfirmProduct(p)}
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
                                <label>Size</label>
                            </div>

                            <div className="image-input-group">
                                <label className="image-label">Hình ảnh sản phẩm</label>

                                {/* Ô nhập URL */}
                                <div className="image-input-row">
                                    <input
                                        type="text"
                                        className="form-input-admin"
                                        placeholder="https://image.jpg"
                                        value={form.image_url || ""}
                                        onChange={(e) =>
                                            setForm({ ...form, image_url: e.target.value })
                                        }
                                    />

                                    <button
                                        type="button"
                                        className="action-btn btn-preview"
                                        disabled={!form.image_url}
                                        onClick={() =>
                                            form.image_url &&
                                            window.open(form.image_url, "_blank")
                                        }
                                    >
                                        Xem
                                    </button>

                                    {form.image_url && (
                                        <button
                                            type="button"
                                            className="action-btn btn-danger"
                                            onClick={() =>
                                                setForm({ ...form, image_url: "" })
                                            }
                                        >
                                            Xóa
                                        </button>
                                    )}
                                </div>

                                {/* Drag & drop upload */}
                                <div
                                    className={`image-dropzone ${dragActive ? "drag-active" : ""
                                        }`}
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
                                            onClick={() =>
                                                document
                                                    .getElementById("product-image-input")
                                                    .click()
                                            }
                                        >
                                            chọn từ máy
                                        </button>
                                    </p>

                                    {uploading && (
                                        <p className="uploading-text">Đang upload...</p>
                                    )}
                                </div>

                                {form.image_url ? (
                                    <div className="image-preview">
                                        <img src={form.image_url} alt="Preview" />
                                    </div>
                                ) : (
                                    <p className="image-placeholder">
                                        Chưa có ảnh nào được chọn
                                    </p>
                                )}
                            </div>

                            <span></span>

                            <div className="modal-actions">
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
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {confirmProduct && (
                <div className="modal-overlay">
                    <div className="modal-content-wrapper confirm-modal">
                        <h3 className="confirm-title">Xoá sản phẩm</h3>
                        <p className="confirm-text">
                            Bạn có chắc muốn xoá sản phẩm{" "}
                            <span className="confirm-product-name">
                                "{confirmProduct.name}"
                            </span>{" "}
                            khỏi hệ thống?
                        </p>

                        <div className="confirm-actions">
                            <button
                                type="button"
                                className="action-btn btn-secondary"
                                onClick={() => setConfirmProduct(null)}
                            >
                                Huỷ
                            </button>
                            <button
                                type="button"
                                className="action-btn btn-danger"
                                onClick={remove}
                            >
                                <i className="fa-solid fa-trash" /> Xoá
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </>
    );
}
