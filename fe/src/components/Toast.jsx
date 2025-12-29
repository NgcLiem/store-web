"use client";
import { createContext, useContext, useState, useCallback, useRef } from "react";
import "../assets/css/toast.css";

const ToastContext = createContext({ showToast: () => { } });

function uid() {
    if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
    return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([]);
    const lastRef = useRef({ at: 0, msg: "", type: "" });

    const removeToast = useCallback((id) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    const showToast = useCallback(
        (message, type = "success") => {
            const now = Date.now();

            if (
                lastRef.current.msg === message &&
                lastRef.current.type === type &&
                now - lastRef.current.at < 500
            ) {
                return;
            }
            lastRef.current = { at: now, msg: message, type };

            const id = uid();

            setToasts((prev) => [...prev, { id, message, type }]);

            window.setTimeout(() => removeToast(id), 3200);
        },
        [removeToast]
    );

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}

            <div className="toast-container" role="region" aria-label="Notifications">
                {toasts.map((t) => (
                    <div key={t.id} className={`toast toast-${t.type}`} role="status" aria-live="polite">
                        <div className="toast-icon-wrap" aria-hidden="true">
                            {t.type === "success" ? (
                                <i className="fa-solid fa-circle-check" />
                            ) : (
                                <i className="fa-solid fa-circle-exclamation" />
                            )}
                        </div>

                        <div className="toast-content">
                            <span>{t.message}</span>
                            <div className="toast-progress" />
                        </div>

                        <button className="toast-close" onClick={() => removeToast(t.id)} aria-label="Close">
                            <i className="fa-solid fa-xmark" />
                        </button>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
}

export function useToast() {
    return useContext(ToastContext);
}
