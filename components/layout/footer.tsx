import Link from "next/link";

export function Footer() {
  return (
    <footer className="flex flex-wrap items-center justify-between gap-4 border-t border-ink-border px-5 py-8 text-xs text-ink-fg-muted md:px-12">
      <span>&copy; 2026 HOYA BIT. 加密市場 AI 分析平台。</span>
      <div className="flex gap-5">
        <Link href="/chat" className="text-ink-fg-secondary hover:text-ink-fg">
          Chat
        </Link>
      </div>
    </footer>
  );
}
