import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { API_BASE } from "../api/config";

interface UserType {
  id?: string;
  name?: string;
  email?: string;
  avatar?: string;
  themePreference?: string;
  phone?: string;
  age?: number;
  gender?: string;
  bloodGroup?: string;
  allergies?: string;
  medicalConditions?: string;
  emergencyContact?: string;
  address?: string;
  location?: string;
}

interface NotificationType {
  _id: string;
  title: string;
  message: string;
  type: string;
  color: string;
  bgColor: string;
  read: boolean;
  createdAt: string;
}

interface AppContextType {
  user: UserType | null;
  setUser: (user: UserType | null) => void;
  theme: "light" | "dark";
  setTheme: (theme: "light" | "dark") => void;
  toggleTheme: () => void;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  notifications: NotificationType[];
  fetchNotifications: () => Promise<void>;
  markNotificationRead: (id: string) => Promise<void>;
  clearAllNotifications: () => Promise<void>;
  unreadCount: number;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<UserType | null>(null);
  const [theme, setThemeState] = useState<"light" | "dark">("light");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationType[]>([]);

  // Load initial user and theme preference
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        setUserState(parsed);
      } catch (e) {
        console.error("Failed to parse user details:", e);
      }
    }

    const storedTheme = localStorage.getItem("theme") as "light" | "dark";
    if (storedTheme) {
      setThemeState(storedTheme);
      applyThemeClass(storedTheme);
    } else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      setThemeState("dark");
      applyThemeClass("dark");
    }
  }, []);

  // Update theme class on HTML element
  const applyThemeClass = (currentTheme: "light" | "dark") => {
    if (currentTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  const setTheme = async (newTheme: "light" | "dark") => {
    setThemeState(newTheme);
    localStorage.setItem("theme", newTheme);
    applyThemeClass(newTheme);

    // Sync theme preference to database if user is logged in
    if (user?.email) {
      try {
        await fetch(`${API_BASE}/api/auth/profile/theme`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: user.email, themePreference: newTheme })
        });
      } catch (err) {
        console.error("Failed to sync theme preference to DB:", err);
      }
    }
  };

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  const setUser = (newUser: UserType | null) => {
    setUserState(newUser);
    if (newUser) {
      localStorage.setItem("user", JSON.stringify(newUser));
      if (newUser.themePreference) {
        setTheme(newUser.themePreference as "light" | "dark");
      }
    } else {
      localStorage.removeItem("user");
      localStorage.removeItem("token");
    }
  };

  const toggleSidebar = () => setSidebarOpen(prev => !prev);

  // Notifications API Integration
  const fetchNotifications = async () => {
    if (!user?.email) return;
    try {
      const res = await fetch(`${API_BASE}/api/notifications?email=${encodeURIComponent(user.email)}`);
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
      }
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    }
  };

  const markNotificationRead = async (id: string) => {
    try {
      const res = await fetch(`${API_BASE}/api/notifications/${id}/read`, {
        method: "PUT"
      });
      if (res.ok) {
        setNotifications(prev =>
          prev.map(n => (n._id === id ? { ...n, read: true } : n))
        );
      }
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
    }
  };

  const clearAllNotifications = async () => {
    if (!user?.email) return;
    try {
      const res = await fetch(
        `${API_BASE}/api/notifications/all?email=${encodeURIComponent(user.email)}`,
        { method: "DELETE" }
      );
      if (res.ok) {
        setNotifications([]);
      }
    } catch (err) {
      console.error("Failed to clear notifications:", err);
    }
  };

  // Poll notifications when user email resolves
  useEffect(() => {
    if (user?.email) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 15000); // Poll every 15s
      return () => clearInterval(interval);
    } else {
      setNotifications([]);
    }
  }, [user?.email]);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <AppContext.Provider
      value={{
        user,
        setUser,
        theme,
        setTheme,
        toggleTheme,
        sidebarOpen,
        setSidebarOpen,
        toggleSidebar,
        notifications,
        fetchNotifications,
        markNotificationRead,
        clearAllNotifications,
        unreadCount
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}
