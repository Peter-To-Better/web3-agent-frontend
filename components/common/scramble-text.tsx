"use client";

import { useRef, type ElementType } from "react";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/gsap";

interface ScrambleTextProps {
  children: string;
  className?: string;
  as?: ElementType;
  delay?: number;
}

/**
 * 「雜訊 → 訊號」標題：載入時文字先以 0/1 與方塊雜訊呈現，再解碼成
 * 真正的內容 — 呼應「從雜訊中提煉可信訊號」的產品主軸。
 * 伺服器端直接輸出純文字，reduced-motion 使用者看到的也是靜態文字。
 */
export function ScrambleText({ children, className = "", as: Tag = "span", delay = 0.1 }: ScrambleTextProps) {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion() || !ref.current) return;

      gsap.fromTo(
        ref.current,
        { opacity: 0.4 },
        {
          opacity: 1,
          delay,
          duration: 0.9,
          ease: "power1.inOut",
          scrambleText: {
            text: children,
            chars: "01▓▒░<>/",
            speed: 0.5,
          },
        }
      );
    },
    { scope: ref, dependencies: [children] }
  );

  const Component = Tag as "span";
  return (
    <Component ref={ref} className={className}>
      {children}
    </Component>
  );
}
