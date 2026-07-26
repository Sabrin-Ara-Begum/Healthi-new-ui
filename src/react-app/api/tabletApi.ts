import { API_BASE } from "./config";

export const identifyMedicine = async (image: File, email?: string) => {
  const formData = new FormData();
  formData.append("image", image);
  if (email) {
    formData.append("email", email);
  }

  const res = await fetch(`${API_BASE}/api/tablet/identify`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    throw new Error("Failed to identify medicine");
  }

  return await res.json();
};

export const getTabletHistory = async (email: string, search: string = "", page: number = 1, limit: number = 5) => {
  const params = new URLSearchParams({
    email,
    search,
    page: String(page),
    limit: String(limit)
  });

  const res = await fetch(`${API_BASE}/api/tablet/history?${params.toString()}`);
  if (!res.ok) {
    throw new Error("Failed to fetch tablet scan history");
  }
  return await res.json();
};

export const deleteTabletHistory = async (id: string) => {
  const res = await fetch(`${API_BASE}/api/tablet/history/${id}`, {
    method: "DELETE"
  });
  if (!res.ok) {
    throw new Error("Failed to delete tablet scan history entry");
  }
  return await res.json();
};