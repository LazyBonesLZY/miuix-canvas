"use client";

import { t, type Lang } from "@/lib/i18n";

function Btn({ title, onClick, children, accent = false, disabled }: { title: string; onClick?: () => void; children: React.ReactNode; accent?: boolean; disabled?: boolean }) {
  return (
    <button
      type="button"
      title={title}
      disabled={disabled}
      onClick={onClick}
      className={`press grid h-8 min-w-8 place-items-center rounded-[10px] px-2 text-[13px] disabled:opacity-40 ${accent ? "bg-[var(--accent)] text-white" : "bg-[var(--tile)] text-[var(--ink)]"}`}
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
  onLang: (lang: Lang) => void;
  github: string;
}) {
  return (
    <header className="flex h-12 shrink-0 items-center gap-1.5 border-b border-[var(--line)] bg-[var(--chrome)] px-2">
      <div className="mr-1 flex items-center gap-2 px-1">
        <Logo />
        <div className="leading-tight">
          <div className="text-[13px] font-semibold text-[var(--ink)]">{t("app", lang)}</div>
        </div>
      </div>
      <Btn title={t("select", lang)} onClick={() => onTool("select")} accent={tool === "select"}>
        <span className="ms">near_me</span>
      </Btn>
      <Btn title={t("hand", lang)} onClick={() => onTool("hand")} accent={tool === "hand"}>
        <span className="ms">pan_tool</span>
      </Btn>
      <div className="mx-1 h-5 w-px bg-[var(--line)]" />
      <Btn title={t("undo", lang)} onClick={onUndo} disabled={!canUndo}><span className="ms">undo</span></Btn>
      <Btn title={t("redo", lang)} onClick={onRedo} disabled={!canRedo}><span className="ms">redo</span></Btn>
      <Btn title={t("tidy", lang)} onClick={onTidy}><span className="ms">auto_fix_high</span></Btn>
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
      <div className="ml-auto flex items-center gap-1">
        <Btn title={t("lang", lang)} onClick={() => onLang(lang === "zh" ? "en" : "zh")}>
          {lang === "zh" ? "中" : "EN"}
        </Btn>
        <a href={github} target="_blank" rel="noreferrer" className="press grid h-8 place-items-center rounded-[10px] bg-[var(--tile)] px-2 text-[12px] text-[var(--ink)]">
          {t("github", lang)}
        </a>
      </div>
    </header>
  );
}

export function Logo({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden>
      <rect width="32" height="32" rx="9" fill="#3482FF" />
      <path d="M8 21.5V10.5h3.1l4.9 7.6 4.9-7.6H24v11h-2.6V14.2l-4.4 6.7h-1.9l-4.4-6.7v7.3H8z" fill="#fff" />
    </svg>
  );
}
