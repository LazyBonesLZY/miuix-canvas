"use client";

import type { CSSProperties, ReactNode } from "react";
import type { Palette } from "@/lib/color";
import { withAlpha } from "@/lib/color";
import { t, type Lang } from "@/lib/i18n";
import type { Item, Join, NavTab } from "@/lib/types";

function Symbol({ name, size = 20, color, fill = false }: { name?: string | null; size?: number; color?: string; fill?: boolean }) {
  if (!name) return null;
  return (
    <span
      className="ms"
      data-fill={fill ? "1" : undefined}
      style={{ fontSize: size, color, width: size, height: size }}
    >
      {name}
    </span>
  );
}

function SwitchTrack({ on, p, compact = false }: { on: boolean; p: Palette; compact?: boolean }) {
  const w = compact ? 44 : 49;
  const h = compact ? 26 : 28;
  const thumb = compact ? 18 : 20;
  return (
    <div
      style={{
        width: w,
        height: h,
        borderRadius: 999,
        background: on ? p.primary : p.secondary,
        position: "relative",
        flexShrink: 0,
      }}
    >
      <div
        style={{
          position: "absolute",
          top: (h - thumb) / 2,
          left: on ? w - thumb - 4 : 4,
          width: thumb,
          height: thumb,
          borderRadius: 999,
          background: on ? p.onPrimary : p.onSecondary,
        }}
      />
    </div>
  );
}

function Check({ on, p, radio = false }: { on: boolean; p: Palette; radio?: boolean }) {
  if (radio) {
    return (
      <div style={{ width: 26, height: 26, display: "grid", placeItems: "center", flexShrink: 0 }}>
        {on && <Symbol name="check" size={20} color={p.primary} />}
      </div>
    );
  }
  return (
    <div
      style={{
        width: 26,
        height: 26,
        borderRadius: 999,
        background: on ? p.primary : p.secondary,
        display: "grid",
        placeItems: "center",
        flexShrink: 0,
      }}
    >
      {on && <Symbol name="check" size={16} color={p.onPrimary} />}
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
      <div style={{ width: `${v * 100}%`, height: "100%", background: p.primary, borderRadius: 999 }} />
      <div style={{ position: "absolute", top: 4, left: thumbLeft(v), width: 20, height: 20, borderRadius: 10, background: p.onPrimary, boxShadow: "0 1px 2px rgba(0,0,0,0.18)" }} />
    </div>
  );
}

function RangeBar({ p, high }: { p: Palette; high: number }) {
  const hi = Math.max(0, Math.min(1, high));
  const lo = Math.max(0, hi - 0.35);
  return (
    <div style={{ flex: 1, height: 28, borderRadius: 999, background: p.sliderBackground, position: "relative" }}>
      <div style={{ position: "absolute", left: `${lo * 100}%`, width: `${Math.max((hi - lo) * 100, 8)}%`, height: "100%", background: p.primary, borderRadius: 999 }} />
      <div style={{ position: "absolute", top: 4, left: thumbLeft(lo), width: 20, height: 20, borderRadius: 10, background: p.onPrimary, boxShadow: "0 1px 2px rgba(0,0,0,0.18)" }} />
      <div style={{ position: "absolute", top: 4, left: thumbLeft(hi), width: 20, height: 20, borderRadius: 10, background: p.onPrimary, boxShadow: "0 1px 2px rgba(0,0,0,0.18)" }} />
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
        padding: "10px 16px",
        display: "flex",
        alignItems: "center",
        gap: 12,
        background: p.surfaceContainer,
        borderRadius: `${top}px ${top}px ${bottom}px ${bottom}px`,
        boxShadow: join?.bottom ? `inset 0 -1px 0 ${p.dividerLine}` : undefined,
      }}
    >
      {it.icon && (
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: 12,
            background: p.tertiaryContainer,
            display: "grid",
            placeItems: "center",
            flexShrink: 0,
          }}
        >
          <Symbol name={it.icon} size={20} color={p.onTertiaryContainer} />
        </div>
      )}
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

