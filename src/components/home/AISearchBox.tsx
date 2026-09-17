"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import type { SearchResultItem } from "@/lib/search";

const SUGGESTED_QUESTIONS = [
  "Homestay nào còn trống cuối tuần này?",
  "Săn ưu đãi homestay như thế nào?",
  "Quán nhậu ngon, view đẹp ở Phan Thiết?",
  "KDL La Ngâu có gì hấp dẫn?",
];

const TYPE_LABEL: Record<SearchResultItem["type"], string> = {
  homestay: "Lưu trú",
  restaurant: "Ẩm thực",
  news: "Tin tức",
  forum: "Diễn đàn",
};

type SearchState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "results"; query: string; results: SearchResultItem[] }
  | { status: "ai"; query: string; answer: string };

export default function AISearchBox() {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);
  const [value, setValue] = useState("");
  const [state, setState] = useState<SearchState>({ status: "idle" });

  useEffect(() => {
    const timer = setInterval(() => {
      setVisible(false);
      window.setTimeout(() => {
        setIndex((i) => (i + 1) % SUGGESTED_QUESTIONS.length);
        setVisible(true);
      }, 350);
    }, 3200);
    return () => clearInterval(timer);
  }, []);

  async function runSearch(query: string) {
    const q = query.trim();
    if (!q) return;
    setState({ status: "loading" });
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      if (data.mode === "results") {
        setState({ status: "results", query: q, results: data.results });
      } else if (data.mode === "ai") {
        setState({ status: "ai", query: q, answer: data.answer });
      } else {
        setState({ status: "idle" });
      }
    } catch {
      setState({ status: "idle" });
    }
  }

  return (
    <div className="relative w-full animate-fade-up [animation-delay:100ms] px-5 sm:px-16">
      {/* AI mascot đứng sát bên trái ô tìm kiếm, chiều cao bằng ô tìm kiếm ở PC */}
      <div className="absolute -top-6 sm:-top-2 lg:top-0 -left-10 z-20">
        <img
          src="/images/ai.png"
          alt="AI"
          className="w-28 h-24 sm:w-44 sm:h-36 lg:w-52 lg:h-44 drop-shadow-xl select-none pointer-events-none"
        />
      </div>

      <div className="bg-white rounded-[28px] shadow-xl px-5 sm:px-7 pt-6 sm:pt-7 pb-5 sm:pb-6">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            runSearch(value);
          }}
          className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-full pl-5 sm:pl-6 pr-2 py-2.5 sm:py-3 mb-3 focus-within:ring-2 focus-within:ring-brand-blue/30 transition-shadow"
        >
          <div className="relative flex-1 min-w-0">
            <input
              type="text"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="relative z-10 w-full bg-transparent text-sm sm:text-[15px] text-slate-700 focus:outline-none"
            />
            {!value && (
              <span
                className={`pointer-events-none absolute inset-y-0 left-0 right-0 flex items-center truncate whitespace-nowrap text-sm sm:text-[15px] text-slate-400 transition-opacity duration-350 ${
                  visible ? "opacity-100" : "opacity-0"
                }`}
              >
                {SUGGESTED_QUESTIONS[index]}
              </span>
            )}
          </div>
          <button type="button" className="text-slate-400 hover:text-brand-blue transition-colors shrink-0 px-1" aria-label="Nói bằng giọng nói">
            <i className="fa-solid fa-microphone" aria-hidden="true" />
          </button>
          <button
            type="submit"
            disabled={state.status === "loading"}
            className="w-10 h-10 rounded-full bg-brand-blue hover:brightness-95 active:scale-95 transition flex items-center justify-center text-white shrink-0 disabled:opacity-60"
            aria-label="Gửi câu hỏi"
          >
            {state.status === "loading" ? (
              <i className="fa-solid fa-spinner fa-spin text-sm" aria-hidden="true" />
            ) : (
              <i className="fa-solid fa-paper-plane text-sm" aria-hidden="true" />
            )}
          </button>
        </form>

        {/* Mobile: cuộn ngang 1 hàng duy nhất để tiết kiệm không gian dọc, thay vì
            xuống dòng thành 1 cột dài như trước. Desktop: giữ cách xuống dòng cũ. */}
        <div className="flex gap-2 overflow-x-auto scrollbar-none snap-x snap-mandatory -mx-5 px-5 sm:mx-0 sm:px-0 sm:flex-wrap sm:overflow-visible">
          {SUGGESTED_QUESTIONS.map((q) => (
            <button
              key={q}
              type="button"
              onClick={() => {
                setValue(q);
                runSearch(q);
              }}
              className="shrink-0 snap-start whitespace-nowrap text-xs sm:text-[13px] font-semibold text-brand-blue bg-white border border-sky-200 rounded-full px-3 py-1.5 hover:bg-sky-50 transition-colors"
            >
              {q}
            </button>
          ))}
        </div>

        {state.status === "loading" && (
          <div className="mt-4 flex items-center gap-2 text-sm text-slate-400">
            <i className="fa-solid fa-spinner fa-spin" aria-hidden="true" />
            Đang tìm kiếm...
          </div>
        )}

        {state.status === "results" && (
          <div className="mt-4 border-t border-slate-100 pt-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                Kết quả tìm kiếm
              </p>
              <button
                type="button"
                onClick={() => setState({ status: "idle" })}
                className="text-slate-400 hover:text-slate-600 transition-colors"
                aria-label="Đóng"
              >
                <i className="fa-solid fa-xmark" aria-hidden="true" />
              </button>
            </div>
            <div className="space-y-2 max-h-[360px] overflow-y-auto">
              {state.results.map((r) => (
                <Link
                  key={`${r.type}-${r.id}`}
                  href={r.href}
                  className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 transition-colors group"
                >
                  <div className="relative w-14 h-14 rounded-lg overflow-hidden bg-slate-100 shrink-0">
                    {r.image && <Image src={r.image} alt={r.title} fill className="object-cover" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="inline-block text-[10px] font-bold text-brand-blue bg-brand-sky/60 rounded-full px-2 py-0.5 mb-0.5">
                      {TYPE_LABEL[r.type]}
                    </span>
                    <p className="font-semibold text-sm text-slate-800 truncate group-hover:text-brand-blue transition-colors">{r.title}</p>
                    {r.subtitle && <p className="text-xs text-slate-400 truncate">{r.subtitle}</p>}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {state.status === "ai" && (
          <div className="mt-4 border-t border-slate-100 pt-4">
            <div className="flex items-center justify-between mb-2">
              <p className="flex items-center gap-1.5 text-xs font-bold text-brand-blue uppercase tracking-wide">
                <i className="fa-solid fa-robot" aria-hidden="true" />
                Trợ lý AI
              </p>
              <button
                type="button"
                onClick={() => setState({ status: "idle" })}
                className="text-slate-400 hover:text-slate-600 transition-colors"
                aria-label="Đóng"
              >
                <i className="fa-solid fa-xmark" aria-hidden="true" />
              </button>
            </div>
            <div className="bg-brand-sky/40 rounded-2xl rounded-tl-sm p-4 text-sm text-slate-700 leading-relaxed whitespace-pre-line">
              {state.answer}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
