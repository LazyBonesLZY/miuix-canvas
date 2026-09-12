"use client";

import type { ReactNode } from "react";
import { AiPanel } from "@/components/AiPanel";
import { applyVariant, ICONS, KIND_SPEC } from "@/lib/tokens";
import { TRANSITION_TEXT, directionLabel, effectLabel, kindShort, t, textStyleLabel, variantLabel, type Lang } from "@/lib/i18n";
import type { Doc, Item, Screen, Selection, Transition } from "@/lib/types";
import { BACK_TARGET, SWIPE_DIRS, TRANSITIONS, frameSize } from "@/lib/types";

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-[13px] text-[var(--muted-strong)]">{label}</span>
      {children}
    </label>
  );
}

function ChromeSwitch({ on, onChange }: { on: boolean; onChange: (next: boolean) => void }) {
  return (
    <button type="button" role="switch" aria-checked={on} className="miuix-switch" data-on={on ? "1" : undefined} onClick={() => onChange(!on)} />
  );
}

const input = "miuix-field";
const TEXT_STYLES = ["body1", "body2", "button", "footnote1", "footnote2", "headline1", "headline2", "subtitle", "title1", "title2", "title3", "title4"] as const;
const EFFECT_DIRS = ["top", "bottom", "left", "right"] as const;

function TargetSelect({
  doc,
  screenId,
  value,
  lang,
  onChange,
}: {
  doc: Doc;
  screenId: string;
  value?: string;
  lang: Lang;
  onChange: (to: string | undefined) => void;
}) {
  return (
    <select className={input} value={value ?? ""} onChange={(e) => onChange(e.target.value || undefined)}>
      <option value="">{t("none", lang)}</option>
      <option value={BACK_TARGET}>{t("back", lang)}</option>
      {doc.screens.filter((s) => s.id !== screenId).map((s) => (
        <option key={s.id} value={s.id}>{s.name}</option>
      ))}
    </select>
  );
}

