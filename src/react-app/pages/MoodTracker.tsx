import { Sparkles } from 'lucide-react';
import { useState, useEffect } from 'react';
import Header from '@/react-app/components/Header';

const quotes = [
  { text: "You are stronger of think", color: "bg-[#FFE5D9]" },
  { text: "Fun am sli a you big changes", color: "bg-[#D4F1E8]" },
  { text: "Small steps lead big changes", color: "bg-[#E9E0F5]" },
  { text: "Small steps you chrives", color: "bg-[#E3E0F7]" },
];

const moodEmojis = [
  { emoji: "😊", label: "Happy", color: "bg-[#F5EFE7]" },
  { emoji: "😊", label: "Calm", color: "bg-[#D4F1E8]" },
  { emoji: "☹️", label: "Sad", color: "bg-[#FFE5E5]" },
  { emoji: "😊", label: "Content", color: "bg-[#E9E0F5]" },
  { emoji: "😊", label: "Relaxed", color: "bg-[#D4F1F0]" },
];

const initialWeeklyData = [
  { day: "Spay", emoji: "😰", height: "h-32", color: "bg-[#FFB3C1]" },
  { day: "Tued", emoji: "😟", height: "h-40", color: "bg-[#B3D9FF]" },
  { day: "Wen", emoji: "😐", height: "h-36", color: "bg-[#D4F1E8]" },
  { day: "Dnay", emoji: "😊", height: "h-44", color: "bg-[#C1E8C8]" },
  { day: "Frup", emoji: "😌", height: "h-40", color: "bg-[#D5C9F5]" },
];

const breathingSteps = [
  { phase: "INHALE", duration: 4 },
  { phase: "HOLD", duration: 4 },
  { phase: "EXHALE", duration: 4 },
  { phase: "HOLD", duration: 4 },
];

interface MoodTrackerProps {
  onNotificationClick: () => void;
}

