"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { parseRendererEvent, rendererUrl, renderRequest } from "@/lib/renderer";
import { frameSize, type Lang, type Screen, type Theme } from "@/lib/types";

function stillKey(screen: Screen, theme: Theme, lang: Lang) {
  return JSON.stringify({
    id: screen.id,
    preset: screen.preset,
    theme,
    lang,
    swipe: screen.swipe ?? null,
    items: screen.items,
  });
}

function capturePng(frame: HTMLIFrameElement | null) {
  const canvas = frame?.contentDocument?.querySelector("canvas");
  if (!canvas) return "";
  try {
    return canvas.toDataURL("image/png");
  } catch {
    return "";
  }
}

export function OfficialMiuixStills({
  screens,
  theme,
  lang,
  priorityId,
  onSnaps,
}: {
  screens: Screen[];
  theme: Theme;
  lang: Lang;
  priorityId?: string;
  onSnaps?: (snaps: Record<string, string>) => void;
}) {
  const frame = useRef<HTMLIFrameElement>(null);
  const readyRef = useRef(false);
  const keysRef = useRef<Record<string, string>>({});
  const snapsRef = useRef<Record<string, string>>({});
  const jobRef = useRef<{ id: string; key: string } | null>(null);
  const genRef = useRef(0);
  const onSnapsRef = useRef(onSnaps);
  const propsRef = useRef({ screens, theme, lang, priorityId });
  const [size, setSize] = useState(() => frameSize(screens[0]?.preset ?? "phone"));
  const [error, setError] = useState("");

  onSnapsRef.current = onSnaps;
  propsRef.current = { screens, theme, lang, priorityId };

  const publish = useCallback((id: string, png: string) => {
    snapsRef.current = { ...snapsRef.current, [id]: png };
    onSnapsRef.current?.(snapsRef.current);
  }, []);

  const runNext = useCallback(() => {
    if (!readyRef.current || jobRef.current) return;
    const props = propsRef.current;
    const ordered = [...props.screens].sort((a, b) => {
      if (a.id === props.priorityId) return -1;
      if (b.id === props.priorityId) return 1;
      return 0;
    });
    const screen = ordered.find((item) => keysRef.current[item.id] !== stillKey(item, props.theme, props.lang));
    if (!screen) return;
    setSize(frameSize(screen.preset));
    const job = { id: screen.id, key: stillKey(screen, props.theme, props.lang) };
    jobRef.current = job;
    const gen = ++genRef.current;
    window.setTimeout(() => {
      if (genRef.current !== gen) return;
      frame.current?.contentWindow?.postMessage(
        JSON.stringify(renderRequest(screen, props.theme, props.lang, false)),
        window.location.origin,
      );
    }, 40);
  }, []);

  useEffect(() => {
    const receive = (event: MessageEvent) => {
      if (event.origin !== window.location.origin || event.source !== frame.current?.contentWindow) return;
      const message = parseRendererEvent(event.data);
      if (!message) return;
      if (message.type === "ready") {
        readyRef.current = true;
        setError("");
        const job = jobRef.current;
        if (!job) {
          runNext();
          return;
        }
        const props = propsRef.current;
        const screen = props.screens.find((item) => item.id === job.id);
        if (screen) {
          frame.current?.contentWindow?.postMessage(
            JSON.stringify(renderRequest(screen, props.theme, props.lang, false)),
            window.location.origin,
          );
        }
        return;
      }
      if (message.type === "fonts") {
        keysRef.current = {};
        jobRef.current = null;
        genRef.current += 1;
        runNext();
        return;
      }
      if (message.type === "error") {
        setError(message.message ?? "Miuix renderer failed");
        jobRef.current = null;
        return;
      }
      if (message.type !== "rendered") return;
      const job = jobRef.current;
      const gen = genRef.current;
      window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => {
          if (!job || genRef.current !== gen || jobRef.current !== job) return;
          const png = capturePng(frame.current);
          if (png) {
            keysRef.current[job.id] = job.key;
            publish(job.id, png);
          }
          jobRef.current = null;
          runNext();
        });
      });
    };
    window.addEventListener("message", receive);
    return () => window.removeEventListener("message", receive);
  }, [publish, runNext]);

  useEffect(() => {
    const wait = window.setTimeout(runNext, 50);
    return () => window.clearTimeout(wait);
  }, [lang, priorityId, runNext, screens, theme]);

  return (
    <div
      aria-hidden
      style={{
        position: "fixed",
        left: -12000,
        top: 0,
        width: size.w,
        height: size.h,
        overflow: "hidden",
        pointerEvents: "none",
        opacity: 0,
      }}
    >
      <iframe
        ref={frame}
        src={rendererUrl()}
        title="Miuix stills"
        style={{ width: "100%", height: "100%", border: 0, display: "block", background: "transparent" }}
      />
      {error && <span className="sr-only">{error}</span>}
    </div>
  );
}
