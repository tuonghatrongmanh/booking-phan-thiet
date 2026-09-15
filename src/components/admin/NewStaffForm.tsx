"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useDialog } from "@/components/ui/DialogProvider";

export default function NewStaffForm() {
  const router = useRouter();
  const { toast } = useDialog();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    setError(null);
    setSaving(true);
    const res = await fetch("/api/admin/staff", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });
    const data = await res.json().catch(() => ({}));
    setSaving(false);

    if (!res.ok) {
      setError(typeof data.error === "string" ? data.error : "Có lỗi xảy ra");
      return;
    }
    toast("Đã tạo tài khoản nhân viên", "success");
    router.push(`/admin/staff/${data.id}`);
  }

  return (
    <div className="bg-white rounded-2xl shadow-card p-6 space-y-4">
      <div>
        <label className="text-[13px] text-slate-500 font-medium mb-1 block">Họ và tên</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-brand-blue/40"
        />
      </div>
      <div>
        <label className="text-[13px] text-slate-500 font-medium mb-1 block">Email đăng nhập</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-brand-blue/40"
        />
      </div>
      <div>
        <label className="text-[13px] text-slate-500 font-medium mb-1 block">Mật khẩu tạm</label>
        <input
          type="text"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Tối thiểu 6 ký tự"
          className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-brand-blue/40"
        />
      </div>
      {error && <p className="text-sm text-brand-red">{error}</p>}
      <button
        type="button"
        disabled={saving || !name || !email || password.length < 6}
        onClick={handleSubmit}
        className="w-full bg-brand-blue text-white font-bold rounded-xl px-4 py-2.5 hover:brightness-95 transition disabled:opacity-50"
      >
        {saving ? "Đang tạo..." : "Tạo tài khoản"}
      </button>
    </div>
  );
}
