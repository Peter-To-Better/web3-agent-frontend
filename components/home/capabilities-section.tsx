"use client";

import { useRef } from "react";
import { CornerFrame } from "@/components/common";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/gsap";
import { capabilities } from "@/lib/home-data";

/**
 * Pinned horizontal-scroll showcase: vertical scroll drives horizontal
 * movement through five panels (desktop only — falls back to a native
 * horizontal swipe row on touch/narrow/reduced-motion). The five panels
 * are the exact capabilities the HOYA BIT hackathon brief scores against,
 * not generic marketing bullets.
 */
export function CapabilitiesSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const isDesktop = typeof window !== "undefined" && window.matchMedia("(min-width: 1024px)").matches;
      const track = trackRef.current;
      if (!isDesktop || prefersReducedMotion() || !track) return;

      const distance = track.scrollWidth - track.clientWidth;
      if (distance <= 0) return;

      gsap.to(track, {
        x: -distance,
        ease: "none",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: () => `+=${distance}`,
          pin: true,
          scrub: 1,
          invalidateOnRefresh: true,
        },
      });
    },
    { scope: sectionRef }
  );

  return (
    <section id="features" ref={sectionRef} className="relative overflow-hidden border-t border-ink-border bg-ink-bg">
      <div className="px-5 pb-8 pt-24 md:px-12">
        <div className="mb-3 text-xs font-semibold uppercase tracking-[0.1em] text-ink-accent">平台核心能力</div>
        <h2 className="max-w-2xl text-[clamp(26px,4vw,42px)] font-extrabold leading-tight tracking-tight">
          不只是聊天，是能通過檢驗的分析
        </h2>
        <p className="mt-3 max-w-xl text-base leading-relaxed text-ink-fg-secondary">
          五項能力，對應「加密市場分析 AI Agent」命題的每一項評分要求。
        </p>
      </div>
      <div
        ref={trackRef}
        className="flex gap-6 overflow-x-auto px-5 pb-24 pt-4 [scrollbar-width:none] md:px-12 lg:overflow-visible [&::-webkit-scrollbar]:hidden"
      >
        {capabilities.map((cap) => (
          <CornerFrame
            key={cap.index}
            className="w-[82vw] shrink-0 border border-ink-border bg-ink-surface p-8 sm:w-[380px]"
          >
            <div className="mb-8 font-mono text-xs text-ink-fg-muted">CAPABILITY {cap.index}</div>
            <h3 className="mb-3 text-2xl font-bold text-ink-fg">{cap.title}</h3>
            <p className="text-sm leading-relaxed text-ink-fg-secondary">{cap.description}</p>
          </CornerFrame>
        ))}
      </div>
    </section>
  );
}
