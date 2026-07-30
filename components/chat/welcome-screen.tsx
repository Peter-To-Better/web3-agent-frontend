import { Logo, CornerFrame } from "@/components/common";
import { welcomeCards } from "@/lib/chat-data";

interface WelcomeScreenProps {
  onSelect: (prompt: string) => void;
}

export function WelcomeScreen({ onSelect }: WelcomeScreenProps) {
  return (
    <div data-entrance="4" className="m-auto max-w-[640px] px-5 py-10 text-center">
      <div className="mb-5 flex justify-center">
        <Logo size={64} />
      </div>
      <h2 className="mb-2 text-[22px] font-extrabold tracking-tight">HOYA BIT AI Agent</h2>
      <p className="mb-7 text-sm leading-relaxed text-ink-fg-secondary">
        你的加密市場智能分析助理。輸入任何關於加密貨幣的問題，我會即時蒐集多源資料為你分析。
      </p>
      <div data-tour="chat-welcome" className="grid grid-cols-1 gap-2.5 text-left sm:grid-cols-2">
        {welcomeCards.map((card) => (
          <CornerFrame key={card.title}>
            <button
              type="button"
              onClick={() => onSelect(card.prompt)}
              className="w-full cursor-pointer border border-ink-border bg-ink-surface p-4 text-left transition-colors hover:border-ink-accent/60 hover:bg-ink-elevated"
            >
              <h4 className="mb-1 text-[13px] font-semibold text-ink-fg">{card.title}</h4>
              <span className="text-xs leading-relaxed text-ink-fg-muted">{card.prompt}</span>
            </button>
          </CornerFrame>
        ))}
      </div>
    </div>
  );
}
