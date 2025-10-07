"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import "../assets/css/auth.css";

export default function Signup() {
    const [isRegister, setIsRegister] = useState(false);
    const [isForgotPassword, setIsForgotPassword] = useState(false);
    const [animating, setAnimating] = useState(false);
    const [messages, setMessages] = useState({ success: "", error: "" });
    const [loading, setLoading] = useState(false);
    const [birthLimit, setBirthLimit] = useState("");

    const router = useRouter();

    useEffect(() => {
        const eighteenYearsAgo = new Date();
        eighteenYearsAgo.setFullYear(eighteenYearsAgo.getFullYear() - 18);
        setBirthLimit(eighteenYearsAgo.toISOString().split("T")[0]);
    }, []);

    const showMessage = (type, text) => {
        if (!text) return;
        setMessages({
            success: type === "success" ? text : "",
            error: type === "error" ? text : ""
        });
        setTimeout(() => setMessages({ success: "", error: "" }), 3000);
    };

    const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    // Đăng nhập
    const handleLogin = (e) => {
        e.preventDefault();
        const email = e.target.loginEmail.value;
        const password = e.target.loginPassword.value;

        if (!email || !password) {
            return showMessage("error", "Vui lòng điền đầy đủ thông tin");
        }

        // Giả lập đăng nhập thành công
        if (email === "demo@123.com" && password === "123456") {
            showMessage("success", "Đăng nhập thành công! Chuyển hướng...");
            setTimeout(() => {
                const redirectPath = localStorage.getItem("redirectAfterLogin") || "/";
                router.push(redirectPath);
            }, 1000);
        } else {
            showMessage("error", "Email hoặc mật khẩu không đúng");
        }
    };

    // Đăng ký
    const handleRegister = (e) => {
        e.preventDefault();
        const firstName = e.target.firstName.value.trim();
        const lastName = e.target.lastName.value.trim();
        const email = e.target.registerEmail.value.trim();
        const password = e.target.registerPassword.value;
        const confirmPassword = e.target.registerConfirmPassword.value;
        const address = e.target.registerAddress.value.trim();
        const phone = e.target.registerPhone.value.trim();
        const birthDate = e.target.birthDate.value;

        if (!firstName || !lastName || !email || !password || !confirmPassword || !address || !phone || !birthDate) {
            return showMessage("error", "Vui lòng điền đầy đủ thông tin");
        }
        if (password.length < 6) {
            return showMessage("error", "Mật khẩu phải có ít nhất 6 ký tự");
        }
        if (password !== confirmPassword) {
            return showMessage("error", "Mật khẩu nhập lại không khớp");
        }
        if (!/^\d{9,11}$/.test(phone)) {
            return showMessage("error", "Số điện thoại không hợp lệ");
        }
        if (!validateEmail(email)) {
            return showMessage("error", "Email không đúng định dạng");
        }

        showMessage("success", `Tài khoản ${firstName} ${lastName} đã được tạo!`);
        setTimeout(() => {
            setIsRegister(false);
            showMessage("success", "Vui lòng đăng nhập bằng tài khoản vừa tạo.");
        }, 2000);
    };

    // Quên mật khẩu
    const handleForgotPassword = (e) => {
        e.preventDefault();
        const email = e.target.forgotEmail.value;
        if (!email) return showMessage("error", "Vui lòng nhập email");
        if (!validateEmail(email)) return showMessage("error", "Email không hợp lệ");

        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            showMessage("success", `Đã gửi link khôi phục đến ${email}`);
        }, 1500);
    };

    // Hiệu ứng chuyển form
    const switchToRegister = () => {
        setAnimating(true);
        setTimeout(() => {
            setIsRegister(true);
            setIsForgotPassword(false);
            setAnimating(false);
        }, 300);
    };
    const switchToLogin = () => {
        setAnimating(true);
        setTimeout(() => {
            setIsRegister(false);
            setIsForgotPassword(false);
            setAnimating(false);
        }, 300);
    };
    const switchToForgotPassword = () => {
        setAnimating(true);
        setTimeout(() => {
            setIsRegister(false);
            setIsForgotPassword(true);
            setAnimating(false);
        }, 300);
    };

    return (
        <div className="auth-container">
            {/* --- Đăng nhập --- */}
            {!isRegister && !isForgotPassword && (
                <div className={`form-container-login ${animating ? "fade-out" : "fade-in"}`}>
                    <div className="breadcrumb">
                        <a href="/">Trang chủ</a> &gt; Đăng nhập
                    </div>
                    <div className="form-header">
                        <h2 className="form-title">Đăng nhập tài khoản</h2>
                        <p className="form-subtitle">Nhập email và mật khẩu của bạn</p>
                    </div>

                    {messages.success && <div className="success-message">{messages.success}</div>}
                    {messages.error && <div className="error-message">{messages.error}</div>}

                    <form onSubmit={handleLogin}>
                        <div className="form-group">
                            <input type="email" className="form-input" placeholder="Email" name="loginEmail" />
                        </div>
                        <div className="form-group">
                            <input type="password" className="form-input" placeholder="Mật khẩu" name="loginPassword" />
                        </div>
                        <button type="submit" className={`btn-primary ${loading ? "btn-loading" : ""}`}>
                            Đăng nhập
                        </button>
                    </form>

                    <div className="form-links">
                        <div>
                            Khách hàng mới? <a href="#" onClick={switchToRegister}>Tạo tài khoản</a>
                        </div>
                        <div style={{ marginTop: "0.5rem" }}>
                            Quên mật khẩu? <a href="#" onClick={switchToForgotPassword}>Khôi phục mật khẩu</a>
                        </div>
                    </div>
                </div>
            )}

            {/* --- Đăng ký --- */}
            {isRegister && (
                <div className={`form-container-register ${animating ? "fade-out" : "fade-in"}`}>
                    <div className="breadcrumb">
                        <a href="/">Trang chủ</a> &gt; <a href="#" onClick={switchToLogin}>Đăng nhập</a> &gt; Tạo tài khoản
                    </div>
                    <div className="form-header">
                        <h2 className="form-title">Tạo tài khoản</h2>
                    </div>

                    {messages.success && <div className="success-message">{messages.success}</div>}
                    {messages.error && <div className="error-message">{messages.error}</div>}

                    <form onSubmit={handleRegister}>
                        <input type="text" className="form-input" placeholder="Họ" name="lastName" />
                        <input type="text" className="form-input" placeholder="Tên" name="firstName" />
                        <input type="text" className="form-input" placeholder="Địa chỉ" name="registerAddress" />
                        <input type="text" className="form-input" placeholder="Số điện thoại" name="registerPhone" />
                        <div className="radio-group">
                            <label><input type="radio" name="gender" value="female" /> Nữ</label>
                            <label><input type="radio" name="gender" value="male" defaultChecked /> Nam</label>
                        </div>
                        <input type="date" className="form-input" name="birthDate" max={birthLimit} />
                        <input type="email" className="form-input" placeholder="Email" name="registerEmail" />
                        <input type="password" className="form-input" placeholder="Mật khẩu" name="registerPassword" />
                        <input type="password" className="form-input" placeholder="Nhập lại mật khẩu" name="registerConfirmPassword" />
                        <button type="submit" className={`btn-primary-register ${loading ? "btn-loading" : ""}`}>
                            Đăng ký
                        </button>
                    </form>
                    <a href="#" className="switch-form-link" onClick={switchToLogin}>
                        ← Quay lại trang đăng nhập
                    </a>
                </div>
            )}

            {/* --- Quên mật khẩu --- */}
            {isForgotPassword && (
                <div className={`form-container-forgot ${animating ? "fade-out" : "fade-in"}`}>
                    <div className="breadcrumb">
                        <a href="/">Trang chủ</a> &gt; <a href="#" onClick={switchToLogin}>Đăng nhập</a> &gt; Khôi phục mật khẩu
                    </div>
                    <div className="form-header">
                        <h2 className="form-title">Khôi phục mật khẩu</h2>
                        <p className="form-subtitle">Nhập email của bạn để nhận liên kết đặt lại mật khẩu</p>
                    </div>
                    {messages.success && <div className="success-message">{messages.success}</div>}
                    {messages.error && <div className="error-message">{messages.error}</div>}
                    <form onSubmit={handleForgotPassword}>
                        <input type="email" className="form-input" placeholder="Email" name="forgotEmail" />
                        <button type="submit" className={`btn-primary ${loading ? "btn-loading" : ""}`}>
                            Gửi liên kết
                        </button>
                    </form>
                    <a href="#" className="switch-form-link" onClick={switchToLogin}>
                        ← Quay lại trang đăng nhập
                    </a>
                </div>
            )}
        </div>
    );
}
