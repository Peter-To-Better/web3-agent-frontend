"use client";

import { useRef, type ReactNode } from "react";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/gsap";

interface MagneticProps {
  children: ReactNode;
  strength?: number;
  className?: string;
}

/** Pulls its child toward the cursor within its own bounds — a signature CTA interaction. */
export function Magnetic({ children, strength = 0.35, className = "inline-block" }: MagneticProps) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;

      const canHover = typeof window !== "undefined" && window.matchMedia("(hover: hover)").matches;
      if (prefersReducedMotion() || !canHover) return;

      const xTo = gsap.quickTo(el, "x", { duration: 0.4, ease: "power3" });
      const yTo = gsap.quickTo(el, "y", { duration: 0.4, ease: "power3" });

      const handleMove = (event: MouseEvent) => {
        const rect = el.getBoundingClientRect();
        xTo((event.clientX - (rect.left + rect.width / 2)) * strength);
        yTo((event.clientY - (rect.top + rect.height / 2)) * strength);
      };
      const handleLeave = () => {
        xTo(0);
        yTo(0);
      };

      el.addEventListener("mousemove", handleMove);
      el.addEventListener("mouseleave", handleLeave);

      return () => {
        el.removeEventListener("mousemove", handleMove);
        el.removeEventListener("mouseleave", handleLeave);
      };
    },
    { scope: ref }
  );

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
