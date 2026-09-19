"use client";

import { useSyncExternalStore } from "react";

// Cài đặt của KHÁCH (lưu trên thiết bị, không cần đăng nhập): bật/tắt âm thanh, hiện/ẩn trợ lý AI,
// ngôn ngữ giao diện. Mọi component đọc qua usePrefs() nên đổi ở đâu cũng đồng bộ ngay.
export type Lang = "vi" | "en";
export type ClientPrefs = { sound: boolean; ai: boolean; lang: Lang };

const KEY = "bpt_prefs_v1";
const LEGACY_MUTE_KEY = "bpt_activity_sound_muted";
const EVENT = "bpt-prefs-change";
export const DEFAULT_PREFS: ClientPrefs = { sound: true, ai: true, lang: "vi" };

let cachedRaw: string | null | undefined;
let cachedPrefs: ClientPrefs = DEFAULT_PREFS;

function readRaw(): string | null {
  try {
    return localStorage.getItem(KEY);
  } catch {
    return null;
  }
}

// Trả về CÙNG một object khi dữ liệu không đổi (bắt buộc với useSyncExternalStore)
export function getPrefs(): ClientPrefs {
  if (typeof window === "undefined") return DEFAULT_PREFS;
  const raw = readRaw();
  if (raw === cachedRaw) return cachedPrefs;
  cachedRaw = raw;
  let next = { ...DEFAULT_PREFS };
  if (raw) {
    try {
      const p = JSON.parse(raw) as Partial<ClientPrefs>;
      next = {
        sound: typeof p.sound === "boolean" ? p.sound : true,
        ai: typeof p.ai === "boolean" ? p.ai : true,
        lang: p.lang === "en" ? "en" : "vi",
      };
    } catch {
      // dữ liệu hỏng - dùng mặc định
    }
  } else {
    // khách từng tắt tiếng thông báo ở phiên bản cũ
    try {
      if (localStorage.getItem(LEGACY_MUTE_KEY) === "1") next.sound = false;
    } catch {
      // bỏ qua
    }
  }
  cachedPrefs = next;
  return next;
}

export function setPref<K extends keyof ClientPrefs>(key: K, value: ClientPrefs[K]) {
  const next = { ...getPrefs(), [key]: value };
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // storage bị chặn - vẫn cập nhật bộ nhớ cho phiên này
    cachedRaw = undefined;
    cachedPrefs = next;
  }
  window.dispatchEvent(new Event(EVENT));
}

function subscribe(cb: () => void) {
  window.addEventListener(EVENT, cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener(EVENT, cb);
    window.removeEventListener("storage", cb);
  };
}

export function usePrefs(): ClientPrefs {
  return useSyncExternalStore(subscribe, getPrefs, () => DEFAULT_PREFS);
}
