"use client";

import type { ReactNode } from "react";

export function PartName({ children }: { children: ReactNode }) {
  return <span className="part-name">{children}</span>;
}
