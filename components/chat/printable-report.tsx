"use client";

import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import { decodeReport, type PrintableReport as ReportPayload } from "@/lib/share-link";

type LoadState = { status: "loading" } | { status: "empty" } | { status: "ready"; data: ReportPayload };

function formatTimestamp(epochMs: number): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  const d = new Date(epochMs);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function IndicatorTable({ indicator }: { indicator: NonNullable<ReportPayload["m"]> }) {
  const rows = [
    ["價格", `$${indicator.price.toLocaleString("en-US")}`],
    ["24h 漲跌", `${indicator.changePct.toFixed(2)}%`],
    ["RSI(14)", indicator.rsi !== null ? indicator.rsi.toFixed(1) : "—"],
    ["多空比", indicator.longShortRatio !== null ? String(indicator.longShortRatio) : "—"],
    ["POC", indicator.poc !== null ? `$${indicator.poc.toLocaleString("en-US")}` : "—"],
    [
      "資金費率",
      indicator.fundingRate !== null ? `${(indicator.fundingRate * 100).toFixed(4)}%` : "—",
    ],
  ];

  return (
    <table className="w-full border-collapse text-[13px]">
      <tbody>
        {rows.map(([label, value]) => (
          <tr key={label} className="border-b border-neutral-200">
            <th className="w-32 py-1.5 pr-4 text-left font-semibold text-neutral-500">{label}</th>
            <td className="py-1.5 font-mono text-neutral-900">{value}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export function PrintableReport() {
  // Payload rides in the fragment, which never reaches the server.
  const [state, setState] = useState<LoadState>({ status: "loading" });

  useEffect(() => {
    const encoded = window.location.hash.slice(1);
    let active = true;

    (encoded ? decodeReport(encoded) : Promise.resolve(null)).then((data) => {
      if (!active) return;
      setState(data ? { status: "ready", data } : { status: "empty" });
    });

    return () => {
      active = false;
    };
  }, []);

  // Wait for the report to paint before opening the print dialog, or the
  // browser captures a blank page.
  useEffect(() => {
    if (state.status !== "ready") return;
    const frame = requestAnimationFrame(() => window.print());
    return () => cancelAnimationFrame(frame);
  }, [state.status]);

  if (state.status === "loading") {
    return <p className="text-sm text-neutral-500">正在準備報告…</p>;
  }

  if (state.status === "empty") {
    return (
      <div>
        <h1 className="mb-2 text-xl font-bold">找不到報告內容</h1>
        <p className="text-sm text-neutral-600">
          這個連結沒有帶有效的報告資料，可能在複製時被截斷了。請回到對話頁重新產生。
        </p>
      </div>
    );
  }

  const { data } = state;

  return (
    <article className="mx-auto max-w-[760px] px-10 py-12 text-neutral-900 print:px-0 print:py-0">
      <header className="mb-8 border-b-2 border-neutral-900 pb-5">
        <div className="mb-1 text-[11px] font-bold tracking-[0.18em] text-amber-600">HOYA BIT AI</div>
        <h1 className="mb-2 text-2xl font-extrabold tracking-tight">
          加密市場分析報告{data.sym ? ` — ${data.sym}` : ""}
        </h1>
        <p className="text-xs text-neutral-500">產生時間：{formatTimestamp(data.t)}</p>
      </header>

      {data.q && (
        <section className="mb-8">
          <h2 className="mb-2 text-sm font-bold tracking-wide text-neutral-500">分析問題</h2>
          <p className="rounded border-l-4 border-amber-500 bg-neutral-50 px-4 py-3 text-[15px] leading-relaxed">
            {data.q}
          </p>
        </section>
      )}

      <section className="mb-8">
        <div className="report-body text-[15px] leading-[1.8]">
          <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]}>{data.c}</ReactMarkdown>
        </div>
      </section>

      {data.m && (
        <section className="mb-8 break-inside-avoid">
          <h2 className="mb-3 border-b border-neutral-300 pb-1.5 text-sm font-bold tracking-wide text-neutral-500">
            {data.m.symbol} 即時指標
          </h2>
          <IndicatorTable indicator={data.m} />
        </section>
      )}

      {data.l && (
        <section className="mb-8 break-inside-avoid">
          <h2 className="mb-2 text-sm font-bold tracking-wide text-neutral-500">資料限制</h2>
          <p className="rounded border-l-4 border-amber-500 bg-amber-50 px-4 py-3 text-[13px] leading-relaxed">
            {data.l}
          </p>
        </section>
      )}

      {data.s?.length ? (
        <section className="mb-8">
          <h2 className="mb-3 border-b border-neutral-300 pb-1.5 text-sm font-bold tracking-wide text-neutral-500">
            推理軌跡
          </h2>
          <ol className="flex flex-col gap-2.5">
            {data.s.map((line, i) => (
              <li key={i} className="flex gap-2.5 break-inside-avoid text-[13px] leading-relaxed">
                <span className="shrink-0 font-mono font-bold text-amber-600">{i + 1}.</span>
                <span className="text-neutral-700">{line}</span>
              </li>
            ))}
          </ol>
        </section>
      ) : null}

      <footer className="border-t border-neutral-300 pt-4 text-[11px] leading-relaxed text-neutral-500">
        本報告由 HOYA BIT AI 從多個資料來源蒐集資訊後自動產生，僅供參考，不構成投資建議。
      </footer>
    </article>
  );
}
