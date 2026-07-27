import { useEffect, useState, useRef } from 'react';
import { Sparkles, ArrowLeft, Send, History } from 'lucide-react';
import { useNavigate } from 'react-router';
import Header from '@/react-app/components/Header';
import { useApp } from '@/react-app/lib/AppContext';
import { logMood, getMoodStats, getMoodHistory } from '@/react-app/api/moodApi';

interface MoodTrackerProps {
  onNotificationClick: () => void;
}

const quotes = [
  { text: "You are stronger than you think", color: "bg-[#FFE5D9] dark:bg-[#7D4F3A]" },
  { text: "Your feelings are valid. Even the quiet ones deserve attention.", color: "bg-[#D4F1E8] dark:bg-[#346F5D]" },
  { text: "Small steps lead big changes", color: "bg-[#E9E0F5] dark:bg-[#5C457B]" },
  { text: "Breathe. It's just a bad day, not a bad life.", color: "bg-[#E3E0F7] dark:bg-[#433B6C]" },
];

const moodEmojis = [
  { emoji: "😊", label: "Happy", color: "bg-[#F5EFE7] dark:bg-[#685A48]" },
  { emoji: "😌", label: "Calm", color: "bg-[#D4F1E8] dark:bg-[#346F5D]" },
  { emoji: "😐", label: "Neutral", color: "bg-[#FFF4D6] dark:bg-[#736338]" },
  { emoji: "😰", label: "Sad", color: "bg-[#FFE5E5] dark:bg-[#7D4545]" },
  { emoji: "😫", label: "Stressed", color: "bg-[#D4F1F0] dark:bg-[#3A6B69]" },
];

const breathingSteps = [
  { phase: "INHALE", duration: 4 },
  { phase: "HOLD", duration: 4 },
  { phase: "EXHALE", duration: 4 },
  { phase: "HOLD", duration: 4 },
];

const stickyColors = [
  "bg-[#FFF6CC] dark:bg-[#706429]",
  "bg-[#E9F7EF] dark:bg-[#2B543C]",
  "bg-[#E8F0FE] dark:bg-[#36496B]",
  "bg-[#FDE2E4] dark:bg-[#6B373A]",
];

