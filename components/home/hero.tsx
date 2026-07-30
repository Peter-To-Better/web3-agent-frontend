"use client";

import { useRef } from "react";
import { Button, CornerFrame, Magnetic } from "@/components/common";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/gsap";

const reportLines = [
  { label: "資產", value: "BTC / USD" },
  { label: "情緒指數", value: "68（貪婪）", tone: "gain" as const },
  { label: "72h 大戶淨流入", value: "+3 個地址 (>10K BTC)", tone: "gain" as const },
  { label: "交易所淨流出", value: "-12,450 BTC", tone: "gain" as const },
];

export function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const queryRef = useRef<HTMLSpanElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const descRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const panel3dRef = useRef<HTMLDivElement>(null);
  const tiltRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;

      gsap
        .timeline({ defaults: { ease: "power3.out" } })
        .fromTo(
          queryRef.current,
          { clipPath: "inset(0 100% 0 0)" },
          { clipPath: "inset(0 0% 0 0)", duration: 0.7, ease: "steps(24)" }
        )
        .fromTo(
          headlineRef.current,
          { opacity: 0, y: 26, filter: "blur(10px)" },
          { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.8 },
          "-=0.15"
        )
        .fromTo(panelRef.current, { opacity: 0, x: 32 }, { opacity: 1, x: 0, duration: 0.8 }, "<")
        // 報告面板像 HUD 懸浮窗：從側面深角度轉到 -7° 的常駐姿態。
        .fromTo(
          panel3dRef.current,
          { rotationY: -20, transformPerspective: 1200 },
          { rotationY: -7, duration: 1.1, ease: "power2.out" },
          "<"
        )
        .fromTo(descRef.current, { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.6 }, "-=0.75")
        .fromTo(
          ctaRef.current?.children ?? [],
          { opacity: 0, y: 14 },
          { opacity: 1, y: 0, duration: 0.5, stagger: 0.1 },
          "-=0.35"
        );

      // 往下滾動時面板緩慢轉正退場（外層與載入動畫分屬不同元素，互不搶寫）。
      gsap.fromTo(
        panelRef.current,
        { rotationY: 0, transformPerspective: 1400 },
        {
          rotationY: 7,
          y: -24,
          ease: "none",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top top",
            end: "bottom 35%",
            scrub: 0.8,
          },
        }
      );

      // 滑鼠微視差（僅指標裝置）：內層獨立承接 pointer 的細微傾斜。
      let removeTiltListeners: (() => void) | undefined;
      if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
        const section = sectionRef.current;
        const tiltX = gsap.quickTo(tiltRef.current, "rotationX", { duration: 0.7, ease: "power3.out" });
        const tiltY = gsap.quickTo(tiltRef.current, "rotationY", { duration: 0.7, ease: "power3.out" });
        gsap.set(tiltRef.current, { transformPerspective: 900 });

        const onMove = (event: PointerEvent) => {
          const rect = section?.getBoundingClientRect();
          if (!rect) return;
          const nx = (event.clientX - rect.left) / rect.width - 0.5;
          const ny = (event.clientY - rect.top) / rect.height - 0.5;
          tiltX(ny * -4);
          tiltY(nx * 5);
        };
        const onLeave = () => {
          tiltX(0);
          tiltY(0);
        };

        section?.addEventListener("pointermove", onMove);
        section?.addEventListener("pointerleave", onLeave);
        removeTiltListeners = () => {
          section?.removeEventListener("pointermove", onMove);
          section?.removeEventListener("pointerleave", onLeave);
        };
      }

      gsap.to(glowRef.current, {
        opacity: 0.55,
        scale: 1.08,
        duration: 4,
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true,
        transformOrigin: "center",
      });

      gsap.to(gridRef.current, {
        backgroundPosition: "48px 48px",
        duration: 18,
        ease: "none",
        repeat: -1,
      });

      return () => {
        removeTiltListeners?.();
        gsap.set(
          [queryRef.current, headlineRef.current, descRef.current, panelRef.current, panel3dRef.current, tiltRef.current],
          { clearProps: "all" }
        );
      };
    },
    { scope: sectionRef }
  );

  return (
    <section
      ref={sectionRef}
      className="relative mx-auto max-w-[1200px] overflow-hidden px-5 pb-24 pt-28 md:px-12 md:pt-36"
    >
      <div
        ref={gridRef}
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            "linear-gradient(to right, var(--color-ink-fg) 1px, transparent 1px), linear-gradient(to bottom, var(--color-ink-fg) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          maskImage: "radial-gradient(ellipse 70% 60% at 50% 20%, black 40%, transparent 90%)",
        }}
      />
      <div
        ref={glowRef}
        aria-hidden
        className="pointer-events-none absolute -top-[280px] left-1/2 h-[760px] w-[900px] -translate-x-1/2 rounded-full opacity-40"
        style={{
          background: "radial-gradient(circle, rgba(255,181,69,0.07) 0%, transparent 65%)",
        }}
      />

      <div className="relative z-10 grid grid-cols-1 items-center gap-14 lg:grid-cols-[1.05fr_0.95fr]">
        <div>
          <div className="mb-6 flex items-center gap-2 font-mono text-[13px] text-ink-fg-muted">
            <span className="text-ink-accent">$</span>
            <span ref={queryRef} className="inline-block">
              query --asset=BTC,ETH,SOL --mode=live
            </span>
            <span className="h-3.5 w-[7px] animate-caret-blink bg-ink-accent" aria-hidden />
          </div>

          <h1
            ref={headlineRef}
            className="mb-6 text-[clamp(46px,8vw,100px)] font-black leading-[0.98] tracking-tight"
          >
            加密市場的
            <br />
            <span className="text-ink-accent">證據型</span> AI 分析
          </h1>

          <p
            ref={descRef}
            className="mb-9 max-w-[520px] text-[clamp(15px,1.6vw,18px)] leading-relaxed text-ink-fg-secondary"
          >
            輸入幣種與問題，AI Agent 即時蒐集多源資料，逐條列出依據與來源，
            產出可驗證的深度分析報告 — 不是模糊的猜測。
          </p>

          <div ref={ctaRef} className="flex flex-wrap items-center gap-5">
            <Magnetic>
              <Button
                href="/chat"
                variant="primary"
                icon={
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                }
              >
                開始分析
              </Button>
            </Magnetic>
            <a
              href="#features"
              className="font-mono text-sm text-ink-fg-secondary transition-colors hover:text-ink-fg hover:no-underline"
            >
              [ 了解更多 ]
            </a>
          </div>
        </div>

        <div ref={panelRef}>
          <div ref={panel3dRef} className="will-change-transform">
            <div ref={tiltRef}>
              <CornerFrame className="border border-ink-border bg-ink-surface">
                <div className="flex items-center gap-2 border-b border-ink-border px-4 py-3">
                  <span className="h-1.5 w-1.5 animate-pulse-dot rounded-full bg-ink-gain" />
                  <span className="font-mono text-[11px] text-ink-fg-muted">analysis/btc_sentiment.log</span>
                </div>
                <div className="space-y-3 px-5 py-5 font-mono text-[13px]">
                  <div className="text-ink-fg-secondary">
                    <span className="text-ink-accent">&gt;</span> BTC 市場情緒分析
                  </div>
                  <dl className="space-y-2">
                    {reportLines.map((line) => (
                      <div key={line.label} className="flex items-baseline justify-between gap-4">
                        <dt className="text-ink-fg-muted">{line.label}</dt>
                        <dd className={line.tone === "gain" ? "text-ink-gain" : "text-ink-fg"}>{line.value}</dd>
                      </div>
                    ))}
                  </dl>
                  <div className="border-t border-ink-border pt-3 text-[11px] text-ink-fg-muted">
                    [1] CoinGlass&nbsp;&nbsp;[2] Glassnode&nbsp;&nbsp;[3] SoSoValue
                  </div>
                </div>
              </CornerFrame>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
