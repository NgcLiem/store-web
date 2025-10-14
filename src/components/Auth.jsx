"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import "../assets/css/auth.css";

export default function Signup() {
    const [isRegister, setIsRegister] = useState(false);
    const [isForgotPassword, setIsForgotPassword] = useState(false);
    const [animating, setAnimating] = useState(false);
    const [messages, setMessages] = useState({ success: "", error: "" });
    const [loading, setLoading] = useState(false);
    const [birthLimit, setBirthLimit] = useState("");
    const [invalidFields, setInvalidFields] = useState([]);

    const router = useRouter();

    useEffect(() => {
        const eighteenYearsAgo = new Date();
        eighteenYearsAgo.setFullYear(eighteenYearsAgo.getFullYear() - 18);
        setBirthLimit(eighteenYearsAgo.toISOString().split("T")[0]);
    }, []);

    useEffect(() => {
        const handleHashChange = () => {
            const hash = window.location.hash;
            if (hash === "#register") {
                setIsRegister(true);
                setIsForgotPassword(false);
            } else if (hash === "#forgotPassword") {
                setIsForgotPassword(true);
                setIsRegister(false);
            } else {
                setIsRegister(false);
                setIsForgotPassword(false);
            }
        };

        window.addEventListener("popstate", handleHashChange);
        handleHashChange(); // chạy lần đầu

        return () => window.removeEventListener("popstate", handleHashChange);
    }, []);


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

    useEffect(() => {
        const handleClickOutside = (e) => {
            const isClickInsideForm = e.target.closest(".auth-container");
            if (!isClickInsideForm) {
                setMessages({ success: "", error: "" });
            }
        };

        document.addEventListener("click", handleClickOutside);

        // Dọn dẹp khi component bị unmount
        return () => {
            document.removeEventListener("click", handleClickOutside);
        };
    }, []);


    const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    // Đăng nhập
    const handleLogin = async (e) => {
        e.preventDefault();
        const email = e.target.loginEmail.value.trim();
        const password = e.target.loginPassword.value;

        const emptyFields = [];

        if (!email) emptyFields.push("loginEmail");
        if (!password) emptyFields.push("loginPassword");

        if (emptyFields.length > 0) {
            setInvalidFields(emptyFields);
            showMessage("error", "Vui lòng điền đầy đủ thông tin");
            return;
        } else {
            setInvalidFields([]);
        }

        try {
            const res = await fetch("/api/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            const data = await res.json();

            if (!res.ok) {
                showMessage("error", data.error || "Đăng nhập thất bại!");
                return;
            }

            localStorage.setItem("userEmail", data.user.email);
            localStorage.setItem("userRole", data.user.role);

            showMessage("success", "Đăng nhập thành công!");

            setTimeout(() => {
                if (data.user.role === "admin") router.push("/admin");
                else if (data.user.role === "staff") router.push("/staff");
                else router.push("/");
            }, 1000);

        } catch (err) {
            showMessage("error", "Lỗi kết nối server!");
        }
    };

    // Đăng ký
    const handleRegister = async (e) => {
        e.preventDefault();
        const lastName = e.target.lastName.value.trim();
        const firstName = e.target.firstName.value.trim();
        const email = e.target.registerEmail.value.trim();
        const password = e.target.registerPassword.value;
        const confirmPassword = e.target.registerConfirmPassword.value;
        const address = e.target.registerAddress.value.trim();
        const phone = e.target.registerPhone.value.trim();
        const birthDate = e.target.birthDate.value;
        const sex = e.target.gender.value;
        const fullName = `${e.target.lastName.value} ${e.target.firstName.value}`;

        const emptyFields = [];
        if (!lastName) emptyFields.push("lastName");
        if (!firstName) emptyFields.push("firstName");
        if (!email) emptyFields.push("registerEmail");
        if (!password) emptyFields.push("registerPassword");
        if (!confirmPassword) emptyFields.push("registerConfirmPassword");
        if (!address) emptyFields.push("registerAddress");
        if (!phone) emptyFields.push("registerPhone");
        if (!birthDate) emptyFields.push("birthDate");

        if (emptyFields.length > 0) {
            setInvalidFields(emptyFields);
            showMessage("error", "Vui lòng điền đầy đủ thông tin");
            return;
        } else {
            setInvalidFields([]);
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

        try {
            const res = await fetch("/api/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password, fullName, phone, address, sex }),
            });
            console.log(9)
            const data = await res.json();
            console.log(data)
            if (!res.ok) {
                showMessage("error", data.error || "Đăng ký thất bại!");
                return;
            }

            showMessage("success", "Tạo tài khoản thành công! Vui lòng đăng nhập.");
            setTimeout(() => switchToLogin(), 2000);

        } catch (err) {
            showMessage("error", "Lỗi kết nối server!");
        }
    };

    const handleForgotPassword = (e) => {
        e.preventDefault();
        const email = e.target.forgotEmail.value.trim();
        const emptyFields = [];
        if (!email) emptyFields.push("forgotEmail");

        if (emptyFields.length > 0) {
            setInvalidFields(emptyFields);
            showMessage("error", "Vui lòng nhập email");
            return;
        }

        if (!validateEmail(email)) return showMessage("error", "Email không hợp lệ");

        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            showMessage("success", `Đã gửi link khôi phục đến ${email}`);
        }, 1500);
    };

    const switchToRegister = () => {
        setAnimating(true);
        setTimeout(() => {
            setIsRegister(true);
            setIsForgotPassword(false);
            setAnimating(false);
            window.history.pushState({}, "", "/login#register");
        }, 300);
    };
    const switchToLogin = () => {
        setAnimating(true);
        setTimeout(() => {
            setIsRegister(false);
            setIsForgotPassword(false);
            setAnimating(false);
            window.history.pushState({}, "", "/login");
        }, 300);
    };
    const switchToForgotPassword = () => {
        setAnimating(true);
        setTimeout(() => {
            setIsRegister(false);
            setIsForgotPassword(true);
            setAnimating(false);
            window.history.pushState({}, "", "/login#forgotPassword");
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
                            <input type="email"
                                className={`form-input ${invalidFields.includes("loginEmail") ? "input-error" : ""}`}
                                placeholder="Email"
                                name="loginEmail"
                                onChange={(e) => {
                                    setInvalidFields((prev) => prev.filter(f => f !== e.target.name));
                                }}
                            />
                        </div>

                        <div className="form-group">
                            <input type="password"
                                className={`form-input ${invalidFields.includes("loginPassword") ? "input-error" : ""}`}
                                placeholder="Mật Khẩu"
                                name="loginPassword"
                                onChange={(e) => {
                                    setInvalidFields((prev) => prev.filter(f => f !== e.target.name));
                                }}
                            />

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
                        <input type="text"
                            className={`form-input ${invalidFields.includes("lastName") ? "input-error" : ""}`}
                            placeholder="Họ"
                            name="lastName"
                            onChange={(e) => {
                                setInvalidFields((prev) => prev.filter(f => f !== e.target.name));
                            }}
                        />
                        <input type="text"
                            className={`form-input ${invalidFields.includes("firstName") ? "input-error" : ""}`}
                            placeholder="Tên"
                            name="firstName"
                            onChange={(e) => {
                                setInvalidFields((prev) => prev.filter(f => f !== e.target.name));
                            }}
                        />
                        <input type="text"
                            className={`form-input ${invalidFields.includes("registerAddress") ? "input-error" : ""}`}
                            placeholder="Địa chỉ"
                            name="registerAddress"
                            onChange={(e) => {
                                setInvalidFields((prev) => prev.filter(f => f !== e.target.name));
                            }}
                        />
                        <input type="text"
                            className={`form-input ${invalidFields.includes("registerPhone") ? "input-error" : ""}`}
                            placeholder="Số điện thoại"
                            name="registerPhone"
                            onChange={(e) => {
                                setInvalidFields((prev) => prev.filter(f => f !== e.target.name));
                            }}
                        />
                        <div className="radio-group">
                            <label><input type="radio" name="gender" value="Nữ" /> Nữ</label>
                            <label><input type="radio" name="gender" value="Nam" defaultChecked /> Nam</label>
                        </div>
                        <input type="date"
                            className={`form-input ${invalidFields.includes("birthDate") ? "input-error" : ""}`}
                            name="birthDate"
                            max={birthLimit}
                            onChange={(e) => {
                                setInvalidFields((prev) => prev.filter(f => f !== e.target.name));
                            }}
                        />
                        <input type="email"
                            className={`form-input ${invalidFields.includes("registerEmail") ? "input-error" : ""}`}
                            placeholder="Email"
                            name="registerEmail"
                            onChange={(e) => {
                                setInvalidFields((prev) => prev.filter(f => f !== e.target.name));
                            }}
                        />
                        <input type="password"
                            className={`form-input ${invalidFields.includes("registerPassword") ? "input-error" : ""}`}
                            placeholder="Mật khẩu"
                            name="registerPassword"
                            onChange={(e) => {
                                setInvalidFields((prev) => prev.filter(f => f !== e.target.name));
                            }}
                        />
                        <input type="password"
                            className={`form-input ${invalidFields.includes("registerConfirmPassword") ? "input-error" : ""}`}
                            placeholder="Nhập lại mật khẩu"
                            name="registerConfirmPassword"
                            onChange={(e) => {
                                setInvalidFields((prev) => prev.filter(f => f !== e.target.name));
                            }}
                        />
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
                        <input type="email"
                            className={`form-input ${invalidFields.includes("forgotEmail") ? "input-error" : ""}`}
                            placeholder="Email"
                            name="forgotEmail"
                            onChange={(e) => {
                                setInvalidFields((prev) => prev.filter(f => f !== e.target.name));
                            }}
                        />
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
