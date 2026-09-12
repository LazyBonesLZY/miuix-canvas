export type Palette = {
  primary: string;
  onPrimary: string;
  primaryContainer: string;
  onPrimaryContainer: string;
  primaryVariant: string;
  tertiaryContainer: string;
  onTertiaryContainer: string;
  secondary: string;
  onSecondary: string;
  secondaryVariant: string;
  onSecondaryVariant: string;
  secondaryContainer: string;
  onSecondaryContainer: string;
  background: string;
  onBackground: string;
  onBackgroundVariant: string;
  surface: string;
  onSurface: string;
  surfaceVariant: string;
  onSurfaceSecondary: string;
  onSurfaceVariantSummary: string;
  onSurfaceVariantActions: string;
  surfaceContainer: string;
  onSurfaceContainer: string;
  onSurfaceContainerVariant: string;
  surfaceContainerHigh: string;
  surfaceContainerHighest: string;
  outline: string;
  dividerLine: string;
  windowDimming: string;
  sliderBackground: string;
  error: string;
  onError: string;
};

export const MIUIX_BLUE = "#3482FF";

type Hsl = { h: number; s: number; l: number };

const clamp = (n: number, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, n));

export function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "").trim();
  const n = h.length === 3 ? h.split("").map((c) => c + c).join("") : h.padEnd(6, "0").slice(0, 6);
  const v = Number.parseInt(n, 16);
  return [(v >> 16) & 255, (v >> 8) & 255, v & 255];
}

export function rgbToHex(r: number, g: number, b: number): string {
  const h = (n: number) => Math.round(clamp(n, 0, 255)).toString(16).padStart(2, "0");
  return `#${h(r)}${h(g)}${h(b)}`.toUpperCase();
}

export function hexToHsl(hex: string): Hsl {
  const [r, g, b] = hexToRgb(hex).map((c) => c / 255);
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return { h: 0, s: 0, l };
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h = 0;
  if (max === r) h = (g - b) / d + (g < b ? 6 : 0);
  else if (max === g) h = (b - r) / d + 2;
  else h = (r - g) / d + 4;
  return { h: h * 60, s, l };
}

function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  const hue = ((h % 360) + 360) % 360;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => {
    const k = (n + hue / 30) % 12;
    return l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
  };
  return [f(0) * 255, f(8) * 255, f(4) * 255];
}

export function hslToHex(h: number, s: number, l: number): string {
  return rgbToHex(...hslToRgb(h, clamp(s), clamp(l)));
}

export function mix(a: string, b: string, t: number): string {
  const [ar, ag, ab] = hexToRgb(a);
  const [br, bg, bb] = hexToRgb(b);
  return rgbToHex(ar + (br - ar) * t, ag + (bg - ag) * t, ab + (bb - ab) * t);
}

export function withAlpha(hex: string, alpha: number): string {
  const [r, g, b] = hexToRgb(hex);
  return `rgba(${r},${g},${b},${clamp(alpha)})`;
}

export function isLightColor(hex: string): boolean {
  const [r, g, b] = hexToRgb(hex);
  return (r * 299 + g * 587 + b * 114) / 1000 > 160;
}

const LIGHT_SURFACES = {
  secondary: "#E6E6E6",
  onSecondary: "#FFFFFF",
  secondaryVariant: "#F0F0F0",
  onSecondaryVariant: "#303030",
  secondaryContainer: "#F0F0F0",
  onSecondaryContainer: "#A9A9A9",
  background: "#FFFFFF",
  onBackground: "#000000",
  onBackgroundVariant: "#8C93B0",
  surface: "#F7F7F7",
  onSurface: "#000000",
  surfaceVariant: "#FFFFFF",
  onSurfaceSecondary: "rgba(0,0,0,0.8)",
  onSurfaceVariantSummary: "rgba(0,0,0,0.6)",
  onSurfaceVariantActions: "rgba(0,0,0,0.4)",
  surfaceContainer: "#FFFFFF",
  onSurfaceContainer: "#000000",
  onSurfaceContainerVariant: "#959595",
  surfaceContainerHigh: "#E8E8E8",
  surfaceContainerHighest: "#E8E8E8",
  outline: "#D9D9D9",
  dividerLine: "#E0E0E0",
  windowDimming: "rgba(0,0,0,0.3)",
  sliderBackground: "rgba(0,0,0,0.06)",
  error: "#E94634",
  onError: "#FFFFFF",
};

