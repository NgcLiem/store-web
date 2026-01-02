"use client";

import { useEffect, useState } from "react";
import "../admin.css";
import "./staff.css";
import { apiSend, apiGet } from "@/lib/api";
import { useToast } from "../../../components/Toast";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3003";

export default function AdminStaffPage() {
    const [items, setItems] = useState([]);
    const [q, setQ] = useState("");
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState(null);
    const { showToast } = useToast();
    const [statusModal, setStatusModal] = useState(null);

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
            showToast(
                data?.message || "Không tải được danh sách nhân viên",
                "error",
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, []);

    useEffect(() => {
        if (!statusModal) return;

        const timer = setTimeout(() => {
            setStatusModal(null);
        }, 3000);

        return () => clearTimeout(timer);
    }, [statusModal]);

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
            showToast(data?.message || "Lưu thất bại", "error");
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
            showToast("Lưu thất bại", "error");
        }
    };

    const remove1 = async (s) => {
        if (!confirm(`Xoá nhân viên ${s.email}?`)) return;
        try {
            await apiSend(`/staff/${s.id}`, "DELETE");
            setItems((prev) => prev.filter((it) => it.id !== s.id));
        } catch (e) {
            console.error(e);
            showToast("Xóa thất bại", "error");
        }
    };

    const remove = async (p) => {
        const url = `${API_BASE}/staff/${p.id}`;

        try {
            const res = await fetch(url, {
                method: "DELETE",
            });

            if (!res.ok) {
                const data = await res.json().catch(() => null);
                showToast(data?.message || "Xoá thất bại", "error");
                return;
            }

            showToast("Xoá nhân viên thành công", "success");
            setItems((prev) => prev.filter((it) => it.id !== p.id));
        } catch (err) {
            console.error("Lỗi xoá nhân viên:", err);
            showToast("Xoá thất bại, thử lại sau", "error");
        }
    };

    return (
        <>
            <div className="admin-header">
                <h1>Quản lý Nhân viên</h1>
                <div className="quick-actions">
                    <button className="addPr" onClick={openCreate}>
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
                                <th className="table-header-cell text-left">
                                    Email
                                </th>
                                <th className="table-header-cell text-left">
                                    Họ tên
                                </th>
                                <th className="table-header-cell text-center">
                                    SĐT
                                </th>
                                <th className="table-header-cell text-center">
                                    Địa chỉ
                                </th>
                                <th className="table-header-cell text-center">
                                    Giới tính
                                </th>
                                <th className="table-header-cell text-center">
                                    Thao tác
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td
                                        colSpan={4}
                                        className="table-cell table-cell-center"
                                    >
                                        Đang tải...
                                    </td>
                                </tr>
                            ) : items.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={4}
                                        className="table-cell table-cell-center"
                                    >
                                        Không có dữ liệu
                                    </td>
                                </tr>
                            ) : (
                                items.map((s) => (
                                    <tr key={s.id} className="table-body-row">
                                        <td className="table-cell">
                                            {s.email}
                                        </td>
                                        <td className="table-cell">
                                            {s.full_name || "-"}
                                        </td>
                                        <td className="table-cell text-center">
                                            {s.phone || "-"}
                                        </td>
                                        <td className="table-cell text-center">
                                            {s.address || "-"}
                                        </td>
                                        <td className="table-cell text-center">
                                            {s.sex || "-"}
                                        </td>
                                        <td className="table-cell table-actions-cell">
                                            <button
                                                className="action-btn"
                                                onClick={() => openEdit(s)}
                                            >
                                                <i className="fa-solid fa-pen" />{" "}
                                                Sửa
                                            </button>
                                            <button
                                                className="action-btn btn-danger"
                                                onClick={() => remove(s)}
                                            >
                                                <i className="fa-solid fa-trash" />{" "}
                                                Xoá
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
                                        setForm({
                                            ...form,
                                            email: e.target.value,
                                        })
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
                                        setForm({
                                            ...form,
                                            full_name: e.target.value,
                                        })
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
                                        setForm({
                                            ...form,
                                            phone: e.target.value,
                                        })
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
                                        setForm({
                                            ...form,
                                            address: e.target.value,
                                        })
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
                                        setForm({
                                            ...form,
                                            sex: e.target.value,
                                        })
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
                                        setForm({
                                            ...form,
                                            password: e.target.value,
                                        })
                                    }
                                    required={!editing}
                                />
                                <label>Mật khẩu</label>
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
        </>
    );
}