export default function MoodTracker({ onNotificationClick }: MoodTrackerProps) {
  const navigate = useNavigate();
  const { user, fetchNotifications, requireAuth, showToast } = useApp();

  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const [moodNote, setMoodNote] = useState("");
  const [loading, setLoading] = useState(false);

  const [historyNotes, setHistoryNotes] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);

  const [breathingActive, setBreathingActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [countdown, setCountdown] = useState(4);

  const notesRef = useRef<HTMLDivElement>(null);

  const loadData = async () => {
    if (!user?.email) return;
    try {
      const [statsData, histData] = await Promise.all([
        getMoodStats(user.email),
        getMoodHistory(user.email)
      ]);
      setStats(statsData);
      setHistoryNotes(histData || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadData();
  }, [user?.email]);

  useEffect(() => {
    if (!breathingActive) return;
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          const nextStep = (currentStep + 1) % breathingSteps.length;
          setCurrentStep(nextStep);
          return breathingSteps[nextStep].duration;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [breathingActive, currentStep]);

  const toggleBreathing = () => {
    setBreathingActive(!breathingActive);
    if (!breathingActive) {
      setCurrentStep(0);
      setCountdown(4);
    }
  };

  const handleMoodClick = (index: number) => {
    requireAuth(() => {
      setSelectedMood(index);
    });
  };

  const handleSaveNote = async () => {
    requireAuth(async () => {
      if (selectedMood === null) {
        showToast("Please select a mood first", "error");
        return;
      }
      if (!user?.email) return;
      
      setLoading(true);
      const now = new Date();
      
      try {
        await logMood({
          email: user.email,
          mood: moodEmojis[selectedMood].emoji,
          label: moodEmojis[selectedMood].label,
          note: moodNote.trim(),
          date: now.toISOString().split("T")[0],
          time: now.toTimeString().split(" ")[0]
        });
        
        showToast("Mood log saved successfully!", "success");
        setMoodNote("");
        setSelectedMood(null);
        await loadData();
        fetchNotifications();
      } catch (err) {
        console.error(err);
        showToast("Failed to save mood", "error");
      } finally {
        setLoading(false);
      }
    });
  };

  return (
    <div className="flex-1 overflow-auto bg-gray-50/50 dark:bg-gray-900 transition-colors duration-300 pb-20">
      <Header onNotificationClick={onNotificationClick} />

      <div className="px-6 py-4 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border-b border-[#DCD2FD]/30 dark:border-gray-700 sticky top-0 z-10">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white transition-colors font-medium"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back</span>
        </button>
      </div>

      <div className="px-4 sm:px-10 py-8 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 dark:text-white mb-2">
              Welcome to your Mood Space!
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-lg">
              Track your emotional well-being and find peace.
            </p>
          </div>
          {stats && (
            <div className="flex gap-4">
              <div className="bg-white dark:bg-gray-800 rounded-2xl px-5 py-3 shadow-sm border border-purple-100 dark:border-gray-700 text-center">
                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-bold mb-1">Streak</p>
                <p className="text-xl font-bold text-orange-500 flex items-center gap-1 justify-center">
                  🔥 {stats.streak}
                </p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-2xl px-5 py-3 shadow-sm border border-purple-100 dark:border-gray-700 text-center">
                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-bold mb-1">Wellness</p>
                <p className="text-xl font-bold text-green-500 flex items-center justify-center">
                  {stats.wellnessScore}%
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Quotes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {quotes.map((q, i) => (
            <div key={i} className={`${q.color} rounded-2xl p-5 shadow-sm transition-transform hover:-translate-y-1`}>
              <div className="text-2xl mb-2">💭</div>
              <p className="text-sm text-gray-800 dark:text-gray-200 font-medium">{q.text}</p>
            </div>
          ))}
        </div>

        {/* Mood Input & Recent Notes */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-3xl p-6 sm:p-8 shadow-sm border border-purple-100 dark:border-gray-700">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
              How are you feeling today?
            </h2>

            <div className="flex flex-wrap sm:flex-nowrap justify-between gap-4">
              {moodEmojis.map((mood, index) => (
                <div key={index} className="flex flex-col items-center flex-1 min-w-[60px]">
                  <button
                    onClick={() => handleMoodClick(index)}
                    className={`w-14 h-14 sm:w-20 sm:h-20 rounded-full flex items-center justify-center text-3xl sm:text-4xl transition shadow-sm ${
                      selectedMood === index 
                        ? "bg-purple-100 dark:bg-purple-900 border-4 border-purple-500 shadow-xl scale-110" 
                        : `${mood.color} hover:scale-110`
                    }`}
                  >
                    {mood.emoji}
                  </button>
                  <span className={`text-xs mt-3 font-bold transition-colors ${selectedMood === index ? 'text-purple-600 dark:text-purple-400' : 'text-gray-500 dark:text-gray-400'}`}>
                    {mood.label}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-4 mt-8">
              <textarea
                value={moodNote}
                onChange={(e) => setMoodNote(e.target.value)}
                placeholder="Add details about why you feel this way (optional)"
                rows={2}
                className="flex-1 px-5 py-4 rounded-2xl border border-purple-200 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 resize-none focus:ring-2 focus:ring-purple-300 outline-none"
              />
              <button
                onClick={handleSaveNote}
                disabled={loading || selectedMood === null}
                className={`px-8 py-4 rounded-2xl font-bold transition-all shadow-md flex items-center justify-center min-w-[120px] ${
                  loading || selectedMood === null 
                    ? "bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed" 
                    : "bg-purple-500 hover:bg-purple-600 text-white"
                }`}
              >
                {loading ? "Saving..." : "Save Log"}
              </button>
            </div>
          </div>

          {/* Notes History Mini-panel */}
          <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-3xl p-6 shadow-sm border border-purple-100 dark:border-gray-700 flex flex-col h-[400px]">
            <h3 className="font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
              <History className="w-5 h-5 text-purple-500" /> Recent Notes
            </h3>
            <div ref={notesRef} className="space-y-4 flex-1 overflow-y-auto pr-2 scrollbar-thin">
              {(() => {
                const validNotes = historyNotes.filter(n => n.note && n.note.trim() !== "");
                if (validNotes.length === 0) {
                  return (
                    <div className="h-full flex flex-col items-center justify-center text-gray-400">
                      <div className="text-4xl mb-2">📝</div>
                      <p className="text-sm">No text notes recorded yet.</p>
                    </div>
                  );
                }
                return validNotes.map((n, i) => (
                  <div
                    key={i}
                    className={`${stickyColors[i % stickyColors.length]} p-4 rounded-2xl shadow-sm`}
                  >
                    <div className="flex items-center justify-end mb-2">
                      <span className="text-xs font-bold opacity-50">
                        {new Date(n.createdAt).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
                      </span>
                    </div>
                    <p className="text-sm whitespace-pre-wrap break-words font-medium opacity-80 leading-relaxed">
                      {n.note}
                    </p>
                  </div>
                ));
              })()}
            </div>
          </div>
        </div>

        {/* Mood Frequency Overview */}
        <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-3xl p-6 sm:p-10 mb-8 shadow-sm border border-purple-100 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-8">
            Mood Frequency Overview
          </h2>
          <div className="flex items-end justify-between h-[300px] overflow-x-auto pb-2 gap-4">
            {(() => {
              const defaultData = [
                { label: "Happy", emoji: "😊", count: 0, color: "bg-[#F5EFE7] dark:bg-[#685A48]" },
                { label: "Calm", emoji: "😌", count: 0, color: "bg-[#D4F1E8] dark:bg-[#346F5D]" },
                { label: "Neutral", emoji: "😐", count: 0, color: "bg-[#FFF4D6] dark:bg-[#736338]" },
                { label: "Sad", emoji: "😰", count: 0, color: "bg-[#FFE5E5] dark:bg-[#7D4545]" },
                { label: "Stressed", emoji: "😫", count: 0, color: "bg-[#D4F1F0] dark:bg-[#3A6B69]" }
              ];
              
              const dataToRender = (!stats?.distribution || stats.distribution.length === 0) 
                ? defaultData 
                : stats.distribution; // We won't sort here to keep the mood order consistent

              // Calculate max count for relative height scaling
              const maxCount = Math.max(1, ...dataToRender.map((d: any) => d.count || 0));
              const hasData = stats && stats.totalLogs > 0;

              return dataToRender.map((d: any, i: number) => {
                // Scale height relative to the max count so the highest bar is always tall
                const relativePercentage = hasData ? (d.count / maxCount) * 100 : 0;
                // Cap at 100, provide a small baseline if there's data
                const displayHeight = hasData ? Math.max(5, relativePercentage) : 0;
                
                return (
                  <div key={i} className="flex flex-col items-center justify-end flex-1 min-w-[50px] h-full relative">
                    {/* The bar and emoji container: uses a percentage of parent's height. 
                        Multiplied by 0.70 to leave room for the labels at the bottom and emoji at the top. */}
                    <div className="flex flex-col items-center justify-end w-full" style={{ height: `calc(${displayHeight}% * 0.70)` }}>
                      <div className="text-2xl sm:text-3xl mb-3 flex-shrink-0">{d.emoji}</div>
                      <div 
                        className={`w-full max-w-[60px] ${d.color || 'bg-gray-200 dark:bg-gray-700'} rounded-t-2xl transition-all duration-1000 ease-out`}
                        style={{ height: '100%', minHeight: hasData ? '4px' : '0px' }}
                      ></div>
                    </div>
                    
                    {/* Labels */}
                    <div className="mt-4 text-center flex-shrink-0 h-[40px]">
                      <span className="block text-xs sm:text-sm font-bold text-gray-500 dark:text-gray-400">{d.label}</span>
                      <span className="block text-xs text-gray-400">{d.count || 0}</span>
                    </div>
                  </div>
                );
              });
            })()}
          </div>
        </div>

        {/* Tools */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Panic Mode / Breathing */}
          <div className="bg-gradient-to-br from-[#E9E0F5] to-[#F5E8F5] dark:from-[#3D2C4D] dark:to-[#4A3B5C] rounded-3xl p-8 sm:p-10 shadow-sm border border-purple-200 dark:border-purple-900 flex flex-col items-center justify-center relative overflow-hidden">
            <h2 className="text-2xl font-black text-purple-900 dark:text-purple-100 mb-8 z-10 text-center uppercase tracking-widest">
              Panic Mode
            </h2>
            
            <div className="flex justify-center mb-10 z-10 relative">
              {/* Outer ripple */}
              {breathingActive && (
                <div className="absolute inset-0 bg-purple-400 dark:bg-purple-500 rounded-full animate-ping opacity-20 scale-150 pointer-events-none"></div>
              )}
              <button
                onClick={toggleBreathing}
                className={`relative w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 flex items-center justify-center shadow-lg transition-transform duration-1000 ${
                  breathingActive ? "scale-110 shadow-purple-500/50" : "hover:scale-105"
                }`}
                style={{
                  animation: breathingActive ? "pulse 2s ease-in-out infinite" : "none",
                }}
              >
                <div className="w-8 h-8 rounded-full bg-white shadow-inner"></div>
              </button>
            </div>

            <div className="text-center z-10 h-24">
              <div className="font-black text-2xl tracking-widest text-purple-800 dark:text-purple-200 mb-2">
                {breathingActive ? breathingSteps[currentStep].phase : "START EXERCISE"}
              </div>
              
              {breathingActive ? (
                <div className="text-5xl font-black text-purple-600 dark:text-purple-400">
                  {countdown}
                </div>
              ) : (
                <div className="text-sm font-medium text-purple-700/70 dark:text-purple-300/70 max-w-[200px] mx-auto leading-relaxed">
                  Tap the circle to begin a 4-7-8 breathing exercise to calm your nerves.
                </div>
              )}
            </div>
          </div>

          {/* Quick AI Companion redirect */}
          <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-3xl p-8 shadow-sm border border-purple-100 dark:border-gray-700 flex flex-col items-center justify-center text-center">
            <div className="w-20 h-20 bg-purple-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-6 shadow-inner">
               <Sparkles className="w-10 h-10 text-purple-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
              Need Someone to Talk To?
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-sm">
              Our compassionate AI companion is available 24/7 to listen, support, and help you process your thoughts without judgment.
            </p>
            <button
              onClick={() => navigate("/chat")}
              className="px-8 py-4 bg-gradient-to-r from-purple-500 to-[#B9A9FB] hover:from-purple-600 hover:to-purple-500 text-white rounded-2xl font-bold transition shadow-md w-full max-w-sm flex items-center justify-center gap-2"
            >
              Start Chatting <Send className="w-5 h-5" />
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}