"use client";

import Link from "next/link";
import { TopBar } from "@/components/layout";
import { Sidebar, WelcomeScreen, MessageList, ChatInput, AgentTokenDialog } from "@/components/chat";
import { useChat } from "@/hooks/use-chat";

function DashboardLink() {
  return (
    <Link
      href="/dashboard"
      className="flex items-center gap-1.5 rounded-lg border border-ink-border px-2.5 py-1.5 text-xs text-ink-fg-secondary transition-colors hover:border-ink-fg-secondary hover:text-ink-fg"
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <line x1="4" y1="20" x2="4" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="20" y1="20" x2="20" y2="14" />
      </svg>
      數據儀表板
    </Link>
  );
}

export default function ChatPage() {
  const { messages, input, setInput, isStreaming, send, stop } = useChat();

  return (
    <div className="grid h-screen grid-cols-1 grid-rows-[56px_1fr] overflow-hidden md:grid-cols-[260px_1fr]">
      <TopBar
        actions={
          <>
            <DashboardLink />
            <AgentTokenDialog />
          </>
        }
      />
      <Sidebar onPromptSelect={setInput} />
      <main className="flex min-h-0 flex-col overflow-hidden bg-ink-bg">
        {messages.length === 0 ? (
          <div className="flex flex-1 overflow-y-auto">
            <WelcomeScreen onSelect={send} />
          </div>
        ) : (
          <MessageList messages={messages} />
        )}
        <ChatInput
          value={input}
          onChange={setInput}
          onSend={() => send(input)}
          disabled={isStreaming}
          isStreaming={isStreaming}
          onStop={stop}
        />
      </main>
    </div>
  );
}
