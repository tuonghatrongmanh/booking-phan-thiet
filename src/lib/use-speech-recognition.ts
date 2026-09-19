"use client";

import { useCallback, useEffect, useRef, useState } from "react";

// Nhan dang giong noi bang Web Speech API co san trong trinh duyet (Chrome/Edge/Safari) -
// mien phi, khong can server/key. Firefox chua ho tro nen `supported=false` (UI se an nut).
// Dung cho nguoi lon tuoi khong quen go phim: bam micro, noi, tu chuyen thanh chu.
type RecognitionResultEvent = {
  resultIndex: number;
  results: ArrayLike<{ isFinal: boolean; 0: { transcript: string } }>;
};
type RecognitionErrorEvent = { error: string };
interface RecognitionLike {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((e: RecognitionResultEvent) => void) | null;
  onerror: ((e: RecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}
type RecognitionCtor = new () => RecognitionLike;

function getCtor(): RecognitionCtor | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as { SpeechRecognition?: RecognitionCtor; webkitSpeechRecognition?: RecognitionCtor };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export function describeSpeechError(code: string): string {
  switch (code) {
    case "not-allowed":
    case "service-not-allowed":
      return "Trình duyệt chưa cho phép dùng micro. Bạn bấm vào biểu tượng ổ khóa cạnh thanh địa chỉ và chọn “Cho phép micro” nhé.";
    case "no-speech":
      return "Mình chưa nghe thấy giọng nói. Bạn bấm micro và nói lại nhé.";
    case "audio-capture":
      return "Không tìm thấy micro trên thiết bị của bạn.";
    case "network":
      return "Mất kết nối mạng nên chưa nhận dạng được giọng nói. Bạn thử lại nhé.";
    case "aborted":
      return "";
    default:
      return "Chưa nhận dạng được giọng nói, bạn thử lại nhé.";
  }
}

export function useSpeechRecognition({
  lang = "vi-VN",
  onInterim,
  onFinal,
}: {
  lang?: string;
  onInterim?: (text: string) => void;
  onFinal: (text: string) => void;
}) {
  const [supported, setSupported] = useState(false);
  const [listening, setListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const recRef = useRef<RecognitionLike | null>(null);
  const finalRef = useRef("");
  const cbRef = useRef({ onInterim, onFinal });

  useEffect(() => {
    cbRef.current = { onInterim, onFinal };
  });

  useEffect(() => {
    // hoan sang tick ke tiep (tranh setState dong bo trong effect) va tranh lech hydration
    const t = setTimeout(() => setSupported(getCtor() !== null), 0);
    return () => {
      clearTimeout(t);
      recRef.current?.abort();
    };
  }, []);

  const start = useCallback(() => {
    const Ctor = getCtor();
    if (!Ctor) return;
    recRef.current?.abort();
    finalRef.current = "";
    setError(null);

    const rec = new Ctor();
    rec.lang = lang;
    rec.continuous = false;
    rec.interimResults = true;
    rec.onresult = (e) => {
      let interim = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const r = e.results[i];
        if (r.isFinal) finalRef.current += r[0].transcript;
        else interim += r[0].transcript;
      }
      cbRef.current.onInterim?.((finalRef.current + interim).trim());
    };
    rec.onerror = (e) => {
      const msg = describeSpeechError(e.error);
      if (msg) setError(msg);
    };
    rec.onend = () => {
      setListening(false);
      const text = finalRef.current.trim();
      finalRef.current = "";
      if (text) cbRef.current.onFinal(text);
    };
    recRef.current = rec;
    try {
      rec.start();
      setListening(true);
    } catch {
      setListening(false);
    }
  }, [lang]);

  const stop = useCallback(() => {
    recRef.current?.stop();
  }, []);

  return { supported, listening, error, start, stop, clearError: () => setError(null) };
}
