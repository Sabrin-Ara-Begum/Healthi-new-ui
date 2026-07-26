const getApiBaseUrl = (): string => {
  // Use Vite environment variables primarily
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }
  
  // Fallback production URL if environment variable is missing
  return "https://healthi-ai-bppm.onrender.com";
};

export const API_BASE = getApiBaseUrl();
