import { API_BASE } from "./config";

export const logMood = async (data: any) => {
  const res = await fetch(`${API_BASE}/api/mood/log`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to log mood");
  return res.json();
};

export const getMoodHistory = async (email: string) => {
  const res = await fetch(`${API_BASE}/api/mood/history?email=${encodeURIComponent(email)}`);
  if (!res.ok) throw new Error("Failed to get mood history");
  return res.json();
};

export const getMoodStats = async (email: string) => {
  const res = await fetch(`${API_BASE}/api/mood/stats?email=${encodeURIComponent(email)}`);
  if (!res.ok) throw new Error("Failed to get mood stats");
  return res.json();
};
