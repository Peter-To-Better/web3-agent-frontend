"use client";

import { useGSAP, gsap, prefersReducedMotion } from "@/lib/gsap";

/**
 * 頁面級進場編排：掛載後蒐集所有 `[data-entrance]` 元素，依數字順序
 * 跑一條淡入 timeline。元素可用 `data-entrance-x` / `data-entrance-y`
 * 指定進場位移方向（預設由下往上 12px）。
 *
 * 渲染為 null，放在頁面任何位置都不影響版面；沒有掛載本元件的頁面，
 * 殘留的 data-entrance 屬性不會有任何效果。
 */
export function PageEntrance() {
  useGSAP(() => {
    if (prefersReducedMotion()) return;

    const els = gsap.utils.toArray<HTMLElement>("[data-entrance]");
    if (!els.length) return;

    els.sort((a, b) => Number(a.dataset.entrance) - Number(b.dataset.entrance));

    const tl = gsap.timeline({ defaults: { ease: "power2.out" } });
    els.forEach((el, i) => {
      const x = Number(el.dataset.entranceX ?? 0);
      const y = Number(el.dataset.entranceY ?? (x ? 0 : 12));
      tl.fromTo(
        el,
        { opacity: 0, x, y },
        { opacity: 1, x: 0, y: 0, duration: 0.55, clearProps: "opacity,transform" },
        i * 0.07
      );
    });
  }, []);

  return null;
}
