"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

export function PartName({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [overflow, setOverflow] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const sync = () => setOverflow(el.scrollWidth > el.clientWidth + 1);
    sync();
    const ro = new ResizeObserver(sync);
    ro.observe(el);
    const onWheel = (e: WheelEvent) => {
      if (el.scrollWidth <= el.clientWidth) return;
      const dx = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      if (!dx) return;
      const max = el.scrollWidth - el.clientWidth;
      const next = Math.min(max, Math.max(0, el.scrollLeft + dx));
      if (next === el.scrollLeft) return;
      e.preventDefault();
      e.stopPropagation();
      el.scrollLeft = next;
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      ro.disconnect();
      el.removeEventListener("wheel", onWheel);
    };
  }, [children]);

  return (
    <span
      ref={ref}
      className={`part-name${overflow ? " is-overflow" : ""}`}
      onPointerDown={(e) => e.stopPropagation()}
    >
      {children}
    </span>
  );
}
