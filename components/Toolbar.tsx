"use client";

import { t, type Lang } from "@/lib/i18n";
import { LANGS } from "@/lib/types";

function Btn({
  title,
  onClick,
  children,
  accent = false,
  on = false,
  disabled,
}: {
  title: string;
  onClick?: () => void;
  children: React.ReactNode;
  accent?: boolean;
  on?: boolean;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      title={title}
      disabled={disabled}
      onClick={onClick}
      data-on={on ? "1" : undefined}
      data-accent={accent ? "1" : undefined}
      className="press miuix-icon-btn"
    >
      {children}
    </button>
  );
}

export function Toolbar({
  lang,
  tool,
  canUndo,
  canRedo,
  onTool,
  onUndo,
  onRedo,
  onTidy,
  onAddPhone,
  onAddDesktop,
  onPreview,
  onSave,
  onLoad,
  onShare,
  onPng,
  onFit,
  onCenter,
  onHelp,
  onReset,
  onLang,
  github,
}: {
  lang: Lang;
  tool: "select" | "hand";
  canUndo: boolean;
  canRedo: boolean;
  onTool: (tool: "select" | "hand") => void;
  onUndo: () => void;
  onRedo: () => void;
  onTidy: () => void;
  onAddPhone: () => void;
  onAddDesktop: () => void;
  onPreview: () => void;
  onSave: () => void;
  onLoad: () => void;
  onShare: () => void;
  onPng: () => void;
  onFit: () => void;
  onCenter: () => void;
  onHelp: () => void;
  onReset: () => void;
  onLang: (lang: Lang) => void;
  github: string;
}) {
  return (
    <header className="flex h-14 shrink-0 items-center gap-0.5 overflow-x-auto border-b border-[var(--line)] bg-[var(--chrome)] px-2">
      <div className="mr-2 flex items-center gap-2 px-1">
        <Logo />
        <div className="text-[17px] font-medium text-[var(--ink)]">{t("app", lang)}</div>
      </div>
      <Btn title={t("select", lang)} onClick={() => onTool("select")} on={tool === "select"}>
        <span className="ms">near_me</span>
      </Btn>
      <Btn title={t("hand", lang)} onClick={() => onTool("hand")} on={tool === "hand"}>
        <span className="ms">pan_tool</span>
      </Btn>
      <div className="mx-1 h-5 w-px bg-[var(--line)]" />
      <Btn title={t("undo", lang)} onClick={onUndo} disabled={!canUndo}><span className="ms">undo</span></Btn>
      <Btn title={t("redo", lang)} onClick={onRedo} disabled={!canRedo}><span className="ms">redo</span></Btn>
      <Btn title={t("tidy", lang)} onClick={onTidy}><span className="ms">auto_fix_high</span></Btn>
      <Btn title={`${t("fit", lang)} (F)`} onClick={onFit}><span className="ms">fit_screen</span></Btn>
      <Btn title={`${t("center", lang)} (C)`} onClick={onCenter}><span className="ms">filter_center_focus</span></Btn>
      <div className="mx-1 h-5 w-px bg-[var(--line)]" />
      <Btn title={t("addScreen", lang)} onClick={onAddPhone}><span className="ms">smartphone</span></Btn>
      <Btn title={`${t("addScreen", lang)} · ${t("desktop", lang)}`} onClick={onAddDesktop}><span className="ms">desktop_windows</span></Btn>
      <Btn title={t("preview", lang)} onClick={onPreview} accent>
        <span className="ms">play_arrow</span>
      </Btn>
      <div className="mx-1 h-5 w-px bg-[var(--line)]" />
      <Btn title={t("save", lang)} onClick={onSave}><span className="ms">download</span></Btn>
      <Btn title={t("load", lang)} onClick={onLoad}><span className="ms">folder_open</span></Btn>
      <Btn title={t("share", lang)} onClick={onShare}><span className="ms">ios_share</span></Btn>
      <Btn title={t("png", lang)} onClick={onPng}><span className="ms">image</span></Btn>
      <Btn title={t("reset", lang)} onClick={onReset}><span className="ms">restart_alt</span></Btn>
      <div className="ml-auto flex items-center gap-1">
        <Btn title={`${t("help", lang)} (?)`} onClick={onHelp}><span className="ms">help</span></Btn>
        <select
          className="h-10 rounded-[16px] bg-[var(--tile)] px-3 text-[13px] text-[var(--ink)] outline-none"
          value={lang}
          title={t("lang", lang)}
          onChange={(e) => onLang(e.target.value as Lang)}
        >
          {LANGS.map((item) => (
            <option key={item.key} value={item.key}>{item.label}</option>
          ))}
        </select>
        <a href={github} target="_blank" rel="noreferrer" className="press miuix-icon-btn px-3 text-[13px]">
          {t("github", lang)}
        </a>
      </div>
    </header>
  );
}

export function Logo({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden>
      <rect width="32" height="32" rx="9" fill="#3482FF" />
      <path d="M8 21.5V10.5h3.1l4.9 7.6 4.9-7.6H24v11h-2.6V14.2l-4.4 6.7h-1.9l-4.4-6.7v7.3H8z" fill="#fff" />
    </svg>
  );
}

export function ConfirmDialog({
  title,
  body,
  cancel,
  confirm,
  onCancel,
  onConfirm,
}: {
  title: string;
  body: string;
  cancel: string;
  confirm: string;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="preview-root" onClick={onCancel}>
      <div className="miuix-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="miuix-dialog-title">{title}</div>
        <p className="miuix-dialog-body">{body}</p>
        <div className="miuix-dialog-actions">
          <button type="button" className="press miuix-text-btn" onClick={onCancel}>{cancel}</button>
          <button type="button" className="press miuix-text-btn" data-accent="1" onClick={onConfirm}>{confirm}</button>
        </div>
      </div>
    </div>
  );
}
