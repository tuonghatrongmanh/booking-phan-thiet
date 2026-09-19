"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import ChatText from "@/components/chat/ChatText";
import { useSpeechRecognition } from "@/lib/use-speech-recognition";
import { useUiSlot } from "@/components/ui/UiSlots";
import type { SearchResultItem } from "@/lib/search";
import type { ChatSource } from "@/lib/ai-chat-utils";

type ChatMessage = {
  id: string;
  role: "user" | "ai";
  text: string;
  cards?: SearchResultItem[];
  sources?: ChatSource[];
  searchQueries?: string[];
  error?: boolean;
  welcome?: boolean;
};

const STORAGE_KEY = "bpt_ai_chat_v1";

const GREETINGS = [
  "Xin chào! Mình là trợ lý AI 👋",
  "Bạn cần tìm homestay không?",
  "Hỏi mình quán ăn ngon nhé!",
  "Thuê xe máy giá tốt, hỏi mình!",
  "Bấm vào mình để trò chuyện nè",
  "Bạn có thể nói bằng micro 🎤",
];

const SUGGESTIONS = [
  "Thời tiết Phan Thiết cuối tuần này?",
  "Quán hải sản ngon ở Phan Thiết?",
  "Homestay view biển giá rẻ",
  "Thuê xe máy giá bao nhiêu?",
  "Lễ hội Nghinh Ông là gì?",
];

const TYPE_LABEL: Record<SearchResultItem["type"], string> = {
  homestay: "Lưu trú",
  restaurant: "Ẩm thực",
  news: "Tin tức",
  forum: "Cộng đồng",
};

const WELCOME: ChatMessage = {
  id: "welcome",
  role: "ai",
  welcome: true,
  text:
    "Xin chào! Mình là trợ lý AI của Booking Phan Thiết. Bạn cứ hỏi mình về homestay, quán ăn, thuê xe, điểm tham quan " +
    "- hoặc bất cứ điều gì về Phan Thiết như thời tiết, đường đi, lễ hội. Bạn cũng có thể bấm nút micro để nói thay vì gõ chữ.",
};

function newId() {
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;
}

function loadSaved(): ChatMessage[] {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    const parsed = raw ? (JSON.parse(raw) as ChatMessage[]) : [];
    return Array.isArray(parsed) ? parsed.slice(-30) : [];
  } catch {
    return [];
  }
}

