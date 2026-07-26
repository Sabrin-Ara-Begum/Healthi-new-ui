import { API_BASE } from "./config";

export const findDoctors = async (specialty: string, location: string) => {
  const res = await fetch(`${API_BASE}/api/doctors/find`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ specialty, location }),
  });
  if (!res.ok) throw new Error("Failed to find doctors");
  return res.json();
};

export const getBookmarks = async (email: string) => {
  const res = await fetch(`${API_BASE}/api/doctors/bookmarks?email=${encodeURIComponent(email)}`);
  if (!res.ok) throw new Error("Failed to get bookmarks");
  return res.json();
};

export const bookmarkDoctor = async (data: any) => {
  const res = await fetch(`${API_BASE}/api/doctors/bookmarks`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to bookmark doctor");
  return res.json();
};

export const removeBookmark = async (id: string) => {
  const res = await fetch(`${API_BASE}/api/doctors/bookmarks/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to remove bookmark");
  return res.json();
};
