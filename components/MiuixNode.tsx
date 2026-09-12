"use client";

import type { CSSProperties, ReactNode } from "react";
import type { Palette } from "@/lib/color";
import { withAlpha } from "@/lib/color";
import { t, type Lang } from "@/lib/i18n";
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

function thumbLeft(value: number) {
  const v = Math.max(0, Math.min(1, value));
  return `clamp(4px, calc(${v * 100}% - 10px), calc(100% - 24px))`;
}

function SliderBar({ p, value }: { p: Palette; value: number }) {
  const v = Math.max(0, Math.min(1, value));
  return (
    <div style={{ flex: 1, height: 28, borderRadius: 999, background: p.sliderBackground, position: "relative" }}>
      <div style={{ width: `${v * 100}%`, height: "100%", background: p.primary, borderRadius: 999, transition: "width 80ms linear" }} />
      <div style={{ position: "absolute", top: 4, left: thumbLeft(v), width: 20, height: 20, borderRadius: 10, background: p.onPrimary, boxShadow: "0 1px 2px rgba(0,0,0,0.16)", transition: "left 80ms linear" }} />
    </div>
  );
}

function RangeBar({ p, high }: { p: Palette; high: number }) {
  const hi = Math.max(0, Math.min(1, high));
  const lo = Math.max(0, hi - 0.35);
  return (
    <div style={{ flex: 1, height: 28, borderRadius: 999, background: p.sliderBackground, position: "relative" }}>
      <div style={{ position: "absolute", left: `${lo * 100}%`, width: `${Math.max((hi - lo) * 100, 8)}%`, height: "100%", background: p.primary, borderRadius: 999 }} />
      <div style={{ position: "absolute", top: 4, left: thumbLeft(lo), width: 20, height: 20, borderRadius: 10, background: p.onPrimary, boxShadow: "0 1px 2px rgba(0,0,0,0.16)" }} />
      <div style={{ position: "absolute", top: 4, left: thumbLeft(hi), width: 20, height: 20, borderRadius: 10, background: p.onPrimary, boxShadow: "0 1px 2px rgba(0,0,0,0.16)" }} />
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
        padding: "12px 16px",
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
        <div style={{ fontSize: 17, color: p.onSurfaceContainer, lineHeight: "22px", fontWeight: 500 }}>{it.label}</div>
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
      <Symbol name="chevron_right" size={22} color={p.onSurfaceVariantActions} />
    </div>
  );
}

