import { Home, MessageSquare, FileText, Stethoscope, Settings, User, X, Moon, Sun, HelpCircle, Mail, ChevronDown, ChevronUp, LogOut } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router';
import { useState } from 'react';
import { useApp } from '@/react-app/lib/AppContext';
import { API_BASE } from '../api/config';

const navItems = [
  { icon: Home, label: 'Home', path: '/' },
  { icon: MessageSquare, label: 'AI Chat', path: '/chat' },
  { icon: FileText, label: 'Reports', path: '/reports' },
  { icon: Stethoscope, label: 'Doctors', path: '/doctors' },
];

interface FAQItem {
  q: string;
  a: string;
}

interface FAQSection {
  title: string;
  items: FAQItem[];
}

const FAQS: FAQSection[] = [
  {
    title: "Symptom Checker FAQ",
    items: [
      { q: "How accurate is the AI diagnosis?", a: "Healthi AI checks symptoms against common diagnostic databases and medical literature using advanced language modeling. However, it should only be used for informational guidelines and NOT as a replacement for clinical consulting." },
      { q: "What should I do in an emergency?", a: "If you experience severe warning signs (e.g. chest pain, breathing difficulties), bypass the checker and seek immediate emergency care." }
    ]
  },
  {
    title: "Mood Tracker FAQ",
    items: [
      { q: "How is my wellness score calculated?", a: "Your wellness score aggregates your daily mood logs on a scale from 1 (Stressed) to 5 (Happy), computing percentage trends based on frequency." },
      { q: "Are my daily notes private?", a: "Yes. All logged notes are encrypted and stored inside isolated user databases. No other user can access them." }
    ]
  },
  {
    title: "Find Doctor FAQ",
    items: [
      { q: "Where does the doctor search data come from?", a: "Doctors and clinic data are fetched in real-time using Google Places geolocation services near your detected coordinates." },
      { q: "How do I bookmark favorite doctors?", a: "Click the Heart icon on any doctor card. The clinic details will be saved to your favorites history." }
    ]
  },
  {
    title: "AI Chat FAQ",
    items: [
      { q: "Can I reopen past chat logs?", a: "Yes. All conversations are grouped into named sessions. You can load and continue old sessions from the chat page panel." }
    ]
  },
  {
    title: "Privacy & Account FAQ",
    items: [
      { q: "How do I update my profile details?", a: "Go to the profile page, click 'Edit Profile', enter details (blood type, allergies, conditions), and save permanently." },
      { q: "Can I completely delete my health history?", a: "Yes. Both Symptom Checker and Tablet Identifier support clearing selected logs or clearing the entire database history." }
    ]
  }
];

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { sidebarOpen, setSidebarOpen, user, setUser, theme, toggleTheme, showToast } = useApp();

  const [settingsOpen, setSettingsOpen] = useState(false);
  const [activeFAQSection, setActiveFAQSection] = useState<number | null>(null);
  const [openFAQIndex, setOpenFAQIndex] = useState<string | null>(null);

  // Contact Us form state
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactMsg, setContactMsg] = useState("");
  const [contactSuccess, setContactSuccess] = useState(false);

  const userName = user?.name || "Guest User";
  const userEmail = user?.email || "";
  const avatarSrc = user?.avatar ? (user.avatar.startsWith("http") ? user.avatar : `${API_BASE}${user.avatar}`) : "";

  const handleLinkClick = () => {
    setSidebarOpen(false);
  };

  const handleUserCardClick = () => {
    handleLinkClick();
    if (userEmail) {
      navigate("/profile");
    } else {
      navigate("/auth");
    }
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactEmail || !contactMsg) return;
    // Simulate API submit
    setContactSuccess(true);
    setTimeout(() => {
      setContactSuccess(false);
      setContactName("");
      setContactEmail("");
      setContactMsg("");
    }, 3000);
  };

  const handleLogout = () => {
    setUser(null);
    setSettingsOpen(false);
    handleLinkClick();
    showToast("Successfully Logged Out", "success");
    navigate("/auth");
  };

  return (
    <>
      {/* Drawer Overlay (backdrop visible only on mobile/tablet) */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar Panel */}
      <div
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md flex flex-col p-4 border-r border-[#DCD2FD]/30 dark:border-gray-800 transition-transform duration-300 lg:translate-x-0 lg:static lg:h-screen flex-shrink-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
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
            <span className="text-xl font-bold text-gray-800 dark:text-white">Healthi AI</span>
          </div>

          <button
            onClick={() => setSidebarOpen(false)}
            className="p-1 hover:bg-[#F3E8FF]/50 dark:hover:bg-gray-800 rounded-lg lg:hidden"
            aria-label="Close Menu"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        {/* Navigation links */}
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
                    ? 'bg-[#DCD2FD]/50 dark:bg-purple-950/40 text-[#B9A9FB] dark:text-purple-300 font-semibold shadow-sm'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-[#F3E8FF]/50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium text-sm">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* User Profile avatar block at the bottom */}
        <div className="mt-auto pt-4 border-t border-[#DCD2FD]/30 dark:border-gray-800 flex-shrink-0">
          <div
            onClick={handleUserCardClick}
            className="flex items-center gap-3 px-2 py-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-xl transition"
          >
            <div className="relative flex-shrink-0">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#B9A9FB] to-[#FFB7C5] flex items-center justify-center border border-[#DCD2FD]/50 dark:border-gray-700 overflow-hidden">
                {avatarSrc ? (
                  <img src={avatarSrc} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-5 h-5 text-white" />
                )}
              </div>
              {userEmail && (
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-900"></div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-gray-800 dark:text-white truncate">{userName}</div>
              <div className="text-xs text-gray-400 truncate">{userEmail || "Log in to save history"}</div>
            </div>
          </div>

          <div className="flex items-center gap-2 mt-3 px-2">
            <button
              id="sidebar-settings-btn"
              onClick={() => setSettingsOpen(true)}
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F3E8FF]/50 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 transition"
              aria-label="Settings"
            >
              <Settings className="w-4 h-4" />
            </button>
            <button
              id="theme-toggle-btn"
              onClick={toggleTheme}
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F3E8FF]/50 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 transition"
              aria-label="Toggle Theme"
            >
              {theme === "dark" ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4" />}
            </button>
            <div className="flex-1"></div>
            {userEmail && (
              <button
                onClick={handleLogout}
                className="text-xs text-red-500 hover:text-red-700 font-semibold px-2 py-1 hover:bg-red-50 dark:hover:bg-red-950/20 rounded"
              >
                Logout
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Settings Modal (Slide-over panel) */}
      {settingsOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop blur */}
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            onClick={() => setSettingsOpen(false)}
          />

          {/* Modal Container */}
          <div className="relative w-full max-w-lg bg-white dark:bg-gray-900 h-full shadow-2xl flex flex-col p-6 overflow-y-auto animate-in slide-in-from-right duration-300 text-gray-800 dark:text-gray-100 transition-colors duration-300">
            {/* Header */}
            <div className="flex justify-between items-center pb-4 border-b border-gray-100 dark:border-gray-800">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Settings className="w-6 h-6 text-purple-500" />
                Settings Center
              </h2>
              <button
                onClick={() => setSettingsOpen(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Dark Mode Theme Block */}
            <div className="my-6 p-4 rounded-2xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-100/50 dark:border-purple-900/30 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-sm sm:text-base">Dark Mode Preference</h3>
                <p className="text-xs text-gray-500 mt-0.5">Toggle complete application visual theme</p>
              </div>
              <button
                onClick={toggleTheme}
                className="px-4 py-2 bg-white dark:bg-gray-800 hover:bg-gray-50 border border-purple-200 dark:border-purple-905 rounded-xl flex items-center gap-2 font-semibold text-xs sm:text-sm shadow-sm transition"
              >
                {theme === "dark" ? (
                  <>
                    <Sun className="w-4 h-4 text-amber-500" />
                    Light Theme
                  </>
                ) : (
                  <>
                    <Moon className="w-4 h-4 text-purple-600" />
                    Dark Theme
                  </>
                )}
              </button>
            </div>

            {/* HELP / FAQ Accordion Sections */}
            <div className="space-y-4 mb-8">
              <h3 className="font-bold text-gray-800 dark:text-white flex items-center gap-2 border-b pb-2">
                <HelpCircle className="w-5 h-5 text-purple-500" />
                Help & FAQ
              </h3>
              
              <div className="space-y-2">
                {FAQS.map((section, idx) => (
                  <div
                    key={idx}
                    className="border border-purple-100/60 dark:border-gray-800 rounded-xl overflow-hidden"
                  >
                    <button
                      onClick={() => setActiveFAQSection(activeFAQSection === idx ? null : idx)}
                      className="w-full flex justify-between items-center p-3.5 bg-purple-50/30 dark:bg-gray-800/30 font-semibold text-xs sm:text-sm hover:bg-purple-50 dark:hover:bg-gray-800 text-left transition"
                    >
                      <span>{section.title}</span>
                      {activeFAQSection === idx ? <ChevronUp className="w-4 h-4 text-purple-500" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                    </button>
                    {activeFAQSection === idx && (
                      <div className="p-3.5 space-y-3 bg-white dark:bg-gray-900 border-t border-purple-100/50 dark:border-gray-800">
                        {section.items.map((item, itemIdx) => {
                          const keyStr = `${idx}-${itemIdx}`;
                          const isFAQOpen = openFAQIndex === keyStr;
                          return (
                            <div key={itemIdx} className="space-y-1.5">
                              <button
                                onClick={() => setOpenFAQIndex(isFAQOpen ? null : keyStr)}
                                className="w-full flex justify-between items-start text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 text-left"
                              >
                                <span>Q: {item.q}</span>
                                <span className="text-[10px] text-purple-400 mt-1">{isFAQOpen ? "▲" : "▼"}</span>
                              </button>
                              {isFAQOpen && (
                                <p className="text-[11px] sm:text-xs text-gray-500 dark:text-gray-400 leading-relaxed bg-gray-50 dark:bg-gray-850 p-2.5 rounded-lg border dark:border-gray-800">
                                  {item.a}
                                </p>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* CONTACT US FORM */}
            <div className="border-t pt-6 mt-auto">
              <h3 className="font-bold text-gray-800 dark:text-white flex items-center gap-2 mb-4">
                <Mail className="w-5 h-5 text-purple-500" />
                Contact Us / Support
              </h3>
              
              {contactSuccess ? (
                <div className="p-4 bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-300 rounded-xl text-center text-sm font-medium border border-green-200">
                  Thank you! Your inquiry was submitted.
                </div>
              ) : (
                <form onSubmit={handleContactSubmit} className="space-y-3.5">
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Your Name"
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      className="px-3 py-2 text-xs sm:text-sm rounded-lg border border-purple-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-850 focus:outline-none focus:ring-2 focus:ring-purple-300 dark:text-white"
                    />
                    <input
                      type="email"
                      placeholder="Your Email"
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      required
                      className="px-3 py-2 text-xs sm:text-sm rounded-lg border border-purple-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-850 focus:outline-none focus:ring-2 focus:ring-purple-300 dark:text-white"
                    />
                  </div>
                  <textarea
                    placeholder="Describe your issue or suggestion..."
                    rows={3}
                    value={contactMsg}
                    onChange={(e) => setContactMsg(e.target.value)}
                    required
                    className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-purple-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-850 focus:outline-none focus:ring-2 focus:ring-purple-300 resize-none dark:text-white"
                  />
                  <button
                    type="submit"
                    className="w-full bg-purple-500 hover:bg-purple-600 text-white rounded-lg py-2.5 text-xs sm:text-sm font-semibold transition"
                  >
                    Send Message
                  </button>
                </form>
              )}
            </div>

            {/* Login / Logout at bottom */}
            {userEmail ? (
              <button
                onClick={handleLogout}
                className="w-full mt-6 border-2 border-red-200 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl py-3 text-xs sm:text-sm font-bold transition flex items-center justify-center gap-2"
              >
                <X className="w-4 h-4" />
                Sign Out Account
              </button>
            ) : (
              <button
                onClick={() => {
                  setSettingsOpen(false);
                  navigate('/auth');
                }}
                className="w-full mt-6 border-2 border-purple-200 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/30 rounded-xl py-3 text-xs sm:text-sm font-bold transition flex items-center justify-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Log In / Sign Up
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
}
