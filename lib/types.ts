export interface ChatHistoryItem {
  id: string;
  title: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "ai";
  content: string;
  streaming?: boolean;
}
