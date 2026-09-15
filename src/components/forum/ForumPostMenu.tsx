"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useDialog } from "@/components/ui/DialogProvider";

export default function ForumPostMenu({ postId }: { postId: string }) {
  const router = useRouter();
  const { confirm } = useDialog();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  async function handleDelete(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!(await confirm({ message: "Xoá bài viết này?", danger: true }))) return;
    await fetch(`/api/forum/posts/${postId}`, { method: "DELETE" });
    setOpen(false);
    router.refresh();
  }

  return (
    <div ref={ref} className="relative pointer-events-auto">
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setOpen((o) => !o);
        }}
        className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-100 transition"
        aria-label="Tuỳ chọn bài viết"
      >
        <i className="fa-solid fa-ellipsis" aria-hidden="true" />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 w-40 bg-white rounded-xl shadow-xl ring-1 ring-black/5 py-1 z-20">
          <button
            type="button"
            onClick={handleDelete}
            className="w-full flex items-center gap-2 text-left text-sm text-brand-red hover:bg-brand-redBg px-3 py-2 transition"
          >
            <i className="fa-solid fa-trash" aria-hidden="true" /> Xoá bài viết
          </button>
        </div>
      )}
    </div>
  );
}
