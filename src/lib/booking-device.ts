// Lưu tạm trên THIẾT BỊ của khách (localStorage) để khách không mất công nhập lại khi lỡ
// thoát form và có thể quay lại đơn đang chờ cọc mà không cần đăng nhập. Chỉ dùng trong
// component client; mọi thao tác bọc try/catch vì localStorage có thể bị chặn (chế độ
// riêng tư, tắt cookie...) - khi đó tính năng tự tắt, form vẫn dùng bình thường.

const CONTACT_KEY = "bpt_contact_v1";
const DRAFT_PREFIX = "bpt_draft_v1:";
const ORDERS_KEY = "bpt_orders_v1";

const DRAFT_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;
const ORDER_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000;
const MAX_ORDERS = 10;

export type BookingKind = "stay" | "rental";

function read<T>(key: string): T | null {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function write(key: string, value: unknown) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // bỏ qua: không lưu được thì thôi
  }
}

// ----- Thông tin liên hệ dùng chung cho mọi lần đặt -----
export type Contact = { name: string; phone: string; email: string };

export function loadContact(): Contact {
  return { name: "", phone: "", email: "", ...(typeof window === "undefined" ? {} : read<Partial<Contact>>(CONTACT_KEY)) };
}

export function saveContact(c: Contact) {
  write(CONTACT_KEY, c);
}

// ----- Nháp form theo từng xe / chỗ ở -----
export type Draft = Record<string, string | number>;

export function loadDraft(kind: BookingKind, placeId: string): Draft {
  if (typeof window === "undefined") return {};
  const d = read<{ savedAt: number; data: Draft }>(DRAFT_PREFIX + kind + ":" + placeId);
  if (!d || Date.now() - d.savedAt > DRAFT_MAX_AGE_MS) return {};
  return d.data ?? {};
}

export function saveDraft(kind: BookingKind, placeId: string, data: Draft) {
  write(DRAFT_PREFIX + kind + ":" + placeId, { savedAt: Date.now(), data });
}

export function clearDraft(kind: BookingKind, placeId: string) {
  try {
    window.localStorage.removeItem(DRAFT_PREFIX + kind + ":" + placeId);
  } catch {
    // bỏ qua
  }
}

// ----- Đơn đã đặt trên thiết bị này (để tra cứu / quay lại thanh toán) -----
export type RememberedOrder = {
  ref: string;
  phone: string;
  kind: BookingKind;
  placeId: string;
  placeName: string;
  createdAt: number;
};

export function loadOrders(): RememberedOrder[] {
  if (typeof window === "undefined") return [];
  const list = read<RememberedOrder[]>(ORDERS_KEY) ?? [];
  const now = Date.now();
  return list.filter((o) => o && o.ref && now - o.createdAt < ORDER_MAX_AGE_MS);
}

export function rememberOrder(order: RememberedOrder) {
  const rest = loadOrders().filter((o) => o.ref !== order.ref);
  write(ORDERS_KEY, [order, ...rest].slice(0, MAX_ORDERS));
}

export function forgetOrder(ref: string) {
  write(
    ORDERS_KEY,
    loadOrders().filter((o) => o.ref !== ref)
  );
}

// Đơn gần đây của ĐÚNG xe/chỗ ở này (dùng để gợi ý "quay lại đơn đang chờ" khi khách mở lại form).
export function loadRecentOrderForPlace(kind: BookingKind, placeId: string, maxAgeMs: number): RememberedOrder | null {
  const now = Date.now();
  return loadOrders().find((o) => o.kind === kind && o.placeId === placeId && now - o.createdAt < maxAgeMs) ?? null;
}
