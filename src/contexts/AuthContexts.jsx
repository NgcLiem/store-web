"use client";
import { createContext, useContext, useState, useEffect } from "react";
import { mergeLocalCart, getLocalCart } from "@/lib/localCart";

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (typeof window === "undefined") return;
        const savedToken = localStorage.getItem("token");
        const savedUser = localStorage.getItem("user");

        if (!savedToken) {
            setLoading(false);
            return;
        }

        (async () => {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
                    headers: { Authorization: `Bearer ${savedToken}` },
                });
                if (res.ok) {
                    const data = await res.json();
                    setUser(data.user);
                    setToken(savedToken);
                    localStorage.setItem("user", JSON.stringify(data.user));
                } else {
                    // Token hết hạn / sai → xóa
                    localStorage.removeItem("token");
                    localStorage.removeItem("user");
                    setUser(null);
                    setToken(null);
                }
            } catch {
                localStorage.removeItem("token");
                localStorage.removeItem("user");
                setUser(null);
                setToken(null);
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    // Hàm đăng nhập: lưu user + token
    const login = (userData, jwtToken) => {
        setUser(userData);
        setToken(jwtToken);

        // lưu vào localStorage
        localStorage.setItem("user", JSON.stringify(userData));
        localStorage.setItem("token", jwtToken);

        // (tuỳ chọn) giữ lại 3 key cũ cho UI cũ
        localStorage.setItem("userId", userData.id);
        localStorage.setItem("userEmail", userData.email);
        localStorage.setItem("userRole", userData.role);

        // Nếu có giỏ hàng local (guest), merge lên server trong nền
        if (typeof window !== 'undefined') {
            try {
                const local = getLocalCart();
                if (local && local.length) {
                    mergeLocalCart(userData.id, jwtToken)
                        .then((res) => console.log('Merged local cart:', res))
                        .catch((err) => console.warn('Merge local cart failed', err));
                }
            } catch (e) {
                console.warn('Error merging local cart after login', e);
            }
        }
    };

    // 🔹 Đăng xuất: xóa tất cả key
    const logout = () => {
        setUser(null);
        setToken(null);
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        localStorage.removeItem("userId");
        localStorage.removeItem("userEmail");
        localStorage.removeItem("userRole");
    };

    const isAdmin = () => user?.role === "admin";
    const isStaff = () => user?.role === "staff";
    const isCustomer = () => user?.role === "customer";
    const isAuthenticated = () => !!user;

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                loading,
                login,
                logout,
                isAdmin,
                isStaff,
                isCustomer,
                isAuthenticated,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export default AuthProvider;

// Hook tiện dụng
export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within AuthProvider");
    }
    return context;
}
