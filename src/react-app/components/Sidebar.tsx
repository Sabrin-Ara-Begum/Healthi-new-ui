import { Home, MessageSquare, FileText, Stethoscope, Settings, User } from 'lucide-react';
import { Link, useLocation } from 'react-router';

const navItems = [
  { icon: Home, label: 'Home', path: '/' },
  { icon: MessageSquare, label: 'AI Chat', path: '/chat' },
  { icon: FileText, label: 'Reports', path: '/reports' },
  { icon: Stethoscope, label: 'Doctors', path: '/doctors' },
];

export default function Sidebar() {
  const location = useLocation();

  return (
    <div className="w-64 h-screen bg-white/50 backdrop-blur-sm flex flex-col p-4 border-r border-[#DCD2FD]/30">
      {/* Logo */}
      <div className="flex items-center gap-3 mb-8 px-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FFB7C5] to-[#B9A9FB] flex items-center justify-center">
          <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
          </svg>
        </div>
        <span className="text-xl font-bold text-gray-800">Healthi AI</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                isActive
                  ? 'bg-[#DCD2FD]/50 text-[#B9A9FB]'
                  : 'text-gray-600 hover:bg-[#F3E8FF]/50'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* User Profile */}
      <div className="mt-auto pt-4 border-t border-[#DCD2FD]/30">
        <div className="flex items-center gap-3 px-2 py-2">
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#B9A9FB] to-[#FFB7C5] flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-gray-800 truncate">me</div>
          </div>
        </div>
        <div className="flex items-center gap-2 mt-3 px-2">
          <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F3E8FF]/50 text-gray-500">
            <Settings className="w-4 h-4" />
          </button>
          <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F3E8FF]/50 text-gray-500">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="3" />
              <path d="M12 1v6m0 6v6m-9-9h6m6 0h6" />
            </svg>
          </button>
          <div className="flex-1"></div>
          <button className="text-gray-400 hover:text-gray-600">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
