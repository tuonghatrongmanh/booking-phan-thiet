"use client";

// Am thanh "ting-ting" cho thong bao hoat dong (toast "... vua trung 63 xu ...") - tao bang
// Web Audio API nen KHONG can tai file am thanh. Trinh duyet chi cho phat tieng SAU KHI
// nguoi dung da cham/bam/go phim it nhat 1 lan tren trang (chinh sach chong tu phat), nen
// AudioContext duoc mo khoa o cu chi dau tien; truoc do toast van hien nhung im lang.
const MUTE_KEY = "bpt_activity_sound_muted";

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

export function readSoundMuted(): boolean {
  try {
    return localStorage.getItem(MUTE_KEY) === "1";
  } catch {
    return false;
  }
}

export function writeSoundMuted(muted: boolean) {
  try {
    localStorage.setItem(MUTE_KEY, muted ? "1" : "0");
  } catch {
    // storage bi chan - trang thai chi giu trong phien
  }
}

// Hai not cao lien tiep (La6 -> Mi7) giong tieng "ting" nhan xu; ctx chua mo khoa thi bo qua
export function playNotificationChime() {
  if (!ctx || ctx.state !== "running") return;
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
