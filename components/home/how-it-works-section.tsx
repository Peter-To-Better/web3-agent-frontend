"use client";

import { useRef } from "react";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/gsap";
import { steps } from "@/lib/home-data";

export function HowItWorksSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);
  const dotRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const stepRefs = useRef<(HTMLDivElement | null)[]>([]);

  useGSAP(
    () => {
      const fadeGroups = stepRefs.current.map((el) => el?.querySelectorAll<HTMLElement>(".step-fade") ?? []);

      if (prefersReducedMotion()) {
        gsap.set(lineRef.current, { scaleY: 1 });
        gsap.set(dotRefs.current, { backgroundColor: "#ffb545" });
        fadeGroups.forEach((group) => gsap.set(group, { opacity: 1, y: 0 }));
        return;
      }

      gsap.set(lineRef.current, { scaleY: 0, transformOrigin: "top" });
      gsap.set(dotRefs.current, { backgroundColor: "#3a382c" });
      fadeGroups.forEach((group) => gsap.set(group, { opacity: 0, y: 8 }));

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 65%",
          end: "bottom 80%",
          scrub: 0.6,
        },
      });

      tl.to(lineRef.current, { scaleY: 1, ease: "none" }, 0);

      const step = 1 / steps.length;
      steps.forEach((_, i) => {
        const at = i * step;
        const dot = dotRefs.current[i];
        if (dot) {
          tl.to(dot, { backgroundColor: "#ffb545", scale: 1.4, duration: step * 0.3 }, at).to(
            dot,
            { scale: 1, duration: step * 0.3 },
            at + step * 0.3
          );
        }
        if (fadeGroups[i].length) {
          tl.to(fadeGroups[i], { opacity: 1, y: 0, duration: step * 0.5, stagger: step * 0.15, ease: "none" }, at);
        }
      });
    },
    { scope: sectionRef }
  );

  return (
    <section id="how" ref={sectionRef} className="mx-auto max-w-[1200px] border-t border-ink-border px-5 py-24 md:px-12">
      <div className="mb-3 text-xs font-semibold uppercase tracking-[0.1em] text-ink-accent">運作方式</div>
      <h2 className="mb-3 text-[clamp(26px,4vw,42px)] font-extrabold leading-tight tracking-tight">
        三步取得深度分析
      </h2>
      <p className="mb-14 max-w-[520px] text-base leading-relaxed text-ink-fg-secondary">
        從提問到報告，全程自動化。
      </p>
      <div className="relative max-w-2xl">
        <div className="absolute left-0 top-0 h-full w-px bg-ink-border" />
        <div ref={lineRef} className="absolute left-0 top-0 h-full w-px bg-ink-accent" />
        {steps.map((step, i) => (
          <div
            key={step.number}
            ref={(el) => {
              stepRefs.current[i] = el;
            }}
            className="relative py-7 pl-8 last:pb-0"
          >
            <span
              ref={(el) => {
                dotRefs.current[i] = el;
              }}
              className="absolute -left-[5px] top-[34px] h-[9px] w-[9px] rounded-full"
            />
            <div className="step-fade mb-1.5 font-mono text-xs tracking-wide text-ink-accent">
              STEP {step.number}
            </div>
            <h3 className="step-fade mb-1.5 text-[15px] font-bold text-ink-fg">{step.title}</h3>
            <p className="step-fade max-w-md text-[13px] leading-relaxed text-ink-fg-secondary">
              {step.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
