import { CornerFrame } from "@/components/common";
import type { RecommendationRow } from "@/lib/types";

const MEDALS = ["🥇", "🥈", "🥉"];

function formatPrice(price: number): string {
  if (price >= 1) {
    return `$${price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 4 })}`;
  }
  if (price >= 0.01) return `$${price.toFixed(4)}`;
  return `$${price.toFixed(8).replace(/0+$/, "").replace(/\.$/, "")}`;
}

interface RecommendationTableProps {
  title: string;
  tone: "gain" | "loss";
  rows: RecommendationRow[];
  onRefresh: () => void;
  refreshing: boolean;
}

export function RecommendationTable({ title, tone, rows, onRefresh, refreshing }: RecommendationTableProps) {
  const toneText = tone === "gain" ? "text-ink-gain" : "text-ink-loss";
  const toneBg = tone === "gain" ? "bg-ink-gain" : "bg-ink-loss";
  const toneDot = tone === "gain" ? "bg-ink-gain" : "bg-ink-loss";

  return (
    <CornerFrame className="border border-ink-border bg-ink-surface">
      <div className="flex items-center justify-between border-b border-ink-border px-4 py-3">
        <span className="flex items-center gap-2 text-sm font-semibold text-ink-fg">
          <span className={`h-2 w-2 rounded-full ${toneDot}`} />
          {title}
        </span>
        <button
          type="button"
          onClick={onRefresh}
          disabled={refreshing}
          className="font-mono text-[11px] text-ink-fg-muted transition-colors hover:text-ink-fg disabled:opacity-50"
        >
          {refreshing ? "更新中…" : "↻ 更新"}
        </button>
      </div>
      <table className="w-full font-mono text-[13px]">
        <thead>
          <tr className="text-left text-[11px] text-ink-fg-muted">
            <th className="w-10 px-4 py-2 font-normal" />
            <th className="px-2 py-2 font-normal">幣種</th>
            <th className="px-2 py-2 font-normal">價格</th>
            <th className="px-2 py-2 font-normal">推薦指數</th>
            <th className="px-4 py-2 text-right font-normal">漲跌幅</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={row.symbol} className="border-t border-ink-border">
              <td className="px-4 py-2.5 text-base leading-none">{MEDALS[i] ?? i + 1}</td>
              <td className="px-2 py-2.5 font-semibold text-ink-fg">{row.symbol}</td>
              <td className="px-2 py-2.5 text-ink-fg-secondary">{formatPrice(row.price)}</td>
              <td className="px-2 py-2.5">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-ink-fg-muted">強度</span>
                  <div className="h-1.5 w-16 overflow-hidden rounded-full bg-ink-elevated">
                    <div className={`h-full ${toneBg}`} style={{ width: `${row.strength}%` }} />
                  </div>
                </div>
              </td>
              <td className={`px-4 py-2.5 text-right ${toneText}`}>
                {row.changePct >= 0 ? "+" : ""}
                {row.changePct.toFixed(1)}%
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </CornerFrame>
  );
}
