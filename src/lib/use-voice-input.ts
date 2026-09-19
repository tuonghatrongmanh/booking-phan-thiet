"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { concatFloat32, createVad, downsample, encodeWav, rms } from "@/lib/audio-utils";

// Nút micro: ghi âm trực tiếp (getUserMedia + Web Audio), TỰ nhận biết khi người dùng ngừng nói,
// rồi gửi đoạn ghi âm lên /api/speech-to-text để chuyển thành chữ. Không phụ thuộc Web Speech API
// của trình duyệt (hay im lặng trên nhiều máy Android/webview) nên chạy đều trên Android, iPhone, máy tính.
export type VoiceStatus = "idle" | "starting" | "listening" | "processing";

type AudioCtor = typeof AudioContext;
const TARGET_RATE = 16000;
const PRE_ROLL_MS = 350; // giữ lại chút âm thanh trước lúc bắt đầu nói để không cụt chữ đầu

function getAudioCtor(): AudioCtor | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as { AudioContext?: AudioCtor; webkitAudioContext?: AudioCtor };
  return w.AudioContext ?? w.webkitAudioContext ?? null;
}

export function describeMicError(err: unknown): string {
  const name = (err as { name?: string } | null)?.name ?? "";
  if (name === "NotAllowedError" || name === "SecurityError" || name === "PermissionDeniedError") {
    return "Trình duyệt chưa cho dùng micro. Bạn bấm vào biểu tượng ổ khóa cạnh thanh địa chỉ, chọn “Cho phép micro” rồi thử lại nhé.";
  }
  if (name === "NotFoundError" || name === "DevicesNotFoundError") return "Không tìm thấy micro trên thiết bị của bạn.";
  if (name === "NotReadableError" || name === "AbortError") return "Micro đang được ứng dụng khác sử dụng (cuộc gọi, quay màn hình...). Bạn tắt đi rồi thử lại nhé.";
  return "Không mở được micro, bạn thử lại nhé.";
}

export function useVoiceInput({ onText }: { onText: (text: string) => void }) {
  const [supported, setSupported] = useState(false);
  const [status, setStatus] = useState<VoiceStatus>("idle");
  const [level, setLevel] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const onTextRef = useRef(onText);
  const stopRef = useRef<((discard: boolean) => void) | null>(null);
  const statusRef = useRef<VoiceStatus>("idle");

  useEffect(() => {
    onTextRef.current = onText;
  });

  const setStatusBoth = useCallback((s: VoiceStatus) => {
    statusRef.current = s;
    setStatus(s);
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setSupported(Boolean(navigator.mediaDevices?.getUserMedia) && getAudioCtor() !== null), 0);
    return () => {
      clearTimeout(t);
      stopRef.current?.(true);
    };
  }, []);

  const start = useCallback(async () => {
    if (statusRef.current !== "idle") return;
    const Ctor = getAudioCtor();
    if (!Ctor || !navigator.mediaDevices?.getUserMedia) return;
    setError(null);
    setLevel(0);
    setStatusBoth("starting");

    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true, channelCount: 1 } });
    } catch (err) {
      setError(describeMicError(err));
      setStatusBoth("idle");
      return;
    }

    const ctx = new Ctor();
    try {
      await ctx.resume();
    } catch {
      // một số trình duyệt tự chạy sẵn
    }
    const source = ctx.createMediaStreamSource(stream);
    const processor = ctx.createScriptProcessor(4096, 1, 1);
    const chunks: Float32Array[] = [];
    const frameMs = (4096 / ctx.sampleRate) * 1000;
    const vad = createVad();
    let done = false;

    function cleanup() {
      processor.onaudioprocess = null;
      try {
        source.disconnect();
        processor.disconnect();
      } catch {
        // đã ngắt
      }
      stream.getTracks().forEach((t) => t.stop());
      void ctx.close().catch(() => {});
      stopRef.current = null;
    }

    async function finish(discard: boolean, reason: "finished" | "no-speech" | "manual") {
      if (done) return;
      done = true;
      const startedAt = vad.speechStartedAtMs;
      cleanup();
      setLevel(0);

      if (discard) {
        setStatusBoth("idle");
        return;
      }
      if (startedAt === null || reason === "no-speech") {
        setError("Mình chưa nghe thấy giọng nói. Bạn bấm micro rồi nói to, rõ hơn nhé.");
        setStatusBoth("idle");
        return;
      }

      setStatusBoth("processing");
      // bỏ phần im lặng đầu, chỉ giữ lại một chút trước lúc bắt đầu nói
      const skipFrames = Math.max(0, Math.floor((startedAt - PRE_ROLL_MS) / frameMs));
      const samples = downsample(concatFloat32(chunks.slice(skipFrames)), ctx.sampleRate, TARGET_RATE);
      try {
        const res = await fetch("/api/speech-to-text", { method: "POST", headers: { "Content-Type": "audio/wav" }, body: encodeWav(samples, TARGET_RATE) });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(typeof data.error === "string" ? data.error : "lỗi");
        const text = typeof data.text === "string" ? data.text.trim() : "";
        if (!text) setError("Mình chưa nghe rõ, bạn thử nói lại chậm và rõ hơn nhé.");
        else onTextRef.current(text);
      } catch (err) {
        setError(err instanceof Error && err.message !== "lỗi" ? err.message : "Chưa chuyển được giọng nói thành chữ, bạn thử lại nhé.");
      } finally {
        setStatusBoth("idle");
      }
    }

    processor.onaudioprocess = (e) => {
      if (done) return;
      const data = new Float32Array(e.inputBuffer.getChannelData(0)); // sao chép: bộ đệm gốc bị dùng lại
      chunks.push(data);
      const l = rms(data);
      setLevel(Math.min(1, l * 9));
      const r = vad.push(l, frameMs);
      if (r !== "continue") void finish(false, r);
    };
    source.connect(processor);
    processor.connect(ctx.destination); // đầu ra im lặng; cần nối để trình duyệt chạy onaudioprocess

    stopRef.current = (discard: boolean) => void finish(discard, "manual");
    setStatusBoth("listening");
  }, [setStatusBoth]);

  // Bấm dừng khi đang nghe: nếu đã nói được câu nào thì vẫn chuyển thành chữ, chưa nói gì thì hủy
  const stop = useCallback(() => stopRef.current?.(false), []);

  return { supported, status, listening: status === "listening", busy: status !== "idle", level, error, start, stop, clearError: () => setError(null) };
}
