"use client";

import { useRef } from "react";

const HASHTAG_SPLIT_RE = /(#[\p{L}\p{N}_]+)/gu;
const HASHTAG_TEST_RE = /^#[\p{L}\p{N}_]+$/u;

// Textarea that highlights #hashtag trong luc go, va cho phep dan (paste) anh truc tiep.
// Ky thuat: textarea that (chu trong suot, chi hien con tro) chong len 1 div backdrop
// ve lai dung noi dung voi #hashtag to mau xanh - giu nguyen hanh vi native cua textarea
// (undo/redo, IME go tieng Viet co dau, selection...) thay vi dung contentEditable.
export default function HighlightedTextarea({
  value,
  onChange,
  onPasteFiles,
  placeholder,
  rows = 4,
  className = "",
  autoFocus,
}: {
  value: string;
  onChange: (value: string) => void;
  onPasteFiles?: (files: File[]) => void;
  placeholder?: string;
  rows?: number;
  className?: string;
  autoFocus?: boolean;
}) {
  const taRef = useRef<HTMLTextAreaElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);

  function syncScroll() {
    if (backdropRef.current && taRef.current) {
      backdropRef.current.scrollTop = taRef.current.scrollTop;
      backdropRef.current.scrollLeft = taRef.current.scrollLeft;
    }
  }

  function handlePaste(e: React.ClipboardEvent<HTMLTextAreaElement>) {
    const files = Array.from(e.clipboardData?.files ?? []).filter((f) => f.type.startsWith("image/"));
    if (files.length > 0 && onPasteFiles) {
      e.preventDefault();
      onPasteFiles(files);
    }
  }

  const parts = value.split(HASHTAG_SPLIT_RE);

  return (
    <div className={`relative border border-slate-200 rounded-xl focus-within:ring-2 focus-within:ring-brand-blue/40 ${className}`}>
      <div
        ref={backdropRef}
        aria-hidden="true"
        className="absolute inset-0 whitespace-pre-wrap break-words px-3 py-2.5 text-[15px] leading-relaxed pointer-events-none overflow-hidden"
      >
        {parts.map((part, i) =>
          HASHTAG_TEST_RE.test(part) ? (
            <span key={i} className="text-brand-blue font-semibold">
              {part}
            </span>
          ) : (
            <span key={i}>{part}</span>
          )
        )}
        {value.endsWith("\n") && "​"}
      </div>
      <textarea
        ref={taRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onScroll={syncScroll}
        onPaste={handlePaste}
        rows={rows}
        placeholder={placeholder}
        autoFocus={autoFocus}
        className="relative w-full bg-transparent resize-none px-3 py-2.5 text-[15px] leading-relaxed text-transparent caret-slate-900 focus:outline-none placeholder:text-slate-400"
      />
    </div>
  );
}
