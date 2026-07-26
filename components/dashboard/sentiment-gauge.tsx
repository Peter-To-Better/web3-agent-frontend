"use client";

import { useRef } from "react";
import { CornerFrame } from "@/components/common";
import { gsap, useGSAP, ScrollTrigger, prefersReducedMotion } from "@/lib/gsap";
import type { GaugeReading } from "@/lib/dashboard-data";

const CX = 100;
const CY = 100;
const RADIUS = 82;
const NEEDLE_LENGTH = 66;
const ZONE_COLORS = [
  "var(--color-ink-loss)",
  "color-mix(in srgb, var(--color-ink-loss) 60%, var(--color-ink-fg-muted))",
  "var(--color-ink-fg-muted)",
  "color-mix(in srgb, var(--color-ink-gain) 60%, var(--color-ink-fg-muted))",
  "var(--color-ink-gain)",
];

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = (angleDeg * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy - r * Math.sin(rad) };
}

function describeArc(cx: number, cy: number, r: number, startAngle: number, endAngle: number) {
  const start = polarToCartesian(cx, cy, r, startAngle);
  const end = polarToCartesian(cx, cy, r, endAngle);
  return `M ${start.x} ${start.y} A ${r} ${r} 0 0 1 ${end.x} ${end.y}`;
}

function valueToAngle(value: number) {
  return 180 - (Math.max(0, Math.min(100, value)) / 100) * 180;
}

interface SentimentGaugeProps {
  reading: GaugeReading;
  /**
   * Reveal the needle via a scroll-triggered entrance animation, once.
   * Set false for a widget whose `reading.value` keeps changing after mount
   * (e.g. a polled live dashboard) — every value change then tweens the
   * needle immediately instead of waiting for a scroll crossing that, for an
   * already-visible element, never fires again after the first time.
   */
  animateOnScroll?: boolean;
}

export function SentimentGauge({ reading, animateOnScroll = true }: SentimentGaugeProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const needleRef = useRef<SVGLineElement>(null);
  const currentValueRef = useRef(0);
  const zoneArcs = Array.from({ length: 5 }, (_, i) => describeArc(CX, CY, RADIUS, 180 - i * 36, 180 - (i + 1) * 36));
  const activeZoneIndex = Math.min(4, Math.floor(reading.value / 20));
  const delta = reading.value - reading.previousValue;

  useGSAP(
    () => {
      // Only the needle sweep is driven imperatively by GSAP — the numeric
      // readout is plain React JSX below, so it's guaranteed to reflect
      // `reading.value` on every render regardless of GSAP/useGSAP's own
      // tween-cleanup timing (its cleanup between dependency changes isn't
      // as strict as a plain useEffect's, so imperative DOM writes for
      // data-critical text aren't safe to rely on here).
      const setNeedle = (value: number) => {
        const { x, y } = polarToCartesian(CX, CY, NEEDLE_LENGTH, valueToAngle(value));
        needleRef.current?.setAttribute("x2", String(x));
        needleRef.current?.setAttribute("y2", String(y));
        currentValueRef.current = value;
      };

      if (prefersReducedMotion()) {
        setNeedle(reading.value);
        return;
      }

      if (!animateOnScroll) {
        const proxy = { value: currentValueRef.current };
        const tween = gsap.to(proxy, {
          value: reading.value,
          duration: 0.8,
          ease: "power2.out",
          onUpdate: () => setNeedle(proxy.value),
        });
        return () => tween.kill();
      }

      setNeedle(0);
      const proxy = { value: 0 };

      const tween = gsap.to(proxy, {
        value: reading.value,
        duration: 1.1,
        ease: "power2.out",
        paused: true,
        onUpdate: () => setNeedle(proxy.value),
      });

      const st = ScrollTrigger.create({
        trigger: rootRef.current,
        start: "top 88%",
        once: true,
        onEnter: () => tween.play(),
      });

      return () => {
        st.kill();
        tween.kill();
      };
    },
    { scope: rootRef, dependencies: [reading.value, animateOnScroll] }
  );

  return (
    <div ref={rootRef}>
      <CornerFrame className="border border-ink-border bg-ink-surface p-5">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-ink-fg">{reading.title}</h3>
          <span className="font-mono text-[11px] text-ink-fg-muted">
            昨日 {reading.previousValue}（{delta >= 0 ? "+" : ""}
            {delta.toFixed(1)}）
          </span>
        </div>
        <svg viewBox="0 0 200 112" className="w-full">
          {zoneArcs.map((d, i) => (
            <path key={d} d={d} fill="none" stroke={ZONE_COLORS[i]} strokeWidth="14" strokeLinecap="round" opacity={i === activeZoneIndex ? 1 : 0.35} />
          ))}
          <circle cx={CX} cy={CY} r="5" fill="var(--color-ink-accent)" />
          <line ref={needleRef} x1={CX} y1={CY} x2={CX - NEEDLE_LENGTH} y2={CY} stroke="var(--color-ink-accent)" strokeWidth="3" strokeLinecap="round" />
          <text x={CX} y={CY - 8} textAnchor="middle" className="font-mono text-[26px] font-bold" fill="var(--color-ink-fg)">
            {reading.value.toFixed(1)}
          </text>
        </svg>
        <div className="mt-1 flex justify-between font-mono text-[10px]">
          {reading.zones.map((zone, i) => (
            <span key={zone} className={i === activeZoneIndex ? "font-semibold text-ink-accent" : "text-ink-fg-muted"}>
              {zone}
            </span>
          ))}
        </div>
      </CornerFrame>
    </div>
  );
}
