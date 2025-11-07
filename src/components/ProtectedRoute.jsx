// src/components/ProtectedRoute.jsx
"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContexts";

export default function ProtectedRoute({ children, allowedRoles = [] }) {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (loading) return; // Đợi load xong

        // Chưa đăng nhập
        if (!user) {
            router.push("/login");
            return;
        }

        // Kiểm tra quyền truy cập
        if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
            // Chuyển hướng theo role
            if (user.role === "admin") {
                router.push("/admin");
            } else if (user.role === "staff") {
                router.push("/staff");
            } else {
                router.push("/");
            }
        }
    }, [user, loading, router, allowedRoles]);

    // Đang load
    if (loading) {
        return (
            <div style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "100vh"
            }}>
                <div>Đang tải...</div>
            </div>
        );
    }

    // Không có quyền
    if (!user || (allowedRoles.length > 0 && !allowedRoles.includes(user.role))) {
        return null;
    }

    return <>{children}</>;
}