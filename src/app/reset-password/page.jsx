"use client";
import { useState, useEffect } from "react";
import "./resetPassword.css"

export default function ResetPasswordPage() {
    const [token, setToken] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const t = new URLSearchParams(window.location.search).get("token");
        setToken(t || "");
    }, []);

    const handleReset = async (e) => {
        e.preventDefault();
        if (!newPassword) return setMessage("Vui lòng nhập mật khẩu mới!");
        setLoading(true);
        try {
            const res = await fetch("/api/reset-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token, newPassword }),
            });
            const data = await res.json();
            setMessage(data.message);
            setLoading(false);
            if (res.ok) {
                setTimeout(() => (window.location.href = "/login"), 2000);
            }
        } catch (error) {
            setMessage("Lỗi server!");
            setLoading(false);
        }
    };

    return (
        <div className="reset-password-container">
            <h2>Đặt lại mật khẩu</h2>
            {message && <p className="message">{message}</p>}
            <form onSubmit={handleReset}>
                <input
                    type="password"
                    placeholder="Mật khẩu mới"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                />
                <button type="submit" disabled={loading}>
                    {loading ? "Đang xử lý..." : "Đặt lại mật khẩu"}
                </button>
            </form>
        </div>
    );
}
