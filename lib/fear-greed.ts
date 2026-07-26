import "server-only";
import type { FearGreedReading } from "@/lib/types";

const CLASSIFICATION_MAP: Record<string, string> = {
  "Extreme Fear": "極度恐懼",
  Fear: "恐懼",
  Neutral: "中性",
  Greed: "貪婪",
  "Extreme Greed": "極度貪婪",
};

interface AlternativeFngResponse {
  data?: Array<{ value: string; value_classification: string }>;
}

/**
 * alternative.me's crypto Fear & Greed Index — free, no API key, updates
 * ~once/day upstream, so a 15-minute revalidate is plenty fresh without
 * hammering a third party on every request.
 */
export async function getFearGreedIndex(): Promise<FearGreedReading | null> {
  try {
    const res = await fetch("https://api.alternative.me/fng/?limit=1&format=json", {
      signal: AbortSignal.timeout(8000),
      next: { revalidate: 900 },
    });
    if (!res.ok) throw new Error(`Fear & Greed API HTTP ${res.status}`);

    const json = (await res.json()) as AlternativeFngResponse;
    const entry = json.data?.[0];
    const value = entry ? parseInt(entry.value, 10) : NaN;
    if (!entry || !Number.isFinite(value)) return null;

    return {
      value,
      classification: CLASSIFICATION_MAP[entry.value_classification] ?? entry.value_classification,
    };
  } catch (error) {
    console.error("Fear & Greed index fetch failed", error);
    return null;
  }
}
