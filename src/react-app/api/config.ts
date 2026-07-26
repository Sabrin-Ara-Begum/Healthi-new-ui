const getApiBaseUrl = (): string => {
  if (typeof window !== "undefined") {
    const hostname = window.location.hostname;
    if (hostname === "localhost" || hostname === "127.0.0.1") {
      return "http://localhost:5001";
    }
  }
  return "https://healthi-ai-bppm.onrender.com";
};

export const API_BASE = getApiBaseUrl();
