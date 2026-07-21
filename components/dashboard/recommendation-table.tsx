import { CornerFrame } from "@/components/common";
import type { RecommendationRow } from "@/lib/dashboard-data";

interface RecommendationTableProps {
  title: string;
  tone: "gain" | "loss";
  rows: RecommendationRow[];
}

export function RecommendationTable({ title, tone, rows }: RecommendationTableProps) {
  const toneText = tone === "gain" ? "text-ink-gain" : "text-ink-loss";
  const toneBg = tone === "gain" ? "bg-ink-gain" : "bg-ink-loss";

  return (
    <CornerFrame className="border border-ink-border bg-ink-surface">
      <div className="flex items-center justify-between border-b border-ink-border px-4 py-3">
        <span className={`text-sm font-semibold ${toneText}`}>{title}</span>
        <span className="font-mono text-[11px] text-ink-fg-muted">↻ 更新</span>
      </div>
      <table className="w-full font-mono text-[13px]">
        <thead>
          <tr className="text-left text-[11px] text-ink-fg-muted">
            <th className="w-8 px-4 py-2 font-normal">#</th>
            <th className="px-2 py-2 font-normal">幣種</th>
            <th className="px-2 py-2 font-normal">價格</th>
            <th className="px-2 py-2 font-normal">推薦指數</th>
            <th className="px-4 py-2 text-right font-normal">漲跌幅</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={row.symbol} className="border-t border-ink-border">
              <td className="px-4 py-2.5 text-ink-fg-muted">{i + 1}</td>
              <td className="px-2 py-2.5 font-semibold text-ink-fg">{row.symbol}</td>
              <td className="px-2 py-2.5 text-ink-fg-secondary">{row.price}</td>
              <td className="px-2 py-2.5">
                <div className="h-1.5 w-16 overflow-hidden rounded-full bg-ink-elevated">
                  <div className={`h-full ${toneBg}`} style={{ width: `${row.strength}%` }} />
                </div>
              </td>
              <td className={`px-4 py-2.5 text-right ${toneText}`}>
                {row.changePct >= 0 ? "▲" : "▼"} {Math.abs(row.changePct).toFixed(1)}%
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </CornerFrame>
  );
}
