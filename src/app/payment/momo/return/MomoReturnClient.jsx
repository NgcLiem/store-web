
"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export default function ResetPasswordClient() {
  const router = useRouter();
  const sp = useSearchParams();

  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  // ✅ lấy query string ổn định để làm dependency
  const qs = sp.toString();

  useEffect(() => {
    const t = sp.get("token") || "";
    setToken(t);
  }, [qs]); // ✅ không phụ thuộc trực tiếp sp

  const submit = async (e) => {
    e.preventDefault();
    if (!token) return alert("Thiếu token reset password");
    if (!password || password.length < 6) return alert("Mật khẩu tối thiểu 6 ký tự");
    if (password !== confirm) return alert("Mật khẩu nhập lại không khớp");

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json().catch(() => null);
      if (!res.ok) {
        alert(data?.message || data?.error || "Đổi mật khẩu thất bại");
        return;
      }

      alert("Đổi mật khẩu thành công! Mời đăng nhập.");
      router.replace("/login");
    } catch (err) {
      console.error(err);
      alert("Lỗi mạng");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 24, maxWidth: 420 }}>
      <h2>Reset Password</h2>

      <form onSubmit={submit} style={{ display: "grid", gap: 12, marginTop: 12 }}>
        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Mật khẩu mới"
          type="password"
        />

        <input
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          placeholder="Nhập lại mật khẩu"
          type="password"
        />

        <button disabled={loading} type="submit">
          {loading ? "Đang xử lý..." : "Đổi mật khẩu"}
        </button>
      </form>
    </div>
  );
}
