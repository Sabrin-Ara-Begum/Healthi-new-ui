import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { CheckCircle2, AlertCircle, X } from "lucide-react";
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
  showToast: (message: string, type?: "success" | "error") => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<UserType | null>(null);
  const [theme, setThemeState] = useState<"light" | "dark">("light");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationType[]>([]);
  
  // Toast state
  const [toast, setToast] = useState<{ message: string; type: "success" | "error"; visible: boolean }>({
    message: "",
    type: "success",
    visible: false
  });

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

  const showToast = useCallback((message: string, type: "success" | "error" = "success") => {
    setToast({ message, type, visible: true });
    setTimeout(() => {
      setToast(prev => ({ ...prev, visible: false }));
    }, 3500);
  }, []);

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
        unreadCount,
        showToast
      }}
    >
      {children}
      {/* Toast Overlay */}
      {toast.visible && (
        <div className="fixed bottom-6 right-6 z-[100] animate-in slide-in-from-bottom-5 fade-in duration-300">
          <div className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl border ${
            toast.type === "success" 
              ? "bg-white dark:bg-gray-800 border-green-200 dark:border-green-900/50" 
              : "bg-white dark:bg-gray-800 border-red-200 dark:border-red-900/50"
          }`}>
            {toast.type === "success" ? (
              <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0">
                <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
            ) : (
              <div className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center flex-shrink-0">
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
            )}
            <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 pr-4">{toast.message}</p>
            <button 
              onClick={() => setToast(prev => ({ ...prev, visible: false }))}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
            >
              <X className="w-4 h-4 text-gray-400" />
            </button>
          </div>
        </div>
      )}
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
