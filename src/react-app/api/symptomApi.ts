const API_BASE_URL = "https://healthi-ai-bppm.onrender.com/api";

export const checkSymptoms = async (symptoms: string, userEmail: string) => {
  const res = await fetch(`${API_BASE_URL}/check`, {
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
  return data;
};

export const getSymptomHistory = async (email: string) => {
  const res = await fetch(`${API_BASE_URL}/history/${email}`);
  const data = await res.json();
  return data;
};