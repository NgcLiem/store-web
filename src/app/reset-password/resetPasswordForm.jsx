'use client';
import { useSearchParams, useRouter } from "next/navigation";
import { useState } from "react";
import "./resetPassword.css"

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

export default function ResetPasswordPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const token = searchParams.get("token");
    const [messages, setMessages] = useState({ success: "", error: "" });
    const [invalidFields, setInvalidFields] = useState([]);

    const [showNewPassword, setNewPassword] = useState(false);
    const [showConfirmPassword, setConfrimPassword] = useState(false);

    const showMessage = (type, text) => {
        if (!text) return;
        setMessages({
            success: type === "success" ? text : "",
            error: type === "error" ? text : ""
        });

        setTimeout(() => {
            const alertEl =
                document.querySelector(".error-message") ||
                document.querySelector(".success-message");
            if (alertEl) {
                alertEl.scrollIntoView({ behavior: "smooth", block: "center" });
            }
        }, 100);

        setTimeout(() => {
            setMessages({ success: "", error: "" });
        }, 3000);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const password = e.target.newPassword.value;
        const confirm = e.target.confirmPassword.value;

        const emptyFields = [];

        if (!password) emptyFields.push("newPassword");
        if (!confirm) emptyFields.push("confirmPassword");

        if (emptyFields.length > 0) {
            setInvalidFields(emptyFields);
            showMessage("error", "Vui lòng điền đầy đủ thông tin");
            return;
        } else {
            setInvalidFields([]);
        }

        if (!password || password.length < 6) {
            showMessage("error", "Mật khẩu phải có ít nhất 6 ký tự");
            return;
        }
        if (password !== confirm) {
            showMessage("error", "Mật khẩu nhập lại không khớp");
            return;
        }

        try {
            const res = await fetch(`${API_BASE}/auth/reset-password`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token, newPassword: password }),
            });

            if (!res.ok) {
                showMessage("error", "Đặt lại mật khẩu thất bại!");
                return;
            }

            showMessage("success", "Đặt lại mật khẩu thành công! Đang chuyển về trang đăng nhập...");
            setTimeout(() => router.push("/login"), 2000);
        } catch (err) {
            console.error(err);
            showMessage("error", "Lỗi kết nối server!");
        }
    };

    if (!token) {
        return <div>Link không hợp lệ.</div>;
    }
    
  return (
        <div className="reset-password-container">
            <form onSubmit={handleSubmit}>
                <h2>ĐẶT LẠI MẬT KHẨU</h2>
                {messages.success && <div className="success-message">{messages.success}</div>}
                {messages.error && <div className="error-message">{messages.error}</div>}
                <div className="password-wrapper">
                    <input
                        type={showNewPassword ? "text" : "password"}
                        className={`form-input ${invalidFields.includes("newPassword") ? "input-error" : ""}`}
                        placeholder="Mật khẩu mới"
                        name="newPassword"
                        onChange={(e) => {
                            setInvalidFields((prev) => prev.filter(f => f !== e.target.name))
                        }}
                    />
                    <button
                        type="button"
                        className="toggle-password-btn"
                        onClick={() => setNewPassword(prev => !prev)}
                        aria-label="Hiện / ẩn mật khẩu"
                    >
                        <i className={`fa-regular ${showNewPassword ? "fa-eye-slash" : "fa-eye"}`} />
                    </button>
                </div>

                <div className="password-wrapper">
                    <input
                        type={showConfirmPassword ? "text" : "password"}
                        className={`form-input ${invalidFields.includes("confirmPassword") ? "input-error" : ""}`}
                        placeholder="Nhập lại mật khẩu mới"
                        name="confirmPassword"
                        onChange={(e) => {
                            setInvalidFields((prev) => prev.filter(f => f !== e.target.name))
                        }}
                    />
                    <button
                        type="button"
                        className="toggle-password-btn"
                        onClick={() => setConfrimPassword(prev => !prev)}
                        aria-label="Hiện / ẩn mật khẩu"
                    >
                        <i className={`fa-regular ${showConfirmPassword ? "fa-eye-slash" : "fa-eye"}`} />
                    </button>
                </div>
                <button type="submit">Xác nhận</button>
            </form>

        </div>
    );
}