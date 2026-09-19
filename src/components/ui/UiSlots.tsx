"use client";

import { createContext, useContext } from "react";
import type { UiSlotId, UiSlotMap } from "@/lib/ui-slots-registry";

// Cung cap anh/GIF tuy chinh cho cac vi tri icon/nut bam (Admin > Giao dien & Le hoi) cho
// component client. Component server (Header, Hero) goi getUiSlots() truc tiep.
const UiSlotsContext = createContext<UiSlotMap>({});

export function UiSlotsProvider({ slots, children }: { slots: UiSlotMap; children: React.ReactNode }) {
  return <UiSlotsContext.Provider value={slots}>{children}</UiSlotsContext.Provider>;
}

// Tra ve URL anh tuy chinh cua vi tri, hoac undefined neu dung mac dinh
export function useUiSlot(id: UiSlotId): string | undefined {
  return useContext(UiSlotsContext)[id];
}
