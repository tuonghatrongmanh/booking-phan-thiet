// Phát "ting" + lời cảm ơn khi khách hoàn tất một việc quan trọng (đặt phòng, thuê xe, đổi quà).
// Chỉ bắn sự kiện; UiSounds (mount ở layout) lắng nghe và phát tiếng nếu khách đang bật âm thanh.
export const SUCCESS_EVENT = "bpt-success";

export function emitSuccess(opts: { voice?: boolean } = {}) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(SUCCESS_EVENT, { detail: { voice: opts.voice ?? false } }));
}
