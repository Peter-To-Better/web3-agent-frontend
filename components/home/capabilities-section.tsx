"use client";

import { useRef } from "react";
import { CornerFrame } from "@/components/common";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/gsap";
import { capabilities } from "@/lib/home-data";

/**
 * Pinned 3D-conveyor showcase: vertical scroll drives the five capability
 * cards through a perspective "viewing position" — the centered card faces
 * the reader at full brightness while its neighbours recede into depth
 * (rotateY + translateZ + dimming). Desktop only; falls back to a native
 * horizontal swipe row on touch/narrow/reduced-motion. The five panels are
 * the exact capabilities the HOYA BIT hackathon brief scores against.
 */
const MAX_TILT_DEG = 16;
const MAX_DEPTH_PX = 240;
const MAX_DIM = 0.45;

export function CapabilitiesSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const isDesktop = typeof window !== "undefined" && window.matchMedia("(min-width: 1024px)").matches;
      const track = trackRef.current;
      if (!isDesktop || prefersReducedMotion() || !track) return;

      const cards = gsap.utils.toArray<HTMLElement>(track.children);
      if (cards.length < 2) return;

      gsap.set(cards, { transformPerspective: 1100 });

      // 量測一次（refresh 時重量測）：卡片中心點在未位移座標系中的位置。
      let centers: number[] = [];
      let trackLeft0 = 0;
      let viewCenter = 0;
      let startX = 0;
      let endX = 0;

      const measure = () => {
        viewCenter = window.innerWidth / 2;
        trackLeft0 = track.getBoundingClientRect().left - (Number(gsap.getProperty(track, "x")) || 0);
        centers = cards.map((card) => card.offsetLeft + card.offsetWidth / 2);
        startX = viewCenter - trackLeft0 - centers[0];
        endX = viewCenter - trackLeft0 - centers[centers.length - 1];
      };

      const setters = cards.map((card) => ({
        rotY: gsap.quickSetter(card, "rotationY", "deg"),
        z: gsap.quickSetter(card, "z", "px"),
        alpha: gsap.quickSetter(card, "opacity"),
      }));

      // 依卡片與「檢視位」（視窗中線）的距離套用縱深姿態，全部只寫 transform/opacity。
      const applyDepth = () => {
        const tx = Number(gsap.getProperty(track, "x")) || 0;
        cards.forEach((_, i) => {
          const d = (trackLeft0 + centers[i] + tx - viewCenter) / viewCenter;
          const clamped = Math.max(-1.4, Math.min(1.4, d));
          setters[i].rotY(clamped * -MAX_TILT_DEG);
          setters[i].z(-Math.abs(clamped) * MAX_DEPTH_PX);
          setters[i].alpha(1 - Math.min(Math.abs(clamped) * MAX_DIM, MAX_DIM));
        });
      };

      measure();

      gsap.fromTo(track,
        { x: () => startX },
        {
          x: () => endX,
          ease: "none",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top top",
            end: () => `+=${centers[centers.length - 1] - centers[0]}`,
            pin: true,
            scrub: 1,
            invalidateOnRefresh: true,
            onRefresh: () => {
              measure();
              applyDepth();
            },
            onUpdate: applyDepth,
          },
        }
      );

      applyDepth();
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
