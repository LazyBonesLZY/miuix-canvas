"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { BootMark, readInitialLang } from "@/components/Editor";
import { setGlobalLang, type Lang } from "@/lib/i18n";

const loadEditor = () => import("@/components/Editor").then((m) => m.Editor);
if (typeof window !== "undefined") void loadEditor();

const Editor = dynamic(loadEditor, { ssr: false, loading: () => null });

const BOOT_FADE_MS = 320;

export default function Page() {
  const [lang, setLang] = useState<Lang | null>(null);
  const [phase, setPhase] = useState<"loading" | "fading" | "done">("loading");

  useEffect(() => {
    const initial = readInitialLang();
    document.documentElement.lang = initial;
    setGlobalLang(initial);
    setLang(initial);
  }, []);

  useEffect(() => {
    if (phase !== "fading") return;
    const id = setTimeout(() => setPhase("done"), BOOT_FADE_MS);
    return () => clearTimeout(id);
  }, [phase]);

  return (
    <>
      {lang && <Editor initialLang={lang} onReady={() => setPhase((p) => (p === "loading" ? "fading" : p))} />}
      {phase !== "done" && <BootMark done={phase === "fading"} />}
    </>
  );
}
