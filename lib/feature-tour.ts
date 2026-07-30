const TOUR_SEEN_STORAGE_PREFIX = "feature_tour_seen_";
const TOUR_RESTART_EVENT = "feature-tour-restart";

export type TourId = "chat" | "dashboard";

export function hasSeenTour(tourId: TourId): boolean {
  if (typeof window === "undefined") return true;
  try {
    return window.localStorage.getItem(`${TOUR_SEEN_STORAGE_PREFIX}${tourId}`) === "1";
  } catch {
    // Storage unavailable (private mode) — treat as seen so the tour never
    // auto-replays every reload; the top-bar button still starts it manually.
    return true;
  }
}

export function markTourSeen(tourId: TourId) {
  try {
    window.localStorage.setItem(`${TOUR_SEEN_STORAGE_PREFIX}${tourId}`, "1");
  } catch {
    // Ignore — worst case the tour offers itself again next visit.
  }
}

export function startFeatureTour(tourId: TourId) {
  window.dispatchEvent(new CustomEvent<TourId>(TOUR_RESTART_EVENT, { detail: tourId }));
}

export function onFeatureTourStart(tourId: TourId, handler: () => void): () => void {
  const listener = (event: Event) => {
    if ((event as CustomEvent<TourId>).detail === tourId) handler();
  };
  window.addEventListener(TOUR_RESTART_EVENT, listener);
  return () => window.removeEventListener(TOUR_RESTART_EVENT, listener);
}
