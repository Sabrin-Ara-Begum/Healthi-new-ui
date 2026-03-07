import { Search, Bell } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router';

interface HeaderProps {
  onNotificationClick: () => void;
  notificationCount?: number;
}

export default function Header({ onNotificationClick, notificationCount = 2 }: HeaderProps) {
  const navigate = useNavigate();
  const [isLoggedIn] = useState(false); // TODO: Replace with actual auth state

  const handleProfileClick = () => {
    if (isLoggedIn) {
      navigate('/profile');
    } else {
      navigate('/auth');
    }
  };

  return (
    <div className="bg-white/60 backdrop-blur-sm border-b border-[#DCD2FD]/30 px-8 py-4">
      <div className="flex items-center justify-between">
        {/* Search Bar */}
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search"
              className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/80 border border-[#DCD2FD]/40 focus:outline-none focus:ring-2 focus:ring-[#B9A9FB]/50 text-gray-700 placeholder-gray-400"
            />
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-4">
          <button 
            onClick={onNotificationClick}
            className="relative p-2 hover:bg-[#F3E8FF]/50 rounded-lg transition-colors"
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
          >
            <span className="text-white font-semibold text-sm">M</span>
          </button>
        </div>
      </div>
    </div>
  );
}
