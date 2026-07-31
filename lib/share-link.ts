import type { ChatMessage, MarketRankingRow } from "@/lib/types";

/**
 * A shared conversation lives entirely in the URL fragment — no server
 * storage, so links never expire and survive container restarts. Only the
 * fields a reader needs are kept; ids and streaming flags are dropped to
 * keep the URL as short as possible.
 */
export interface SharedTurn {
  r: "user" | "ai";
  c: string;
  /** stageLog */
  s?: string[];
  /** dataLimitation */
  l?: string;
}

export interface SharedConversation {
  v: 1;
  /** Export timestamp, epoch ms. */
  t: number;
  turns: SharedTurn[];
}

function toBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(value: string): Uint8Array {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

async function collect(stream: ReadableStream<Uint8Array>): Promise<Uint8Array> {
  const chunks: Uint8Array[] = [];
  const reader = stream.getReader();
  let total = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
    total += value.length;
  }
  const merged = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    merged.set(chunk, offset);
    offset += chunk.length;
  }
  return merged;
}

function pipeThrough(bytes: Uint8Array, transform: "deflate-raw", mode: "compress" | "decompress") {
  const stream = new Blob([bytes as BlobPart]).stream();
  return mode === "compress"
    ? stream.pipeThrough(new CompressionStream(transform))
    : stream.pipeThrough(new DecompressionStream(transform));
}

async function encodePayload(payload: unknown): Promise<string> {
  const raw = new TextEncoder().encode(JSON.stringify(payload));
  return toBase64Url(await collect(pipeThrough(raw, "deflate-raw", "compress")));
}

async function decodePayload(encoded: string): Promise<unknown> {
  try {
    const inflated = await collect(pipeThrough(fromBase64Url(encoded), "deflate-raw", "decompress"));
    return JSON.parse(new TextDecoder().decode(inflated)) as unknown;
  } catch {
    return null;
  }
}

export function encodeConversation(messages: ChatMessage[], now = Date.now()): Promise<string> {
  const payload: SharedConversation = {
    v: 1,
    t: now,
    turns: messages
      .filter((m) => m.content.trim())
      .map((m) => ({
        r: m.role,
        c: m.content,
        ...(m.stageLog?.length ? { s: m.stageLog } : {}),
        ...(m.dataLimitation ? { l: m.dataLimitation } : {}),
      })),
  };

  return encodePayload(payload);
}

export async function decodeConversation(encoded: string): Promise<SharedConversation | null> {
  const parsed = await decodePayload(encoded);

  if (
    typeof parsed !== "object" ||
    parsed === null ||
    (parsed as SharedConversation).v !== 1 ||
    !Array.isArray((parsed as SharedConversation).turns)
  ) {
    return null;
  }
  return parsed as SharedConversation;
}

/** One answer packed for the print/PDF view — carries the question it answered, too. */
export interface PrintableReport {
  v: 1;
  t: number;
  /** The question this report answers. */
  q?: string;
  /** Answer markdown. */
  c: string;
  /** relatedSymbol */
  sym?: string;
  /** stageLog */
  s?: string[];
  /** dataLimitation */
  l?: string;
  /** marketIndicator */
  m?: MarketRankingRow;
}

export function encodeReport(
  message: ChatMessage,
  question: string | undefined,
  now = Date.now()
): Promise<string> {
  const payload: PrintableReport = {
    v: 1,
    t: now,
    ...(question ? { q: question } : {}),
    c: message.content,
    ...(message.relatedSymbol ? { sym: message.relatedSymbol } : {}),
    ...(message.stageLog?.length ? { s: message.stageLog } : {}),
    ...(message.dataLimitation ? { l: message.dataLimitation } : {}),
    ...(message.marketIndicator ? { m: message.marketIndicator } : {}),
  };

  return encodePayload(payload);
}

export async function decodeReport(encoded: string): Promise<PrintableReport | null> {
  const parsed = await decodePayload(encoded);

  if (
    typeof parsed !== "object" ||
    parsed === null ||
    (parsed as PrintableReport).v !== 1 ||
    typeof (parsed as PrintableReport).c !== "string"
  ) {
    return null;
  }
  return parsed as PrintableReport;
}

export async function buildShareUrl(messages: ChatMessage[], origin: string): Promise<string> {
  return `${origin}/share#${await encodeConversation(messages)}`;
}
