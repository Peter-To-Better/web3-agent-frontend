import Link from "next/link";
import { TopBar } from "@/components/layout";
import { SharedConversationView } from "@/components/chat";

export const metadata = {
  title: "分享的分析對話 — HOYA BIT AI",
};

function BackToChatLink() {
  return (
    <Link
      href="/chat"
      className="flex items-center gap-1.5 rounded-lg border border-ink-border px-2.5 py-1.5 text-xs text-ink-fg-secondary transition-colors hover:border-ink-fg-secondary hover:text-ink-fg"
    >
      開始我的分析
    </Link>
  );
}

export default function SharePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <TopBar actions={<BackToChatLink />} />
      <main className="mx-auto w-full max-w-[880px] flex-1 px-5 py-10 md:px-8">
        <SharedConversationView />
      </main>
    </div>
  );
}
