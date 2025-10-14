"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminPage() {
    const router = useRouter();

    useEffect(() => {
        const role = localStorage.getItem("userRole");
        if (role !== "admin") {
            alert("Bạn không có quyền truy cập trang này!");
            router.push("/");
        }
    }, []);

    return (
        <main style={{ padding: "2rem" }}>
            <h1>👑 Trang quản trị Admin</h1>
            <p>Chỉ dành cho admin.</p>
        </main>
    );
}
