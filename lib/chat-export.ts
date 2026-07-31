import type { ChatMessage } from "@/lib/types";

const TITLE = "HOYA BIT AI — 加密市場分析";

function formatTimestamp(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

/** One AI answer as a standalone report: the analysis, its reasoning trace, and its caveats. */
export function buildReportMarkdown(message: ChatMessage, now = new Date()): string {
  const parts = [`# ${TITLE}`, `> 匯出時間：${formatTimestamp(now)}`];

  if (message.relatedSymbol) parts.push(`> 標的：${message.relatedSymbol}`);

  parts.push("---", message.content.trim());

  if (message.stageLog?.length) {
    parts.push(
      "---",
      "## 推理軌跡",
      message.stageLog.map((line, i) => `${i + 1}. ${line}`).join("\n")
    );
  }

  if (message.dataLimitation) {
    parts.push("---", "## 資料限制", message.dataLimitation);
  }

  const indicator = message.marketIndicator;
  if (indicator) {
    parts.push(
      "---",
      `## ${indicator.symbol} 即時指標`,
      [
        `- 價格：${indicator.price}`,
        `- 24h 漲跌：${indicator.changePct.toFixed(2)}%`,
        indicator.rsi !== null ? `- RSI(14)：${indicator.rsi.toFixed(1)}` : null,
        indicator.longShortRatio !== null ? `- 多空比：${indicator.longShortRatio}` : null,
        indicator.poc !== null ? `- POC：${indicator.poc}` : null,
        indicator.fundingRate !== null
          ? `- 資金費率：${(indicator.fundingRate * 100).toFixed(4)}%`
          : null,
      ]
        .filter(Boolean)
        .join("\n")
    );
  }

  return `${parts.join("\n\n")}\n`;
}