export default function AiChatWidget() {
  const pathname = usePathname();
  const customRobot = useUiSlot("ai-robot");
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [greetIdx, setGreetIdx] = useState(0);
  const [greetVisible, setGreetVisible] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const sendRef = useRef<(text: string) => void>(() => {});

  // Khoi phuc hoi thoai trong tab (sessionStorage) - hoan tick de tranh setState dong bo trong effect
  useEffect(() => {
    const t = setTimeout(() => {
      const saved = loadSaved();
      if (saved.length > 0) setMessages(saved);
    }, 0);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-30)));
    } catch {
      // storage day/bi chan - bo qua, chat van dung binh thuong
    }
  }, [messages]);

  // Bong chao o mieng robot: cu moi 3 giay doi 1 cau (mo dan 0.35s giua 2 cau), dung khi dang mo chat
  useEffect(() => {
    if (open) return;
    let swapTimer: ReturnType<typeof setTimeout> | undefined;
    const first = setTimeout(() => setGreetVisible(true), 1200);
    const interval = setInterval(() => {
      setGreetVisible(false);
      swapTimer = setTimeout(() => {
        setGreetIdx((i) => (i + 1) % GREETINGS.length);
        setGreetVisible(true);
      }, 350);
    }, 3000);
    return () => {
      clearTimeout(first);
      clearInterval(interval);
      if (swapTimer) clearTimeout(swapTimer);
    };
  }, [open]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading, open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const speech = useSpeechRecognition({
    onInterim: (t) => setInput(t),
    onFinal: (t) => {
      setInput("");
      sendRef.current(t);
    },
  });

  const send = useCallback(
    async (text: string) => {
      const q = text.trim();
      if (!q || loading) return;
      const userMsg: ChatMessage = { id: newId(), role: "user", text: q };
      const next = [...messages, userMsg];
      setMessages(next);
      setInput("");
      setLoading(true);

      const history = next
        .filter((m) => !m.welcome && !m.error)
        .map((m) => ({ role: m.role === "user" ? ("user" as const) : ("model" as const), text: m.text }));

      try {
        const res = await fetch("/api/ai-chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: history }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok && typeof data.answer !== "string") throw new Error("bad response");
        setMessages((cur) => [
          ...cur,
          {
            id: newId(),
            role: "ai",
            text: String(data.answer ?? ""),
            cards: Array.isArray(data.cards) ? data.cards : undefined,
            sources: Array.isArray(data.sources) ? data.sources : undefined,
            searchQueries: Array.isArray(data.searchQueries) ? data.searchQueries : undefined,
            error: !res.ok,
          },
        ]);
      } catch {
        setMessages((cur) => [
          ...cur,
          { id: newId(), role: "ai", error: true, text: "Mình chưa kết nối được, bạn kiểm tra mạng rồi thử lại nhé." },
        ]);
      } finally {
        setLoading(false);
      }
    },
    [messages, loading]
  );

  useEffect(() => {
    sendRef.current = send;
  }, [send]);

  function openChat() {
    setOpen(true);
    if (window.matchMedia("(pointer: fine)").matches) setTimeout(() => inputRef.current?.focus(), 120);
  }

  function resetChat() {
    speech.stop();
    setMessages([WELCOME]);
    setInput("");
  }

  if (pathname.startsWith("/admin")) return null;

  const onlyWelcome = messages.length === 1 && messages[0].welcome;

  return (
    <>
      {!open && (
        <div className="fixed z-[45] right-2 sm:right-4 bottom-[80px]">
          {greetVisible && (
            <div
              key={greetIdx}
              className="chat-bubble-in absolute right-full top-[22%] mr-0.5 w-max max-w-[170px] sm:max-w-[210px] rounded-2xl rounded-br-sm bg-white border border-brand-blueMid px-3 py-2 text-[13px] font-bold leading-snug text-brand-blue shadow-lg pointer-events-none"
            >
              {GREETINGS[greetIdx]}
              <span className="absolute -right-1.5 bottom-2.5 w-3 h-3 rotate-45 bg-white border-r border-b border-brand-blueMid" aria-hidden="true" />
            </div>
          )}
          <button
            type="button"
            onClick={openChat}
            aria-label="Mở trợ lý AI để trò chuyện"
            className="group relative block w-[84px] sm:w-[100px] focus:outline-none focus-visible:ring-4 focus-visible:ring-brand-blue/30 rounded-3xl"
          >
            {customRobot ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={customRobot}
                alt=""
                className="w-full h-auto drop-shadow-[0_8px_14px_rgba(0,59,149,0.35)] select-none group-hover:scale-105 transition-transform"
              />
            ) : (
              <Image
                src="/images/ai-robot.png"
                alt=""
                width={300}
                height={331}
                className="robot-float w-full h-auto drop-shadow-[0_8px_14px_rgba(0,59,149,0.35)] select-none group-hover:scale-105 transition-transform"
              />
            )}
            <span className="absolute left-1/2 -translate-x-1/2 -bottom-1 rounded-full bg-brand-blue px-2.5 py-0.5 text-[11px] font-bold text-white shadow whitespace-nowrap">
              Hỏi AI
            </span>
          </button>
        </div>
      )}

      {open && (
        <>
          <div className="fixed inset-0 z-[79] bg-black/40 sm:hidden" onClick={() => setOpen(false)} aria-hidden="true" />
          <div
            role="dialog"
            aria-label="Trợ lý AI Booking Phan Thiết"
            className="fixed z-[80] inset-x-0 bottom-0 h-[88dvh] sm:inset-x-auto sm:right-5 sm:bottom-24 sm:w-[410px] sm:h-[min(660px,calc(100dvh-8rem))] flex flex-col overflow-hidden rounded-t-3xl sm:rounded-3xl bg-white shadow-2xl border border-slate-200 animate-fade-up"
          >
            <div className="bg-navbar-gradient text-white flex items-center gap-3 px-4 py-3">
              <span className="relative w-11 h-11 shrink-0 rounded-full bg-white flex items-center justify-center overflow-hidden">
                <Image src="/images/ai-robot.png" alt="" width={44} height={48} className="w-9 h-auto" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-display font-bold text-[17px] leading-tight">Trợ lý AI Phan Thiết</p>
                <p className="text-[12px] text-white/80 leading-tight truncate">Hỏi về lưu trú, ẩm thực, thuê xe, thời tiết…</p>
              </div>
              <button
                type="button"
                onClick={resetChat}
                aria-label="Bắt đầu cuộc trò chuyện mới"
                title="Cuộc trò chuyện mới"
                className="w-10 h-10 rounded-full hover:bg-white/15 flex items-center justify-center"
              >
                <i className="fa-solid fa-rotate-right" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Đóng trợ lý AI"
                className="w-10 h-10 rounded-full hover:bg-white/15 flex items-center justify-center text-lg"
              >
                <i className="fa-solid fa-xmark" aria-hidden="true" />
              </button>
            </div>

            <div ref={scrollRef} className="flex-1 overflow-y-auto bg-slate-50 px-3 py-4 space-y-3">
              {messages.map((m) => (
                <div key={m.id} className={m.role === "user" ? "flex justify-end" : "flex items-start gap-2"}>
                  {m.role === "ai" && (
                    <span className="w-8 h-8 shrink-0 rounded-full bg-white border border-slate-200 flex items-center justify-center overflow-hidden">
                      <Image src="/images/ai-robot.png" alt="" width={32} height={35} className="w-6 h-auto" />
                    </span>
                  )}
                  <div className={m.role === "user" ? "max-w-[85%]" : "min-w-0 max-w-[88%]"}>
                    <div
                      className={
                        m.role === "user"
                          ? "bg-brand-blue text-white rounded-2xl rounded-tr-sm px-3.5 py-2.5 text-[15px] leading-relaxed"
                          : `border rounded-2xl rounded-tl-sm px-3.5 py-2.5 text-[15px] leading-relaxed shadow-sm ${
                              m.error ? "bg-red-50 border-red-200 text-red-700" : "bg-white border-slate-200 text-slate-700"
                            }`
                      }
                    >
                      {m.role === "ai" ? <ChatText text={m.text} /> : m.text}
                    </div>

                    {m.cards && m.cards.length > 0 && (
                      <div className="mt-2 space-y-1.5">
                        {m.cards.map((c) => (
                          <Link
                            key={`${c.type}-${c.id}`}
                            href={c.href}
                            onClick={() => setOpen(false)}
                            className="flex items-center gap-2.5 rounded-xl bg-white border border-slate-200 p-2 hover:border-brand-blue transition-colors"
                          >
                            <span className="relative w-12 h-12 shrink-0 rounded-lg overflow-hidden bg-slate-100">
                              {c.image && <Image src={c.image} alt="" fill sizes="48px" className="object-cover" />}
                            </span>
                            <span className="min-w-0">
                              <span className="block text-[10px] font-bold text-brand-blue">{TYPE_LABEL[c.type]}</span>
                              <span className="block text-sm font-semibold text-slate-800 truncate">{c.title}</span>
                            </span>
                          </Link>
                        ))}
                      </div>
                    )}

                    {m.sources && m.sources.length > 0 && (
                      <div className="mt-2 flex flex-wrap items-center gap-1.5">
                        <span className="text-[11px] font-bold text-slate-400">Nguồn:</span>
                        {m.sources.map((s, si) => (
                          <a
                            key={s.uri}
                            href={s.uri}
                            target="_blank"
                            rel="noopener noreferrer nofollow"
                            className="max-w-full truncate text-[12px] font-semibold text-brand-blue bg-white border border-brand-blueMid rounded-full px-2.5 py-1 hover:bg-brand-tint"
                          >
                            [{si + 1}] {s.title}
                          </a>
                        ))}
                      </div>
                    )}

                    {m.searchQueries && m.searchQueries.length > 0 && (
                      <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                        {m.searchQueries.map((q) => (
                          <a
                            key={q}
                            href={`https://www.google.com/search?q=${encodeURIComponent(q)}`}
                            target="_blank"
                            rel="noopener noreferrer nofollow"
                            className="text-[12px] text-slate-500 bg-white border border-slate-200 rounded-full px-2.5 py-1 hover:text-brand-blue"
                          >
                            <i className="fa-brands fa-google mr-1" aria-hidden="true" />
                            Tìm thêm: {q}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex items-start gap-2">
                  <span className="w-8 h-8 shrink-0 rounded-full bg-white border border-slate-200 flex items-center justify-center overflow-hidden">
                    <Image src="/images/ai-robot.png" alt="" width={32} height={35} className="w-6 h-auto" />
                  </span>
                  <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-sm px-4 py-3 text-slate-400 text-sm flex items-center gap-1.5">
                    <i className="fa-solid fa-circle text-[6px] animate-bounce" aria-hidden="true" />
                    <i className="fa-solid fa-circle text-[6px] animate-bounce [animation-delay:150ms]" aria-hidden="true" />
                    <i className="fa-solid fa-circle text-[6px] animate-bounce [animation-delay:300ms]" aria-hidden="true" />
                    <span className="sr-only">Trợ lý đang trả lời</span>
                  </div>
                </div>
              )}

              {onlyWelcome && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => send(s)}
                      className="text-[14px] font-semibold text-brand-blue bg-white border border-brand-blueMid rounded-full px-3.5 py-2 hover:bg-brand-tint transition-colors text-left"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="border-t border-slate-200 bg-white px-3 pt-2.5 pb-3">
              {speech.listening && (
                <div className="mb-2 flex items-center gap-2 rounded-xl bg-red-50 px-3 py-2 text-[13px] font-semibold text-red-600">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" aria-hidden="true" />
                  Đang nghe... bạn cứ nói, nói xong mình tự gửi
                </div>
              )}
              {speech.error && <p className="mb-2 text-[13px] text-red-600">{speech.error}</p>}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  send(input);
                }}
                className="flex items-center gap-2"
              >
                <input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={speech.listening ? "Đang nghe bạn nói…" : "Nhập câu hỏi của bạn…"}
                  maxLength={500}
                  className="min-w-0 flex-1 h-12 rounded-full border border-slate-300 bg-slate-50 px-4 text-[16px] text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-blue/40"
                />
                {speech.supported && (
                  <button
                    type="button"
                    onClick={() => (speech.listening ? speech.stop() : speech.start())}
                    aria-label={speech.listening ? "Dừng nghe" : "Nói bằng micro"}
                    title={speech.listening ? "Dừng nghe" : "Nói bằng micro"}
                    className={`w-12 h-12 shrink-0 rounded-full flex items-center justify-center text-lg transition ${
                      speech.listening ? "bg-red-500 text-white animate-pulse" : "bg-brand-sky text-brand-blue hover:bg-brand-blueMid"
                    }`}
                  >
                    <i className={speech.listening ? "fa-solid fa-stop" : "fa-solid fa-microphone"} aria-hidden="true" />
                  </button>
                )}
                <button
                  type="submit"
                  disabled={loading || !input.trim()}
                  aria-label="Gửi câu hỏi"
                  className="w-12 h-12 shrink-0 rounded-full bg-brand-blue text-white flex items-center justify-center disabled:opacity-50 hover:brightness-95 active:scale-95 transition"
                >
                  <i className="fa-solid fa-paper-plane" aria-hidden="true" />
                </button>
              </form>
              <p className="mt-2 text-center text-[11px] text-slate-400">Trợ lý AI có thể nhầm lẫn, hãy kiểm tra lại thông tin quan trọng.</p>
            </div>
          </div>
        </>
      )}
    </>
  );
}
