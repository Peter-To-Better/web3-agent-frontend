"use client";

import { startFeatureTour, type TourId } from "@/lib/feature-tour";

interface TourButtonProps {
  tourId: TourId;
}

export function TourButton({ tourId }: TourButtonProps) {
  return (
    <button
      type="button"
      onClick={() => startFeatureTour(tourId)}
      title="播放功能導覽"
      className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-ink-border px-2.5 py-1.5 text-xs text-ink-fg-secondary transition-colors hover:border-ink-fg-secondary hover:text-ink-fg"
    >
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="10" />
        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
      功能導覽
    </button>
  );
}
