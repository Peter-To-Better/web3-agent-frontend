import type { ChatHistoryItem } from "@/lib/types";

interface ChatHistoryListProps {
  items: ChatHistoryItem[];
  activeId: string | null;
  onSelect: (id: string) => void;
}

export function ChatHistoryList({ items, activeId, onSelect }: ChatHistoryListProps) {
  return (
    <div className="flex-1 overflow-y-auto p-2">
      {items.map((item) => (
        <button
          key={item.id}
          type="button"
          onClick={() => onSelect(item.id)}
          className={`mb-0.5 flex w-full cursor-pointer items-center gap-2 rounded-lg px-3 py-2.5 text-left text-[13px] transition-colors ${
            activeId === item.id
              ? "bg-ink-elevated font-medium text-ink-fg"
              : "text-ink-fg-secondary hover:bg-ink-elevated hover:text-ink-fg"
          }`}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="shrink-0 opacity-40"
          >
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          <span className="truncate">{item.title}</span>
        </button>
      ))}
    </div>
  );
}
