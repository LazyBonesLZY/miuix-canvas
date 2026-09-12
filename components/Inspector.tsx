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
const local = (lang: Lang, zh: string, en: string, ja: string, ko: string) => ({ zh, en, ja, ko }[lang]);

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
      {it.kind !== "blur" && (
        <Field label={local(lang, "Miuix 效果", "Miuix effect", "Miuix エフェクト", "Miuix 효과")}>
          <select className={input} value={it.effect ?? "none"} onChange={(e) => patch({ effect: e.target.value === "none" ? undefined : e.target.value as Item["effect"] })}>
            <option value="none">{local(lang, "无", "None", "なし", "없음")}</option>
            <option value="textureBlur">Modifier.textureBlur</option>
            <option value="progressiveTextureBlur">Modifier.progressiveTextureBlur</option>
          </select>
        </Field>
      )}
      {(it.kind === "blur" || (it.effect && it.effect !== "none")) && (
        <>
          <Field label={`${local(lang, "模糊半径", "Blur radius", "ブラー半径", "블러 반경")} ${(it.blurRadius ?? 20).toFixed(0)}dp`}>
            <input type="range" min={0} max={150} step={1} value={it.blurRadius ?? 20} onPointerDown={onBeginHistory} onChange={(e) => patch({ blurRadius: Number(e.target.value) }, false)} />
          </Field>
          <Field label={local(lang, "噪声系数", "Noise coefficient", "ノイズ係数", "노이즈 계수")}>
            <input type="number" min={0} max={0.1} step={0.0005} className={input} value={it.noiseCoefficient ?? (it.effect === "progressiveTextureBlur" ? 0 : 0.0045)} onChange={(e) => patch({ noiseCoefficient: Number(e.target.value) })} />
          </Field>
          {it.effect === "progressiveTextureBlur" && (
            <Field label={local(lang, "渐进方向", "Progressive direction", "グラデーション方向", "점진 방향")}>
              <select className={input} value={it.effectDirection ?? "top"} onChange={(e) => patch({ effectDirection: e.target.value as Item["effectDirection"] })}>
                {["top", "bottom", "left", "right"].map((direction) => <option key={direction} value={direction}>{direction}</option>)}
              </select>
            </Field>
          )}
        </>
      )}
      <div className="flex items-center justify-between rounded-[16px] bg-[var(--chrome)] px-4 py-3 text-[15px]">
        <span>{local(lang, "启用", "Enabled", "有効", "사용")}</span>
        <ChromeSwitch on={it.enabled ?? true} onChange={(enabled) => patch({ enabled })} />
      </div>
      {(["dialog", "bottomSheet", "listPopup", "cascadingPopup", "dropdownMenu", "iconDropdownMenu", "iconCascadingMenu", "tooltip"] as Item["kind"][]).includes(it.kind) && (
        <div className="flex items-center justify-between rounded-[16px] bg-[var(--chrome)] px-4 py-3 text-[15px]">
          <span>{local(lang, "显示弹层", "Show overlay", "オーバーレイ表示", "오버레이 표시")}</span>
          <ChromeSwitch on={it.show ?? true} onChange={(show) => patch({ show })} />
        </div>
      )}
      <Field label={local(lang, "Scaffold 槽位", "Scaffold slot", "Scaffold スロット", "Scaffold 슬롯")}>
        <select className={input} value={it.slot ?? "content"} onChange={(e) => patch({ slot: e.target.value as Item["slot"] })}>
          {["content", "topBar", "bottomBar", "floatingActionButton", "floatingToolbar", "snackbarHost", "overlay"].map((slot) => (
            <option key={slot} value={slot}>{slot}</option>
          ))}
        </select>
      </Field>
      <Field label={local(lang, "父容器", "Parent container", "親コンテナ", "상위 컨테이너")}>
        <select className={input} value={it.parentId ?? ""} onChange={(e) => patch({ parentId: e.target.value || undefined })}>
          <option value="">{local(lang, "屏幕根节点", "Screen root", "画面ルート", "화면 루트")}</option>
          {screen.items.filter((candidate) => candidate.id !== it.id && (candidate.kind === "card" || candidate.kind === "surface")).map((candidate) => (
            <option key={candidate.id} value={candidate.id}>{candidate.label || KIND_TEXT[lang][candidate.kind]}</option>
          ))}
        </select>
      </Field>
      {it.kind === "topAppBar" && (
        <>
          <Field label={local(lang, "大标题", "Large title", "大タイトル", "큰 제목")}>
            <input className={input} value={it.largeTitle ?? ""} onFocus={onBeginHistory} onChange={(e) => patch({ largeTitle: e.target.value }, false)} />
          </Field>
          <Field label={local(lang, "副标题", "Subtitle", "サブタイトル", "부제")}>
            <input className={input} value={it.subtitle ?? ""} onFocus={onBeginHistory} onChange={(e) => patch({ subtitle: e.target.value }, false)} />
          </Field>
        </>
      )}
      {(it.kind === "snackbar" || it.kind === "dialog" || it.kind === "tooltip") && (
        <Field label={local(lang, "操作文字", "Action label", "アクション", "작업 문구")}>
          <input className={input} value={it.actionLabel ?? ""} onFocus={onBeginHistory} onChange={(e) => patch({ actionLabel: e.target.value }, false)} />
        </Field>
      )}
      {(it.kind === "navigationBar" || it.kind === "floatingNav" || it.kind === "navigationRail") && (
        <Field label={local(lang, "徽标文字", "Badge text", "バッジ", "배지")}>
          <input className={input} value={it.badge ?? ""} onFocus={onBeginHistory} onChange={(e) => patch({ badge: e.target.value || undefined }, false)} />
        </Field>
      )}
      {it.kind === "pullToRefresh" && (
        <div className="flex items-center justify-between rounded-[16px] bg-[var(--chrome)] px-4 py-3 text-[15px]">
          <span>{local(lang, "刷新中", "Refreshing", "更新中", "새로 고치는 중")}</span>
          <ChromeSwitch on={it.refreshing ?? false} onChange={(refreshing) => patch({ refreshing })} />
        </div>
      )}
      {it.kind === "textField" && (
        <div className="flex items-center justify-between rounded-[16px] bg-[var(--chrome)] px-4 py-3 text-[15px]">
          <span>{local(lang, "多行", "Multiline", "複数行", "여러 줄")}</span>
          <ChromeSwitch on={it.multiline ?? false} onChange={(multiline) => patch({ multiline })} />
        </div>
      )}
      {it.kind === "image" && (
        <>
          <Field label={local(lang, "图片 URL", "Image URL", "画像 URL", "이미지 URL")}>
            <input className={input} value={it.source ?? ""} onFocus={onBeginHistory} onChange={(e) => patch({ source: e.target.value || undefined }, false)} />
          </Field>
          <Field label={local(lang, "内容描述", "Content description", "内容説明", "콘텐츠 설명")}>
            <input className={input} value={it.contentDescription ?? ""} onFocus={onBeginHistory} onChange={(e) => patch({ contentDescription: e.target.value || undefined }, false)} />
          </Field>
        </>
      )}
      {it.kind === "text" && (
        <Field label={local(lang, "文字样式", "Text style", "テキストスタイル", "텍스트 스타일")}>
          <select className={input} value={it.textStyle ?? "body1"} onChange={(e) => patch({ textStyle: e.target.value as Item["textStyle"] })}>
            {["body1", "body2", "button", "footnote1", "footnote2", "headline1", "headline2", "subtitle", "title1", "title2", "title3", "title4"].map((style) => (
              <option key={style} value={style}>{style}</option>
            ))}
          </select>
        </Field>
      )}
      {(it.kind === "colorPicker" || it.kind === "colorPalette") && (
        <Field label={local(lang, "颜色", "Color", "カラー", "색상")}>
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
        <Field label={local(lang, "单选组", "Radio group", "ラジオグループ", "라디오 그룹")}>
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
                <input className={input} value={tab.badge ?? ""} onFocus={onBeginHistory} onChange={(e) => patch({ tabs: it.tabs!.map((x, j) => (j === i ? { ...x, badge: e.target.value || undefined } : x)) }, false)} placeholder={local(lang, "徽标", "Badge", "バッジ", "배지")} />
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
