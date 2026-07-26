import { API_BASE } from "./config";

export const checkSymptoms = async (symptoms: string, userEmail: string) => {
  const res = await fetch(`${API_BASE}/api/symptoms/check`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      symptoms,
      userEmail,
    }),
  });

  const data = await res.json();
  console.log("API RAW:", JSON.stringify(data, null, 2));
  return data;
};

export const getSymptomHistory = async (email: string) => {
  const res = await fetch(`${API_BASE}/api/history/${email}`);
  const data = await res.json();
  return data;
};