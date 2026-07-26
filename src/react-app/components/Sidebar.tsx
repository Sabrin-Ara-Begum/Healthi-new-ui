import { Home, MessageSquare, FileText, Stethoscope, Settings, User, X } from 'lucide-react';
import { Link, useLocation } from 'react-router';
import { useSidebar } from '@/react-app/lib/SidebarContext';

const navItems = [
  { icon: Home, label: 'Home', path: '/' },
  { icon: MessageSquare, label: 'AI Chat', path: '/chat' },
  { icon: FileText, label: 'Reports', path: '/reports' },
  { icon: Stethoscope, label: 'Doctors', path: '/doctors' },
];

export default function Sidebar() {
  const location = useLocation();
  const { isOpen, setIsOpen } = useSidebar();

  // Read user info from localStorage dynamically
  const userString = localStorage.getItem("user");
  const user = userString ? JSON.parse(userString) : null;
  const userName = user?.name || "Guest User";

  // Automatically close sidebar on navigation (mobile)
  const handleLinkClick = () => {
    setIsOpen(false);
  };

  return (
    <>
      {/* Drawer Overlay (backdrop visible only on mobile/tablet) */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Panel */}
      <div
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-white/95 backdrop-blur-md flex flex-col p-4 border-r border-[#DCD2FD]/30 transition-transform duration-300 lg:translate-x-0 lg:static lg:h-screen flex-shrink-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo and Mobile Close Button */}
        <div className="flex items-center justify-between mb-8 px-3 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FFB7C5] to-[#B9A9FB] flex items-center justify-center">
              <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
            </div>
            <span className="text-xl font-bold text-gray-800">Healthi AI</span>
          </div>

          <button
            onClick={() => setIsOpen(false)}
            className="p-1 hover:bg-[#F3E8FF]/50 rounded-lg lg:hidden"
            aria-label="Close Menu"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={handleLinkClick}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  isActive
                    ? 'bg-[#DCD2FD]/50 text-[#B9A9FB] font-semibold shadow-sm'
                    : 'text-gray-600 hover:bg-[#F3E8FF]/50 hover:text-gray-900'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium text-sm">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* User Profile */}
        <div className="mt-auto pt-4 border-t border-[#DCD2FD]/30 flex-shrink-0">
          <div className="flex items-center gap-3 px-2 py-2">
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#B9A9FB] to-[#FFB7C5] flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
              {user && (
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-gray-800 truncate">{userName}</div>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-3 px-2">
            <Link
              to="/profile"
              onClick={handleLinkClick}
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F3E8FF]/50 text-gray-500"
              aria-label="Settings"
            >
              <Settings className="w-4 h-4" />
            </Link>
            <div className="flex-1"></div>
            {user && (
              <button
                onClick={() => {
                  localStorage.removeItem("token");
                  localStorage.removeItem("user");
                  handleLinkClick();
                  window.location.href = "/auth";
                }}
                className="text-xs text-red-500 hover:text-red-700 font-semibold px-2 py-1 hover:bg-red-50 rounded"
              >
                Logout
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
