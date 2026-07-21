import Link from "next/link";
import { Logo } from "@/components/common";

const links = [
  { href: "#features", label: "功能" },
  { href: "#how", label: "運作方式" },
];

export function Navbar() {
  return (
    <nav className="fixed inset-x-0 top-0 z-50 flex h-[60px] items-center justify-between border-b border-ink-border bg-ink-bg/88 px-5 backdrop-blur-lg md:px-12">
      <Link href="/" className="flex items-center gap-2.5 text-base font-bold tracking-tight text-ink-fg">
        <Logo size={34} />
        HOYA BIT AI
      </Link>
      <div className="hidden gap-7 text-sm text-ink-fg-secondary md:flex">
        {links.map((link) => (
          <a key={link.href} href={link.href} className="hover:text-ink-fg hover:no-underline">
            {link.label}
          </a>
        ))}
        <Link href="/dashboard" className="hover:text-ink-fg hover:no-underline">
          數據看板
        </Link>
      </div>
      <Link
        href="/chat"
        className="inline-flex items-center gap-1.5 rounded-lg bg-ink-accent px-5 py-2 text-[13px] font-semibold text-ink-bg transition-opacity hover:opacity-90 hover:no-underline"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
        開始對話
      </Link>
    </nav>
  );
}
