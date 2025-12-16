"use client";

import { useEffect, useState } from "react";
import "../admin.css";
import "./staff.css";
import { apiGet, apiSend } from "@/lib/api";

export default function AdminStaffPage() {
    const [items, setItems] = useState([]);
    const [q, setQ] = useState("");
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState(null);

    const [form, setForm] = useState({
        email: "",
        full_name: "",
        password: "",
        phone: "",
        address: "",
        sex: "",
    });

    const load = async () => {
        setLoading(true);
        try {
            const query = q ? `?q=${encodeURIComponent(q)}` : "";
            const data = await apiGet(`/staff${query}`);
            setItems(Array.isArray(data) ? data : []);
        } catch (e) {
            console.error(e);
            alert("Không tải được danh sách nhân viên");
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

    const openCreate = () => {
        setEditing(null);
        setForm({
            email: "",
            full_name: "",
            password: "",
            phone: "",
            address: "",
            sex: "",
        });
        setModalOpen(true);
    };

    const openEdit = (s) => {
        setEditing(s);
        setForm({
            email: s.email || "",
            full_name: s.full_name || "",
            password: "",
            phone: s.phone || "",
            address: s.address || "",
            sex: s.sex || "",
        });
        setModalOpen(true);
    };

    const save = async (e) => {
        e.preventDefault();
        const body = { ...form };

        if (!editing && !body.password) {
            alert("Mật khẩu không được để trống");
            return;
        }
        if (editing && !body.password) {
            delete body.password;
        }

        try {
            if (editing) {
                await apiSend(`/staff/${editing.id}`, "PUT", body);
            } else {
                await apiSend(`/staff`, "POST", body);
            }
            await load();
            setModalOpen(false);
        } catch (e) {
            console.error(e);
            alert("Lưu thất bại");
        }
    };

    const remove = async (s) => {
        if (!confirm(`Xoá nhân viên ${s.email}?`)) return;
        try {
            await apiSend(`/staff/${s.id}`, "DELETE");
            setItems((prev) => prev.filter((it) => it.id !== s.id));
        } catch (e) {
            console.error(e);
            alert("Xoá thất bại");
        }
    };

    return (
        <>
            <div className="admin-header">
                <h1>Quản lý Nhân viên</h1>
                <div className="quick-actions">
                    <button className="action-btn" onClick={openCreate}>
                        <i className="fa-solid fa-user-plus" /> Thêm nhân viên
                    </button>
                </div>
            </div>

            <div className="admin-content">
                <form onSubmit={submitSearch} className="search-form-row">
                    <input
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                        className="form-input-admin search-input-narrow"
                        placeholder="Tìm theo email / tên"
                    />
                    <button className="action-btn" type="submit">
                        <i className="fa-solid fa-search" />
                    </button>
                </form>

                <div className="table-responsive-wrapper">
                    <table className="staff-table">
                        <thead>
                            <tr className="table-header-row">
                                <th className="table-header-cell text-left">Email</th>
                                <th className="table-header-cell text-left">Họ tên</th>
                                <th className="table-header-cell text-center">SĐT</th>
                                <th className="table-header-cell text-center">Địa chỉ</th>
                                <th className="table-header-cell text-center">Giới tính</th>
                                <th className="table-header-cell text-center">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={4} className="table-cell table-cell-center">
                                        Đang tải...
                                    </td>
                                </tr>
                            ) : items.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="table-cell table-cell-center">
                                        Không có dữ liệu
                                    </td>
                                </tr>
                            ) : (
                                items.map((s) => (
                                    <tr key={s.id} className="table-body-row">
                                        <td className="table-cell">{s.email}</td>
                                        <td className="table-cell">{s.full_name || "-"}</td>
                                        <td className="table-cell text-center">{s.phone || "-"}</td>
                                        <td className="table-cell text-center">{s.address || "-"}</td>
                                        <td className="table-cell text-center">{s.sex || "-"}</td>
                                        <td className="table-cell table-actions-cell">
                                            <button
                                                className="action-btn"
                                                onClick={() => openEdit(s)}
                                            >
                                                <i className="fa-solid fa-pen" /> Sửa
                                            </button>
                                            <button
                                                className="action-btn btn-danger"
                                                onClick={() => remove(s)}
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
                        <h3>{editing ? "Sửa nhân viên" : "Thêm nhân viên"}</h3>
                        <form onSubmit={save} className="modal-form">
                            <div className="floating-group">
                                <input
                                    type="text"
                                    placeholder=" "
                                    required
                                    value={form.email}
                                    onChange={(e) =>
                                        setForm({ ...form, email: e.target.value })
                                    }
                                />
                                <label>Email</label>
                            </div>

                            <div className="floating-group">
                                <input
                                    type="text"
                                    placeholder=" "
                                    required
                                    value={form.full_name}
                                    onChange={(e) =>
                                        setForm({ ...form, full_name: e.target.value })
                                    }
                                />
                                <label>Họ và Tên</label>
                            </div>

                            <div className="floating-group">
                                <input
                                    type="text"
                                    placeholder=" "
                                    value={form.phone}
                                    onChange={(e) =>
                                        setForm({ ...form, phone: e.target.value })
                                    }
                                />
                                <label>Điện thoại</label>
                            </div>

                            <div className="floating-group">
                                <input
                                    type="text"
                                    placeholder=" "
                                    value={form.address}
                                    onChange={(e) =>
                                        setForm({ ...form, address: e.target.value })
                                    }
                                />
                                <label>Địa chỉ</label>
                            </div>

                            <div className="floating-group">
                                <input
                                    type="text"
                                    placeholder=" "
                                    value={form.sex}
                                    onChange={(e) =>
                                        setForm({ ...form, sex: e.target.value })
                                    }
                                />
                                <label>Giới tính</label>
                            </div>

                            <div className="floating-group">
                                <input
                                    type="password"
                                    placeholder=" "
                                    value={form.password}
                                    onChange={(e) =>
                                        setForm({ ...form, password: e.target.value })
                                    }
                                    required={!editing}
                                />
                                <label>
                                    Mật khẩu
                                </label>
                            </div>

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
        </>
    );
}
