import Link from "next/link";
import { Logo } from "@/components/common";

export function TopBar() {
  return (
    <header className="col-span-full flex h-14 flex-shrink-0 items-center justify-between border-b border-ink-border bg-ink-bg px-4 md:px-6">
      <Link href="/" className="flex items-center gap-2 text-[15px] font-bold text-ink-fg">
        <Logo size={30} />
        HOYA BIT AI
      </Link>
      <div className="flex items-center gap-3 text-xs text-ink-gain">
        <span className="h-[5px] w-[5px] animate-pulse-dot rounded-full bg-ink-gain" />
        Agent 就緒
      </div>
    </header>
  );
}
