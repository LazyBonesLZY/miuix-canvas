"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { parseRendererEvent, rendererBoot, rendererUrl, renderRequest, type RendererEvent } from "@/lib/renderer";
import type { Lang, Screen, Theme } from "@/lib/types";

export function OfficialMiuixFrame({
  screen,
  theme,
  lang,
  interactive = false,
  screens,
  deferMs = 0,
  className,
  onEvent,
}: {
  screen: Screen;
  theme: Theme;
  lang: Lang;
  interactive?: boolean;
  screens?: Screen[];
  deferMs?: number;
  className?: string;
  onEvent?: (event: RendererEvent) => void;
}) {
  const frame = useRef<HTMLIFrameElement>(null);
  const [src, setSrc] = useState(() => (deferMs > 0 ? "" : rendererUrl()));
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const boot = rendererBoot(src, deferMs);
    if (boot === "keep") return;
    if (boot === "now") {
      setSrc(rendererUrl());
      return;
    }
    const start = window.setTimeout(() => setSrc(rendererUrl()), deferMs);
    return () => window.clearTimeout(start);
  }, [deferMs, src]);

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
      if (message.type === "ready" || message.type === "rendered") {
        setError("");
        setReady(true);
      }
      if (message.type === "ready") send();
      if (message.type === "error") setError(message.message ?? "Miuix renderer failed");
      onEvent?.(message);
    };
    window.addEventListener("message", receive);
    return () => window.removeEventListener("message", receive);
  }, [onEvent, send]);

  useEffect(() => {
    send();
    if (ready) return;
    const retry = window.setInterval(send, 400);
    return () => window.clearInterval(retry);
  }, [ready, send]);

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
      {!ready && !error && (
        <div className="pointer-events-none absolute inset-0 grid place-items-center text-[12px] text-[var(--muted)]">
          Miuix…
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
