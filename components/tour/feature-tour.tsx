"use client";

import { useEffect, useState } from "react";
import { EVENTS, Joyride, type EventData, type Step } from "react-joyride";
import { hasSeenTour, markTourSeen, onFeatureTourStart, type TourId } from "@/lib/feature-tour";

// Give fonts與 GSAP 進場動畫一點時間穩定，再對目標打 spotlight。
const AUTO_START_DELAY_MS = 900;

// 色票對應 globals.css 的 ink tokens。react-joyride 需要具體色值
// （不能保證所有內部用途都支援 var()），因此在這裡鏡射一份。
const INK = {
  bg: "#0a0a09",
  elevated: "#201e17",
  border: "#2e2b22",
  fg: "#f5f2e8",
  fgSecondary: "#a39d8c",
  fgMuted: "#6b6555",
  accent: "#ffb545",
} as const;

interface FeatureTourProps {
  tourId: TourId;
  steps: Step[];
}

export function FeatureTour({ tourId, steps }: FeatureTourProps) {
  const [run, setRun] = useState(false);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    if (!hasSeenTour(tourId)) {
      timer = setTimeout(() => setRun(true), AUTO_START_DELAY_MS);
    }
    const unsubscribe = onFeatureTourStart(tourId, () => setRun(true));
    return () => {
      clearTimeout(timer);
      unsubscribe();
    };
  }, [tourId]);

  function handleEvent(event: EventData) {
    // TOUR_END 涵蓋完成、略過與關閉；一律記錄已看過，之後靠按鈕重播。
    if (event.type === EVENTS.TOUR_END) {
      markTourSeen(tourId);
      setRun(false);
    }
  }

  // 不執行時整個卸載，重播即從第一步重新開始。
  if (!run) return null;

  return (
    <Joyride
      steps={steps}
      run
      continuous
      scrollToFirstStep
      onEvent={handleEvent}
      locale={{
        back: "上一步",
        close: "關閉",
        last: "完成導覽",
        next: "下一步",
        nextWithProgress: "下一步（{current}/{total}）",
        skip: "略過導覽",
      }}
      options={{
        arrowColor: INK.elevated,
        backgroundColor: INK.elevated,
        overlayColor: "rgba(5, 5, 4, 0.72)",
        primaryColor: INK.accent,
        textColor: INK.fg,
        spotlightRadius: 12,
        spotlightPadding: 6,
        zIndex: 10000,
        skipBeacon: true,
        showProgress: true,
        buttons: ["skip", "back", "primary", "close"],
      }}
      styles={{
        tooltip: {
          borderRadius: 12,
          border: `1px solid ${INK.border}`,
          fontFamily: "var(--font-body)",
          fontSize: 14,
        },
        tooltipTitle: { color: INK.accent, fontSize: 15, fontWeight: 700 },
        tooltipContent: { color: INK.fgSecondary, lineHeight: 1.7, textAlign: "left" },
        buttonPrimary: { color: INK.bg, fontWeight: 600, fontSize: 13, borderRadius: 8 },
        buttonBack: { color: INK.fgSecondary, fontSize: 13 },
        buttonSkip: { color: INK.fgMuted, fontSize: 12 },
        buttonClose: { color: INK.fgSecondary },
      }}
    />
  );
}
