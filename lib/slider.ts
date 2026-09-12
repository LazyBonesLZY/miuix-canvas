/** Official Miuix Slider: 28dp capsule, thumb radius = half-height * 0.72. */
export const SLIDER_SIZE = 28;
export const SLIDER_THUMB = SLIDER_SIZE * 0.72;

export function clamp01(n: number) {
  return Math.max(0, Math.min(1, n));
}

/** Thumb center as a CSS calc along a 28dp-thick track. */
export function thumbCenterCalc(v: number) {
  return `calc(${SLIDER_SIZE / 2}px + ${clamp01(v)} * (100% - ${SLIDER_SIZE}px))`;
}

/** Foreground pill width: round-cap stroke from 0 to the thumb center. */
export function fillLengthCalc(v: number) {
  return `calc(${SLIDER_SIZE}px + ${clamp01(v)} * (100% - ${SLIDER_SIZE}px))`;
}

export function rangeFillLeftCalc(from: number) {
  return `calc(${clamp01(from)} * (100% - ${SLIDER_SIZE}px))`;
}

export function rangeFillWidthCalc(from: number, to: number) {
  const lo = Math.min(clamp01(from), clamp01(to));
  const hi = Math.max(clamp01(from), clamp01(to));
  const span = Number((hi - lo).toFixed(3));
  return `calc(${span} * (100% - ${SLIDER_SIZE}px) + ${SLIDER_SIZE}px)`;
}

export function rangeStart(it: { from?: number; value?: number }) {
  return clamp01(it.from ?? Math.max(0, (it.value ?? 0.7) - 0.35));
}

export function rangeEnd(it: { from?: number; value?: number }) {
  return clamp01(it.value ?? 0.8);
}
