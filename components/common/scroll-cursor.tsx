"use client";

import { useRef } from "react";
import { useGSAP, ScrollTrigger, prefersReducedMotion } from "@/lib/gsap";

/**
 * Fixed terminal-cursor glyph in the corner: "｜" at rest, flips to "＿"
 * while the page is actively scrolling, then snaps back to "｜" once it
 * settles — an Awwwards-style scroll affordance that reuses the blinking-
 * caret motif from the hero instead of a generic progress bar/dot.
 */
export function ScrollCursor() {
  const glyphRef = useRef<HTMLDivElement>(null);
  const idleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useGSAP(() => {
    if (prefersReducedMotion()) return;

    const setGlyph = (char: string) => {
      if (glyphRef.current) glyphRef.current.textContent = char;
    };

    const trigger = ScrollTrigger.create({
      trigger: document.documentElement,
      start: 0,
      end: "max",
      onUpdate: () => {
        setGlyph("＿");
        if (idleTimer.current) clearTimeout(idleTimer.current);
        idleTimer.current = setTimeout(() => setGlyph("｜"), 220);
      },
    });

    return () => {
      trigger.kill();
      if (idleTimer.current) clearTimeout(idleTimer.current);
    };
  }, []);

  return (
    <div
      ref={glyphRef}
      aria-hidden
      className="pointer-events-none fixed bottom-6 right-6 z-40 hidden select-none font-mono text-xl font-bold text-ink-accent md:block"
    >
      ｜
    </div>
  );
}
