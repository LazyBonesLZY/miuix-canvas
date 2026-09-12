"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { t } from "@/lib/i18n";
import { parseRendererEvent, rendererBoot, rendererUrl, renderRequest, type RendererEvent } from "@/lib/renderer";
import type { Lang, Screen, Theme } from "@/lib/types";

export function OfficialMiuixFrame({
  screen,
  theme,
  lang,
  interactive = false,
  screens,
  deferMs = 0,
  active = true,
  className,
  onEvent,
  onPainted,
}: {
  screen: Screen;
  theme: Theme;
  lang: Lang;
  interactive?: boolean;
  screens?: Screen[];
  deferMs?: number;
  active?: boolean;
  className?: string;
  onEvent?: (event: RendererEvent) => void;
  onPainted?: () => void;
}) {
  const frame = useRef<HTMLIFrameElement>(null);
  const [src, setSrc] = useState(() => (active && deferMs <= 0 ? rendererUrl() : ""));
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!active) return;
    const boot = rendererBoot(src, deferMs);
    if (boot === "keep") return;
    if (boot === "now") {
      setSrc(rendererUrl());
      return;
    }
    const start = window.setTimeout(() => setSrc(rendererUrl()), deferMs);
    return () => window.clearTimeout(start);
  }, [active, deferMs, src]);

  const send = useCallback(() => {
    const target = frame.current?.contentWindow;
    if (!target) return;
    target.postMessage(JSON.stringify(renderRequest(screen, theme, lang, interactive, screens)), window.location.origin);
  }, [interactive, lang, screen, screens, theme]);

  useEffect(() => {
    const receive = (event: MessageEvent) => {
      if (event.origin !== window.location.origin || event.source !== frame.current?.contentWindow) return;
      const message = parseRendererEvent(event.data);
      if (!message) return;
      if (message.type === "ready") {
        setError("");
        setReady(true);
        send();
      }
      if (message.type === "rendered" && message.requestId) {
        setError("");
        setReady(true);
        onPainted?.();
      }
      if (message.type === "error") {
        setError(message.message ?? "Miuix renderer failed");
        onPainted?.();
      }
      onEvent?.(message);
    };
    window.addEventListener("message", receive);
    return () => window.removeEventListener("message", receive);
  }, [onEvent, onPainted, send]);

  useEffect(() => {
    if (!src) return;
    send();
    if (ready) return;
    const retry = window.setInterval(send, 400);
    return () => window.clearInterval(retry);
  }, [ready, send, src]);

  return (
    <div className={`absolute inset-0 ${className ?? ""}`}>
      {src && (
        <iframe
          ref={frame}
          src={src}
          title={`${screen.name} — Miuix`}
          onLoad={send}
          style={{
            width: "100%",
            height: "100%",
            border: 0,
            display: "block",
            pointerEvents: interactive ? "auto" : "none",
            background: "transparent",
          }}
        />
      )}
      {!!src && !ready && !error && (
        <div className="miuix-loader pointer-events-none absolute inset-0">
          <div className="miuix-spinner" />
          <span className="max-w-full px-3 text-center">{t("loading", lang)}</span>
        </div>
      )}
      {error && (
        <div className="absolute inset-0 grid place-items-center bg-black/75 p-4 text-center text-xs text-white">
          {error}
        </div>
      )}
    </div>
  );
}
