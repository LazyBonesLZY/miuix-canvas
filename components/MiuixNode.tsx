"use client";

import type { CSSProperties, ReactNode } from "react";
import type { Palette } from "@/lib/color";
import { rgbToHex, withAlpha } from "@/lib/color";
import { t, type Lang } from "@/lib/i18n";
import { SLIDER_SIZE, SLIDER_THUMB, fillLengthCalc, rangeEnd, rangeFillLeftCalc, rangeFillWidthCalc, rangeStart, thumbCenterCalc } from "@/lib/slider";
import type { Item, Join, NavTab } from "@/lib/types";

function Symbol({ name, size = 20, color, fill = false }: { name?: string | null; size?: number; color?: string; fill?: boolean }) {
  if (!name) return null;
  return (
    <span className="ms" data-fill={fill ? "1" : undefined} style={{ fontSize: size, color, width: size, height: size }}>
      {name}
    </span>
  );
}

function sq(radius: number): CSSProperties {
  return { borderRadius: radius, cornerShape: "squircle" } as CSSProperties;
}

function hints(lang: Lang) {
  return {
    zh: ["建议 0", "建议 1", "建议 2", "建议 3"],
    en: ["Suggestion 0", "Suggestion 1", "Suggestion 2", "Suggestion 3"],
    ja: ["候補 0", "候補 1", "候補 2", "候補 3"],
    ko: ["제안 0", "제안 1", "제안 2", "제안 3"],
  }[lang];
}

function hueColor(t: number) {
  return `hsl(${Math.round(Math.max(0, Math.min(1, t)) * 360)} 82% 52%)`;
}

const MIUIX_GRAY = "#888888";
const PALETTE_S = [0.1, 0.35, 0.7, 1, 1, 1, 1];
const PALETTE_V = [1, 1, 1, 0.85, 0.65, 0.45, 0.2];

function hsvHex(h: number, s: number, v: number) {
  const f = (n: number) => {
    const k = (n + h / 60) % 6;
    return v - v * s * Math.max(0, Math.min(k, 4 - k, 1));
  };
  return rgbToHex(f(5) * 255, f(3) * 255, f(1) * 255);
}

function paletteCell(col: number, row: number) {
  if (col === 12) {
    const g = 1 - row / 6;
    return rgbToHex(g * 255, g * 255, g * 255);
  }
  return hsvHex((col * 30) % 360, PALETTE_S[row] ?? 1, PALETTE_V[row] ?? 1);
}

function ArrowUpDown({ color }: { color: string }) {
  return (
    <svg width={10} height={16} viewBox="0 0 10 16" fill="none" aria-hidden>
      <path d="M5 1.2 1.4 6.4h7.2L5 1.2Zm0 13.6 3.6-5.2H1.4L5 14.8Z" fill={color} />
    </svg>
  );
}

function OrbitRing({ size = 20, stroke = 2, dot = 4, color = MIUIX_GRAY }: { size?: number; stroke?: number; dot?: number; color?: string }) {
  return (
    <div style={{ width: size, height: size, position: "relative" }}>
      <div style={{ position: "absolute", inset: 0, borderRadius: 999, border: `${stroke}px solid ${color}` }} />
      <div className="miuix-orbit">
        <div style={{ position: "absolute", top: (stroke - dot) / 2, left: "50%", width: dot, height: dot, marginLeft: -dot / 2, borderRadius: 999, background: color }} />
      </div>
    </div>
  );
}

function CircularRing({ value, track, ink }: { value: number; track: string; ink: string }) {
  const r = 13;
  const c = 2 * Math.PI * r;
  const v = Math.max(0, Math.min(1, value));
  return (
    <svg width={30} height={30} viewBox="0 0 30 30" aria-hidden>
      <circle cx={15} cy={15} r={r} fill="none" stroke={track} strokeWidth={4} />
      <circle cx={15} cy={15} r={r} fill="none" stroke={ink} strokeWidth={4} strokeLinecap="round" strokeDasharray={`${c * v} ${c}`} transform="rotate(-90 15 15)" />
    </svg>
  );
}

function GlassNoise() {
  return (
    <div
      aria-hidden
      style={{
        position: "absolute",
        inset: 0,
        borderRadius: "inherit",
        pointerEvents: "none",
        opacity: 0.22,
        mixBlendMode: "overlay",
        backgroundImage:
          "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='80' height='80'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.55 0'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>\")",
      }}
    />
  );
}

