"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminRankEditor({
  endpoint,
  field,
  currentRank,
}: {
  endpoint: string;
  field: string;
  currentRank: number | null;
}) {
  const router = useRouter();
  const [value, setValue] = useState(currentRank?.toString() ?? "");
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    await fetch(endpoint, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [field]: value.trim() === "" ? null : Number(value) }),
    });
    setSaving(false);
    router.refresh();
  }

  return (
    <div className="flex items-center gap-1.5">
      <input
        type="number"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Tự động"
        className="w-16 border border-slate-200 rounded-lg px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-brand-blue/40"
      />
      <button
        onClick={save}
        disabled={saving}
        className="text-xs font-bold text-brand-blue hover:bg-sky-50 rounded-lg px-2 py-1 transition disabled:opacity-50"
      >
        {saving ? "..." : "Ghim"}
      </button>
    </div>
  );
}
