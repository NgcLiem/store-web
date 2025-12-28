"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContexts";
import { useToast } from "@/components/Toast";

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

function MomoReturnHandler() {
    const router = useRouter();
    const sp = useSearchParams();
    const { token } = useAuth();
    const { showToast } = useToast();

    useEffect(() => {
        const resultCode = Number(sp.get("resultCode") || "-1");
        const orderId = sp.get("orderId");

        (async () => {
            if (resultCode === 0) {
                showToast("Thanh toán MoMo thành công!", "success");

                // (tuỳ bạn) xoá cart ở client
                if (token) {
                    await fetch(`${API_BASE}/cart/clear`, {
                        method: "DELETE",
                        headers: { Authorization: `Bearer ${token}` },
                    }).catch(() => { });
                }

                router.replace("/account/orders");
                return;
            }

            showToast("Thanh toán MoMo thất bại hoặc bị huỷ", "error");
            // nếu muốn quay lại xem đơn:
            if (orderId) router.replace(`/account/orders`);
            else router.replace("/checkout");
        })();
    }, [sp, router, token, showToast]);

    return (
        <div style={{ padding: 24 }}>
            <h2>Đang xử lý kết quả thanh toán...</h2>
            <p>Vui lòng không đóng trang.</p>
        </div>
    );
}

export const dynamic = "force-dynamic"; // tránh prerender static

export default function Page() {
    return (
        <Suspense fallback={<div style={{ padding: 24 }}><h2>Loading...</h2></div>}>
            <MomoReturnHandler />
        </Suspense>
    );
}
