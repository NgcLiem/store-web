// src/components/AppShell.jsx
"use client";

import { useAuth } from "../contexts/AuthContexts";
import Header from "./Header";
import Footer from "./Footer";

export default function AppShell({ children }) {
    const { user, loading } = useAuth();

    if (loading) return <main>{children}</main>;

    const role = user?.role?.toLowerCase?.();
    const hideLayout = role === "admin" || role === "staff";

    return (
        <>
            {!hideLayout && <Header />}
            <main>{children}</main>
            {!hideLayout && <Footer />}
        </>
    );
}
