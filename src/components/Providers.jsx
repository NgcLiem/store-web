"use client";

import AuthProvider from "../contexts/AuthContexts";

export default function Providers({ children }) {
    return (
        <AuthProvider>
            {children}
        </AuthProvider>
    );
}