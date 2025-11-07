"use client";
import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Load user từ localStorage khi app khởi động
        const email = localStorage.getItem("userEmail");
        const role = localStorage.getItem("userRole");
        const userId = localStorage.getItem("userId");

        if (email && role) {
            setUser({ id: userId, email, role });
        }
        setLoading(false);
    }, []);

    const login = (userData) => {
        localStorage.setItem("userId", userData.id);
        localStorage.setItem("userEmail", userData.email);
        localStorage.setItem("userRole", userData.role);
        setUser(userData);
    };

    const logout = () => {
        localStorage.removeItem("userId");
        localStorage.removeItem("userEmail");
        localStorage.removeItem("userRole");
        setUser(null);
    };

    const isAdmin = () => user?.role === "admin";
    const isStaff = () => user?.role === "staff";
    const isCustomer = () => user?.role === "customer";
    const isAuthenticated = () => !!user;

    return (
        <AuthContext.Provider
            value={{
                user,
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

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within AuthProvider");
    }
    return context;
}