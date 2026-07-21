"use client";

import { useRef, type ElementType, type ReactNode } from "react";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/gsap";

interface RevealProps {
  children: ReactNode;
  className?: string;
  as?: ElementType;
  y?: number;
  delay?: number;
}

/** Fades a block up into place the first time it scrolls into view. */
export function Reveal({ children, className = "", as: Tag = "div", y = 20, delay = 0 }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;

      const tween = gsap.fromTo(
        ref.current,
        { opacity: 0, y },
        {
          opacity: 1,
          y: 0,
          duration: 0.7,
          delay,
          ease: "power2.out",
          scrollTrigger: {
            trigger: ref.current,
            start: "top 88%",
            toggleActions: "play none none none",
          },
        }
      );

      return () => {
        tween.scrollTrigger?.kill();
        tween.kill();
        gsap.set(ref.current, { clearProps: "all" });
      };
    },
    { scope: ref }
  );

  const Component = Tag as "div";
  return (
    <Component ref={ref} className={className}>
      {children}
    </Component>
  );
}
