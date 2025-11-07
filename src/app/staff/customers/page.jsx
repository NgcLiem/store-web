"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/contexts/AuthContexts";
import { useEffect, useState } from "react";
import "../staff.css";

function CustomersPageContent() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [items, setItems] = useState([]);
    const [q, setQ] = useState("");
    const [onlyActive, setOnlyActive] = useState(false);

    const fetchCustomers = async () => {
        try {
            setLoading(true);
            const res = await fetch(`/api/customers?q=${encodeURIComponent(q)}&active=${onlyActive ? 1 : ""}`);
            const data = await res.json();
            if (!res.ok) throw new Error(data?.message || "Không tải được khách hàng");
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
        fetchCustomers();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [onlyActive]);

    const submitSearch = (e) => {
        e.preventDefault();
        fetchCustomers();
    };

    const toggleActive = async (c) => {
        const next = !c.active;
        if (!confirm(`${next ? "Mở" : "Khóa"} tài khoản khách hàng ${c.email}?`)) return;
        try {
            const res = await fetch(`/api/customers/${c.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ active: next }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data?.message || "Cập nhật thất bại");
            setItems((prev) => prev.map((it) => (it.id === c.id ? { ...it, active: next } : it)));
        } catch (e) {
            alert(e.message);
        }
    };

    return (
        <div className="staff-main">
            <div className="staff-header">
                <h1>Quản lý Khách hàng</h1>
            </div>

            <div className="staff-content">
                <form onSubmit={submitSearch} style={{ display: "flex", gap: 12, marginBottom: 16 }}>
                    <input
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                        className="form-input"
                        placeholder="Tìm theo email / tên / SĐT"
                        style={{ maxWidth: 360 }}
                    />
                    <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <input type="checkbox" checked={onlyActive} onChange={(e) => setOnlyActive(e.target.checked)} />
                        Chỉ hiển thị đang hoạt động
                    </label>
                    <button className="action-btn" type="submit"><i className="fa-solid fa-search" /> Tìm</button>
                </form>

                <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                        <thead>
                            <tr style={{ background: "#f1f2f6" }}>
                                <th style={{ padding: 12, borderBottom: "1px solid #eee", textAlign: "left" }}>Email</th>
                                <th style={{ padding: 12, borderBottom: "1px solid #eee", textAlign: "left" }}>Họ tên</th>
                                <th style={{ padding: 12, borderBottom: "1px solid #eee", textAlign: "left" }}>SĐT</th>
                                <th style={{ padding: 12, borderBottom: "1px solid #eee", textAlign: "left" }}>Địa chỉ</th>
                                <th style={{ padding: 12, borderBottom: "1px solid #eee", textAlign: "center" }}>Trạng thái</th>
                                <th style={{ padding: 12, borderBottom: "1px solid #eee", textAlign: "center" }}>Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={6} style={{ padding: 20, textAlign: "center" }}>Đang tải...</td></tr>
                            ) : items.length === 0 ? (
                                <tr><td colSpan={6} style={{ padding: 20, textAlign: "center" }}>Không có dữ liệu</td></tr>
                            ) : (
                                items.map((c) => (
                                    <tr key={c.id} style={{ borderBottom: "1px solid #f0f0f0" }}>
                                        <td style={{ padding: 12 }}>{c.email}</td>
                                        <td style={{ padding: 12 }}>{c.full_name || "-"}</td>
                                        <td style={{ padding: 12 }}>{c.phone || "-"}</td>
                                        <td style={{ padding: 12 }}>{c.address || "-"}</td>
                                        <td style={{ padding: 12, textAlign: "center" }}>
                                            <span style={{
                                                padding: "4px 8px",
                                                borderRadius: 6,
                                                color: "#fff",
                                                background: c.active ? "#27ae60" : "#7f8c8d",
                                                fontSize: 12
                                            }}>
                                                {c.active ? "Đang hoạt động" : "Đã khóa"}
                                            </span>
                                        </td>
                                        <td style={{ padding: 12, textAlign: "center" }}>
                                            <button className="action-btn" onClick={() => toggleActive(c)}>
                                                <i className="fa-solid fa-user-lock" /> {c.active ? "Khóa" : "Mở"}
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default function CustomersPage() {
    return (
        <ProtectedRoute allowedRoles={["staff"]}>
            <CustomersPageContent />
        </ProtectedRoute>
    );
}
