"use client";

import { useSyncExternalStore } from "react";

// Trạng thái "cài ứng dụng" (PWA) dùng chung: Chrome/Edge/Samsung trên Android bắn sự kiện
// beforeinstallprompt - giữ lại để bấm nút "Cài ứng dụng" của mình mở hộp thoại cài. iPhone/iPad không có
// sự kiện này nên hiện hướng dẫn "Chia sẻ > Thêm vào Màn hình chính".
type InstallPromptEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: "accepted" | "dismissed" }> };
type State = { canPrompt: boolean; installed: boolean; ios: boolean };

let deferred: InstallPromptEvent | null = null;
let installed = false;
const listeners = new Set<() => void>();
let snapshot: State = { canPrompt: false, installed: false, ios: false };
const SERVER: State = { canPrompt: false, installed: false, ios: false };

function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(display-mode: standalone)").matches || (navigator as Navigator & { standalone?: boolean }).standalone === true;
}

function isIos(): boolean {
  if (typeof navigator === "undefined") return false;
  return /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
}

function update() {
  snapshot = { canPrompt: deferred !== null, installed: installed || isStandalone(), ios: isIos() };
  listeners.forEach((l) => l());
}

if (typeof window !== "undefined") {
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferred = e as InstallPromptEvent;
    update();
  });
  window.addEventListener("appinstalled", () => {
    installed = true;
    deferred = null;
    update();
  });
  snapshot = { canPrompt: false, installed: isStandalone(), ios: isIos() };
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

export function usePwaInstall(): State {
  return useSyncExternalStore(subscribe, () => snapshot, () => SERVER);
}

export async function promptInstall(): Promise<"accepted" | "dismissed" | "unavailable"> {
  if (!deferred) return "unavailable";
  const ev = deferred;
  await ev.prompt();
  const { outcome } = await ev.userChoice;
  deferred = null;
  update();
  return outcome;
}
