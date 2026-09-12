"use client";

import { useEffect, useRef, useState } from "react";
import { t, type Lang } from "@/lib/i18n";
import { LANGS } from "@/lib/types";
import type { LayoutMode } from "@/lib/viewport";

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

type MenuItem = {
  key: string;
  title: string;
  icon: string;
  onClick: () => void;
  disabled?: boolean;
};

function OverflowMenu({
  lang,
  items,
  children,
}: {
  lang: Lang;
  items: MenuItem[];
  children?: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener("pointerdown", onDown);
    return () => window.removeEventListener("pointerdown", onDown);
  }, [open]);

  if (!items.length && !children) return null;

  return (
    <div className="toolbar-overflow relative" ref={ref}>
      <Btn title={t("more", lang)} onClick={() => setOpen((v) => !v)} on={open}>
        <span className="ms">more_horiz</span>
      </Btn>
      {open && (
        <div className="toolbar-menu">
          {items.map((item) => (
            <button
              key={item.key}
              type="button"
              disabled={item.disabled}
              onClick={() => {
                item.onClick();
                setOpen(false);
              }}
            >
              <span className="ms">{item.icon}</span>
              {item.title}
            </button>
          ))}
          {children}
        </div>
      )}
    </div>
  );
}

export function Toolbar({
  lang,
  layout,
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
  onDelete,
  canDelete,
  github,
}: {
  lang: Lang;
  layout: LayoutMode;
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
  onDelete?: () => void;
  canDelete?: boolean;
  github: string;
}) {
  const phone = layout === "phone";
  const desktop = layout === "desktop";

  const overflow: MenuItem[] = [
    ...(phone
      ? [
          { key: "tidy", title: t("tidy", lang), icon: "auto_fix_high", onClick: onTidy },
          { key: "fit", title: t("fit", lang), icon: "fit_screen", onClick: onFit },
          { key: "center", title: t("center", lang), icon: "filter_center_focus", onClick: onCenter },
          { key: "desktop", title: `${t("addScreen", lang)} · ${t("desktop", lang)}`, icon: "desktop_windows", onClick: onAddDesktop },
          { key: "help", title: t("help", lang), icon: "help", onClick: onHelp },
        ]
      : []),
    { key: "save", title: t("save", lang), icon: "download", onClick: onSave },
    { key: "load", title: t("load", lang), icon: "folder_open", onClick: onLoad },
    { key: "share", title: t("share", lang), icon: "ios_share", onClick: onShare },
    { key: "png", title: t("png", lang), icon: "image", onClick: onPng },
    { key: "reset", title: t("reset", lang), icon: "restart_alt", onClick: onReset },
    ...(onDelete
      ? [{ key: "delete", title: t("deleteSelection", lang), icon: "delete", onClick: onDelete, disabled: !canDelete }]
      : []),
  ];

  return (
    <header className="flex h-14 shrink-0 items-center gap-0.5 border-b border-[var(--line)] bg-[var(--chrome)] px-2">
      <div className="mr-1 flex shrink-0 items-center gap-2 px-1">
        <Logo size={phone ? 24 : 28} />
        <div className="toolbar-title text-[17px] font-medium text-[var(--ink)]">{t("app", lang)}</div>
      </div>
      <div className="flex min-w-0 flex-1 items-center gap-0.5 overflow-x-auto">
        <Btn title={t("select", lang)} onClick={() => onTool("select")} on={tool === "select"}>
          <span className="ms">near_me</span>
        </Btn>
        <Btn title={t("hand", lang)} onClick={() => onTool("hand")} on={tool === "hand"}>
          <span className="ms">pan_tool</span>
        </Btn>
        <div className="mx-1 h-5 w-px shrink-0 bg-[var(--line)]" />
        <Btn title={t("undo", lang)} onClick={onUndo} disabled={!canUndo}><span className="ms">undo</span></Btn>
        <Btn title={t("redo", lang)} onClick={onRedo} disabled={!canRedo}><span className="ms">redo</span></Btn>
        <span className="toolbar-wide contents">
          <Btn title={t("tidy", lang)} onClick={onTidy}><span className="ms">auto_fix_high</span></Btn>
          <Btn title={`${t("fit", lang)} (F)`} onClick={onFit}><span className="ms">fit_screen</span></Btn>
          <Btn title={`${t("center", lang)} (C)`} onClick={onCenter}><span className="ms">filter_center_focus</span></Btn>
        </span>
        <div className="mx-1 h-5 w-px shrink-0 bg-[var(--line)]" />
        <Btn title={t("addScreen", lang)} onClick={onAddPhone}><span className="ms">smartphone</span></Btn>
        <span className="toolbar-wide contents">
          <Btn title={`${t("addScreen", lang)} · ${t("desktop", lang)}`} onClick={onAddDesktop}><span className="ms">desktop_windows</span></Btn>
        </span>
        <Btn title={t("preview", lang)} onClick={onPreview} accent>
          <span className="ms">play_arrow</span>
        </Btn>
        <span className="toolbar-desktop contents">
          <div className="mx-1 h-5 w-px shrink-0 bg-[var(--line)]" />
          <Btn title={t("save", lang)} onClick={onSave}><span className="ms">download</span></Btn>
          <Btn title={t("load", lang)} onClick={onLoad}><span className="ms">folder_open</span></Btn>
          <Btn title={t("share", lang)} onClick={onShare}><span className="ms">ios_share</span></Btn>
          <Btn title={t("png", lang)} onClick={onPng}><span className="ms">image</span></Btn>
          <Btn title={t("reset", lang)} onClick={onReset}><span className="ms">restart_alt</span></Btn>
        </span>
      </div>
      <div className="ml-1 flex shrink-0 items-center gap-1">
        <span className="toolbar-wide contents">
          <Btn title={`${t("help", lang)} (?)`} onClick={onHelp}><span className="ms">help</span></Btn>
        </span>
        {desktop && (
          <>
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
          </>
        )}
        {!desktop && (
          <OverflowMenu lang={lang} items={overflow}>
            <label>
              <span className="ms">translate</span>
              <select
                className="min-w-0 flex-1 bg-transparent text-[14px] text-[var(--ink)] outline-none"
                value={lang}
                title={t("lang", lang)}
                onChange={(e) => onLang(e.target.value as Lang)}
              >
                {LANGS.map((item) => (
                  <option key={item.key} value={item.key}>{item.label}</option>
                ))}
              </select>
            </label>
            <a href={github} target="_blank" rel="noreferrer">
              <span className="ms">code</span>
              {t("github", lang)}
            </a>
          </OverflowMenu>
        )}
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
