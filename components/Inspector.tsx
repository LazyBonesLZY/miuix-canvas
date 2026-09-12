"use client";

import type { ReactNode } from "react";
import { AiPanel } from "@/components/AiPanel";
import { applyVariant, ICONS, KIND_SPEC } from "@/lib/tokens";
import { KIND_TEXT, TRANSITION_TEXT, t, type Lang } from "@/lib/i18n";
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
    <button type="button" role="switch" aria-checked={on} className="press miuix-switch" data-on={on ? "1" : undefined} onClick={() => onChange(!on)} />
  );
}

const input = "miuix-field";

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
}: {
  doc: Doc;
  lang: Lang;
  selection: Selection;
  onChangeItem: (screenId: string, itemId: string, patch: Partial<Item>, record?: boolean) => void;
  onChangeScreen: (screenId: string, patch: Partial<Screen>, record?: boolean) => void;
  onChangeTitle: (title: string, record?: boolean) => void;
  onBeginHistory?: () => void;
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
      <div className="break-words text-[13px] font-medium text-[var(--accent)]">{KIND_TEXT[lang][it.kind]}</div>
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
                {v}
              </button>
            ))}
          </div>
        </Field>
      )}
      {typeof it.checked === "boolean" && (
        <div className="flex items-center justify-between rounded-[16px] bg-[var(--chrome)] px-4 py-3 text-[15px]">
          <span>{t("checked", lang)}</span>
          <ChromeSwitch on={it.checked} onChange={(checked) => patch({ checked })} />
        </div>
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
