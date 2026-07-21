"use client";

import { useRef } from "react";
import { gsap, useGSAP, ScrollTrigger, prefersReducedMotion } from "@/lib/gsap";
import { stats } from "@/lib/home-data";

function parseValue(raw: string): { prefix: string; number: number } {
  const match = raw.match(/^(\D*)(\d+)$/);
  if (!match) return { prefix: raw, number: 0 };
  return { prefix: match[1], number: Number(match[2]) };
}

export function StatsBar() {
  const rootRef = useRef<HTMLDivElement>(null);
  const numberRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const parsed = stats.map((stat) => parseValue(stat.value));

  useGSAP(
    () => {
      const setDisplay = (i: number, value: number) => {
        const el = numberRefs.current[i];
        if (el) el.textContent = `${parsed[i].prefix}${Math.round(value)}`;
      };

      if (prefersReducedMotion()) {
        parsed.forEach((p, i) => setDisplay(i, p.number));
        return;
      }

      parsed.forEach((_, i) => setDisplay(i, 0));

      const tl = gsap.timeline({ paused: true });
      parsed.forEach((p, i) => {
        const proxy = { value: 0 };
        tl.to(
          proxy,
          {
            value: p.number,
            duration: 1.6,
            ease: "none",
            snap: { value: 1 },
            onUpdate: () => setDisplay(i, proxy.value),
          },
          i * 0.15
        );
      });

      const st = ScrollTrigger.create({
        trigger: rootRef.current,
        start: "top 88%",
        once: true,
        onEnter: () => tl.play(),
      });

      return () => {
        st.kill();
        tl.kill();
      };
    },
    { scope: rootRef }
  );

  return (
    <div
      ref={rootRef}
      className="mx-5 grid max-w-[1200px] grid-cols-2 gap-px overflow-hidden rounded-xl bg-ink-border md:mx-auto md:grid-cols-4"
    >
      {stats.map((stat, i) => (
        <div key={stat.label} className="bg-ink-surface px-5 py-7 text-center">
          <div className="font-mono text-[28px] font-bold tracking-tight">
            <span
              ref={(el) => {
                numberRefs.current[i] = el;
              }}
            >
              {stat.value}
            </span>
            <span className="text-ink-gain">{stat.suffix}</span>
          </div>
          <div className="mt-1 text-[13px] text-ink-fg-muted">{stat.label}</div>
        </div>
      ))}
    </div>
  );
}
