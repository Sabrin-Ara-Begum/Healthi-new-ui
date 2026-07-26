import { API_BASE } from "./config";

export interface NotificationItem {
  _id: string;
  title: string;
  message: string;
  type: string;
  color: string;
  bgColor: string;
  read: boolean;
  createdAt: string;
}

export const getNotifications = async (email: string): Promise<NotificationItem[]> => {
  const response = await fetch(`${API_BASE}/api/notifications?email=${encodeURIComponent(email)}`);
  if (!response.ok) {
    throw new Error("Failed to fetch notifications");
  }
  return response.json();
};

export const markNotificationRead = async (id: string): Promise<void> => {
  const response = await fetch(`${API_BASE}/api/notifications/${id}/read`, {
    method: "PUT",
  });
  if (!response.ok) {
    throw new Error("Failed to mark notification as read");
  }
};

export const clearNotifications = async (email: string): Promise<void> => {
  const response = await fetch(`${API_BASE}/api/notifications/all?email=${encodeURIComponent(email)}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    throw new Error("Failed to clear notifications");
  }
};
