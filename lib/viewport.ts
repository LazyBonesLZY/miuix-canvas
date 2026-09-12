"use client";

import { useEffect, useState } from "react";

export type LayoutMode = "phone" | "tablet" | "desktop";

/** iPhone landscape sits in tablet; iPad Pro 12.9 landscape is desktop. */
export const PHONE_MAX = 767;
export const TABLET_MAX = 1199;

export function layoutModeOf(width: number): LayoutMode {
  if (width <= PHONE_MAX) return "phone";
  if (width <= TABLET_MAX) return "tablet";
  return "desktop";
}

export function useLayoutMode(): LayoutMode {
  const [mode, setMode] = useState<LayoutMode>(() =>
    typeof window === "undefined" ? "desktop" : layoutModeOf(window.innerWidth),
  );

  useEffect(() => {
    const phone = window.matchMedia(`(max-width: ${PHONE_MAX}px)`);
    const tablet = window.matchMedia(`(min-width: ${PHONE_MAX + 1}px) and (max-width: ${TABLET_MAX}px)`);
    const update = () => setMode(layoutModeOf(window.innerWidth));
    phone.addEventListener("change", update);
    tablet.addEventListener("change", update);
    update();
    return () => {
      phone.removeEventListener("change", update);
      tablet.removeEventListener("change", update);
    };
  }, []);

  return mode;
}
