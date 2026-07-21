"use client";

import { useRef, type ReactNode } from "react";
import { gsap, useGSAP, ScrollTrigger, prefersReducedMotion } from "@/lib/gsap";

interface CornerFrameProps {
  children: ReactNode;
  className?: string;
}

/**
 * HUD-style bracket corners — the site's recurring "readout panel" motif.
 * On scroll into view, the four corners snap in like a targeting lock,
 * then the content settles in behind them. Stands in for the generic
 * colored-icon-in-rounded-box card pattern.
 */
export function CornerFrame({ children, className = "" }: CornerFrameProps) {
  const rootRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const corners = gsap.utils.toArray<HTMLElement>(".corner-frame__corner", rootRef.current);
      const content = rootRef.current?.querySelector(".corner-frame__content") ?? null;

      if (prefersReducedMotion()) return;

      gsap.set(corners, { scale: 0 });
      gsap.set(content, { opacity: 0, y: 10 });

      const tl = gsap
        .timeline({ paused: true })
        .to(corners, { scale: 1, duration: 0.35, stagger: 0.06, ease: "back.out(3)" })
        .to(content, { opacity: 1, y: 0, duration: 0.4, ease: "power2.out" }, "-=0.15");

      const st = ScrollTrigger.create({
        trigger: rootRef.current,
        start: "top 88%",
        once: true,
        onEnter: () => tl.play(),
      });

      return () => {
        st.kill();
        tl.kill();
        gsap.set(corners, { clearProps: "all" });
        gsap.set(content, { clearProps: "all" });
      };
    },
    { scope: rootRef }
  );

  const corner = "corner-frame__corner pointer-events-none absolute h-3 w-3 border-ink-accent/70";

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <span
        className={`${corner} -left-px -top-px border-l-2 border-t-2`}
        style={{ transformOrigin: "top left" }}
      />
      <span
        className={`${corner} -right-px -top-px border-r-2 border-t-2`}
        style={{ transformOrigin: "top right" }}
      />
      <span
        className={`${corner} -bottom-px -left-px border-b-2 border-l-2`}
        style={{ transformOrigin: "bottom left" }}
      />
      <span
        className={`${corner} -bottom-px -right-px border-b-2 border-r-2`}
        style={{ transformOrigin: "bottom right" }}
      />
      <div className="corner-frame__content">{children}</div>
    </div>
  );
}
