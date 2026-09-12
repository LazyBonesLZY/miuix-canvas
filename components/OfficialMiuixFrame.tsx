"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { parseRendererEvent, rendererUrl, renderRequest, type RendererEvent } from "@/lib/renderer";
import type { Lang, Screen, Theme } from "@/lib/types";

export function OfficialMiuixFrame({
  screen,
  theme,
  lang,
  interactive = false,
  screens,
  className,
  onEvent,
}: {
  screen: Screen;
  theme: Theme;
  lang: Lang;
  interactive?: boolean;
  screens?: Screen[];
  className?: string;
  onEvent?: (event: RendererEvent) => void;
}) {
  const frame = useRef<HTMLIFrameElement>(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");

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
      if (message.type === "error") setError(message.message ?? "Miuix renderer failed");
      onEvent?.(message);
    };
    window.addEventListener("message", receive);
    return () => window.removeEventListener("message", receive);
  }, [onEvent, send]);

  useEffect(() => {
    if (ready) send();
  }, [ready, send]);

  return (
    <>
      <iframe
        ref={frame}
        src={rendererUrl()}
        title={`${screen.name} — Miuix`}
        className={className}
        onLoad={() => setReady(false)}
        style={{
          width: "100%",
          height: "100%",
          border: 0,
          display: "block",
          pointerEvents: interactive ? "auto" : "none",
          background: "transparent",
        }}
      />
      {error && (
        <div className="absolute inset-0 grid place-items-center bg-black/75 p-4 text-center text-xs text-white">
          {error}
        </div>
      )}
    </>
  );
}
