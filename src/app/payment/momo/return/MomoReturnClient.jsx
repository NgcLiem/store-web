"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContexts";
import { useToast } from "@/components/Toast";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export default function MomoReturnHandler() {
  const router = useRouter();
  const sp = useSearchParams();
  const { token } = useAuth();
  const { showToast } = useToast();

  const qs = sp.toString();

  useEffect(() => {
    const resultCode = Number(sp.get("resultCode") || "-1");
    const orderId = sp.get("orderId");

    (async () => {
      if (resultCode === 0) {
        showToast("Thanh toán MoMo thành công!", "success");

        if (token && API_BASE) {
          await fetch(`${API_BASE}/cart/clear`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
          }).catch(() => {});
        }

        router.replace("/account/orders");
        return;
      }

      showToast("Thanh toán MoMo thất bại hoặc bị huỷ", "error");
      router.replace(orderId ? "/account/orders" : "/checkout");
    })();
  }, [qs, router, token, showToast, sp]);

  return (
    <div style={{ padding: 24 }}>
      <h2>Đang xử lý kết quả thanh toán...</h2>
      <p>Vui lòng không đóng trang.</p>
    </div>
  );
}
