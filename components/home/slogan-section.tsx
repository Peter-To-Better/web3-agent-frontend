"use client";

import { useRef } from "react";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/gsap";

interface Segment {
  text: string;
  accent?: boolean;
}

function chunkSegments(segments: Segment[], size = 3): Segment[] {
  const out: Segment[] = [];
  for (const seg of segments) {
    for (let i = 0; i < seg.text.length; i += size) {
      out.push({ text: seg.text.slice(i, i + size), accent: seg.accent });
    }
  }
  return out;
}

const line1 = chunkSegments([{ text: "市場從不缺意見，" }]);
const line2 = chunkSegments([
  { text: "缺的是" },
  { text: "禁得起回溯", accent: true },
  { text: "的證據。" },
]);

/**
 * Scroll-scrubbed "zoom in" transition: the whole slogan keeps growing as
 * you scroll through the section, while its word-groups pop in individually
 * (scale + fade) in reading order — driven directly by scroll position, not
 * a one-shot enter animation.
 */
export function SloganSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const chunkRefs = useRef<(HTMLSpanElement | null)[]>([]);

  useGSAP(
    () => {
      if (prefersReducedMotion()) {
        gsap.set(containerRef.current, { scale: 1 });
        gsap.set(chunkRefs.current.filter(Boolean), { opacity: 1, scale: 1, y: 0 });
        return;
      }

      const chunks = chunkRefs.current.filter((el): el is HTMLSpanElement => el !== null);

      gsap.set(containerRef.current, { scale: 0.72, transformOrigin: "center" });
      gsap.set(chunks, { opacity: 0, scale: 0.4, y: 24 });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 92%",
          end: "center 40%",
          scrub: 0.6,
        },
      });

      tl.to(containerRef.current, { scale: 1.08, ease: "none", duration: 1 }, 0);

      const n = chunks.length;
      chunks.forEach((el, i) => {
        tl.to(el, { opacity: 1, scale: 1, y: 0, ease: "none", duration: 1 / n }, (i / n) * 0.82);
      });
    },
    { scope: sectionRef }
  );

  return (
    <section
      ref={sectionRef}
      className="relative flex min-h-[80vh] items-center justify-center overflow-hidden border-t border-ink-border bg-ink-bg px-5 py-24 text-center md:px-12"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 h-[640px] w-[900px] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{ background: "radial-gradient(circle, rgba(255,181,69,0.08) 0%, transparent 70%)" }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{ background: "radial-gradient(ellipse at center, transparent 35%, var(--color-ink-bg) 92%)" }}
      />
      <div
        ref={containerRef}
        className="relative max-w-4xl text-[clamp(32px,6vw,72px)] font-black leading-[1.3] tracking-tight"
      >
        <div>
          {line1.map((seg, i) => (
            <span
              key={i}
              ref={(el) => {
                chunkRefs.current[i] = el;
              }}
              className="inline-block"
            >
              {seg.text}
            </span>
          ))}
        </div>
        <div>
          {line2.map((seg, i) => (
            <span
              key={i}
              ref={(el) => {
                chunkRefs.current[line1.length + i] = el;
              }}
              className={`inline-block ${seg.accent ? "text-ink-accent" : ""}`}
            >
              {seg.text}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
