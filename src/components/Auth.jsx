"use client";
import { useState, useEffect } from "react";
import "../assets/css/auth.css"

export default function LoginPage() {
    const [showRegister, setShowRegister] = useState(false);
    const [message, setMessage] = useState("");

    // Hàm tính tuổi
    const calculateAge = (birthDate) => {
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    };

    // Hàm xử lý login
    const handleLogin = (e) => {
        e.preventDefault();
        const email = e.target.loginEmail.value;
        const password = e.target.loginPassword.value;

        if (email === "demo@memolstudio.com" && password === "123456") {
            setMessage("✅ Đăng nhập thành công! Chuyển hướng...");
        } else {
            setMessage("❌ Email hoặc mật khẩu không đúng");
        }
    };

    // Hàm xử lý register
    const handleRegister = (e) => {
        e.preventDefault();
        const firstName = e.target.firstName.value;
        const lastName = e.target.lastName.value;
        const birthDate = e.target.birthDate.value;
        const password = e.target.registerPassword.value;

        if (calculateAge(new Date(birthDate)) < 13) {
            setMessage("❌ Bạn phải từ 13 tuổi trở lên để đăng ký");
            return;
        }
        if (password.length < 6) {
            setMessage("❌ Mật khẩu phải có ít nhất 6 ký tự");
            return;
        }

        setMessage(`✅ Tạo tài khoản thành công cho ${firstName} ${lastName}`);
        setTimeout(() => setShowRegister(false), 2000);
    };

    return (
        <div className="auth-container">
            {!showRegister ? (
                <div className="form-container-login">
                    <div className="form-header">
                        <h2 className="form-title">Đăng nhập tài khoản</h2>
                        <p className="form-subtitle">Nhập email và mật khẩu của bạn</p>
                    </div>

                    {message && <div className="success-message">{message}</div>}

                    <form onSubmit={handleLogin}>
                        <div className="form-group">
                            <input type="email" name="loginEmail" className="form-input" placeholder="Email" required />
                        </div>
                        <div className="form-group">
                            <input type="password" name="loginPassword" className="form-input" placeholder="Mật khẩu" required />
                        </div>
                        <button type="submit" className="btn-primary">Đăng nhập</button>
                    </form>

                    <div className="form-links">
                        <div>
                            Khách hàng mới?{" "}
                            <a href="#" onClick={() => setShowRegister(true)}>Tạo tài khoản</a>
                        </div>
                        <div style={{ marginTop: "0.5rem" }}>
                            Quên mật khẩu?{" "}
                            <a href="#" onClick={() => alert("Chức năng khôi phục mật khẩu")}>
                                Khôi phục mật khẩu
                            </a>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="form-container-register">
                    <div className="form-header">
                        <h2 className="form-title">Tạo tài khoản</h2>
                    </div>

                    {message && <div className="success-message">{message}</div>}

                    <form onSubmit={handleRegister}>
                        <div className="form-group">
                            <input type="text" name="lastName" className="form-input" placeholder="Họ" required />
                        </div>
                        <div className="form-group">
                            <input type="text" name="firstName" className="form-input" placeholder="Tên" required />
                        </div>
                        <div className="form-group">
                            <input type="date" name="birthDate" className="form-input" required />
                        </div>
                        <div className="form-group">
                            <input type="email" name="registerEmail" className="form-input" placeholder="Email" required />
                        </div>
                        <div className="form-group">
                            <input type="password" name="registerPassword" className="form-input" placeholder="Mật khẩu" required />
                        </div>
                        <button type="submit" className="btn-primary-register">Đăng ký</button>
                    </form>

                    <a href="#" className="switch-form-link" onClick={() => setShowRegister(false)}>
                        ← Quay lại đăng nhập
                    </a>
                </div>
            )}
        </div>
    );
}