export function Inspector({
  doc,
  lang,
  selection,
  onChangeItem,
  onChangeScreen,
  onChangeTitle,
  onBeginHistory,
  onDelete,
  onDuplicate,
}: {
  doc: Doc;
  lang: Lang;
  selection: Selection;
  onChangeItem: (screenId: string, itemId: string, patch: Partial<Item>, record?: boolean) => void;
  onChangeScreen: (screenId: string, patch: Partial<Screen>, record?: boolean) => void;
  onChangeTitle: (title: string, record?: boolean) => void;
  onBeginHistory?: () => void;
  onDelete?: () => void;
  onDuplicate?: () => void;
}) {
  if (!selection) {
    return (
      <div className="flex flex-col gap-3 px-3 py-3">
        <Field label={t("title", lang)}>
          <input className={input} value={doc.title} onFocus={onBeginHistory} onChange={(e) => onChangeTitle(e.target.value, false)} />
        </Field>
        <p className="text-[13px] leading-relaxed text-[var(--muted)]">{t("noSelection", lang)}</p>
      </div>
    );
  }

  const screen = doc.screens.find((s) => s.id === selection.screenId);
  if (!screen) return null;

  if (selection.kind === "screen") {
    const size = frameSize(screen.preset);
    return (
      <div className="flex flex-col gap-3 px-3 py-3">
        <div className="flex items-center gap-2">
          <div className="min-w-0 flex-1 text-[13px] font-medium text-[var(--accent)]">{t("screenName", lang)}</div>
          {onDelete && (
            <button type="button" className="press miuix-icon-btn h-11 min-w-11 text-[#e94634]" title={t("deleteScreen", lang)} onClick={onDelete}>
              <span className="ms text-[20px]">delete</span>
            </button>
          )}
        </div>
        <Field label={t("screenName", lang)}>
          <input className={input} value={screen.name} onFocus={onBeginHistory} onChange={(e) => onChangeScreen(screen.id, { name: e.target.value }, false)} />
        </Field>
        <div className="text-[13px] text-[var(--muted)]">
          {screen.preset === "phone" ? t("phone", lang) : t("desktop", lang)} · {size.w}×{size.h}dp
        </div>
        <Field label={t("note", lang)}>
          <textarea className={`${input} min-h-[88px] resize-y`} value={screen.note ?? ""} onFocus={onBeginHistory} onChange={(e) => onChangeScreen(screen.id, { note: e.target.value }, false)} />
        </Field>
        <div className="text-[13px] text-[var(--muted-strong)]">{t("swipe", lang)}</div>
        {SWIPE_DIRS.map((dir) => (
          <Field key={dir} label={t(`swipe${dir[0].toUpperCase()}${dir.slice(1)}` as "swipeLeft", lang)}>
            <TargetSelect doc={doc} screenId={screen.id} lang={lang} value={screen.swipe?.[dir]} onChange={(to) => onChangeScreen(screen.id, { swipe: { ...screen.swipe, [dir]: to } })} />
          </Field>
        ))}
        <AiPanel doc={doc} lang={lang} screen={screen} onNote={(note) => onChangeScreen(screen.id, { note })} />
      </div>
    );
  }

  const it = screen.items.find((i) => i.id === selection.itemId);
  if (!it) return null;
  const spec = KIND_SPEC[it.kind];
  const patch = (p: Partial<Item>, record = true) => onChangeItem(screen.id, it.id, p, record);

  return (
    <div className="flex flex-col gap-3 px-3 py-3">
      <div className="flex items-center gap-2">
        <div className="min-w-0 flex-1 break-words text-[13px] font-medium text-[var(--accent)]">{kindShort(it.kind, lang)}</div>
        {onDuplicate && (
          <button type="button" className="press miuix-icon-btn h-11 min-w-11" title={t("duplicate", lang)} onClick={onDuplicate}>
            <span className="ms text-[20px]">content_copy</span>
          </button>
        )}
        {onDelete && (
          <button type="button" className="press miuix-icon-btn h-11 min-w-11 text-[#e94634]" title={t("delete", lang)} onClick={onDelete}>
            <span className="ms text-[20px]">delete</span>
          </button>
        )}
      </div>
      <Field label={t("label", lang)}>
        <input className={input} value={it.label} onFocus={onBeginHistory} onChange={(e) => patch({ label: e.target.value }, false)} />
      </Field>
      {(it.supporting !== undefined || spec.defaultSupporting) && (
        <Field label={t("supporting", lang)}>
          <input className={input} value={it.supporting ?? ""} onFocus={onBeginHistory} onChange={(e) => patch({ supporting: e.target.value }, false)} />
        </Field>
      )}
      <Field label={t("icon", lang)}>
        <div className="flex flex-wrap gap-1">
          <button
            type="button"
            onClick={() => patch({ icon: null })}
            className={`press grid h-9 w-9 place-items-center rounded-[12px] ${!it.icon ? "bg-[var(--accent-soft)] text-[var(--accent)]" : "bg-[var(--tile)] text-[var(--muted)]"}`}
          >
            <span className="ms text-[18px]">block</span>
          </button>
          {ICONS.map((icon) => (
            <button
              key={icon}
              type="button"
              onClick={() => patch({ icon })}
              className={`press grid h-9 w-9 place-items-center rounded-[12px] ${it.icon === icon ? "bg-[var(--accent-soft)] text-[var(--accent)]" : "bg-[var(--tile)] text-[var(--muted)]"}`}
            >
              <span className="ms text-[18px]">{icon}</span>
            </button>
          ))}
        </div>
      </Field>
      {spec.variants && (
        <Field label={t("variant", lang)}>
          <div className="flex flex-wrap gap-1">
            {spec.variants.map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => patch(applyVariant(it, v))}
                className="press miuix-chip"
                data-on={it.variant === v ? "1" : undefined}
              >
                {variantLabel(v, lang)}
              </button>
            ))}
          </div>
        </Field>
      )}
      {it.kind !== "blur" && (
        <Field label={t("effect", lang)}>
          <select className={input} value={it.effect ?? "none"} onChange={(e) => patch({ effect: e.target.value === "none" ? undefined : e.target.value as Item["effect"] })}>
            <option value="none">{effectLabel("none", lang)}</option>
            <option value="textureBlur">{effectLabel("textureBlur", lang)}</option>
            <option value="progressiveTextureBlur">{effectLabel("progressiveTextureBlur", lang)}</option>
          </select>
        </Field>
      )}
      {(it.kind === "blur" || (it.effect && it.effect !== "none")) && (
        <>
          <Field label={`${t("blurRadius", lang)} ${(it.blurRadius ?? 20).toFixed(0)}dp`}>
            <input type="range" min={0} max={150} step={1} value={it.blurRadius ?? 20} onPointerDown={onBeginHistory} onChange={(e) => patch({ blurRadius: Number(e.target.value) }, false)} />
          </Field>
          <Field label={t("noise", lang)}>
            <input type="number" min={0} max={0.1} step={0.0005} className={input} value={it.noiseCoefficient ?? (it.effect === "progressiveTextureBlur" ? 0 : 0.0045)} onChange={(e) => patch({ noiseCoefficient: Number(e.target.value) })} />
          </Field>
          {it.effect === "progressiveTextureBlur" && (
            <Field label={t("direction", lang)}>
              <select className={input} value={it.effectDirection ?? "top"} onChange={(e) => patch({ effectDirection: e.target.value as Item["effectDirection"] })}>
                {EFFECT_DIRS.map((direction) => <option key={direction} value={direction}>{directionLabel(direction, lang)}</option>)}
              </select>
            </Field>
          )}
        </>
      )}
      <div className="flex items-center justify-between gap-3 rounded-[16px] bg-[var(--chrome)] px-4 py-3 text-[15px]">
        <span className="min-w-0 flex-1 leading-snug">{t("enabled", lang)}</span>
        <ChromeSwitch on={it.enabled ?? true} onChange={(enabled) => patch({ enabled })} />
      </div>
      {(["dialog", "bottomSheet", "listPopup", "cascadingPopup", "dropdownMenu", "iconDropdownMenu", "iconCascadingMenu", "tooltip"] as Item["kind"][]).includes(it.kind) && (
        <div className="flex items-center justify-between rounded-[16px] bg-[var(--chrome)] px-4 py-3 text-[15px]">
          <span>{t("showOverlay", lang)}</span>
          <ChromeSwitch on={it.show ?? true} onChange={(show) => patch({ show })} />
        </div>
      )}
      <Field label={t("parent", lang)}>
        <select className={input} value={it.parentId ?? ""} onChange={(e) => patch({ parentId: e.target.value || undefined })}>
          <option value="">{t("screenRoot", lang)}</option>
          {screen.items.filter((candidate) => candidate.id !== it.id && (candidate.kind === "card" || candidate.kind === "surface")).map((candidate) => (
            <option key={candidate.id} value={candidate.id}>{candidate.label || kindShort(candidate.kind, lang)}</option>
          ))}
        </select>
      </Field>
      {it.kind === "topAppBar" && (
        <>
          <Field label={t("largeTitle", lang)}>
            <input className={input} value={it.largeTitle ?? ""} onFocus={onBeginHistory} onChange={(e) => patch({ largeTitle: e.target.value }, false)} />
          </Field>
          <Field label={t("subtitleField", lang)}>
            <input className={input} value={it.subtitle ?? ""} onFocus={onBeginHistory} onChange={(e) => patch({ subtitle: e.target.value }, false)} />
          </Field>
        </>
      )}
      {(it.kind === "snackbar" || it.kind === "dialog" || it.kind === "tooltip") && (
        <Field label={t("actionLabel", lang)}>
          <input className={input} value={it.actionLabel ?? ""} onFocus={onBeginHistory} onChange={(e) => patch({ actionLabel: e.target.value }, false)} />
        </Field>
      )}
      {(it.kind === "navigationBar" || it.kind === "floatingNav" || it.kind === "navigationRail") && (
        <Field label={t("badgeText", lang)}>
          <input className={input} value={it.badge ?? ""} onFocus={onBeginHistory} onChange={(e) => patch({ badge: e.target.value || undefined }, false)} />
        </Field>
      )}
      {it.kind === "pullToRefresh" && (
        <div className="flex items-center justify-between rounded-[16px] bg-[var(--chrome)] px-4 py-3 text-[15px]">
          <span>{t("refreshing", lang)}</span>
          <ChromeSwitch on={it.refreshing ?? false} onChange={(refreshing) => patch({ refreshing })} />
        </div>
      )}
      {it.kind === "textField" && (
        <div className="flex items-center justify-between rounded-[16px] bg-[var(--chrome)] px-4 py-3 text-[15px]">
          <span>{t("multiline", lang)}</span>
          <ChromeSwitch on={it.multiline ?? false} onChange={(multiline) => patch({ multiline })} />
        </div>
      )}
      {it.kind === "image" && (
        <>
          <Field label={t("imageUrl", lang)}>
            <input className={input} value={it.source ?? ""} onFocus={onBeginHistory} onChange={(e) => patch({ source: e.target.value || undefined }, false)} />
          </Field>
          <Field label={t("altText", lang)}>
            <input className={input} value={it.contentDescription ?? ""} onFocus={onBeginHistory} onChange={(e) => patch({ contentDescription: e.target.value || undefined }, false)} />
          </Field>
        </>
      )}
      {it.kind === "text" && (
        <Field label={t("textStyle", lang)}>
          <select className={input} value={it.textStyle ?? "body1"} onChange={(e) => patch({ textStyle: e.target.value as Item["textStyle"] })}>
            {TEXT_STYLES.map((style) => (
              <option key={style} value={style}>{textStyleLabel(style, lang)}</option>
            ))}
          </select>
        </Field>
      )}
      {(it.kind === "colorPicker" || it.kind === "colorPalette") && (
        <Field label={t("colorField", lang)}>
          <input type="color" className={`${input} h-10`} value={(it.color ?? "#3482FF").slice(0, 7)} onChange={(e) => patch({ color: e.target.value })} />
        </Field>
      )}
      {typeof it.checked === "boolean" && (
        <div className="flex items-center justify-between rounded-[16px] bg-[var(--chrome)] px-4 py-3 text-[15px]">
          <span>{t("checked", lang)}</span>
          <ChromeSwitch on={it.checked} onChange={(checked) => patch({ checked })} />
        </div>
      )}
      {(it.kind === "radio" || it.kind === "radioPref") && (
        <Field label={t("radioGroup", lang)}>
          <input className={input} value={it.group ?? ""} onFocus={onBeginHistory} onChange={(e) => patch({ group: e.target.value || undefined }, false)} />
        </Field>
      )}
      {(it.kind === "rangeSlider" || it.kind === "rangeSliderPref") && (
        <Field label={t("rangeStart", lang)}>
          <input type="range" min={0} max={1} step={0.05} value={it.from ?? 0.2} onPointerDown={onBeginHistory} onChange={(e) => patch({ from: Number(e.target.value) }, false)} />
        </Field>
      )}
      {typeof it.value === "number" && (
        <Field label={t("value", lang)}>
          <input type="range" min={0} max={1} step={0.05} value={it.value} onPointerDown={onBeginHistory} onChange={(e) => patch({ value: Number(e.target.value) }, false)} />
        </Field>
      )}
      {it.tabs && (
        <Field label={t("tabs", lang)}>
          <div className="flex flex-col gap-2">
            {it.tabs.map((tab, i) => (
              <div key={i} className={`flex flex-col gap-1 rounded-[16px] p-2 ${(it.selected ?? 0) === i ? "bg-[var(--accent-soft)]" : "bg-[var(--chrome)]"}`}>
                <button type="button" className="self-start text-[11px] text-[var(--accent)]" onClick={() => patch({ selected: i })}>
                  {t("selected", lang)} {i === (it.selected ?? 0) ? "●" : "○"}
                </button>
                <div className="flex flex-col gap-1">
                  <input className={input} value={tab.icon} onFocus={onBeginHistory} onChange={(e) => patch({ tabs: it.tabs!.map((x, j) => (j === i ? { ...x, icon: e.target.value } : x)) }, false)} placeholder={t("icon", lang)} />
                  <input className={input} value={tab.label} onFocus={onBeginHistory} onChange={(e) => patch({ tabs: it.tabs!.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)) }, false)} placeholder={t("label", lang)} />
                </div>
                <input className={input} value={tab.badge ?? ""} onFocus={onBeginHistory} onChange={(e) => patch({ tabs: it.tabs!.map((x, j) => (j === i ? { ...x, badge: e.target.value || undefined } : x)) }, false)} placeholder={t("badge", lang)} />
                <TargetSelect
                  doc={doc}
                  screenId={screen.id}
                  lang={lang}
                  value={tab.to}
                  onChange={(to) => patch({ tabs: it.tabs!.map((x, j) => (j === i ? { ...x, to } : x)) })}
                />
              </div>
            ))}
          </div>
        </Field>
      )}
      <Field label={t("target", lang)}>
        <TargetSelect doc={doc} screenId={screen.id} lang={lang} value={it.to} onChange={(to) => patch({ to })} />
      </Field>
      {it.to && (
        <Field label={t("transition", lang)}>
          <select className={input} value={it.transition ?? "slide"} onChange={(e) => patch({ transition: e.target.value as Transition })}>
            {TRANSITIONS.map((tr) => (
              <option key={tr} value={tr}>{TRANSITION_TEXT[lang][tr]}</option>
            ))}
          </select>
        </Field>
      )}
      <Field label={t("note", lang)}>
        <textarea className={`${input} min-h-[80px] resize-y`} value={it.note ?? ""} onFocus={onBeginHistory} onChange={(e) => patch({ note: e.target.value }, false)} />
      </Field>
      <AiPanel doc={doc} lang={lang} screen={screen} item={it} onNote={(note) => patch({ note })} />
    </div>
  );
}
