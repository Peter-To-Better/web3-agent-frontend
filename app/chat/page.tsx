"use client";

import { TopBar } from "@/components/layout";
import { Sidebar, WelcomeScreen, MessageList, ChatInput } from "@/components/chat";
import { useChat } from "@/hooks/use-chat";

export default function ChatPage() {
  const { messages, input, setInput, isStreaming, send, stop, reset } = useChat();

  return (
    <div className="grid h-screen grid-cols-1 grid-rows-[56px_1fr] overflow-hidden md:grid-cols-[260px_1fr]">
      <TopBar />
      <Sidebar onNewChat={reset} onSelectPrompt={send} />
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
