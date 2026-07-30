import type { ReactNode } from "react";
import Link from "next/link";
import { Logo } from "@/components/common";

interface TopBarProps {
  actions?: ReactNode;
}

export function TopBar({ actions }: TopBarProps) {
  return (
    <header
      data-entrance="1"
      data-entrance-y="-10"
      className="col-span-full flex h-14 flex-shrink-0 items-center justify-between border-b border-ink-border bg-ink-bg px-4 md:px-6"
    >
      <Link href="/" className="flex items-center gap-2 text-[15px] font-bold text-ink-fg">
        <Logo size={30} />
        HOYA BIT AI
      </Link>
      <div className="flex items-center gap-3">
        {actions}
        <div className="flex items-center gap-2 text-xs text-ink-gain">
          <span className="h-[5px] w-[5px] animate-pulse-dot rounded-full bg-ink-gain" />
          Agent 就緒
        </div>
      </div>
    </header>
  );
}
