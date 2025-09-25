"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import "../assets/css/auth.css";

export default function Signup() {
    const [isRegister, setIsRegister] = useState(false);
    const [isForgotPassword, setIsForgotPassword] = useState(false);

    const [messages, setMessages] = useState({ success: "", error: "" });
    const [loading, setLoading] = useState(false);

    const [LoginEmail, setLoginEmail] = useState("");

    const [loginPassword, setLoginPassword] = useState("");
    const [registerEmail, setRegisterEmail] = useState("");
    const [birthDate, setBirthDate] = useState("");

    const router = useRouter();

    useEffect(() => {
        const eighteenYearsAgo = new Date();
        eighteenYearsAgo.setFullYear(eighteenYearsAgo.getFullYear() - 18);
        setBirthDate(eighteenYearsAgo.toISOString().split("T")[0]);
    }, []);

    const showMessage = (type, text) => {
        setMessages({ [type]: text });
        setTimeout(() => setMessages({ success: "", error: "" }), 3000);
    };

    const validateEmail = (email) =>
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    const handleLogin = (e) => {
        e.preventDefault();
        const email = e.target.loginEmail.value;
        const password = e.target.loginPassword.value;
        if (!email || !password) {
            showMessage("error", "Vui lòng điền đầy đủ thông tin");
            return;
        }
        if (email === "demo@123.com" || loginPassword === "123456") {
            showMessage("success", "Đăng nhập thành công! Chuyển hướng...");

            setTimeout(() => {
                const redirectPath = localStorage.getItem("redirectAfterLogin") || "/";
                router.push(redirectPath);
            }, 1000);
        }
        else {
            showMessage("error", "Email hoặc mật khẩu không đúng");
        }
    };

    const handleRegister = (e) => {
        e.preventDefault();
        const firstName = e.target.firstName.value;
        const lastName = e.target.lastName.value;
        const email = e.target.registerEmail.value;
        const password = e.target.registerPassword.value;
        const birthDate = e.target.birthDate.value;

        if (!firstName || !lastName || !email || !password || !birthDate) {
            return showMessage("error", "Vui lòng điền đầy đủ thông tin");
        }
        if (password.length < 6) {
            return showMessage("error", "Mật khẩu phải có ít nhất 6 ký tự");
        }
        const age = new Date().getFullYear() - new Date(birthDate).getFullYear();

        // if (age < 13) {
        //     showMessage("error", "Bạn phải đủ 13 tuổi trở lên mới được đăng ký");
        //     return;
        // }

        if (validateEmail(email)) {
            showMessage("error", "Email không đúng định dạng");
            return;
        }

        showMessage("success", `Tài khoản đã được tạo thành công cho ${firstName} ${lastName}!`);
        setTimeout(() => {
            setIsRegister(false);
            setLoginEmail(registerEmail);
            showMessage("success", "Tài khoản đã được tạo! Vui lòng đăng nhập.");
        }, 2000);
    };


    return (
        <div className="auth-container">
            {!isRegister && !isForgotPassword && (
                <div className="form-container-login">
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
                            Khách hàng mới?{" "}
                            <a href="#" onClick={() => setIsRegister(true)}>
                                Tạo tài khoản
                            </a>
                        </div>
                        <div style={{ marginTop: "0.5rem" }}>
                            Quên mật khẩu?{" "}
                            <a href="#" onClick={() => setIsForgotPassword(true)}>
                                Khôi phục mật khẩu
                            </a>
                        </div>
                    </div>
                </div>
            )}

            {isRegister && (
                <div className="form-container-register">
                    <div className="breadcrumb">
                        <a href="/">Trang chủ</a> &gt;{" "}
                        <a href="#" onClick={() => setIsRegister(false)}>
                            Đăng nhập
                        </a>{" "}
                        &gt; Tạo tài khoản
                    </div>
                    <div className="form-header">
                        <h2 className="form-title">Tạo tài khoản</h2>
                    </div>

                    {messages.success && <div className="success-message">{messages.success}</div>}
                    {messages.error && <div className="error-message">{messages.error}</div>}

                    <form onSubmit={handleRegister}>
                        <div className="form-group-register">
                            <input type="text" className="form-input" placeholder="Họ" name="lastName" />
                        </div>
                        <div className="form-group-register">
                            <input type="text" className="form-input" placeholder="Tên" name="firstName" />
                        </div>
                        <div className="radio-group">
                            <label className="radio-item">
                                <input type="radio" name="gender" value="female" className="radio-input" /> Nữ
                            </label>
                            <label className="radio-item">
                                <input type="radio" name="gender" value="male" defaultChecked className="radio-input" /> Nam
                            </label>
                        </div>
                        <div className="form-group-register">
                            <input type="date" className="form-input" name="birthDate" />
                        </div>
                        <div className="form-group-register">
                            <input type="email" className="form-input" placeholder="Email" name="registerEmail" />
                        </div>
                        <div className="form-group-register">
                            <input type="password" className="form-input" placeholder="Mật khẩu" name="registerPassword" />
                        </div>
                        <button type="submit" className={`btn-primary-register ${loading ? "btn-loading" : ""}`}>
                            Đăng ký
                        </button>
                    </form>

                    <a href="#" className="switch-form-link" onClick={() => setIsRegister(false)}>
                        ← Quay lại trang đăng nhập
                    </a>
                </div>
            )}

            {isForgotPassword && (
                <div className="form-container-forgot">
                    <div className="breadcrumb">
                        <a href="/">Trang chủ</a> &gt;{" "}
                        <a href="#" onClick={() => setIsForgotPassword(false)}>
                            Đăng nhập
                        </a>{" "}
                        &gt; Khôi phục mật khẩu
                    </div>

                    <div className="form-header">
                        <h2 className="form-title">Khôi phục mật khẩu</h2>
                        <p className="form-subtitle">
                            Nhập email của bạn để nhận liên kết đặt lại mật khẩu
                        </p>
                    </div>

                    {messages.success && <div className="success-message">{messages.success}</div>}
                    {messages.error && <div className="error-message">{messages.error}</div>}

                    <form onSubmit={(e) => {
                        e.preventDefault();
                        const email = e.target.forgotEmail.value;
                        if (!email) {
                            showMessage("error", "Vui lòng nhập email");
                            return;
                        }
                        if (!validateEmail(email)) {
                            showMessage("error", "Vui lòng nhập email hợp lệ");
                            return;
                        }
                        setLoading(true);
                        showMessage("success", "");
                        setTimeout(() => {
                            setLoading(false);
                            showMessage(`Link khôi phục mật khẩu đã được gửi tới ${email}`, "",);
                        }, 3000);
                    }}
                    >
                        <div className="form-group">
                            <input
                                type="email"
                                className="form-input"
                                placeholder="Email"
                                name="forgotEmail"
                            />
                        </div>
                        <button type="submit" className={`btn-primary ${loading ? "btn-loading" : ""}`}
                        >
                            Gửi liên kết
                        </button>
                    </form>

                    <a href="#" className="switch-form-link" onClick={() => setIsForgotPassword(false)}>
                        ← Quay lại trang đăng nhập
                    </a>

                </div>
            )
            }
        </div >
    );
}
