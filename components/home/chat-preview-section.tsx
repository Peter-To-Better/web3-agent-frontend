"use client";

import { useRef } from "react";
import { gsap, useGSAP, ScrollTrigger, prefersReducedMotion } from "@/lib/gsap";

const QUESTION = "BTC 目前的市場情緒怎麼樣？";

export function ChatPreviewSection() {
  const sectionRef = useRef<HTMLElement>(null);

  const placeholderRef = useRef<HTMLSpanElement>(null);
  const inputTextRef = useRef<HTMLSpanElement>(null);
  const sendBtnRef = useRef<HTMLSpanElement>(null);

  const userBubbleRef = useRef<HTMLDivElement>(null);
  const typingRef = useRef<HTMLDivElement>(null);
  const aiBubbleRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const summaryRef = useRef<HTMLDivElement>(null);
  const evidenceLabelRef = useRef<HTMLDivElement>(null);
  const bulletRefs = useRef<(HTMLDivElement | null)[]>([]);
  const sourcesRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const revealBlocks = [
        titleRef.current,
        summaryRef.current,
        evidenceLabelRef.current,
        ...bulletRefs.current,
        sourcesRef.current,
      ];

      if (prefersReducedMotion()) {
        gsap.set(placeholderRef.current, { opacity: 0 });
        gsap.set(inputTextRef.current, { clipPath: "inset(0 0% 0 0)" });
        gsap.set([userBubbleRef.current, aiBubbleRef.current, ...revealBlocks], { opacity: 1, y: 0 });
        gsap.set(typingRef.current, { display: "none" });
        return;
      }

      gsap.set(placeholderRef.current, { opacity: 1 });
      gsap.set(inputTextRef.current, { clipPath: "inset(0 100% 0 0)" });
      gsap.set(userBubbleRef.current, { opacity: 0, y: 12 });
      gsap.set(typingRef.current, { opacity: 0 });
      gsap.set(aiBubbleRef.current, { opacity: 0 });
      gsap.set(revealBlocks, { opacity: 0, y: 8 });

      const tl = gsap.timeline({ paused: true });

      tl.addLabel("typeStart", 0.4)
        .to(placeholderRef.current, { opacity: 0, duration: 0.2 }, "typeStart")
        .to(
          inputTextRef.current,
          { clipPath: "inset(0 0% 0 0)", duration: 0.9, ease: "steps(22)" },
          "typeStart"
        )
        .addLabel("send", "typeStart+=1.15")
        .to(sendBtnRef.current, { scale: 0.85, duration: 0.1 }, "send")
        .to(sendBtnRef.current, { scale: 1, duration: 0.15 }, "send+=0.1")
        .to(inputTextRef.current, { opacity: 0, duration: 0.15 }, "send")
        .addLabel("cleared", "send+=0.2")
        .set(inputTextRef.current, { clipPath: "inset(0 100% 0 0)", opacity: 1 }, "cleared")
        .set(placeholderRef.current, { opacity: 1 }, "cleared")
        .to(userBubbleRef.current, { opacity: 1, y: 0, duration: 0.4, ease: "power2.out" }, "cleared")
        .addLabel("thinking", "cleared+=0.5")
        .to(typingRef.current, { opacity: 1, duration: 0.3 }, "thinking")
        .addLabel("respond", "thinking+=1.1")
        .to(typingRef.current, { opacity: 0, duration: 0.2 }, "respond")
        .set(aiBubbleRef.current, { opacity: 1 }, "respond+=0.1")
        .to(
          revealBlocks,
          { opacity: 1, y: 0, duration: 0.4, stagger: 0.18, ease: "power2.out" },
          "respond+=0.1"
        );

      const st = ScrollTrigger.create({
        trigger: sectionRef.current,
        start: "top 75%",
        once: true,
        onEnter: () => tl.play(),
      });

      return () => {
        st.kill();
        tl.kill();
      };
    },
    { scope: sectionRef }
  );

  return (
    <section ref={sectionRef} className="mx-auto max-w-[1200px] border-t border-ink-border px-5 py-24 md:px-12">
      <div className="mb-3 text-xs font-semibold uppercase tracking-[0.1em] text-ink-accent">實際體驗</div>
      <h2 className="mb-10 text-[clamp(26px,4vw,42px)] font-extrabold leading-tight tracking-tight">
        看看 AI 怎麼分析
      </h2>
      <div className="mx-auto max-w-[720px] overflow-hidden rounded-xl border border-ink-border bg-ink-surface">
        <div className="flex items-center gap-1.5 border-b border-ink-border px-3.5 py-2.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
        </div>

        <div className="flex flex-col gap-3 p-5">
          <div className="flex min-h-[260px] flex-col gap-3">
            <div
              ref={userBubbleRef}
              className="max-w-[78%] self-end rounded-xl rounded-br-sm bg-ink-accent px-4 py-3 text-sm font-medium leading-relaxed text-ink-bg"
            >
              {QUESTION}
            </div>

            <div ref={typingRef} className="flex gap-1 self-start px-4 py-3">
              {[0, 0.2, 0.4].map((delay) => (
                <span
                  key={delay}
                  className="h-1.5 w-1.5 animate-typing-bounce rounded-full bg-ink-fg-muted"
                  style={{ animationDelay: `${delay}s` }}
                />
              ))}
            </div>

            <div
              ref={aiBubbleRef}
              className="max-w-[78%] self-start rounded-xl rounded-bl-sm bg-ink-elevated px-4 py-3 text-sm leading-relaxed"
            >
              <div ref={titleRef}>
                <strong>市場情緒分析 — BTC</strong>
              </div>
              <div ref={summaryRef} className="mt-3">
                當前恐懼貪婪指數為 <strong className="text-ink-gain">68（貪婪）</strong>，較一週前上升 12 點。
              </div>
              <div ref={evidenceLabelRef} className="mt-3">
                <strong>關鍵依據：</strong>
              </div>
              <div
                ref={(el) => {
                  bulletRefs.current[0] = el;
                }}
                className="mt-1"
              >
                · 鏈上大戶地址 72h 內新增 3 個 &gt;10K BTC 地址
              </div>
              <div
                ref={(el) => {
                  bulletRefs.current[1] = el;
                }}
              >
                · 交易所淨流出 12,450 BTC，持續囤積趨勢
              </div>
              <div
                ref={(el) => {
                  bulletRefs.current[2] = el;
                }}
              >
                · BTC ETF 昨日淨流入 $4.2 億
              </div>
              <div ref={sourcesRef} className="mt-3 inline-flex items-center gap-1 font-mono text-[11px] text-ink-gain">
                📎 CoinGlass · Glassnode · SoSoValue
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 rounded-xl border border-ink-border bg-ink-bg px-4 py-3">
            <div className="flex-1 overflow-hidden whitespace-nowrap text-sm">
              <span ref={placeholderRef} className="text-ink-fg-muted">
                輸入你的問題...
              </span>
              <span ref={inputTextRef} className="text-ink-fg">
                {QUESTION}
              </span>
              <span className="ml-0.5 inline-block h-4 w-[2px] animate-caret-blink bg-ink-accent align-middle" />
            </div>
            <span ref={sendBtnRef} className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-ink-accent text-ink-bg">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
