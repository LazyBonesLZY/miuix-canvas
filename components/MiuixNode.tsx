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
  const w = compact ? 38 : 42;
  const h = compact ? 22 : 24;
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
          top: 3,
          left: on ? w - h + 3 : 3,
          width: h - 6,
          height: h - 6,
          borderRadius: 999,
          background: on ? p.onPrimary : p.onSecondary,
        }}
      />
    </div>
  );
}

function Check({ on, p, radio = false }: { on: boolean; p: Palette; radio?: boolean }) {
  return (
    <div
      style={{
        width: 22,
        height: 22,
        borderRadius: radio ? 999 : 6,
        border: on ? "none" : `1.5px solid ${p.outline}`,
        background: on ? p.primary : "transparent",
        display: "grid",
        placeItems: "center",
        flexShrink: 0,
      }}
    >
      {on && <Symbol name={radio ? "circle" : "check"} size={14} color={p.onPrimary} fill />}
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
            width: 36,
            height: 36,
            borderRadius: 10,
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
        <div style={{ fontSize: 16, color: p.onSurfaceContainer, lineHeight: "22px", fontWeight: 400 }}>{it.label}</div>
        {it.supporting && (
          <div style={{ fontSize: 13, color: p.onSurfaceVariantSummary, lineHeight: "18px", marginTop: 2 }}>{it.supporting}</div>
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
      const variant = it.variant ?? "primary";
      const bg = variant === "primary" ? p.primary : variant === "secondary" ? p.secondaryVariant : "transparent";
      const fg = variant === "primary" ? p.onPrimary : variant === "secondary" ? p.onSecondaryVariant : p.primary;
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
              fontSize: 16,
              fontWeight: 500,
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
          <div style={{ width: 56, height: 56, borderRadius: 18, background: p.primary, display: "grid", placeItems: "center", boxShadow: `0 8px 20px ${withAlpha(p.primary, 0.35)}` }}>
            <Symbol name={it.icon || "add"} size={26} color={p.onPrimary} />
          </div>
        </div>
      );
    case "floatingToolbar":
      return (
        <div style={{ ...style, borderRadius: 26, background: p.surfaceContainerHighest, display: "flex", alignItems: "center", justifyContent: "space-evenly", padding: "0 8px" }}>
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
            <div style={{ flex: 1, fontSize: large ? 28 : 20, fontWeight: 600, color: p.onSurface, letterSpacing: large ? -0.4 : 0 }}>{it.label}</div>
            <Symbol name="more_horiz" size={22} color={p.onSurface} />
          </div>
        </div>
      );
    }
    case "smallTitle":
      return (
        <div style={{ ...style, display: "flex", alignItems: "flex-end", padding: "0 4px 4px", fontSize: 14, color: p.onSurfaceVariantSummary, fontWeight: 500 }}>
          {it.label}
        </div>
      );
    case "navigationBar":
      return (
        <div style={{ ...style, background: p.surfaceContainer, borderTop: `1px solid ${p.dividerLine}` }}>
          <Tabs tabs={it.tabs ?? []} selected={it.selected} p={p} />
        </div>
      );
    case "navigationRail":
      return (
        <div style={{ ...style, background: p.surfaceContainer }}>
          <Tabs tabs={it.tabs ?? []} selected={it.selected} p={p} vertical />
        </div>
      );
    case "tabRow":
      return (
        <div style={{ ...style, background: p.secondaryVariant, borderRadius: 12, padding: 3, display: "flex", gap: 3 }}>
          {(it.tabs ?? []).map((tab, i) => {
            const on = i === (it.selected ?? 0);
            return (
              <div
                key={i}
                style={{
                  flex: 1,
                  borderRadius: 10,
                  background: on ? p.surfaceContainer : "transparent",
                  color: on ? p.onSurface : p.onSurfaceVariantSummary,
                  display: "grid",
                  placeItems: "center",
                  fontSize: 14,
                  fontWeight: on ? 600 : 400,
                }}
              >
                {tab.label}
              </div>
            );
          })}
        </div>
      );
    case "searchBar":
      return (
        <div style={{ ...style, borderRadius: 18, background: p.surfaceContainerHigh, display: "flex", alignItems: "center", gap: 8, padding: "0 14px", color: p.onSurfaceContainerVariant }}>
          <Symbol name="search" size={20} color={p.onSurfaceVariantActions} />
          <span style={{ fontSize: 15, color: p.onSurfaceVariantSummary }}>{it.label}</span>
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
            <div style={{ fontSize: 17, fontWeight: 600, color: p.onSurfaceContainer }}>{it.label}</div>
          </div>
          {it.supporting && <div style={{ fontSize: 14, color: p.onSurfaceVariantSummary, lineHeight: 1.45 }}>{it.supporting}</div>}
        </div>
      );
    case "surface":
      return <div style={{ ...style, borderRadius: 16, background: p.surfaceContainer }} />;
    case "divider":
      return <div style={{ ...style, background: p.dividerLine, height: 1, alignSelf: "center" }} />;
    case "snackbar":
      return (
        <div style={{ ...style, borderRadius: 16, background: "#323232", color: "#fff", display: "flex", alignItems: "center", padding: "0 16px", fontSize: 14 }}>
          {it.label}
        </div>
      );
    case "dialog":
      return (
        <div style={{ ...style, borderRadius: 18, background: p.surfaceContainer, padding: 22, display: "flex", flexDirection: "column", boxShadow: `0 16px 40px ${p.windowDimming}` }}>
          <div style={{ fontSize: 18, fontWeight: 600, color: p.onSurface }}>{it.label}</div>
          {it.supporting && <div style={{ fontSize: 14, color: p.onSurfaceVariantSummary, marginTop: 8, lineHeight: 1.5 }}>{it.supporting}</div>}
          <div style={{ marginTop: "auto", display: "flex", justifyContent: "flex-end", gap: 8 }}>
            <span style={{ color: p.onSurfaceVariantSummary, fontSize: 15, padding: "6px 10px" }}>{t("cancel", lang)}</span>
            <span style={{ color: p.primary, fontSize: 15, fontWeight: 600, padding: "6px 10px" }}>{t("confirm", lang)}</span>
          </div>
        </div>
      );
    case "textField":
      return (
        <div style={{ ...style, borderRadius: 16, background: p.surfaceContainerHigh, display: "flex", alignItems: "center", padding: "0 14px", fontSize: 15, color: p.onSurfaceVariantSummary }}>
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
      return (
        <div style={{ ...style, display: "flex", alignItems: "center" }}>
          <div style={{ flex: 1, height: 4, borderRadius: 4, background: p.sliderBackground, position: "relative" }}>
            <div style={{ width: `${Math.round((it.value ?? 0.5) * 100)}%`, height: "100%", background: p.primary, borderRadius: 4 }} />
            <div style={{ position: "absolute", top: -6, left: `${Math.round((it.value ?? 0.5) * 100)}%`, width: 16, height: 16, marginLeft: -8, borderRadius: 8, background: p.primary }} />
          </div>
        </div>
      );
    case "dropdown":
      return (
        <div style={{ ...style, borderRadius: 16, background: p.surfaceContainer, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 14px" }}>
          <span style={{ fontSize: 15, color: p.onSurface }}>{it.label}</span>
          <Symbol name="expand_more" size={20} color={p.onSurfaceVariantActions} />
        </div>
      );
    case "numberPicker":
      return (
        <div style={{ ...style, borderRadius: 16, background: p.surfaceContainer, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: p.onSurfaceVariantSummary, fontSize: 16 }}>
          <div>11</div>
          <div style={{ fontSize: 28, fontWeight: 600, color: p.onSurface, lineHeight: 1.2 }}>{it.label || "12"}</div>
          <div>13</div>
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
      if (it.variant === "circular") {
        return (
          <div style={{ ...style, display: "grid", placeItems: "center" }}>
            <div style={{ width: 28, height: 28, borderRadius: 999, border: `3px solid ${p.sliderBackground}`, borderTopColor: p.primary }} />
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
        <div style={{ ...style, borderRadius: "20px 20px 0 0", background: p.surfaceContainer, padding: "10px 16px 16px", display: "flex", flexDirection: "column" }}>
          <div style={{ width: 36, height: 4, borderRadius: 4, background: p.outline, alignSelf: "center", marginBottom: 12 }} />
          <div style={{ fontSize: 17, fontWeight: 600, color: p.onSurface }}>{it.label}</div>
          {it.supporting && <div style={{ fontSize: 13, color: p.onSurfaceVariantSummary, marginTop: 6 }}>{it.supporting}</div>}
        </div>
      );
    case "listPopup":
      return (
        <div style={{ ...style, borderRadius: 16, background: p.surfaceContainer, boxShadow: `0 12px 32px ${p.windowDimming}`, padding: "6px 0" }}>
          {(it.tabs ?? [{ label: it.label, icon: "" }]).map((tab, i) => (
            <div key={i} style={{ padding: "10px 16px", fontSize: 15, color: p.onSurface }}>{tab.label}</div>
          ))}
        </div>
      );
    case "tooltip":
      return (
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
    case "switchPref":
      return <PrefRow it={it} p={p} join={join} trailing={<SwitchTrack on={!!it.checked} p={p} compact />} />;
    case "checkboxPref":
      return <PrefRow it={it} p={p} join={join} trailing={<Check on={!!it.checked} p={p} />} />;
    case "radioPref":
      return <PrefRow it={it} p={p} join={join} trailing={<Check on={!!it.checked} p={p} radio />} />;
    case "sliderPref":
      return (
        <div style={{ ...style, background: p.surfaceContainer, padding: "10px 16px", borderRadius: `${join?.top ? 0 : 16}px ${join?.top ? 0 : 16}px ${join?.bottom ? 0 : 16}px ${join?.bottom ? 0 : 16}px` }}>
          <div style={{ fontSize: 16, color: p.onSurfaceContainer }}>{it.label}</div>
          <div style={{ marginTop: 12, height: 4, borderRadius: 4, background: p.sliderBackground, position: "relative" }}>
            <div style={{ width: `${Math.round((it.value ?? 0.5) * 100)}%`, height: "100%", background: p.primary, borderRadius: 4 }} />
            <div style={{ position: "absolute", top: -6, left: `${Math.round((it.value ?? 0.5) * 100)}%`, width: 16, height: 16, marginLeft: -8, borderRadius: 8, background: p.primary }} />
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
