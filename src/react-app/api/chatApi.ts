export const sendMessage = async (message: string) => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const res = await fetch("https://healthi-ai-bppm.onrender.com/api/openrouter/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      message,
      email: user.email,
    }),
  });

  const data = await res.json();
  return data.reply;
};

export const getSymptomHistory = async () => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  if (!user.email) return [];

  const res = await fetch(`https://healthi-ai-bppm.onrender.com/api/history/${user.email}`);
  const data = await res.json();

  return data;
};