function ColorBand({ colors, value }: { colors: string; value: number }) {
  return (
    <div style={{ height: 26, borderRadius: 999, background: colors, position: "relative", boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.06)" }}>
      <div style={{ position: "absolute", top: 5, left: `clamp(2px, calc(${value * 100}% - 8px), calc(100% - 18px))`, width: 16, height: 16, borderRadius: 8, background: "#fff", boxShadow: "0 0 0 1px rgba(0,0,0,0.18)" }} />
    </div>
  );
}

function CheckMark({ color, size = 18 }: { color: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M5 12.8l4.8 4.6L19.2 7.4" stroke={color} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function SwitchTrack({ on, p }: { on: boolean; p: Palette }) {
  return (
    <div style={{ width: 49, height: 28, borderRadius: 999, background: on ? p.primary : p.secondary, position: "relative", flexShrink: 0, transition: "background 180ms ease" }}>
      <div
        style={{
          position: "absolute",
          top: 4,
          left: on ? 25 : 4,
          width: 20,
          height: 20,
          borderRadius: 999,
          background: on ? p.onPrimary : p.onSecondary,
          transition: "left 180ms cubic-bezier(0.2, 0.8, 0.2, 1), background 180ms ease",
        }}
      />
    </div>
  );
}

function Check({ on, p, radio = false }: { on: boolean; p: Palette; radio?: boolean }) {
  if (radio) {
    return (
      <div style={{ width: 26, height: 26, display: "grid", placeItems: "center", flexShrink: 0 }}>
        {on && <CheckMark color={p.primary} size={20} />}
      </div>
    );
  }
  return (
    <div style={{ width: 26, height: 26, borderRadius: 999, background: on ? p.primary : p.secondary, display: "grid", placeItems: "center", flexShrink: 0 }}>
      {on && <CheckMark color={p.onPrimary} size={16} />}
    </div>
  );
}

function SliderThumb({ color, left, bottom }: { color: string; left?: string; bottom?: string }) {
  return (
    <div
      style={{
        position: "absolute",
        top: bottom ? undefined : "50%",
        left,
        bottom,
        width: SLIDER_THUMB,
        height: SLIDER_THUMB,
        marginTop: bottom ? undefined : -SLIDER_THUMB / 2,
        marginLeft: left ? -SLIDER_THUMB / 2 : undefined,
        marginBottom: bottom ? -SLIDER_THUMB / 2 : undefined,
        borderRadius: 999,
        background: color,
        zIndex: 2,
      }}
    />
  );
}

function SliderBar({ p, value, disabled = false, steps = false }: { p: Palette; value: number; disabled?: boolean; steps?: boolean }) {
  const fg = disabled ? p.disabledPrimaryButton : p.primary;
  const thumb = disabled ? p.disabledOnPrimaryButton : p.onPrimary;
  return (
    <div style={{ flex: 1, height: SLIDER_SIZE, borderRadius: 999, background: p.sliderBackground, position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", left: 0, top: 0, height: SLIDER_SIZE, width: fillLengthCalc(value), borderRadius: 999, background: fg }} />
      {steps && [0, 0.25, 0.5, 0.75, 1].map((k) => (
        <div
          key={k}
          style={{
            position: "absolute",
            top: "50%",
            left: thumbCenterCalc(k),
            width: 7.7,
            height: 7.7,
            marginTop: -3.85,
            marginLeft: -3.85,
            borderRadius: 999,
            background: k <= value ? withAlpha("#fff", 0.55) : "rgba(0,0,0,0.18)",
            zIndex: 1,
          }}
        />
      ))}
      <SliderThumb color={thumb} left={thumbCenterCalc(value)} />
    </div>
  );
}

function VerticalSliderBar({ p, value, disabled = false }: { p: Palette; value: number; disabled?: boolean }) {
  const fg = disabled ? p.disabledPrimaryButton : p.primary;
  const thumb = disabled ? p.disabledOnPrimaryButton : p.onPrimary;
  return (
    <div style={{ width: SLIDER_SIZE, height: "100%", borderRadius: 999, background: p.sliderBackground, position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", left: 0, bottom: 0, width: SLIDER_SIZE, height: fillLengthCalc(value), borderRadius: 999, background: fg }} />
      <SliderThumb color={thumb} left="50%" bottom={thumbCenterCalc(value)} />
    </div>
  );
}

function RangeBar({ p, from, to }: { p: Palette; from: number; to: number }) {
  return (
    <div style={{ flex: 1, height: SLIDER_SIZE, borderRadius: 999, background: p.sliderBackground, position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: 0, height: SLIDER_SIZE, left: rangeFillLeftCalc(from), width: rangeFillWidthCalc(from, to), borderRadius: 999, background: p.primary }} />
      <SliderThumb color={p.onPrimary} left={thumbCenterCalc(from)} />
      <SliderThumb color={p.onPrimary} left={thumbCenterCalc(to)} />
    </div>
  );
}

function PrefRow({ it, p, trailing, join }: { it: Item; p: Palette; trailing?: ReactNode; join?: Join }) {
  const top = join?.top ? 0 : 16;
  const bottom = join?.bottom ? 0 : 16;
  return (
    <div
      style={{
        height: "100%",
        padding: 16,
        display: "flex",
        alignItems: "center",
        gap: 12,
        background: p.surfaceContainer,
        ...sq(0),
        borderRadius: `${top}px ${top}px ${bottom}px ${bottom}px`,
        boxShadow: join?.bottom ? `inset 0 -0.5px 0 ${p.dividerLine}` : undefined,
      }}
    >
      {it.icon && <Symbol name={it.icon} size={24} color={p.onSurface} />}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 17, color: p.onBackground, lineHeight: "22px", fontWeight: 500 }}>{it.label}</div>
        {it.supporting && (
          <div style={{ fontSize: 14, color: p.onSurfaceVariantSummary, lineHeight: "18px", marginTop: 2 }}>{it.supporting}</div>
        )}
      </div>
      {trailing}
    </div>
  );
}

function ValueTrail({ value, p, swatch }: { value?: string; p: Palette; swatch?: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
      {swatch && <div style={{ width: 16, height: 16, borderRadius: 5, background: swatch }} />}
      {value && <span style={{ fontSize: 14, color: p.onSurfaceVariantSummary }}>{value}</span>}
      <ArrowUpDown color={p.onSurfaceVariantActions} />
    </div>
  );
}

function Tabs({ tabs, selected, p, vertical = false, iconsOnly = false }: { tabs: NavTab[]; selected?: number; p: Palette; vertical?: boolean; iconsOnly?: boolean }) {
  return (
    <div style={{ display: "flex", flexDirection: vertical ? "column" : "row", justifyContent: vertical ? "flex-start" : "space-around", height: "100%", padding: vertical ? "24px 8px" : "8px 4px" }}>
      {tabs.map((tab, i) => {
        const on = i === (selected ?? 0);
        const color = p.onSurfaceContainer;
        return (
          <div key={`${tab.label}-${i}`} style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 3, color, flex: 1, opacity: on ? 1 : 0.4 }}>
            <Symbol name={tab.icon} size={26} color={color} fill={on} />
            {!iconsOnly && tab.label && <span style={{ fontSize: 12, fontWeight: on ? 700 : 400 }}>{tab.label}</span>}
          </div>
        );
      })}
    </div>
  );
}

function PopupCard({ p, windowed, children, style }: { p: Palette; windowed?: boolean; children: ReactNode; style?: CSSProperties }) {
  return (
    <div
      style={{
        ...sq(16),
        background: p.surfaceContainer,
        boxShadow: `0 12px 40px ${p.windowDimming}`,
        border: windowed ? `1px solid ${p.outline}` : undefined,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export function MiuixNode({ item: it, palette: p, interactive = false, join, lang = "zh" }: { item: Item; palette: Palette; interactive?: boolean; join?: Join; lang?: Lang }) {
  const style: CSSProperties = {
    width: "100%",
    height: "100%",
    overflow: "hidden",
    pointerEvents: interactive ? "auto" : "none",
    userSelect: "none",
  };

  switch (it.kind) {
    case "button": {
      const variant = it.variant ?? "secondary";
      const bg = variant === "primary" ? p.primary : variant === "disabled" ? p.disabledSecondaryVariant : p.secondaryVariant;
      const fg = variant === "primary" ? p.onPrimary : variant === "disabled" ? p.disabledOnSecondaryVariant : p.onSecondaryVariant;
      return (
        <div className={interactive ? "miuix-press" : undefined} style={{ ...style, ...sq(16), background: bg, color: fg, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, fontSize: 17, fontWeight: 400, padding: "0 16px" }}>
          {it.icon && <Symbol name={it.icon} size={18} color={fg} />}
          {it.label}
        </div>
      );
    }
    case "iconButton":
      return (
        <div style={{ ...style, display: "grid", placeItems: "center" }}>
          <div style={{ width: 40, height: 40, borderRadius: 20, display: "grid", placeItems: "center" }}>
            <Symbol name={it.icon || "more_horiz"} size={24} color={p.onSurface} />
          </div>
        </div>
      );
    case "fab":
      return (
        <div className={interactive ? "miuix-press" : undefined} style={{ ...style, borderRadius: 999, background: p.primary, display: "grid", placeItems: "center", boxShadow: `0 6px 16px ${withAlpha(p.primary, 0.28)}` }}>
          <Symbol name={it.icon || "add"} size={26} color={p.onPrimary} />
        </div>
      );
    case "floatingToolbar":
      return (
        <div style={{ ...style, borderRadius: 50, background: p.surfaceContainer, boxShadow: "0 4px 10px rgba(0,0,0,0.1)", display: "flex", alignItems: "center", justifyContent: "space-evenly", padding: "0 10px" }}>
          {(it.tabs ?? []).map((tab, i) => (
            <Symbol key={i} name={tab.icon} size={22} color={i === (it.selected ?? 0) ? p.primary : p.onSurface} />
          ))}
        </div>
      );
    case "topAppBar": {
      const large = it.variant === "large";
      return (
        <div style={{ ...style, background: p.surface, padding: large ? "28px 16px 10px" : "28px 16px 8px", display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 2, minHeight: 40 }}>
            {it.icon && (
              <div style={{ width: 40, height: 40, display: "grid", placeItems: "center" }}>
                <Symbol name={it.icon} size={24} color={p.onSurface} />
              </div>
            )}
            <div style={{ flex: 1, fontSize: large ? 32 : 20, fontWeight: large ? 400 : 500, color: p.onSurface, letterSpacing: large ? -0.4 : 0, paddingLeft: it.icon ? 0 : 10 }}>{it.label}</div>
            {["tune", "sort", "more_horiz"].map((name) => (
              <div key={name} style={{ width: 40, height: 40, display: "grid", placeItems: "center" }}>
                <Symbol name={name} size={22} color={p.onSurface} />
              </div>
            ))}
          </div>
        </div>
      );
    }
    case "smallTitle":
      return (
        <div style={{ ...style, display: "flex", alignItems: "center", padding: "8px 28px", fontSize: 14, color: p.onBackgroundVariant, fontWeight: 700 }}>
          {it.label}
        </div>
      );
    case "navigationBar": {
      const blur = it.variant === "blur";
      return (
        <div style={{ ...style, position: "relative", overflow: "hidden", background: blur ? withAlpha(p.surface, 0.42) : p.surface, backdropFilter: blur ? "blur(28px) saturate(1.8)" : undefined, WebkitBackdropFilter: blur ? "blur(28px) saturate(1.8)" : undefined, display: "flex", flexDirection: "column" }}>
          {blur && <GlassNoise />}
          <div style={{ height: 0.5, background: p.dividerLine }} />
          <div style={{ flex: 1 }}>
            <Tabs tabs={it.tabs ?? []} selected={it.selected} p={p} />
          </div>
        </div>
      );
    }
    case "floatingNav": {
      if (it.variant === "glass") {
        const tabs = it.tabs ?? [];
        const n = Math.max(tabs.length, 1);
        const sel = it.selected ?? 0;
        return (
          <div
            style={{
              ...style,
              borderRadius: 999,
              background: withAlpha(p.surfaceContainer, 0.28),
              backdropFilter: "blur(32px) saturate(2)",
              WebkitBackdropFilter: "blur(32px) saturate(2)",
              boxShadow: `0 10px 28px ${withAlpha("#000", 0.16)}, inset 0 1px 0 rgba(255,255,255,0.7), inset 0 -1px 0 rgba(255,255,255,0.18)`,
              padding: 4,
              display: "flex",
              alignItems: "stretch",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <GlassNoise />
            <div
              style={{
                position: "absolute",
                top: 4,
                bottom: 4,
                left: `calc(4px + ${sel} * (100% - 8px) / ${n})`,
                width: `calc((100% - 8px) / ${n})`,
                borderRadius: 999,
                background: withAlpha(p.onSurface, 0.08),
                boxShadow: "inset 0 0 0 0.5px rgba(255,255,255,0.4)",
                transition: "left 220ms cubic-bezier(0.2, 0.8, 0.2, 1)",
              }}
            />
            {tabs.map((tab, i) => (
              <div key={i} style={{ flex: 1, zIndex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 1, color: p.onSurface, opacity: i === sel ? 1 : 0.42 }}>
                <Symbol name={tab.icon} size={22} color={p.onSurface} fill={i === sel} />
                {tab.label && <span style={{ fontSize: 11 }}>{tab.label}</span>}
              </div>
            ))}
          </div>
        );
      }
      return (
        <div style={{ ...style, borderRadius: 50, background: p.surfaceContainer, boxShadow: "0 10px 20px rgba(0,0,0,0.12)", padding: "0 12px", display: "flex", alignItems: "center", justifyContent: "center", gap: 12 }}>
          {(it.tabs ?? []).map((tab, i) => (
            <div key={i} style={{ padding: 10, opacity: i === (it.selected ?? 0) ? 1 : 0.4 }}>
              <Symbol name={tab.icon} size={28} color={p.onSurfaceContainer} fill={i === (it.selected ?? 0)} />
            </div>
          ))}
        </div>
      );
    }
    case "navigationRail": {
      const tabs = it.tabs ?? [];
      const sel = it.selected ?? 0;
      return (
        <div style={{ ...style, background: p.surface, padding: "24px 8px", display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
          {tabs.map((tab, i) => {
            const on = i === sel;
            return (
              <div key={i} style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center", gap: 4, padding: "8px 0" }}>
                <div style={{ ...sq(12), background: on ? p.surfaceContainerHigh : "transparent", padding: "4px 10px", display: "grid", placeItems: "center" }}>
                  <Symbol name={tab.icon} size={28} color={p.onSurface} fill={on} />
                </div>
                {tab.label && <span style={{ fontSize: 12, color: p.onSurface, opacity: on ? 1 : 0.6 }}>{tab.label}</span>}
              </div>
            );
          })}
        </div>
      );
    }
    case "tabRow": {
      const contour = it.variant === "contour";
      const tabs = it.tabs ?? [];
      const n = Math.max(tabs.length, 1);
      const sel = it.selected ?? 0;
      const gap = contour ? 5 : 9;
      const pad = contour ? 5 : 0;
      return (
        <div style={{ ...style, position: "relative", background: contour ? "transparent" : p.surface, ...sq(contour ? 11 : 12), padding: pad, display: "flex", gap, border: contour ? `1px solid ${p.outline}` : undefined, boxSizing: "border-box" }}>
          <div
            style={{
              position: "absolute",
              top: pad,
              bottom: pad,
              left: `calc(${pad}px + ${sel} * ((100% - ${pad * 2}px - ${(n - 1) * gap}px) / ${n} + ${gap}px))`,
              width: `calc((100% - ${pad * 2}px - ${(n - 1) * gap}px) / ${n})`,
              ...sq(contour ? 8 : 12),
              background: p.surfaceContainer,
              transition: "left 200ms linear",
            }}
          />
          {tabs.map((tab, i) => {
            const on = i === sel;
            return (
              <div
                key={i}
                style={{
                  flex: 1,
                  zIndex: 1,
                  color: on ? p.onBackground : p.onSurfaceVariantSummary,
                  display: "grid",
                  placeItems: "center",
                  fontSize: contour ? 14 : 16,
                  fontWeight: on ? 700 : 400,
                  ...sq(contour ? 8 : 12),
                  boxShadow: !contour && !on ? `inset 0 0 0 1px ${p.outline}` : undefined,
                }}
              >
                {tab.label}
              </div>
            );
          })}
        </div>
      );
    }
    case "searchBar": {
      const expanded = it.variant === "expanded";
      const field = (
        <div style={{ height: 45, borderRadius: 999, background: p.surfaceContainerHigh, display: "flex", alignItems: "center", gap: 8, padding: "0 16px" }}>
          <Symbol name="search" size={20} color={p.onSurfaceContainerHigh} />
          <span style={{ flex: 1, fontSize: 17, fontWeight: 500, color: p.onSurfaceContainerHigh }}>{it.label}</span>
          {expanded && <span style={{ fontSize: 17, fontWeight: 700, color: p.primary }}>{t("cancel", lang)}</span>}
        </div>
      );
      if (!expanded) return <div style={style}>{field}</div>;
      return (
        <div style={{ ...style, display: "flex", flexDirection: "column", gap: 4 }}>
          {field}
          <div style={{ ...sq(16), background: p.surfaceContainer, flex: 1, padding: "4px 0" }}>
            {hints(lang).map((row) => (
              <div key={row} style={{ padding: "12px 16px", fontSize: 17, color: p.onSurfaceContainer }}>{row}</div>
            ))}
          </div>
        </div>
      );
    }
    case "breadcrumb": {
      const parts = it.label.split(/\s*[\/·>]\s*/).filter(Boolean);
      return (
        <div style={{ ...style, display: "flex", alignItems: "center", padding: "8px 12px", gap: 0, overflow: "hidden" }}>
          {parts.map((part, i) => {
            const on = i === parts.length - 1;
            return (
              <span key={`${part}-${i}`} style={{ display: "flex", alignItems: "center", flexShrink: 0 }}>
                {i > 0 && (
                  <svg width={10} height={16} viewBox="0 0 10 16" style={{ margin: "0 4px" }} aria-hidden>
                    <path d="M3 2.5 7.2 8 3 13.5" fill="none" stroke={p.onSurfaceVariantActions} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
                <span
                  style={{
                    height: 32,
                    maxWidth: 160,
                    borderRadius: 999,
                    padding: "0 10px",
                    display: "grid",
                    placeItems: "center",
                    fontSize: 14,
                    fontWeight: on ? 500 : 400,
                    color: on ? p.primary : withAlpha(p.onBackground, 0.55),
                    background: on ? withAlpha(p.primary, 0.2) : withAlpha(p.onBackground, 0.1),
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {part}
                </span>
              </span>
            );
          })}
        </div>
      );
    }
    case "card":
      return (
        <div style={{ ...style, ...sq(16), background: p.surfaceContainer, padding: 16, display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {it.icon && <Symbol name={it.icon} size={24} color={p.primary} />}
            <div style={{ fontSize: 17, fontWeight: 500, color: p.onSurfaceContainer }}>{it.label}</div>
          </div>
          {it.supporting && <div style={{ fontSize: 14, color: p.onSurfaceVariantSummary, lineHeight: 1.45 }}>{it.supporting}</div>}
        </div>
      );
    case "surface":
      return <div style={{ ...style, ...sq(16), background: p.surface }} />;
    case "blur": {
      const scene = `radial-gradient(120% 80% at 10% 20%, ${p.primary} 0%, transparent 55%), radial-gradient(90% 70% at 90% 10%, #7C4DFF 0%, transparent 50%), linear-gradient(150deg, #E11D48 0%, ${p.primary} 48%, #0F9D58 100%)`;
      return (
        <div style={{ ...style, ...sq(16), position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", inset: 0, background: scene }} />
          <div style={{ position: "absolute", inset: -28, background: scene, filter: "blur(26px) saturate(1.6)", transform: "scale(1.12)" }} />
          <div
            style={{
              position: "absolute",
              inset: 22,
              ...sq(16),
              background: withAlpha(p.surfaceContainer, 0.32),
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.7), inset 0 -1px 0 rgba(255,255,255,0.14)",
              display: "grid",
              placeItems: "center",
              fontSize: 17,
              fontWeight: 500,
              color: p.onSurface,
              overflow: "hidden",
            }}
          >
            <GlassNoise />
            <span style={{ zIndex: 1 }}>{it.label}</span>
          </div>
        </div>
      );
    }
    case "divider":
      return it.variant === "vertical"
        ? <div style={{ ...style, background: p.dividerLine, width: 1, margin: "0 auto" }} />
        : <div style={{ ...style, background: p.dividerLine, height: 1, alignSelf: "center" }} />;
    case "snackbar":
      return (
        <div style={{ ...style, ...sq(16), background: p.onSecondaryVariant, color: p.secondaryVariant, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 12px", fontSize: 14 }}>
          <span>{it.label}</span>
          <span style={{ background: p.primary, color: p.onPrimary, borderRadius: 999, padding: "4px 12px", fontSize: 15, fontWeight: 500 }}>{t("confirm", lang)}</span>
        </div>
      );
    case "dialog":
      return (
        <div style={{ ...style, ...sq(32), background: p.background, padding: 24, display: "flex", flexDirection: "column", boxShadow: `0 16px 40px ${p.windowDimming}` }}>
          <div style={{ fontSize: 18, fontWeight: 500, color: p.onBackground }}>{it.label}</div>
          {it.supporting && <div style={{ fontSize: 17, color: p.onSurfaceSecondary, marginTop: 8, lineHeight: 1.45 }}>{it.supporting}</div>}
          <div style={{ marginTop: "auto", display: "flex", justifyContent: "flex-end", gap: 12 }}>
            <span style={{ ...sq(16), background: p.secondaryVariant, color: p.onSecondaryVariant, fontSize: 17, padding: "10px 18px" }}>{t("cancel", lang)}</span>
            <span style={{ ...sq(16), background: p.primary, color: p.onPrimary, fontSize: 17, padding: "10px 18px" }}>{t("confirm", lang)}</span>
          </div>
        </div>
      );
    case "textField":
      return (
        <div
          style={{
            ...style,
            ...sq(16),
            background: p.secondaryContainer,
            display: "flex",
            alignItems: "center",
            padding: 16,
            fontSize: 17,
            color: it.label ? p.onSurface : p.onSecondaryContainer,
            boxShadow: interactive ? `inset 0 0 0 2px ${p.primary}` : undefined,
          }}
        >
          {it.label || t("fieldHint", lang)}
          {interactive && <span className="miuix-caret" style={{ background: p.primary }} />}
        </div>
      );
    case "switch":
      return (
        <div style={{ ...style, display: "grid", placeItems: "center" }}>
          <SwitchTrack on={!!it.checked} p={p} />
        </div>
      );
    case "checkbox":
      return (
        <div style={{ ...style, display: "grid", placeItems: "center" }}>
          <Check on={!!it.checked} p={p} />
        </div>
      );
    case "radio":
      return (
        <div style={{ ...style, display: "grid", placeItems: "center" }}>
          <Check on={!!it.checked} p={p} radio />
        </div>
      );
    case "slider":
      if (it.variant === "vertical") {
        return (
          <div style={{ ...style, display: "grid", placeItems: "center" }}>
            <VerticalSliderBar p={p} value={it.value ?? 0.5} />
          </div>
        );
      }
      return (
        <div style={{ ...style, display: "flex", alignItems: "center" }}>
          <SliderBar p={p} value={it.value ?? 0.5} disabled={it.variant === "disabled"} steps={it.variant === "steps"} />
        </div>
      );
    case "rangeSlider":
      return (
        <div style={{ ...style, display: "flex", alignItems: "center" }}>
          <RangeBar p={p} from={rangeStart(it)} to={rangeEnd(it)} />
        </div>
      );
    case "dropdown":
      return (
        <div style={{ ...style, ...sq(16), background: p.surfaceContainer, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 16px" }}>
          <span style={{ fontSize: 17, color: p.onSurface }}>{it.tabs?.[it.selected ?? 0]?.label || it.label}</span>
          <ArrowUpDown color={p.onSurfaceVariantActions} />
        </div>
      );
    case "numberPicker": {
      const n = Number.parseInt(it.label, 10);
      const cur = Number.isFinite(n) ? n : 12;
      return (
        <div style={{ ...style, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
          {[-2, -1, 0, 1, 2].map((d) => {
            const dist = Math.abs(d);
            const scale = 1 - 0.2 * dist;
            const alpha = (1 - dist / 2) * (1 - dist * 0.25);
            return (
              <div
                key={d}
                style={{
                  height: 28,
                  display: "grid",
                  placeItems: "center",
                  fontSize: d === 0 ? 32 : 16,
                  fontWeight: d === 0 ? 600 : 400,
                  color: p.onSurface,
                  opacity: Math.max(0.18, alpha),
                  transform: `scale(${scale})`,
                  lineHeight: 1,
                }}
              >
                {cur + d}
              </div>
            );
          })}
        </div>
      );
    }
    case "text":
      return (
        <div style={{ ...style, display: "flex", alignItems: "center", fontSize: 17, color: p.onSurface }}>
          {it.label}
        </div>
      );
    case "image":
      return (
        <div style={{ ...style, ...sq(16), background: `radial-gradient(90% 70% at 18% 22%, ${p.primary} 0%, transparent 56%), radial-gradient(80% 60% at 92% 8%, #7C4DFF 0%, transparent 52%), linear-gradient(160deg, #E11D48, ${p.tertiaryContainer})`, display: "grid", placeItems: "center" }}>
          <Symbol name={it.icon || "image"} size={36} color="rgba(255,255,255,0.72)" />
        </div>
      );
    case "badge":
      if (it.variant === "dot" || !it.label) {
        return <div style={{ ...style, borderRadius: 999, background: p.error, minWidth: 6, minHeight: 6 }} />;
      }
      return (
        <div style={{ ...style, borderRadius: 999, background: p.error, color: p.onError, display: "grid", placeItems: "center", fontSize: 11, fontWeight: 600, padding: "0 5px" }}>
          {it.label}
        </div>
      );
    case "icon":
      return (
        <div style={{ ...style, display: "grid", placeItems: "center" }}>
          <Symbol name={it.icon || "star"} size={24} color={p.onSurface} />
        </div>
      );
    case "progress":
      if (it.variant === "infinite") {
        return (
          <div style={{ ...style, display: "grid", placeItems: "center" }}>
            <OrbitRing />
          </div>
        );
      }
      if (it.variant === "circular") {
        return (
          <div style={{ ...style, display: "grid", placeItems: "center" }}>
            <CircularRing value={it.value ?? 0.4} track={p.secondaryContainer} ink={p.primary} />
          </div>
        );
      }
      return (
        <div style={{ ...style, display: "flex", alignItems: "center" }}>
          <div style={{ flex: 1, height: 6, borderRadius: 6, background: p.secondaryContainer }}>
            <div style={{ width: `${Math.round((it.value ?? 0.4) * 100)}%`, height: "100%", background: p.primary, borderRadius: 6, transition: "width 120ms linear" }} />
          </div>
        </div>
      );
    case "pullToRefresh":
      return (
        <div style={{ ...style, display: "grid", placeItems: "center" }}>
          <OrbitRing size={20} stroke={1.8} dot={3.6} />
        </div>
      );
    case "bottomSheet":
      return (
        <div style={{ ...style, borderRadius: "28px 28px 0 0", background: p.background, padding: "10px 0 16px", display: "flex", flexDirection: "column", border: it.variant === "window" ? `1px solid ${p.outline}` : undefined }}>
          <div style={{ width: 36, height: 4, borderRadius: 4, background: withAlpha(p.onSurfaceVariantSummary, 0.2), alignSelf: "center", marginBottom: 8 }} />
          <div style={{ padding: "8px 24px 12px", fontSize: 18, fontWeight: 500, color: p.onBackground }}>{it.label}</div>
          {(it.tabs ?? [
            { icon: "", label: t("confirm", lang) },
            { icon: "", label: t("more", lang) },
          ]).slice(0, 3).map((tab, i) => (
            <div key={i} style={{ padding: "14px 24px", fontSize: 17, color: p.onSurfaceContainer, boxShadow: i < 2 ? `inset 0 -0.5px 0 ${p.dividerLine}` : undefined }}>{tab.label}</div>
          ))}
        </div>
      );
    case "listPopup":
    case "dropdownMenu":
    case "iconDropdownMenu": {
      const rows = it.tabs ?? [{ label: it.label, icon: "" }];
      const menu = (
        <PopupCard p={p} windowed={it.variant === "window"} style={{ flex: 1, padding: "6px 0", minHeight: 0 }}>
          {rows.map((tab, i) => (
            <div key={i} style={{ padding: "11px 16px", fontSize: 17, color: p.onSurface, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span>{tab.label}</span>
              {i === (it.selected ?? 0) && <CheckMark color={p.primary} size={18} />}
            </div>
          ))}
        </PopupCard>
      );
      if (it.kind !== "iconDropdownMenu") return <div style={{ ...style, display: "flex" }}>{menu}</div>;
      return (
        <div style={{ ...style, display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
          <div style={{ width: 40, height: 40, display: "grid", placeItems: "center" }}>
            <Symbol name={it.icon || "sort"} size={22} color={p.onSurface} />
          </div>
          <div style={{ width: "100%", flex: 1, minHeight: 0 }}>{menu}</div>
        </div>
      );
    }
    case "cascadingPopup":
    case "iconCascadingMenu":
      return (
        <div style={{ ...style, display: "flex", gap: 8, flexDirection: it.kind === "iconCascadingMenu" ? "column" : "row" }}>
          {it.kind === "iconCascadingMenu" && (
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <div style={{ width: 40, height: 40, display: "grid", placeItems: "center" }}>
                <Symbol name={it.icon || "tune"} size={22} color={p.onSurface} />
              </div>
            </div>
          )}
          <div style={{ flex: 1, display: "flex", gap: 8, minHeight: 0 }}>
            <PopupCard p={p} windowed={it.variant === "window"} style={{ flex: 1, padding: "6px 0" }}>
              {(it.tabs ?? []).map((tab, i) => (
                <div key={i} style={{ padding: "11px 14px", fontSize: 17, color: i === (it.selected ?? 0) ? p.primary : p.onSurface, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span>{tab.label}</span>
                  {i === (it.selected ?? 0) && <Symbol name="chevron_right" size={18} color={p.onSurfaceVariantActions} />}
                </div>
              ))}
            </PopupCard>
            <PopupCard p={p} windowed={it.variant === "window"} style={{ width: 108, padding: "12px 14px", fontSize: 14, color: p.onSurfaceVariantSummary }}>
              {it.tabs?.[it.selected ?? 0]?.label || t("more", lang)}
            </PopupCard>
          </div>
        </div>
      );
    case "tooltip":
      return it.variant === "rich" ? (
        <div style={{ ...style, ...sq(16), background: p.surfaceContainer, color: p.onSurface, padding: 16, display: "flex", flexDirection: "column", justifyContent: "center", gap: 8, boxShadow: `0 12px 32px ${p.windowDimming}` }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: p.onSurface }}>{it.label}</div>
          {it.supporting && <div style={{ fontSize: 13, color: p.onSurfaceContainerVariant, lineHeight: 1.4 }}>{it.supporting}</div>}
          <div style={{ alignSelf: "flex-end", ...sq(8), background: p.secondaryVariant, color: p.onSecondaryVariant, fontSize: 13, padding: "6px 12px" }}>{t("confirm", lang)}</div>
        </div>
      ) : (
        <div style={{ ...style, ...sq(12), background: p.onSecondaryVariant, color: p.secondaryVariant, display: "grid", placeItems: "center", fontSize: 13, padding: "8px 12px" }}>
          {it.label}
        </div>
      );
    case "colorPicker": {
      const hue = it.value ?? 0.6;
      const hex = hueColor(hue);
      return (
        <div style={{ ...style, display: "flex", flexDirection: "column", justifyContent: "space-between", gap: 12 }}>
          <div style={{ height: 26, borderRadius: 999, background: hex }} />
          <ColorBand colors="linear-gradient(90deg,#f00,#ff0,#0f0,#0ff,#00f,#f0f,#f00)" value={hue} />
          <ColorBand colors={`linear-gradient(90deg,#fff,${hex})`} value={0.82} />
          <ColorBand colors={`linear-gradient(90deg,#000,${hex})`} value={0.7} />
          <ColorBand colors={`linear-gradient(90deg,transparent,${hex})`} value={1} />
        </div>
      );
    }
    case "colorPalette": {
      const on = it.selected ?? 0;
      return (
        <div style={{ ...style, ...sq(16), overflow: "hidden", display: "grid", gridTemplateColumns: "repeat(13, 1fr)", gridTemplateRows: "repeat(7, 1fr)" }}>
          {Array.from({ length: 91 }, (_, i) => {
            const col = i % 13;
            const row = Math.floor(i / 13);
            const c = paletteCell(col, row);
            return (
              <div key={i} style={{ background: c, display: "grid", placeItems: "center" }}>
                {i === on && <div style={{ width: 10, height: 10, borderRadius: 999, boxShadow: `inset 0 0 0 2px ${row < 3 ? "#111" : "#fff"}` }} />}
              </div>
            );
          })}
        </div>
      );
    }
    case "scrollBar":
      return <div style={{ ...style, width: 4, borderRadius: 999, background: p.onSurfaceVariantActions, opacity: 0.1, margin: "0 auto" }} />;
    case "basicPref":
      return <PrefRow it={it} p={p} join={join} />;
    case "switchPref":
      return <PrefRow it={it} p={p} join={join} trailing={<SwitchTrack on={!!it.checked} p={p} />} />;
    case "checkboxPref":
      return <PrefRow it={it} p={p} join={join} trailing={<Check on={!!it.checked} p={p} />} />;
    case "radioPref":
      return <PrefRow it={it} p={p} join={join} trailing={<Check on={!!it.checked} p={p} radio />} />;
    case "sliderPref":
    case "rangeSliderPref":
      return (
        <div style={{ ...style, background: p.surfaceContainer, padding: "10px 16px 14px", borderRadius: `${join?.top ? 0 : 16}px ${join?.top ? 0 : 16}px ${join?.bottom ? 0 : 16}px ${join?.bottom ? 0 : 16}px` }}>
          <div style={{ fontSize: 17, fontWeight: 500, color: p.onBackground }}>{it.label}</div>
          {it.supporting && <div style={{ fontSize: 14, color: p.onSurfaceVariantSummary, marginTop: 2 }}>{it.supporting}</div>}
          <div style={{ marginTop: 12 }}>
            {it.kind === "rangeSliderPref" ? <RangeBar p={p} from={rangeStart(it)} to={rangeEnd(it)} /> : <SliderBar p={p} value={it.value ?? 0.5} />}
          </div>
        </div>
      );
    case "dropdownPref":
      return <PrefRow it={{ ...it, supporting: undefined }} p={p} join={join} trailing={<ValueTrail value={it.supporting} p={p} />} />;
    case "spinnerPref":
      return <PrefRow it={{ ...it, supporting: undefined }} p={p} join={join} trailing={<ValueTrail value={it.supporting} p={p} swatch={p.primary} />} />;
    case "arrowPref":
      return <PrefRow it={it} p={p} join={join} trailing={<Symbol name="chevron_right" size={22} color={p.onSurfaceVariantActions} />} />;
    default:
      return <div style={style}>{it.label}</div>;
  }
}

export function StatusBar({ palette: p, dark }: { palette: Palette; dark: boolean }) {
  const color = dark ? "#fff" : "#000";
  return (
    <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 28, display: "flex", alignItems: "flex-end", justifyContent: "space-between", padding: "0 18px 4px", color, fontSize: 12, fontWeight: 600, pointerEvents: "none", zIndex: 2 }}>
      <span>12:00</span>
      <span style={{ display: "flex", gap: 4, alignItems: "center" }}>
        <Symbol name="wifi" size={14} color={color} />
        <Symbol name="battery_full" size={14} color={color} />
      </span>
    </div>
  );
}