export default function MoodTracker({ onNotificationClick }: MoodTrackerProps) {
  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const [moodNote, setMoodNote] = useState("");
  const [breathingActive, setBreathingActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [countdown, setCountdown] = useState(4);
  const [weeklyData, setWeeklyData] = useState(initialWeeklyData);

  useEffect(() => {
    if (!breathingActive) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
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
    setSelectedMood(index);
    
    // Update today's mood in the weekly graph (Friday/Frup)
    const moodHeights = ['h-36', 'h-40', 'h-28', 'h-44', 'h-40'];
    const moodColors = ['bg-[#FFB3C1]', 'bg-[#B3D9FF]', 'bg-[#FFE5E5]', 'bg-[#D5C9F5]', 'bg-[#D4F1F0]'];
    
    setWeeklyData(prev => {
      const updated = [...prev];
      updated[4] = {
        ...updated[4],
        emoji: moodEmojis[index].emoji,
        height: moodHeights[index],
        color: moodColors[index]
      };
      return updated;
    });
  };

  return (
    <div className="flex-1 overflow-auto">
      <Header onNotificationClick={onNotificationClick} />

      {/* Main Content */}
      <div className="px-8 py-8">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Welcome to your Mood Space!
          </h1>
        </div>

        {/* Quote Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {quotes.map((quote, index) => (
            <div
              key={index}
              className={`${quote.color} rounded-2xl p-5 shadow-sm border border-white/50`}
            >
              <div className="text-2xl mb-2">💭</div>
              <p className="text-gray-700 font-medium leading-relaxed text-sm">
                {quote.text}
              </p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* How are you feeling today */}
            <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-8 border border-purple-200/30 shadow-sm">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                How are you feeling today
              </h2>
              
              <div className="flex items-center gap-4 flex-wrap">
                {moodEmojis.map((mood, index) => (
                  <button
                    key={index}
                    onClick={() => handleMoodClick(index)}
                    className={`w-20 h-20 rounded-full ${mood.color} flex items-center justify-center text-4xl transition-all hover:scale-110 border border-gray-200/30 ${
                      selectedMood === index ? 'ring-4 ring-purple-300 scale-105' : ''
                    }`}
                  >
                    {mood.emoji}
                  </button>
                ))}
                <input
                  type="text"
                  placeholder="Add details (optional)"
                  value={moodNote}
                  onChange={(e) => setMoodNote(e.target.value)}
                  className="flex-1 min-w-[200px] px-4 py-3 rounded-xl bg-white/80 border border-purple-200/40 focus:outline-none focus:ring-2 focus:ring-purple-300/50 text-gray-700 placeholder-gray-400"
                />
              </div>
            </div>

            {/* Weekly Mood Overview */}
            <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-8 border border-purple-200/30 shadow-sm">
              <h2 className="text-2xl font-bold text-gray-800 mb-8">
                Weekly Mood Overview
              </h2>
              
              <div className="flex items-end justify-around gap-4 h-64">
                {weeklyData.map((day, index) => (
                  <div key={index} className="flex flex-col items-center gap-3">
                    <div className="text-2xl mb-1">{day.emoji}</div>
                    <div className={`w-20 ${day.height} ${day.color} rounded-t-2xl transition-all hover:opacity-90 border-t border-l border-r border-gray-200/30`}></div>
                    <span className="text-sm font-medium text-gray-600 mt-1">{day.day}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Panic Mode & AI Companion */}
          <div className="space-y-6">
            {/* Panic Mode */}
            <div className="bg-gradient-to-br from-[#E9E0F5]/80 to-[#F5E8F5]/60 backdrop-blur-sm rounded-3xl p-8 border border-purple-200/30 shadow-sm">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
                Panic Mode
              </h2>
              
              <div className="flex justify-center mb-8">
                <button
                  onClick={toggleBreathing}
                  className={`relative w-20 h-20 rounded-full bg-[#FFB3C1] flex items-center justify-center transition-all ${
                    breathingActive ? 'scale-110' : 'hover:scale-105'
                  }`}
                  style={{
                    animation: breathingActive ? 'pulse 2s ease-in-out infinite' : 'none',
                  }}
                >
                  <div className="w-5 h-5 rounded-full bg-white/90"></div>
                </button>
              </div>

              <div className="space-y-4 text-center">
                <div className="text-gray-700 font-semibold text-base mb-4">
                  {breathingActive ? breathingSteps[currentStep].phase : 'INHALE'}
                </div>
                {breathingActive && (
                  <div className="text-3xl font-bold text-gray-700 mb-4">
                    ({countdown})
                  </div>
                )}
                <div className="text-gray-600 text-sm space-y-1">
                  <div>INHALE    HOLD (4)</div>
                  <div>EXHALE (4)    HOLD (4)</div>
                </div>
              </div>
            </div>

            {/* AI Mental Wellness Companion */}
            <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-6 border border-purple-200/30 shadow-sm">
              <div className="flex items-start gap-3 mb-6">
                <div className="relative">
                  <img
                    src="https://i.pravatar.cc/150?img=47"
                    alt="AI Assistant"
                    className="w-12 h-12 rounded-full border-2 border-purple-200/50"
                  />
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 border-2 border-white rounded-full"></div>
                </div>
                <div className="flex-1">
                  <div className="bg-purple-50/80 rounded-2xl rounded-tl-none p-4 border border-purple-100/50">
                    <p className="text-gray-700 text-sm">
                      Hello! I'm here at listen. What's on your mind today?
                    </p>
                  </div>
                </div>
              </div>

              <h3 className="text-center text-lg font-semibold text-gray-700 mb-4">
                AI Mental Wellness Companion
              </h3>

              <div className="relative">
                <input
                  type="text"
                  placeholder="Type your message..."
                  className="w-full px-4 py-3 rounded-xl bg-white/80 border border-purple-200/40 focus:outline-none focus:ring-2 focus:ring-purple-300/50 text-gray-700 placeholder-gray-400 text-sm"
                />
                <button className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-purple-100/80 hover:bg-purple-200 transition-colors">
                  <Sparkles className="w-4 h-4 text-purple-600" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
