"use client";

import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrambleTextPlugin } from "gsap/ScrambleTextPlugin";

gsap.registerPlugin(useGSAP, ScrollTrigger, ScrambleTextPlugin);

/**
 * Direct synchronous check instead of gsap.matchMedia().add() with a single
 * named condition — matchMedia's condition callback only fires while that
 * query currently matches, so passing just `{ reduceMotion: "..." }` means
 * the callback (and therefore all animation setup inside it) never runs at
 * all for the common case where the user does NOT prefer reduced motion.
 */
export function prefersReducedMotion(): boolean {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export { gsap, useGSAP, ScrollTrigger };
