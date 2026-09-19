"use client";

// Am thanh "ting-ting" cho thong bao hoat dong (toast "... vua trung 63 xu ...") - tao bang
// Web Audio API nen KHONG can tai file am thanh. Trinh duyet chi cho phat tieng SAU KHI
// nguoi dung da cham/bam/go phim it nhat 1 lan tren trang (chinh sach chong tu phat), nen
// AudioContext duoc mo khoa o cu chi dau tien; truoc do toast van hien nhung im lang.
import { getPrefs, setPref } from "@/lib/client-prefs";

let ctx: AudioContext | null = null;
let armed = false;

type AudioCtor = typeof AudioContext;

function getCtor(): AudioCtor | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as { AudioContext?: AudioCtor; webkitAudioContext?: AudioCtor };
  return w.AudioContext ?? w.webkitAudioContext ?? null;
}

function unlock() {
  const Ctor = getCtor();
  if (!Ctor) return;
  if (!ctx) ctx = new Ctor();
  if (ctx.state === "suspended") void ctx.resume();
}

// Goi 1 lan khi ticker mount: cho cu chi dau tien cua nguoi dung roi mo khoa am thanh
export function armNotificationSound() {
  if (armed || typeof window === "undefined") return;
  armed = true;
  const events = ["pointerdown", "keydown", "touchstart"] as const;
  const handler = () => {
    unlock();
    events.forEach((e) => window.removeEventListener(e, handler));
  };
  events.forEach((e) => window.addEventListener(e, handler, { passive: true }));
}

// Tắt/bật tiếng nay dùng cài đặt chung của khách (client-prefs) - 1 công tắc cho mọi âm thanh
export function readSoundMuted(): boolean {
  return !getPrefs().sound;
}

export function writeSoundMuted(muted: boolean) {
  setPref("sound", !muted);
}

// Hai not cao lien tiep (La6 -> Mi7) giong tieng "ting" nhan xu; ctx chua mo khoa thi bo qua
export function playNotificationChime() {
  if (!ctx || ctx.state !== "running" || !getPrefs().sound) return;
  const now = ctx.currentTime;
  const notes: [number, number][] = [
    [880, 0],
    [1318.5, 0.12],
  ];
  for (const [freq, delay] of notes) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.0001, now + delay);
    gain.gain.exponentialRampToValueAtTime(0.16, now + delay + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + delay + 0.5);
    osc.connect(gain).connect(ctx.destination);
    osc.start(now + delay);
    osc.stop(now + delay + 0.55);
  }
}

// Tiếng "tách" rất nhẹ khi chuyển trang / mở chi tiết - phản hồi cho biết thao tác đã nhận
export function playNavigateTick() {
  if (!ctx || ctx.state !== "running" || !getPrefs().sound) return;
  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "sine";
  osc.frequency.setValueAtTime(720, now);
  osc.frequency.exponentialRampToValueAtTime(520, now + 0.07);
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(0.07, now + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.09);
  osc.connect(gain).connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 0.1);
}

// Ba nốt đi lên vui tai khi hoàn tất việc quan trọng (đặt phòng, đổi quà...)
export function playSuccessChime() {
  if (!ctx || ctx.state !== "running" || !getPrefs().sound) return;
  const now = ctx.currentTime;
  const notes: [number, number][] = [
    [1046.5, 0],
    [1318.5, 0.11],
    [1568, 0.22],
  ];
  for (const [freq, delay] of notes) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "triangle";
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.0001, now + delay);
    gain.gain.exponentialRampToValueAtTime(0.14, now + delay + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + delay + 0.5);
    osc.connect(gain).connect(ctx.destination);
    osc.start(now + delay);
    osc.stop(now + delay + 0.55);
  }
}

let thanks: HTMLAudioElement | null = null;

// Giọng nữ "Booking Phan Thiết xin cảm ơn" (file public/audio/cam-on.wav, cùng một giọng trên mọi máy)
export function playThanksVoice() {
  if (typeof window === "undefined" || !getPrefs().sound) return;
  try {
    if (!thanks) thanks = new Audio("/audio/cam-on.wav");
    thanks.currentTime = 0;
    void thanks.play().catch(() => {});
  } catch {
    // trình duyệt chặn phát - bỏ qua
  }
}
