const AGENT_VERIFY_TOKEN_STORAGE_KEY = "agent_verify_token";
const TOKEN_CHANGE_EVENT = "agent-verify-token-change";

export function getAgentVerifyToken(): string {
  if (typeof window === "undefined") return "";
  return window.localStorage.getItem(AGENT_VERIFY_TOKEN_STORAGE_KEY) ?? "";
}

export function setAgentVerifyToken(token: string): void {
  if (typeof window === "undefined") return;
  const trimmed = token.trim();
  if (trimmed) {
    window.localStorage.setItem(AGENT_VERIFY_TOKEN_STORAGE_KEY, trimmed);
  } else {
    window.localStorage.removeItem(AGENT_VERIFY_TOKEN_STORAGE_KEY);
  }
  window.dispatchEvent(new Event(TOKEN_CHANGE_EVENT));
}

/** For useSyncExternalStore — notifies on same-tab writes (custom event) and cross-tab writes (`storage`). */
export function subscribeToAgentVerifyToken(onChange: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(TOKEN_CHANGE_EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(TOKEN_CHANGE_EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}