const DARK_SURFACES = {
  secondary: "#505050",
  onSecondary: "#FFFFFF",
  secondaryVariant: "#434343",
  onSecondaryVariant: "#D9D9D9",
  secondaryContainer: "#434343",
  onSecondaryContainer: "#7C7C7C",
  background: "#242424",
  onBackground: "rgba(255,255,255,0.9)",
  onBackgroundVariant: "#787E96",
  surface: "#000000",
  onSurface: "#F2F2F2",
  surfaceVariant: "#242424",
  onSurfaceSecondary: "rgba(255,255,255,0.8)",
  onSurfaceVariantSummary: "rgba(255,255,255,0.5)",
  onSurfaceVariantActions: "rgba(255,255,255,0.4)",
  surfaceContainer: "#242424",
  onSurfaceContainer: "rgba(255,255,255,0.9)",
  onSurfaceContainerVariant: "#737373",
  surfaceContainerHigh: "#242424",
  surfaceContainerHighest: "#2D2D2D",
  outline: "#404040",
  dividerLine: "#393939",
  windowDimming: "rgba(0,0,0,0.6)",
  sliderBackground: "rgba(255,255,255,0.15)",
  error: "#F12522",
  onError: "#FFFFFF",
};

/** Shift MIUIX primary roles from a seed, keep HyperOS surfaces. */
export function schemeFromSeed(seed: string, dark: boolean): Palette {
  const raw = (seed || MIUIX_BLUE).toUpperCase();
  const { h, s } = hexToHsl(raw);
  const sat = clamp(s, 0.45, 0.95);
  const officialBlue = raw === MIUIX_BLUE;
  const primary = officialBlue ? (dark ? "#277AF7" : MIUIX_BLUE) : dark ? hslToHex(h, sat, 0.56) : hslToHex(h, sat, 0.6);
  const primaryContainer = officialBlue
    ? (dark ? "#277AF7" : "#5C9DFF")
    : dark
      ? hslToHex(h, sat * 0.85, 0.54)
      : hslToHex(h, sat * 0.82, 0.68);
  const primaryVariant = officialBlue ? (dark ? "#1F6AD4" : MIUIX_BLUE) : dark ? hslToHex(h, sat, 0.44) : primary;
  const tertiary = officialBlue ? (dark ? "#2B3B54" : "#EAF2FF") : dark ? hslToHex(h, 0.35, 0.24) : hslToHex(h, 0.55, 0.96);
  const onTertiary = officialBlue ? (dark ? "#5C9DFF" : MIUIX_BLUE) : dark ? hslToHex(h, 0.9, 0.64) : primary;
  const surfaces = dark ? DARK_SURFACES : LIGHT_SURFACES;
  return {
    primary,
    onPrimary: "#FFFFFF",
    primaryContainer,
    onPrimaryContainer: "#FFFFFF",
    primaryVariant,
    tertiaryContainer: tertiary,
    onTertiaryContainer: onTertiary,
    ...surfaces,
  };
}

export const PRESETS = [
  { key: "miuix", label: "Miuix", seed: MIUIX_BLUE },
  { key: "orange", label: "Orange", seed: "#FF6A00" },
  { key: "green", label: "Green", seed: "#0F9D58" },
  { key: "teal", label: "Teal", seed: "#0D9488" },
  { key: "purple", label: "Purple", seed: "#7C4DFF" },
  { key: "rose", label: "Rose", seed: "#E11D48" },
  { key: "gold", label: "Gold", seed: "#C9A227" },
] as const;
