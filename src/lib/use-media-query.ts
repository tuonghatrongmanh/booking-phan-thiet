"use client";

import { useSyncExternalStore } from "react";

// Theo doi media query (vd "(max-width: 639px)"). Render server luon la false; sau hydrate lay
// gia tri that. useSyncExternalStore tranh loi set-state-in-effect va giat hinh.
export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const mql = window.matchMedia(query);
      mql.addEventListener("change", onChange);
      return () => mql.removeEventListener("change", onChange);
    },
    () => window.matchMedia(query).matches,
    () => false
  );
}
