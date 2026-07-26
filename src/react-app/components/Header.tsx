import { Search, Bell, Menu } from 'lucide-react';
import { useNavigate } from 'react-router';
import { useSidebar } from '@/react-app/lib/SidebarContext';

interface HeaderProps {
  onNotificationClick: () => void;
  notificationCount?: number;
}

export default function Header({ onNotificationClick, notificationCount = 2 }: HeaderProps) {
  const navigate = useNavigate();
  const { toggle } = useSidebar();

  // Read actual auth state from localStorage dynamically
  const token = localStorage.getItem("token");
  const userString = localStorage.getItem("user");
  const isLoggedIn = !!token && !!userString;
  const user = isLoggedIn ? JSON.parse(userString) : null;
  const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : "U";

  const handleProfileClick = () => {
    if (isLoggedIn) {
      navigate('/profile');
    } else {
      navigate('/auth');
    }
  };

  return (
    <div className="bg-white/60 backdrop-blur-sm border-b border-[#DCD2FD]/30 px-6 py-4">
      <div className="flex items-center justify-between gap-4">
        {/* Hamburger Menu & Search Bar Container */}
        <div className="flex items-center flex-1 max-w-md min-w-0">
          {/* Hamburger Menu (visible on mobile/tablet < 1024px) */}
          <button
            onClick={toggle}
            className="p-2 hover:bg-[#F3E8FF]/50 rounded-lg lg:hidden mr-2 flex-shrink-0"
            aria-label="Toggle Sidebar"
          >
            <Menu className="w-6 h-6 text-gray-600" />
          </button>

          {/* Search Bar */}
          <div className="relative flex-1 min-w-0">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search"
              className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/80 border border-[#DCD2FD]/40 focus:outline-none focus:ring-2 focus:ring-[#B9A9FB]/50 text-gray-700 placeholder-gray-400 text-sm"
            />
          </div>
        </div>

        {/* Right Section (Notifications, Profile) */}
        <div className="flex items-center gap-4 flex-shrink-0">
          <button 
            onClick={onNotificationClick}
            className="relative p-2 hover:bg-[#F3E8FF]/50 rounded-lg transition-colors"
            aria-label="View Notifications"
          >
            <Bell className="w-6 h-6 text-gray-600" />
            {notificationCount > 0 && (
              <span className="absolute top-1 right-1 w-5 h-5 bg-[#FFB7C5] text-white text-xs font-bold rounded-full flex items-center justify-center">
                {notificationCount}
              </span>
            )}
          </button>
          <button
            onClick={handleProfileClick}
            className="w-10 h-10 rounded-full bg-gradient-to-br from-[#B9A9FB] to-[#FFB7C5] flex items-center justify-center border-2 border-[#DCD2FD]/50 hover:scale-105 transition-transform cursor-pointer"
            aria-label="User Profile"
          >
            <span className="text-white font-semibold text-sm">{userInitial}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