function Tabs({ tabs, selected, p, vertical = false, iconsOnly = false }: { tabs: NavTab[]; selected?: number; p: Palette; vertical?: boolean; iconsOnly?: boolean }) {
  return (
    <div style={{ display: "flex", flexDirection: vertical ? "column" : "row", justifyContent: "space-around", height: "100%", padding: vertical ? "16px 8px" : "8px 4px 6px" }}>
      {tabs.map((tab, i) => {
        const on = i === (selected ?? 0);
        const color = on ? p.primary : p.onSurfaceVariantActions;
        return (
          <div key={`${tab.label}-${i}`} style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 3, color, flex: 1 }}>
            <Symbol name={tab.icon} size={24} color={color} fill={on} />
            {!iconsOnly && tab.label && <span style={{ fontSize: 11, fontWeight: on ? 700 : 400 }}>{tab.label}</span>}
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
      const bg = variant === "primary" ? p.primary : variant === "disabled" ? p.disabledSecondaryVariant : variant === "text" ? "transparent" : p.secondaryVariant;
      const fg = variant === "primary" ? p.onPrimary : variant === "disabled" ? p.disabledOnSecondaryVariant : variant === "text" ? p.primary : p.onSecondaryVariant;
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
        <div style={{ ...style, borderRadius: 50, background: p.surfaceContainerHighest, display: "flex", alignItems: "center", justifyContent: "space-evenly", padding: "0 10px" }}>
          {(it.tabs ?? []).map((tab, i) => (
            <Symbol key={i} name={tab.icon} size={22} color={i === (it.selected ?? 0) ? p.primary : p.onSurface} />
          ))}
        </div>
      );
    case "topAppBar": {
      const large = it.variant === "large";
      return (
        <div style={{ ...style, background: p.surface, padding: large ? "28px 12px 10px" : "28px 4px 8px", display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 2, minHeight: 40 }}>
            {it.icon && (
              <div style={{ width: 40, height: 40, display: "grid", placeItems: "center" }}>
                <Symbol name={it.icon} size={24} color={p.onSurface} />
              </div>
            )}
            <div style={{ flex: 1, fontSize: large ? 32 : 20, fontWeight: large ? 400 : 500, color: p.onSurface, letterSpacing: large ? -0.4 : 0, paddingLeft: it.icon ? 0 : 12 }}>{it.label}</div>
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
    case "navigationBar":
      return (
        <div style={{ ...style, background: p.surface }}>
          <Tabs tabs={it.tabs ?? []} selected={it.selected} p={p} />
        </div>
      );
    case "floatingNav":
      return (
        <div style={{ ...style, borderRadius: 50, background: p.surfaceContainerHighest, boxShadow: `0 10px 28px ${p.windowDimming}`, padding: "4px 12px" }}>
          <Tabs tabs={it.tabs ?? []} selected={it.selected} p={p} iconsOnly />
        </div>
      );
    case "navigationRail":
      return (
        <div style={{ ...style, background: p.surface }}>
          <Tabs tabs={it.tabs ?? []} selected={it.selected} p={p} vertical />
        </div>
      );
    case "tabRow": {
      const contour = it.variant === "contour";
      return (
        <div style={{ ...style, background: contour ? "transparent" : p.surface, ...sq(contour ? 11 : 12), padding: contour ? 3 : 3, display: "flex", gap: contour ? 6 : 8, border: contour ? `1px solid ${p.outline}` : undefined, boxSizing: "border-box" }}>
          {(it.tabs ?? []).map((tab, i) => {
            const on = i === (it.selected ?? 0);
            return (
              <div
                key={i}
                style={{
                  flex: 1,
                  ...sq(contour ? 8 : 12),
                  background: on ? p.surfaceContainer : "transparent",
                  color: on ? p.onBackground : p.onSurfaceVariantSummary,
                  display: "grid",
                  placeItems: "center",
                  fontSize: 14,
                  fontWeight: on ? 700 : 400,
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
          <Symbol name="search" size={20} color={p.onSurfaceVariantActions} />
          <span style={{ flex: 1, fontSize: 17, fontWeight: 500, color: p.onSurfaceVariantSummary }}>{it.label}</span>
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
        <div style={{ ...style, display: "flex", alignItems: "center", padding: "8px 12px", gap: 4, fontSize: 14 }}>
          {parts.map((part, i) => (
            <span key={`${part}-${i}`} style={{ display: "flex", alignItems: "center", gap: 4, color: i === parts.length - 1 ? p.onSurface : p.onSurfaceVariantSummary, fontWeight: i === parts.length - 1 ? 500 : 400 }}>
              {i > 0 && <Symbol name="chevron_right" size={16} color={p.onSurfaceVariantActions} />}
              {part}
            </span>
          ))}
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
      return <div style={{ ...style, ...sq(16), background: p.surfaceContainer }} />;
    case "blur":
      return (
        <div style={{ ...style, ...sq(16), position: "relative", overflow: "hidden", background: `linear-gradient(135deg, ${p.primary} 0%, #7C4DFF 50%, #E11D48 100%)` }}>
          <div style={{ position: "absolute", inset: 24, ...sq(16), background: withAlpha(p.surfaceContainer, 0.55), backdropFilter: "blur(18px)", WebkitBackdropFilter: "blur(18px)", display: "grid", placeItems: "center", fontSize: 17, fontWeight: 500, color: p.onSurface }}>
            {it.label}
          </div>
        </div>
      );
    case "divider":
      return it.variant === "vertical"
        ? <div style={{ ...style, background: p.dividerLine, width: 1, margin: "0 auto" }} />
        : <div style={{ ...style, background: p.dividerLine, height: 1, alignSelf: "center" }} />;
    case "snackbar":
      return (
        <div style={{ ...style, ...sq(16), background: p.onSecondaryVariant, color: p.secondaryVariant, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 12px", fontSize: 14 }}>
          <span>{it.label}</span>
          <span style={{ color: p.primary, fontWeight: 600, fontSize: 14 }}>{t("confirm", lang)}</span>
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
        <div style={{ ...style, ...sq(16), background: p.secondaryContainer, display: "flex", alignItems: "center", padding: "0 16px", fontSize: 17, color: it.label ? p.onSurface : p.onSecondaryContainer }}>
          {it.label || t("empty", lang)}
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
        const v = Math.round((it.value ?? 0.5) * 100);
        return (
          <div style={{ ...style, display: "grid", placeItems: "center" }}>
            <div style={{ width: 28, height: "100%", borderRadius: 999, background: p.sliderBackground, position: "relative" }}>
              <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: `${v}%`, background: p.primary, borderRadius: 999 }} />
              <div style={{ position: "absolute", left: 4, bottom: `clamp(4px, calc(${v}% - 10px), calc(100% - 24px))`, width: 20, height: 20, borderRadius: 10, background: p.onPrimary, boxShadow: "0 1px 2px rgba(0,0,0,0.16)" }} />
            </div>
          </div>
        );
      }
      return (
        <div style={{ ...style, display: "flex", alignItems: "center" }}>
          <SliderBar p={p} value={it.value ?? 0.5} />
        </div>
      );
    case "rangeSlider":
      return (
        <div style={{ ...style, display: "flex", alignItems: "center" }}>
          <RangeBar p={p} high={it.value ?? 0.7} />
        </div>
      );
    case "dropdown":
      return (
        <div style={{ ...style, ...sq(16), background: p.surfaceContainer, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 16px" }}>
          <span style={{ fontSize: 17, color: p.onSurface }}>{it.tabs?.[it.selected ?? 0]?.label || it.label}</span>
          <Symbol name="expand_more" size={22} color={p.onSurfaceVariantActions} />
        </div>
      );
    case "numberPicker": {
      const n = Number.parseInt(it.label, 10);
      const cur = Number.isFinite(n) ? n : 12;
      return (
        <div style={{ ...style, position: "relative", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: p.onSurfaceSecondary }}>
          <div style={{ position: "absolute", left: 12, right: 12, height: 45, ...sq(12), background: p.secondaryVariant }} />
          <div style={{ fontSize: 16, opacity: 0.4, zIndex: 1 }}>{cur - 1}</div>
          <div style={{ fontSize: 32, fontWeight: 400, color: p.onSurface, lineHeight: "45px", zIndex: 1 }}>{cur}</div>
          <div style={{ fontSize: 16, opacity: 0.4, zIndex: 1 }}>{cur + 1}</div>
        </div>
      );
    }
    case "text":
      return (
        <div style={{ ...style, display: "flex", alignItems: "center", fontSize: 17, color: p.onSurfaceSecondary }}>
          {it.label}
        </div>
      );
    case "image":
      return (
        <div style={{ ...style, ...sq(16), background: `linear-gradient(160deg, ${p.surfaceContainerHigh}, ${p.tertiaryContainer})`, display: "grid", placeItems: "center" }}>
          <Symbol name={it.icon || "image"} size={36} color={p.onSurfaceVariantActions} />
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
            <div className="miuix-spin" style={{ width: 20, height: 20, borderRadius: 999, border: `2px solid ${p.secondaryContainer}`, borderTopColor: p.primary, position: "relative" }}>
              <div style={{ position: "absolute", top: -3, right: 2, width: 4, height: 4, borderRadius: 999, background: p.primary }} />
            </div>
          </div>
        );
      }
      if (it.variant === "circular") {
        const v = Math.round((it.value ?? 0.4) * 100);
        return (
          <div style={{ ...style, display: "grid", placeItems: "center" }}>
            <div
              style={{
                width: 30,
                height: 30,
                borderRadius: 999,
                background: `conic-gradient(${p.primary} ${v}%, ${p.secondaryContainer} 0)`,
                WebkitMask: "radial-gradient(farthest-side, transparent calc(100% - 4px), #000 calc(100% - 3px))",
                mask: "radial-gradient(farthest-side, transparent calc(100% - 4px), #000 calc(100% - 3px))",
              }}
            />
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
          <div className="miuix-spin" style={{ width: 30, height: 30, borderRadius: 999, border: `4px solid ${p.secondaryContainer}`, borderTopColor: p.primary, boxSizing: "border-box" }} />
        </div>
      );
    case "bottomSheet":
      return (
        <div style={{ ...style, borderRadius: "28px 28px 0 0", background: p.surfaceContainer, padding: "10px 0 16px", display: "flex", flexDirection: "column", border: it.variant === "window" ? `1px solid ${p.outline}` : undefined }}>
          <div style={{ width: 36, height: 4, borderRadius: 4, background: p.outline, alignSelf: "center", marginBottom: 8 }} />
          <div style={{ padding: "8px 16px 12px", fontSize: 18, fontWeight: 500, color: p.onSurface }}>{it.label}</div>
          {(it.tabs ?? [
            { icon: "", label: t("confirm", lang) },
            { icon: "", label: t("more", lang) },
          ]).slice(0, 3).map((tab, i) => (
            <div key={i} style={{ padding: "14px 16px", fontSize: 17, color: p.onSurfaceContainer, boxShadow: i < 2 ? `inset 0 -0.5px 0 ${p.dividerLine}` : undefined }}>{tab.label}</div>
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
        <div style={{ ...style, ...sq(16), background: p.onSurface, color: p.surface, padding: 16, display: "flex", flexDirection: "column", justifyContent: "center", gap: 6 }}>
          <div style={{ fontSize: 14, fontWeight: 700 }}>{it.label}</div>
          {it.supporting && <div style={{ fontSize: 13, opacity: 0.72, lineHeight: 1.4 }}>{it.supporting}</div>}
          <div style={{ alignSelf: "flex-end", ...sq(8), background: withAlpha("#fff", 0.14), padding: "6px 12px", fontSize: 13 }}>{t("confirm", lang)}</div>
        </div>
      ) : (
        <div style={{ ...style, ...sq(12), background: p.onSurface, color: p.surface, display: "grid", placeItems: "center", fontSize: 13, padding: "8px 12px" }}>
          {it.label}
        </div>
      );
    case "colorPicker": {
      const hue = hueColor(it.value ?? 0.6);
      return (
        <div style={{ ...style, display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{ height: 28, ...sq(8), background: hue }} />
          <div style={{ flex: 1, ...sq(12), background: `linear-gradient(180deg,#fff,transparent),linear-gradient(90deg,#fff,${hue})`, backgroundBlendMode: "multiply" }} />
          <div style={{ height: 22, borderRadius: 999, background: "linear-gradient(90deg,#f00,#ff0,#0f0,#0ff,#00f,#f0f,#f00)", position: "relative" }}>
            <div style={{ position: "absolute", top: 3, left: `clamp(2px, calc(${(it.value ?? 0.6) * 100}% - 7px), calc(100% - 16px))`, width: 14, height: 16, borderRadius: 7, background: "#fff", boxShadow: "0 0 0 1px rgba(0,0,0,0.2)" }} />
          </div>
          <div style={{ height: 22, borderRadius: 999, background: `linear-gradient(90deg,transparent,${hue})`, boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.06)" }} />
        </div>
      );
    }
    case "colorPalette": {
      const swatches = ["#3482FF", "#FF6A00", "#0F9D58", "#7C4DFF", "#E11D48", "#C9A227", "#00000000", "#FFFFFF"];
      const on = it.selected ?? 0;
      return (
        <div style={{ ...style, ...sq(16), background: p.surfaceContainer, padding: 12, display: "grid", gridTemplateColumns: "repeat(8, 1fr)", gap: 8, alignContent: "center" }}>
          {swatches.map((c, i) => (
            <div
              key={c}
              style={{
                aspectRatio: "1",
                ...sq(8),
                background: c === "#00000000" ? "repeating-conic-gradient(#ddd 0 25%, #fff 0 50%) 50% / 8px 8px" : c,
                boxShadow: i === on ? `inset 0 0 0 2px ${p.primary}` : `inset 0 0 0 1px ${p.outline}`,
                display: "grid",
                placeItems: "center",
              }}
            >
              {i === on && <CheckMark color={c === "#FFFFFF" || c === "#00000000" ? p.primary : "#fff"} size={12} />}
            </div>
          ))}
        </div>
      );
    }
    case "scrollBar":
      return <div style={{ ...style, borderRadius: 999, background: p.onSurfaceVariantActions, opacity: 0.45 }} />;
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
          <div style={{ fontSize: 17, fontWeight: 500, color: p.onSurfaceContainer }}>{it.label}</div>
          {it.supporting && <div style={{ fontSize: 14, color: p.onSurfaceVariantSummary, marginTop: 2 }}>{it.supporting}</div>}
          <div style={{ marginTop: 12 }}>
            {it.kind === "rangeSliderPref" ? <RangeBar p={p} high={it.value ?? 0.7} /> : <SliderBar p={p} value={it.value ?? 0.5} />}
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
