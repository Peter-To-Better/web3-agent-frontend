import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const notoSansTC = localFont({
  variable: "--font-noto-tc",
  src: [
    { path: "./fonts/noto-sans-tc-400.woff", weight: "400", style: "normal" },
    { path: "./fonts/noto-sans-tc-500.woff", weight: "500", style: "normal" },
    { path: "./fonts/noto-sans-tc-700.woff", weight: "700", style: "normal" },
    { path: "./fonts/noto-sans-tc-900.woff", weight: "900", style: "normal" },
  ],
});

const jetbrainsMono = localFont({
  variable: "--font-jetbrains",
  src: [
    { path: "./fonts/jetbrains-mono-400.woff", weight: "400", style: "normal" },
    { path: "./fonts/jetbrains-mono-500.woff", weight: "500", style: "normal" },
  ],
});

export const metadata: Metadata = {
  title: "HOYA BIT — 加密市場 AI 智能分析",
  description: "HOYA BIT AI Agent，你的加密市場智能分析助理。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="zh-Hant"
      className={`${notoSansTC.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-ink-bg text-ink-fg font-body">
        {children}
      </body>
    </html>
  );
}
