import type { Metadata, Viewport } from "next";
import "./globals.css";

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_ORIGIN ?? "https://lazyboneslzy.github.io"),
  title: "Miuix Canvas",
  applicationName: "Miuix Canvas",
  alternates: { canonical: `${BASE}/` },
  description:
    "Sketch HyperOS / Miuix screens in the browser and turn them into vibe-coding prompts. / 在浏览器中拼装 HyperOS / Miuix 界面，再变成给 AI 编程工具的提示词。",
  openGraph: {
    title: "Miuix Canvas",
    description: "Design Miuix screens, link them, preview them, and copy a prompt for your AI coding tool.",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#3482FF",
  interactiveWidget: "resizes-content",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh">
      <head>
        <link rel="preload" href={`${BASE}/fonts/material-symbols-rounded.ttf`} as="font" type="font/ttf" crossOrigin="anonymous" />
        <style>{`
          @font-face {
            font-family: "Material Symbols Rounded";
            font-style: normal;
            font-weight: 400;
            font-display: block;
            src: url("${BASE}/fonts/material-symbols-rounded.ttf") format("truetype");
          }
        `}</style>
      </head>
      <body>{children}</body>
    </html>
  );
}
