import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);

const MARKED_UTC_ISO_PATTERN =
  /(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:?\d{2}))\s*(?:（UTC）|\(UTC\))/g;

/**
 * Converts UTC ISO timestamps explicitly marked with `(UTC)` / `（UTC）`
 * inside report text to the current runtime's local timezone. Keeping this
 * transformation at the presentation boundary means a shared report adapts
 * to each reader rather than baking in the sender's timezone.
 */
export function localizeUtcTimestamps(text: string): string {
  if (!text.includes("UTC")) return text;

  return text.replace(MARKED_UTC_ISO_PATTERN, (original, isoTimestamp: string) => {
    const local = dayjs.utc(isoTimestamp).local();
    if (!local.isValid()) return original;

    return `${local.format("YYYY-MM-DD HH:mm:ss")}（本地時間 UTC${local.format("Z")}）`;
  });
}
