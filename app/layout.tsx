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
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Noto+Sans+SC:wght@400;500;600;700&family=Noto+Sans+JP:wght@400;500;600;700&family=Noto+Sans+KR:wght@400;500;600;700&display=swap"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@24,400..700,0..1,0&display=block"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