function Tabs({ tabs, selected, p, vertical = false }: { tabs: NavTab[]; selected?: number; p: Palette; vertical?: boolean }) {
  return (
    <div style={{ display: "flex", flexDirection: vertical ? "column" : "row", justifyContent: "space-around", height: "100%", padding: vertical ? "12px 8px" : "6px 4px" }}>
      {tabs.map((tab, i) => {
        const on = i === (selected ?? 0);
        return (
          <div key={`${tab.label}-${i}`} style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 2, color: on ? p.primary : p.onSurfaceVariantActions, flex: 1 }}>
            <Symbol name={tab.icon} size={22} color={on ? p.primary : p.onSurfaceVariantActions} fill={on} />
            {tab.label && <span style={{ fontSize: 11, fontWeight: on ? 600 : 400 }}>{tab.label}</span>}
          </div>
        );
      })}
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
      const bg = variant === "primary" ? p.primary : variant === "text" ? "transparent" : p.secondaryVariant;
      const fg = variant === "primary" ? p.onPrimary : variant === "text" ? p.primary : p.onSecondaryVariant;
      return (
        <div style={{ ...style, display: "grid", placeItems: "center" }}>
          <div
            style={{
              minWidth: 58,
              height: 50,
              padding: "0 20px",
              borderRadius: 16,
              background: bg,
              color: fg,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
              fontSize: 17,
              fontWeight: 400,
            }}
          >
            {it.icon && <Symbol name={it.icon} size={18} color={fg} />}
            {it.label}
          </div>
        </div>
      );
    }
    case "iconButton":
      return (
        <div style={{ ...style, display: "grid", placeItems: "center" }}>
          <div style={{ width: 40, height: 40, borderRadius: 20, display: "grid", placeItems: "center" }}>
            <Symbol name={it.icon || "more_horiz"} size={22} color={p.onSurface} />
          </div>
        </div>
      );
    case "fab":
      return (
        <div style={{ ...style, display: "grid", placeItems: "center" }}>
          <div style={{ width: "100%", height: "100%", borderRadius: 999, background: p.primary, display: "grid", placeItems: "center", boxShadow: `0 4px 12px ${withAlpha(p.primary, 0.28)}` }}>
            <Symbol name={it.icon || "add"} size={26} color={p.onPrimary} />
          </div>
        </div>
      );
    case "floatingToolbar":
      return (
        <div style={{ ...style, borderRadius: 50, background: p.surfaceContainerHighest, display: "flex", alignItems: "center", justifyContent: "space-evenly", padding: "0 8px" }}>
          {(it.tabs ?? []).map((tab, i) => (
            <Symbol key={i} name={tab.icon} size={22} color={p.onSurface} />
          ))}
        </div>
      );
    case "topAppBar": {
      const large = it.variant === "large";
      return (
        <div style={{ ...style, background: p.surface, padding: large ? "28px 16px 12px" : "28px 8px 8px", display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 4, minHeight: 40 }}>
            {it.icon && <Symbol name={it.icon} size={22} color={p.onSurface} />}
            <div style={{ flex: 1, fontSize: large ? 32 : 20, fontWeight: large ? 400 : 500, color: p.onSurface, letterSpacing: large ? -0.4 : 0 }}>{it.label}</div>
            <Symbol name="more_horiz" size={22} color={p.onSurface} />
          </div>
        </div>
      );
    }
    case "smallTitle":
      return (
        <div style={{ ...style, display: "flex", alignItems: "flex-end", padding: "0 12px 4px", fontSize: 14, color: p.onBackgroundVariant, fontWeight: 700 }}>
          {it.label}
        </div>
      );
    case "navigationBar":
      return (
        <div style={{ ...style, background: p.surface, borderTop: `1px solid ${p.dividerLine}` }}>
          <Tabs tabs={it.tabs ?? []} selected={it.selected} p={p} />
        </div>
      );
    case "floatingNav":
      return (
        <div style={{ ...style, borderRadius: 999, background: p.surfaceContainerHighest, boxShadow: `0 10px 28px ${p.windowDimming}`, padding: "4px 10px" }}>
          <Tabs tabs={it.tabs ?? []} selected={it.selected} p={p} />
        </div>
      );
    case "navigationRail":
      return (
        <div style={{ ...style, background: p.surfaceContainer }}>
          <Tabs tabs={it.tabs ?? []} selected={it.selected} p={p} vertical />
        </div>
      );
    case "tabRow": {
      const contour = it.variant === "contour";
      return (
        <div style={{ ...style, background: contour ? "transparent" : p.surface, borderRadius: 12, padding: 3, display: "flex", gap: 9, border: contour ? `1px solid ${p.outline}` : undefined }}>
          {(it.tabs ?? []).map((tab, i) => {
            const on = i === (it.selected ?? 0);
            return (
              <div
                key={i}
                style={{
                  flex: 1,
                  borderRadius: contour ? 8 : 12,
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
    case "searchBar":
      return (
        <div style={{ ...style, borderRadius: 999, background: p.surfaceContainerHigh, display: "flex", alignItems: "center", gap: 8, padding: "0 16px", color: p.onSurfaceContainerVariant }}>
          <Symbol name="search" size={20} color={p.onSurfaceVariantActions} />
          <span style={{ fontSize: 17, fontWeight: 500, color: p.onSurfaceVariantSummary }}>{it.label}</span>
        </div>
      );
    case "breadcrumb":
      return (
        <div style={{ ...style, display: "flex", alignItems: "center", padding: "0 4px", fontSize: 13, color: p.onSurfaceVariantSummary }}>
          {it.label}
        </div>
      );
    case "card":
      return (
        <div style={{ ...style, borderRadius: 16, background: p.surfaceContainer, padding: 16, display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {it.icon && (
              <div style={{ width: 40, height: 40, borderRadius: 12, background: p.tertiaryContainer, display: "grid", placeItems: "center" }}>
                <Symbol name={it.icon} size={22} color={p.onTertiaryContainer} />
              </div>
            )}
            <div style={{ fontSize: 17, fontWeight: 500, color: p.onSurfaceContainer }}>{it.label}</div>
          </div>
          {it.supporting && <div style={{ fontSize: 14, color: p.onSurfaceVariantSummary, lineHeight: 1.45 }}>{it.supporting}</div>}
        </div>
      );
    case "surface":
      return <div style={{ ...style, borderRadius: 16, background: p.surfaceContainer }} />;
    case "divider":
      return it.variant === "vertical"
        ? <div style={{ ...style, background: p.dividerLine, width: 1, margin: "0 auto" }} />
        : <div style={{ ...style, background: p.dividerLine, height: 1, alignSelf: "center" }} />;
    case "snackbar":
      return (
        <div style={{ ...style, borderRadius: 16, background: p.onSecondaryVariant, color: p.secondaryVariant, display: "flex", alignItems: "center", padding: "0 12px", fontSize: 14 }}>
          {it.label}
        </div>
      );
    case "dialog":
      return (
        <div style={{ ...style, borderRadius: 32, background: p.background, padding: 24, display: "flex", flexDirection: "column", boxShadow: `0 16px 40px ${p.windowDimming}` }}>
          <div style={{ fontSize: 18, fontWeight: 500, color: p.onBackground }}>{it.label}</div>
          {it.supporting && <div style={{ fontSize: 17, color: p.onSurfaceSecondary, marginTop: 8, lineHeight: 1.5 }}>{it.supporting}</div>}
          <div style={{ marginTop: "auto", display: "flex", justifyContent: "flex-end", gap: 8 }}>
            <span style={{ color: p.onSurfaceVariantSummary, fontSize: 17, padding: "8px 14px" }}>{t("cancel", lang)}</span>
            <span style={{ color: p.primary, fontSize: 17, fontWeight: 600, padding: "8px 14px" }}>{t("confirm", lang)}</span>
          </div>
        </div>
      );
    case "textField":
      return (
        <div style={{ ...style, borderRadius: 16, background: p.secondaryContainer, display: "flex", alignItems: "center", padding: "0 16px", fontSize: 17, color: p.onSecondaryContainer }}>
          {it.label}
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
              <div style={{ position: "absolute", left: 4, bottom: `clamp(4px, calc(${v}% - 10px), calc(100% - 24px))`, width: 20, height: 20, borderRadius: 10, background: p.onPrimary, boxShadow: "0 1px 2px rgba(0,0,0,0.18)" }} />
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
        <div style={{ ...style, borderRadius: 16, background: p.surfaceContainer, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 14px" }}>
          <span style={{ fontSize: 17, color: p.onSurface }}>{it.label}</span>
          <Symbol name="expand_more" size={20} color={p.onSurfaceVariantActions} />
        </div>
      );
    case "numberPicker":
      return (
        <div style={{ ...style, position: "relative", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: p.onSurfaceSecondary }}>
          <div style={{ position: "absolute", left: 8, right: 8, height: 45, borderRadius: 12, background: p.secondaryVariant }} />
          <div style={{ fontSize: 16, opacity: 0.45, zIndex: 1 }}>11</div>
          <div style={{ fontSize: 32, fontWeight: 400, color: p.onSurface, lineHeight: "45px", zIndex: 1 }}>{it.label || "12"}</div>
          <div style={{ fontSize: 16, opacity: 0.45, zIndex: 1 }}>13</div>
        </div>
      );
    case "text":
      return (
        <div style={{ ...style, display: "flex", alignItems: "center", fontSize: 15, color: p.onSurfaceSecondary }}>
          {it.label}
        </div>
      );
    case "image":
      return (
        <div style={{ ...style, borderRadius: 16, background: p.surfaceContainerHigh, display: "grid", placeItems: "center" }}>
          <Symbol name={it.icon || "image"} size={36} color={p.onSurfaceVariantActions} />
        </div>
      );
    case "badge":
      return (
        <div style={{ ...style, borderRadius: 999, background: p.error, color: p.onError, display: "grid", placeItems: "center", fontSize: 11, fontWeight: 600 }}>
          {it.label}
        </div>
      );
    case "icon":
      return (
        <div style={{ ...style, display: "grid", placeItems: "center" }}>
          <Symbol name={it.icon || "star"} size={24} color={p.primary} />
        </div>
      );
    case "progress":
      if (it.variant === "circular" || it.variant === "infinite") {
        return (
          <div style={{ ...style, display: "grid", placeItems: "center" }}>
            {it.variant === "infinite" ? (
              <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
                {[0, 1, 2].map((i) => (
                  <div key={i} style={{ width: 6, height: 6, borderRadius: 999, background: p.primary, opacity: 0.35 + i * 0.3 }} />
                ))}
              </div>
            ) : (
              <div style={{ width: 28, height: 28, borderRadius: 999, border: `3px solid ${p.sliderBackground}`, borderTopColor: p.primary }} />
            )}
          </div>
        );
      }
      return (
        <div style={{ ...style, display: "flex", alignItems: "center" }}>
          <div style={{ flex: 1, height: 6, borderRadius: 6, background: p.sliderBackground }}>
            <div style={{ width: `${Math.round((it.value ?? 0.4) * 100)}%`, height: "100%", background: p.primary, borderRadius: 6 }} />
          </div>
        </div>
      );
    case "pullToRefresh":
      return (
        <div style={{ ...style, display: "grid", placeItems: "center" }}>
          <div style={{ width: 36, height: 36, borderRadius: 18, background: p.surfaceContainer, display: "grid", placeItems: "center", boxShadow: "0 2px 8px rgba(0,0,0,0.12)" }}>
            <Symbol name="refresh" size={20} color={p.primary} />
          </div>
        </div>
      );
    case "bottomSheet":
      return (
        <div style={{ ...style, borderRadius: "20px 20px 0 0", background: p.surfaceContainer, padding: "10px 16px 16px", display: "flex", flexDirection: "column", border: it.variant === "window" ? `1px solid ${p.outline}` : undefined }}>
          <div style={{ width: 36, height: 4, borderRadius: 4, background: p.outline, alignSelf: "center", marginBottom: 12 }} />
          <div style={{ fontSize: 17, fontWeight: 500, color: p.onSurface }}>{it.label}</div>
          {it.supporting && <div style={{ fontSize: 13, color: p.onSurfaceVariantSummary, marginTop: 6 }}>{it.supporting}</div>}
        </div>
      );
    case "listPopup":
    case "dropdownMenu":
      return (
        <div style={{ ...style, borderRadius: 16, background: p.surfaceContainer, boxShadow: `0 12px 32px ${p.windowDimming}`, padding: "6px 0" }}>
          {(it.tabs ?? [{ label: it.label, icon: "" }]).map((tab, i) => (
            <div key={i} style={{ padding: "10px 16px", fontSize: 17, color: p.onSurface }}>{tab.label}</div>
          ))}
        </div>
      );
    case "cascadingPopup":
      return (
        <div style={{ ...style, display: "flex", gap: 8 }}>
          <div style={{ flex: 1, borderRadius: 16, background: p.surfaceContainer, boxShadow: `0 12px 32px ${p.windowDimming}`, padding: "6px 0" }}>
            {(it.tabs ?? []).map((tab, i) => (
              <div key={i} style={{ padding: "10px 12px", fontSize: 14, color: p.onSurface, display: "flex", justifyContent: "space-between" }}>
                <span>{tab.label}</span>
                {i === (it.tabs?.length ?? 1) - 1 && <Symbol name="chevron_right" size={16} color={p.onSurfaceVariantActions} />}
              </div>
            ))}
          </div>
          <div style={{ width: 96, borderRadius: 16, background: p.surfaceContainerHigh, boxShadow: `0 12px 32px ${p.windowDimming}`, padding: "10px 12px", fontSize: 13, color: p.onSurfaceVariantSummary }}>
            {t("more", lang)}
          </div>
        </div>
      );
    case "tooltip":
      return it.variant === "rich" ? (
        <div style={{ ...style, borderRadius: 14, background: p.onSurface, color: p.surface, padding: "10px 12px", display: "flex", flexDirection: "column", justifyContent: "center", gap: 4 }}>
          <div style={{ fontSize: 13, fontWeight: 600 }}>{it.label}</div>
          {it.supporting && <div style={{ fontSize: 11, opacity: 0.72 }}>{it.supporting}</div>}
        </div>
      ) : (
        <div style={{ ...style, borderRadius: 12, background: p.onSurface, color: p.surface, display: "grid", placeItems: "center", fontSize: 12, padding: "0 10px" }}>
          {it.label}
        </div>
      );
    case "colorPicker":
      return (
        <div style={{ ...style, borderRadius: 16, background: p.surfaceContainer, padding: 12, display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{ flex: 1, borderRadius: 12, background: "linear-gradient(180deg,#fff,hsl(214,100%,60%)),linear-gradient(90deg,#fff,#3482FF)", backgroundBlendMode: "multiply" }} />
          <div style={{ height: 10, borderRadius: 6, background: "linear-gradient(90deg,#f00,#ff0,#0f0,#0ff,#00f,#f0f,#f00)" }} />
        </div>
      );
    case "colorPalette":
      return (
        <div style={{ ...style, display: "flex", alignItems: "center", gap: 8, padding: "0 4px" }}>
          {["#3482FF", "#FF6A00", "#0F9D58", "#7C4DFF", "#E11D48", "#C9A227"].map((c) => (
            <div key={c} style={{ width: 28, height: 28, borderRadius: 8, background: c }} />
          ))}
        </div>
      );
    case "scrollBar":
      return <div style={{ ...style, borderRadius: 999, background: p.outline, opacity: 0.7 }} />;
    case "basicPref":
      return <PrefRow it={it} p={p} join={join} />;
    case "switchPref":
      return <PrefRow it={it} p={p} join={join} trailing={<SwitchTrack on={!!it.checked} p={p} compact />} />;
    case "checkboxPref":
      return <PrefRow it={it} p={p} join={join} trailing={<Check on={!!it.checked} p={p} />} />;
    case "radioPref":
      return <PrefRow it={it} p={p} join={join} trailing={<Check on={!!it.checked} p={p} radio />} />;
    case "sliderPref":
    case "rangeSliderPref":
      return (
        <div style={{ ...style, background: p.surfaceContainer, padding: "10px 16px", borderRadius: `${join?.top ? 0 : 16}px ${join?.top ? 0 : 16}px ${join?.bottom ? 0 : 16}px ${join?.bottom ? 0 : 16}px` }}>
          <div style={{ fontSize: 17, fontWeight: 500, color: p.onSurfaceContainer }}>{it.label}</div>
          <div style={{ marginTop: 12 }}>
            {it.kind === "rangeSliderPref" ? <RangeBar p={p} high={it.value ?? 0.7} /> : <SliderBar p={p} value={it.value ?? 0.5} />}
          </div>
        </div>
      );
    case "dropdownPref":
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
