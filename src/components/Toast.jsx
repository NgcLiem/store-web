"use client";
import { createContext, useContext, useState, useCallback } from "react";
import "../assets/css/services.css";

const ToastContext = createContext();

export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([]);

    const showToast = useCallback((message, type = "success") => {
        const id = Date.now();

        const audio = new Audio("/sounds/notify.mp3");
        audio.volume = 0.3;
        audio.play().catch(() => { });

        setToasts((prev) => [...prev, { id, message, type }]);

        setTimeout(() => removeToast(id), 3200);
    }, []);

    const removeToast = (id) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    };

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}

            <div className="toast-container">
                {toasts.map((t) => (
                    <div key={t.id} className={`toast toast-${t.type}`}>
                        <div className="toast-icon-wrap">
                            {t.type === "success" ? (
                                <i className="fa-solid fa-circle-check"></i>
                            ) : (
                                <i className="fa-solid fa-circle-exclamation"></i>
                            )}
                        </div>

                        <div className="toast-content">
                            <span>{t.message}</span>
                            <div className="toast-progress"></div>
                        </div>

                        <button className="toast-close" onClick={() => removeToast(t.id)}>
                            <i className="fa-solid fa-xmark"></i>
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
