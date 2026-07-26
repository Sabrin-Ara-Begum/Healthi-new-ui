import { API_BASE } from "./config";

export const createChatSession = async (email: string, title?: string) => {
  const res = await fetch(`${API_BASE}/api/chat/session`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, title }),
  });
  if (!res.ok) throw new Error("Failed to create chat session");
  return res.json();
};

export const getChatSessions = async (email: string) => {
  const res = await fetch(`${API_BASE}/api/chat/sessions?email=${encodeURIComponent(email)}`);
  if (!res.ok) throw new Error("Failed to fetch chat sessions");
  return res.json();
};

export const getSessionMessages = async (sessionId: string, email: string) => {
  const res = await fetch(`${API_BASE}/api/chat/sessions/${sessionId}?email=${encodeURIComponent(email)}`);
  if (!res.ok) throw new Error("Failed to fetch session messages");
  return res.json();
};

export const sendChatMessage = async (sessionId: string, text: string) => {
  const res = await fetch(`${API_BASE}/api/chat/sessions/${sessionId}/message`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ text }),
  });
  if (!res.ok) throw new Error("Failed to send chat message");
  return res.json();
};

export const deleteChatSession = async (sessionId: string, email: string) => {
  const res = await fetch(`${API_BASE}/api/chat/sessions/${sessionId}?email=${encodeURIComponent(email)}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to delete chat session");
  return res.json();
};