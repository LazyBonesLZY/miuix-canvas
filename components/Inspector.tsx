"use client";

import type { ReactNode } from "react";
import { ICONS, KIND_SPEC } from "@/lib/tokens";
import { KIND_TEXT, TRANSITION_TEXT, t, type Lang } from "@/lib/i18n";
import type { Doc, Item, Screen, Selection, Transition } from "@/lib/types";
import { BACK_TARGET, TRANSITIONS, frameSize } from "@/lib/types";

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-[11px] text-[var(--muted)]">{label}</span>
      {children}
    </label>
  );
}

const input = "w-full rounded-[10px] border-0 bg-[var(--tile)] px-2.5 py-2 text-[13px] text-[var(--ink)] outline-none focus:ring-2 focus:ring-[var(--accent)]";

export function Inspector({
  doc,
  lang,
  selection,
  onChangeItem,
  onChangeScreen,
  onChangeTitle,
}: {
  doc: Doc;
  lang: Lang;
  selection: Selection;
  onChangeItem: (screenId: string, itemId: string, patch: Partial<Item>) => void;
  onChangeScreen: (screenId: string, patch: Partial<Screen>) => void;
  onChangeTitle: (title: string) => void;
}) {
  if (!selection) {
    return (
      <div className="flex flex-col gap-3 px-3 py-3">
        <Field label={t("title", lang)}>
          <input className={input} value={doc.title} onChange={(e) => onChangeTitle(e.target.value)} />
        </Field>
        <p className="text-[12px] leading-relaxed text-[var(--muted)]">{t("noSelection", lang)}</p>
      </div>
    );
  }

  const screen = doc.screens.find((s) => s.id === selection.screenId);
  if (!screen) return null;

  if (selection.kind === "screen") {
    const size = frameSize(screen.preset);
    return (
      <div className="flex flex-col gap-3 overflow-auto px-3 py-3">
        <Field label={t("screenName", lang)}>
          <input className={input} value={screen.name} onChange={(e) => onChangeScreen(screen.id, { name: e.target.value })} />
        </Field>
        <div className="text-[12px] text-[var(--muted)]">
          {screen.preset === "phone" ? t("phone", lang) : t("desktop", lang)} · {size.w}×{size.h}dp
        </div>
        <Field label={t("note", lang)}>
          <textarea className={`${input} min-h-[88px] resize-y`} value={screen.note ?? ""} onChange={(e) => onChangeScreen(screen.id, { note: e.target.value })} />
        </Field>
      </div>
    );
  }

  const it = screen.items.find((i) => i.id === selection.itemId);
  if (!it) return null;
  const spec = KIND_SPEC[it.kind];
  const patch = (p: Partial<Item>) => onChangeItem(screen.id, it.id, p);

  return (
    <div className="flex flex-col gap-3 overflow-auto px-3 py-3">
      <div className="text-[12px] font-medium text-[var(--accent)]">{KIND_TEXT[lang][it.kind]}</div>
      <Field label={t("label", lang)}>
        <input className={input} value={it.label} onChange={(e) => patch({ label: e.target.value })} />
      </Field>
      {(it.supporting !== undefined || spec.defaultSupporting) && (
        <Field label={t("supporting", lang)}>
          <input className={input} value={it.supporting ?? ""} onChange={(e) => patch({ supporting: e.target.value })} />
        </Field>
      )}
      <Field label={t("icon", lang)}>
        <div className="flex flex-wrap gap-1">
          {ICONS.map((icon) => (
            <button
              key={icon}
              type="button"
              onClick={() => patch({ icon })}
              className={`press grid h-8 w-8 place-items-center rounded-[8px] ${it.icon === icon ? "bg-[var(--accent-soft)] text-[var(--accent)]" : "bg-[var(--tile)] text-[var(--muted)]"}`}
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
                onClick={() => patch({ variant: v })}
                className={`press rounded-[8px] px-2.5 py-1 text-[12px] ${it.variant === v ? "bg-[var(--accent)] text-white" : "bg-[var(--tile)]"}`}
              >
                {v}
              </button>
            ))}
          </div>
        </Field>
      )}
      {typeof it.checked === "boolean" && (
        <label className="flex items-center justify-between text-[13px]">
          <span>{t("checked", lang)}</span>
          <input type="checkbox" checked={it.checked} onChange={(e) => patch({ checked: e.target.checked })} />
        </label>
      )}
      {typeof it.value === "number" && (
        <Field label={t("value", lang)}>
          <input type="range" min={0} max={1} step={0.05} value={it.value} onChange={(e) => patch({ value: Number(e.target.value) })} />
        </Field>
      )}
      {it.tabs && (
        <Field label={t("tabs", lang)}>
          <div className="flex flex-col gap-1.5">
            {it.tabs.map((tab, i) => (
              <div key={i} className="flex gap-1">
                <input className={input} value={tab.icon} onChange={(e) => {
                  const tabs = it.tabs!.map((x, j) => (j === i ? { ...x, icon: e.target.value } : x));
                  patch({ tabs });
                }} />
                <input className={input} value={tab.label} onChange={(e) => {
                  const tabs = it.tabs!.map((x, j) => (j === i ? { ...x, label: e.target.value } : x));
                  patch({ tabs });
                }} />
              </div>
            ))}
          </div>
        </Field>
      )}
      <Field label={t("target", lang)}>
        <select
          className={input}
          value={it.to ?? ""}
          onChange={(e) => patch({ to: e.target.value || undefined })}
        >
          <option value="">{t("none", lang)}</option>
          <option value={BACK_TARGET}>{t("back", lang)}</option>
          {doc.screens.filter((s) => s.id !== screen.id).map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
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
        <textarea className={`${input} min-h-[80px] resize-y`} value={it.note ?? ""} onChange={(e) => patch({ note: e.target.value })} />
      </Field>
    </div>
  );
}
