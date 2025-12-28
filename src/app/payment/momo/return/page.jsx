"use client";

import { Suspense, useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContexts";
import { useToast } from "@/components/Toast";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

function MomoReturnHandlerInner() {
  const router = useRouter();
  const sp = useSearchParams();
  const { token } = useAuth();
  const { showToast } = useToast();

  // ✅ ổn định dependency
  const qs = useMemo(() => sp.toString(), [sp]);

  useEffect(() => {
    const resultCode = Number(sp.get("resultCode") ?? "-1");
    const orderId = sp.get("orderId");

    const run = async () => {
      if (resultCode === 0) {
        showToast("Thanh toán MoMo thành công!", "success");

        // (tuỳ bạn) xoá cart ở client
        if (token) {
          try {
            await fetch(`${API_BASE}/cart/clear`, {
              method: "DELETE",
              headers: { Authorization: `Bearer ${token}` },
            });
          } catch {}
        }

        router.replace("/account/orders");
        return;
      }

      showToast("Thanh toán MoMo thất bại hoặc bị huỷ", "error");
      router.replace(orderId ? "/account/orders" : "/checkout");
    };

    run();
  }, [qs, router, token, showToast]); // ✅ dùng qs, không dùng sp trực tiếp

  return (
    <div style={{ padding: 24 }}>
      <h2>Đang xử lý kết quả thanh toán...</h2>
      <p>Vui lòng không đóng trang.</p>
    </div>
  );
}

export const dynamic = "force-dynamic"; // ✅ tránh prerender static gây lỗi build

export default function Page() {
  return (
    <Suspense
      fallback={
        <div style={{ padding: 24 }}>
          <h2>Loading...</h2>
        </div>
      }
    >
      <MomoReturnHandlerInner />
    </Suspense>
  );
}
