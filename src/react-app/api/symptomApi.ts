import { API_BASE } from "./config";

export const checkSymptoms = async (payload: any) => {
  const res = await fetch(`${API_BASE}/api/symptoms/check`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  
  if (!res.ok) {
    throw new Error("Failed to check symptoms");
  }

  const data = await res.json();
  return data;
};

export const getSymptomHistory = async (email: string) => {
  const res = await fetch(`${API_BASE}/api/history/${email}`);
  if (!res.ok) throw new Error("Failed to fetch history");
  const data = await res.json();
  return data;
};

export const deleteSymptomHistory = async (id: string) => {
  const res = await fetch(`${API_BASE}/api/symptoms/history/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to delete entry");
  return await res.json();
};

export const deleteMultipleSymptomHistory = async (ids: string[]) => {
  const res = await fetch(`${API_BASE}/api/symptoms/history/delete-multiple`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ ids }),
  });
  if (!res.ok) throw new Error("Failed to delete entries");
  return await res.json();
};

export const deleteAllSymptomHistory = async (email: string) => {
  const res = await fetch(`${API_BASE}/api/symptoms/history/all/${encodeURIComponent(email)}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to clear history");
  return await res.json();
};

export const uploadMedicalReport = async (file: File) => {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${API_BASE}/api/symptoms/upload-report`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    throw new Error("Failed to upload file");
  }

  const data = await res.json();
  return data;
};