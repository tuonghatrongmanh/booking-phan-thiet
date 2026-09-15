"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useDialog } from "@/components/ui/DialogProvider";
import { SECTION_LABELS, type AdminPermissions, type PermMode, type SectionKey } from "@/lib/admin-permissions";

const MODE_LABEL: Record<PermMode, string> = {
  none: "Không có quyền",
  direct: "Làm trực tiếp",
  approval: "Cần duyệt",
  own: "Chỉ nội dung của mình",
};

const SECTIONS = Object.keys(SECTION_LABELS) as SectionKey[];

function emptyPerm() {
  return { access: false, create: "none" as PermMode, edit: "none" as PermMode, delete: "none" as PermMode, hide: "none" as PermMode };
}

export default function StaffPermissionsEditor({
  staffId,
  initialPermissions,
}: {
  staffId: string;
  initialPermissions: AdminPermissions;
}) {
  const router = useRouter();
  const { toast } = useDialog();
  const [permissions, setPermissions] = useState<AdminPermissions>(initialPermissions);
  const [saving, setSaving] = useState(false);

  function update(section: SectionKey, patch: Partial<ReturnType<typeof emptyPerm>>) {
    setPermissions((prev) => ({
      ...prev,
      [section]: { ...(prev[section] ?? emptyPerm()), ...patch },
    }));
  }

  async function handleSave() {
    setSaving(true);
    const res = await fetch(`/api/admin/staff/${staffId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ permissions }),
    });
    setSaving(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      toast(typeof data.error === "string" ? data.error : "Lưu thất bại", "error");
      return;
    }
    toast("Đã lưu phân quyền", "success");
    router.refresh();
  }

  return (
    <div className="bg-white rounded-2xl shadow-card p-5 sm:p-6">
      <p className="font-bold text-slate-700 mb-1">Phân quyền theo từng mục</p>
      <p className="text-xs text-slate-400 mb-4">Tắt &quot;Truy cập&quot; để ẩn hẳn mục đó khỏi menu của nhân viên này.</p>

      <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[820px]">
          <thead className="bg-slate-50 text-slate-500 text-left">
            <tr>
              <th className="px-3 py-2.5 font-semibold">Mục</th>
              <th className="px-3 py-2.5 font-semibold">Truy cập</th>
              <th className="px-3 py-2.5 font-semibold">Thêm mới</th>
              <th className="px-3 py-2.5 font-semibold">Sửa</th>
              <th className="px-3 py-2.5 font-semibold">Xóa</th>
              <th className="px-3 py-2.5 font-semibold">Ẩn</th>
            </tr>
          </thead>
          <tbody>
            {SECTIONS.map((section) => {
              const perm = permissions[section] ?? emptyPerm();
              return (
                <tr key={section} className="border-t border-slate-100">
                  <td className="px-3 py-2 text-slate-700 whitespace-nowrap">{SECTION_LABELS[section]}</td>
                  <td className="px-3 py-2">
                    <input
                      type="checkbox"
                      checked={perm.access}
                      onChange={(e) => update(section, { access: e.target.checked })}
                      className="w-4 h-4 accent-brand-blue"
                    />
                  </td>
                  {(["create", "edit", "delete", "hide"] as const).map((action) => (
                    <td key={action} className="px-3 py-2">
                      <select
                        value={perm[action]}
                        disabled={!perm.access}
                        onChange={(e) => update(section, { [action]: e.target.value as PermMode })}
                        className="border border-slate-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-brand-blue/40 disabled:opacity-40 disabled:bg-slate-50"
                      >
                        {(Object.keys(MODE_LABEL) as PermMode[]).map((m) => (
                          <option key={m} value={m}>
                            {MODE_LABEL[m]}
                          </option>
                        ))}
                      </select>
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <button
        type="button"
        disabled={saving}
        onClick={handleSave}
        className="mt-5 bg-brand-blue text-white font-bold rounded-xl px-6 py-2.5 hover:brightness-95 transition disabled:opacity-50"
      >
        {saving ? "Đang lưu..." : "Lưu phân quyền"}
      </button>
    </div>
  );
}
