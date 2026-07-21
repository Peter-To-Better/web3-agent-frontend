"use client";

import { useRef } from "react";
import Link from "next/link";
import { gsap, useGSAP, ScrollTrigger, prefersReducedMotion } from "@/lib/gsap";

export function BigStatSection() {
  const rootRef = useRef<HTMLDivElement>(null);
  const numberRef = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      const setNumber = (value: number) => {
        if (numberRef.current) numberRef.current.textContent = Math.round(value).toString();
      };

      if (prefersReducedMotion()) {
        setNumber(68);
        return;
      }

      setNumber(0);
      const proxy = { value: 0 };

      const tween = gsap.to(proxy, {
        value: 68,
        duration: 1.4,
        ease: "power2.out",
        paused: true,
        onUpdate: () => setNumber(proxy.value),
      });

      const st = ScrollTrigger.create({
        trigger: rootRef.current,
        start: "top 80%",
        once: true,
        onEnter: () => tween.play(),
      });

      return () => {
        st.kill();
        tween.kill();
      };
    },
    { scope: rootRef }
  );

  return (
    <section ref={rootRef} className="border-y border-ink-border bg-ink-surface px-5 py-20 text-center md:px-12">
      <div className="mx-auto max-w-[1200px]">
        <div className="mb-2 font-mono text-xs uppercase tracking-[0.1em] text-ink-fg-muted">
          即時市場情緒 · 恐懼貪婪指數
        </div>
        <div className="flex items-baseline justify-center gap-2 font-mono">
          <span ref={numberRef} className="text-[clamp(80px,16vw,180px)] font-black leading-none text-ink-gain">
            0
          </span>
          <span className="text-[clamp(24px,4vw,40px)] font-bold text-ink-fg-muted">/100</span>
        </div>
        <p className="mx-auto mt-3 max-w-md text-sm text-ink-fg-secondary">
          市場目前處於「貪婪」區間。想看完整的情緒儀表、RSI 與做多/做空推薦榜？
        </p>
        <Link
          href="/dashboard"
          className="mt-6 inline-flex items-center gap-1.5 font-mono text-sm text-ink-accent hover:no-underline"
        >
          進入數據看板 →
        </Link>
      </div>
    </section>
  );
}
