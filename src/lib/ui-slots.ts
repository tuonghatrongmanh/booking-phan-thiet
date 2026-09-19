import { prisma } from "@/lib/prisma";
import { isUiSlotId, type UiSlotMap } from "@/lib/ui-slots-registry";

// Danh sach vi tri (UI_SLOTS...) nam o ui-slots-registry.ts de component client dung duoc (file nay keo theo Prisma).
export { UI_SLOTS, isUiSlotId } from "@/lib/ui-slots-registry";
export type { UiSlotId, UiSlotMap } from "@/lib/ui-slots-registry";

const TTL_MS = 10_000;
// globalThis: xem ghi chu o site-theme.ts (route handler va trang co the co 2 ban module)
const g = globalThis as unknown as { __bptSlotsCache?: { at: number; value: UiSlotMap } | null };

export function invalidateUiSlotsCache() {
  g.__bptSlotsCache = null;
}

export async function getUiSlots(): Promise<UiSlotMap> {
  const hit = g.__bptSlotsCache;
  if (hit && Date.now() - hit.at < TTL_MS) return hit.value;
  const value: UiSlotMap = {};
  try {
    const rows = await prisma.uiIconSlot.findMany();
    for (const r of rows) if (isUiSlotId(r.slot)) value[r.slot] = r.imageUrl;
  } catch (err) {
    console.error("[ui-slots] Không đọc được icon tuỳ chỉnh:", err);
  }
  g.__bptSlotsCache = { at: Date.now(), value };
  return value;
}
