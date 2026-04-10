export const signupUser = async (name: string, email: string, password: string) => {

  const res = await fetch("https://healthi-ai-bppm.onrender.com/api/auth/signup", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      name,
      email,
      password
    })
  });

  const data = await res.json();
  return data;
};

export const loginUser = async (email: string, password: string) => {

  const res = await fetch("https://healthi-ai-bppm.onrender.com/api/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      email,
      password
    })
  });

  const data = await res.json();
  return data;
};