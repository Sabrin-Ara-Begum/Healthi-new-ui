import { Search, Bell, Menu, X, Pill, Stethoscope, FileText, User, Settings } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';
import { useApp } from '@/react-app/lib/AppContext';
import { API_BASE } from '../api/config';

interface HeaderProps {
  onNotificationClick: () => void;
}

interface SearchSuggestion {
  title: string;
  description: string;
  type: string; // 'page' | 'doctor' | 'symptom' | 'medicine' | 'settings'
  path?: string;
  value?: string;
  action?: string;
}

export default function Header({ onNotificationClick }: HeaderProps) {
  const navigate = useNavigate();
  const { toggleSidebar, user, unreadCount } = useApp();

  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch search suggestions from API
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSuggestions([]);
      return;
    }

    const delayDebounce = setTimeout(async () => {
      try {
        const res = await fetch(`${API_BASE}/api/search?q=${encodeURIComponent(searchQuery)}`);
        if (res.ok) {
          const data = await res.json();
          setSuggestions(data);
        }
      } catch (err) {
        console.error("Search suggestion fetch failed:", err);
      }
    }, 200); // 200ms debounce

    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  // Click outside listener
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSuggestionClick = (item: SearchSuggestion) => {
    setShowSuggestions(false);
    setSearchQuery("");
    
    if (item.type === "page" && item.path) {
      navigate(item.path);
    } else if (item.type === "doctor" && item.value) {
      localStorage.setItem("recommendedSpecialist", item.value);
      navigate("/doctors");
      // Force page refresh or reload if already on doctors page
      if (window.location.pathname === "/doctors") {
        window.location.reload();
      }
    } else if (item.type === "symptom" && item.value) {
      localStorage.setItem("prefilledSymptom", item.value);
      navigate("/symptom-checker");
      if (window.location.pathname === "/symptom-checker") {
        window.location.reload();
      }
    } else if (item.type === "medicine" && item.value) {
      localStorage.setItem("prefilledMedicineSearch", item.value);
      navigate("/tablet-identifier");
      if (window.location.pathname === "/tablet-identifier") {
        window.location.reload();
      }
    } else if (item.type === "settings") {
      // Trigger Settings sidebar opening or details
      if (item.action === "toggle_theme") {
        // Toggle theme directly
        document.getElementById("theme-toggle-btn")?.click();
      } else {
        // Open settings panel
        document.getElementById("sidebar-settings-btn")?.click();
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex(prev => (prev + 1 < suggestions.length ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex(prev => (prev - 1 >= 0 ? prev - 1 : suggestions.length - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (activeIndex >= 0 && activeIndex < suggestions.length) {
        handleSuggestionClick(suggestions[activeIndex]);
      }
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
    }
  };

  const handleProfileClick = () => {
    if (user?.email) {
      navigate('/profile');
    } else {
      navigate('/auth');
    }
  };

  // Avatar source resolution
  const avatarSrc = user?.avatar ? (user.avatar.startsWith("http") ? user.avatar : `${API_BASE}${user.avatar}`) : "";
  const initial = user?.name ? user.name.charAt(0).toUpperCase() : "U";

  // Icon helper for search result types
  const getSuggestionIcon = (type: string) => {
    switch (type) {
      case "doctor":
        return <Stethoscope className="w-4 h-4 text-blue-500" />;
      case "symptom":
        return <FileText className="w-4 h-4 text-teal-500" />;
      case "medicine":
        return <Pill className="w-4 h-4 text-purple-500" />;
      case "settings":
        return <Settings className="w-4 h-4 text-gray-500" />;
      default:
        return <User className="w-4 h-4 text-purple-400" />;
    }
  };

  return (
    <div className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm border-b border-[#DCD2FD]/30 dark:border-gray-800 px-6 py-4 z-20 relative transition-colors duration-300">
      <div className="flex items-center justify-between gap-4">
        {/* Hamburger Menu & Search Bar Container */}
        <div className="flex items-center flex-1 max-w-md min-w-0 relative" ref={dropdownRef}>
          {/* Hamburger Menu (visible on mobile/tablet < 1024px) */}
          <button
            onClick={toggleSidebar}
            className="p-2 hover:bg-[#F3E8FF]/50 dark:hover:bg-gray-800 rounded-lg lg:hidden mr-2 flex-shrink-0"
            aria-label="Toggle Sidebar"
          >
            <Menu className="w-6 h-6 text-gray-600 dark:text-gray-300" />
          </button>

          {/* Search Input */}
          <div className="relative flex-1 min-w-0">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search features, doctors, medicines..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSuggestions(true);
                setActiveIndex(-1);
              }}
              onFocus={() => setShowSuggestions(true)}
              onKeyDown={handleKeyDown}
              className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/80 dark:bg-gray-800/80 border border-[#DCD2FD]/40 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-[#B9A9FB]/50 text-gray-700 dark:text-gray-200 placeholder-gray-400 text-sm"
            />
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSuggestions([]);
                }}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Autocomplete Dropdown suggestions list */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 border border-purple-100 dark:border-gray-700 rounded-2xl shadow-2xl max-h-80 overflow-y-auto z-50 p-2 animate-in fade-in slide-in-from-top-1">
              {suggestions.map((item, idx) => (
                <div
                  key={idx}
                  onClick={() => handleSuggestionClick(item)}
                  onMouseEnter={() => setActiveIndex(idx)}
                  className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition ${
                    idx === activeIndex
                      ? "bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300"
                      : "text-gray-700 dark:text-gray-200"
                  }`}
                >
                  <div className="w-8 h-8 rounded-lg bg-gray-50 dark:bg-gray-700/50 flex items-center justify-center flex-shrink-0">
                    {getSuggestionIcon(item.type)}
                  </div>
                  <div className="min-w-0">
                    <div className="font-semibold text-xs sm:text-sm truncate">{item.title}</div>
                    <div className="text-[10px] sm:text-xs text-gray-400 dark:text-gray-500 truncate">{item.description}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Section (Notifications, Profile) */}
        <div className="flex items-center gap-4 flex-shrink-0">
          <button 
            onClick={onNotificationClick}
            className="relative p-2 hover:bg-[#F3E8FF]/50 dark:hover:bg-gray-800 rounded-lg transition-colors"
            aria-label="View Notifications"
          >
            <Bell className="w-6 h-6 text-gray-600 dark:text-gray-300" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-5 h-5 bg-[#FFB7C5] text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>
          <button
            onClick={handleProfileClick}
            className="w-10 h-10 rounded-full bg-gradient-to-br from-[#B9A9FB] to-[#FFB7C5] flex items-center justify-center border-2 border-[#DCD2FD]/50 dark:border-gray-700 hover:scale-105 transition-transform cursor-pointer overflow-hidden"
            aria-label="User Profile"
          >
            {avatarSrc ? (
              <img src={avatarSrc} alt="User Avatar" className="w-full h-full object-cover" />
            ) : (
              <span className="text-white font-semibold text-sm">{initial}</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
