"use client";

import { useRouter } from "next/navigation";
import "../assets/css/loginRequiredModal.css";

export default function LoginRequiredModal({
    open,
    onClose,
    message = "Bạn cần đăng nhập để thanh toán.",
    callback = "/checkout",
}) {
    const router = useRouter();
    if (!open) return null;

    const goLogin = () => {
        onClose?.();
        router.push(`/login?callback=${encodeURIComponent(callback)}`);
    };

    return (
        <div className="lrm-overlay" onClick={onClose}>
            <div className="lrm-modal" onClick={(e) => e.stopPropagation()}>
                <h3 className="lrm-title">Yêu cầu đăng nhập</h3>
                <p className="lrm-desc">{message}</p>

                <div className="lrm-actions">
                    <button className="lrm-btn lrm-cancel" onClick={onClose}>
                        Huỷ
                    </button>
                    <button className="lrm-btn lrm-primary" onClick={goLogin}>
                        Đăng nhập
                    </button>
                </div>
            </div>
        </div>
    );
}
