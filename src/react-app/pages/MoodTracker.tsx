import { Sparkles } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import Header from '@/react-app/components/Header';

const quotes = [
  { text: "You are stronger than you think", color: "bg-[#FFE5D9]" },
  { text: "Your feelings are valid. Even the quiet ones deserve attention.", color: "bg-[#D4F1E8]" },
  { text: "Small steps lead big changes", color: "bg-[#E9E0F5]" },
  { text: "Small steps you achieve", color: "bg-[#E3E0F7]" },
];

const moodEmojis = [
  { emoji: "😊", label: "Happy", color: "bg-[#F5EFE7]" },
  { emoji: "😌", label: "Calm", color: "bg-[#D4F1E8]" },
  { emoji: "😐", label: "Neutral", color: "bg-[#FFF4D6]" },
  { emoji: "😰", label: "Sad", color: "bg-[#FFE5E5]" },
  { emoji: "😫", label: "Stressed", color: "bg-[#D4F1F0]" },
];

const initialWeeklyData = [
  { day: "Mon", emoji: "😰", height: "h-32", color: "bg-[#FFB3C1]" },
  { day: "Tue", emoji: "😟", height: "h-40", color: "bg-[#B3D9FF]" },
  { day: "Wed", emoji: "😐", height: "h-36", color: "bg-[#D4F1E8]" },
  { day: "Thu", emoji: "😊", height: "h-44", color: "bg-[#C1E8C8]" },
  { day: "Fri", emoji: "😌", height: "h-40", color: "bg-[#FFE5E5]" },
  { day: "Sat", emoji: "🙂", height: "h-36", color: "bg-[#E8F0FE]" },
  { day: "Sun", emoji: "😊", height: "h-38", color: "bg-[#FDE2E4]" },
];

const breathingSteps = [
  { phase: "INHALE", duration: 4 },
  { phase: "HOLD", duration: 4 },
  { phase: "EXHALE", duration: 4 },
  { phase: "HOLD", duration: 4 },
];

const stickyColors = [
  "bg-[#FFF6CC]",
  "bg-[#E9F7EF]",
  "bg-[#E8F0FE]",
  "bg-[#FDE2E4]",
];

interface MoodTrackerProps {
  onNotificationClick: () => void;
}

export default function MoodTracker({ onNotificationClick }: MoodTrackerProps) {

  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const [moodNote, setMoodNote] = useState("");
  const [weeklyData, setWeeklyData] = useState(initialWeeklyData);
  const [notes, setNotes] = useState<any[]>([]);
  const [breathingActive, setBreathingActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [countdown, setCountdown] = useState(4);

  const [messages, setMessages] = useState([
    { role: "bot", text: "Hello! I'm here to listen. What's on your mind today?" }
  ]);
  const [chatInput, setChatInput] = useState("");

  const notesRef = useRef<HTMLDivElement>(null);
  const chatRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    notesRef.current?.scrollTo({
      top: notesRef.current.scrollHeight,
      behavior: "smooth"
    });
  }, [notes]);

  useEffect(() => {
    chatRef.current?.scrollTo({
      top: chatRef.current.scrollHeight,
      behavior: "smooth"
    });
  }, [messages]);

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
    },1000);

    return () => clearInterval(timer);

  }, [breathingActive, currentStep]);

  const toggleBreathing = () => {

    setBreathingActive(!breathingActive);

    if(!breathingActive){

      setCurrentStep(0);
      setCountdown(4);

    }

  };

  const handleMoodClick = (index:number) => {

    setSelectedMood(index);

    const today = new Date().getDay();
    const adjusted = today === 0 ? 6 : today - 1;

    const moodHeights = ["h-44","h-40","h-34","h-30","h-28"];
    const moodColors = [
      "bg-[#C1E8C8]",
      "bg-[#D5C9F5]",
      "bg-[#FFF4D6]",
      "bg-[#FFB3C1]",
      "bg-[#D4F1F0]"
    ];

    setWeeklyData(prev => {

      const updated = [...prev];

      updated[adjusted] = {
        ...updated[adjusted],
        emoji: moodEmojis[index].emoji,
        height: moodHeights[index],
        color: moodColors[index]
      };

      return updated;

    });

  };

  const handleSaveNote = () => {

    if(selectedMood===null || moodNote.trim()==="") return;

    const day = new Date().toLocaleDateString("en-US",{weekday:"long"});
    const color = stickyColors[notes.length % stickyColors.length];

    setNotes(prev=>[
      ...prev,
      {
        mood:moodEmojis[selectedMood].emoji,
        note:moodNote,
        day,
        color
      }
    ]);

    setMoodNote("");

  };

  const sendMessage = () => {

    if(!chatInput.trim()) return;

    const user = {role:"user",text:chatInput};
    const bot = {role:"bot",text:"I'm here for you. Tell me more."};

    setMessages(prev=>[...prev,user,bot]);

    setChatInput("");

  };

  return (

    <div className="flex-1 overflow-auto">

      <Header onNotificationClick={onNotificationClick}/>

      <div className="px-8 py-8">

        <h1 className="text-4xl font-bold text-gray-800 mb-6">
          Welcome to your Mood Space!
        </h1>

        {/* Quotes */}

        <div className="grid md:grid-cols-4 gap-4 mb-8">

          {quotes.map((q,i)=>(
            <div key={i} className={`${q.color} rounded-2xl p-5 shadow-sm`}>
              <div className="text-2xl mb-2">💭</div>
              <p className="text-sm text-gray-700">{q.text}</p>
            </div>
          ))}

        </div>

        {/* Mood + Notes */}

        <div className="grid lg:grid-cols-3 gap-6 mb-8">

          <div className="lg:col-span-2 bg-white/70 rounded-3xl p-8 shadow-sm">

            <h2 className="text-2xl font-bold mb-6">
              How are you feeling today
            </h2>

            <div className="flex justify-between">

              {moodEmojis.map((mood,index)=>(
                <div key={index} className="flex flex-col items-center">

                  <button
                    onClick={()=>handleMoodClick(index)}
                    className={`w-20 h-20 rounded-full ${mood.color} flex items-center justify-center text-4xl hover:scale-110 transition ${
                      selectedMood===index ? "ring-4 ring-purple-300" : ""
                    }`}
                  >
                    {mood.emoji}
                  </button>

                  <span className="text-xs mt-2 text-gray-600 font-medium">
                    {mood.label}
                  </span>

                </div>
              ))}

            </div>

            <div className="flex gap-3 mt-6">

              <input
                value={moodNote}
                onChange={(e)=>setMoodNote(e.target.value)}
                onKeyDown={(e)=>{ if(e.key==="Enter") handleSaveNote(); }}
                placeholder="Add details (optional)"
                className="flex-1 px-4 py-3 rounded-xl border border-purple-200"
              />

              <button
                onClick={handleSaveNote}
                className="px-6 py-3 bg-purple-400 text-white rounded-xl"
              >
                Save
              </button>

            </div>

          </div>

          {/* Notes */}

          <div className="bg-white/70 rounded-3xl p-6 shadow-sm">

            <h3 className="font-semibold mb-4">Your Notes</h3>

            <div ref={notesRef} className="space-y-3 h-48 overflow-y-auto">

              {notes.map((n,i)=>(
                <div key={i} className={`${n.color} p-4 rounded-xl shadow-sm`}>
                  <div className="text-xl">{n.mood}</div>
                  <p className="text-sm">{n.note}</p>
                  <span className="text-xs text-gray-500">{n.day}</span>
                </div>
              ))}

            </div>

          </div>

        </div>

        {/* Weekly Mood */}

        <div className="bg-white/70 rounded-3xl p-10 mb-8 shadow-sm">

          <h2 className="text-2xl font-bold mb-8">
            Weekly Mood Overview
          </h2>

          <div className="flex items-end justify-between h-64">

            {weeklyData.map((d,i)=>(
              <div key={i} className="flex flex-col items-center gap-3 flex-1">

                <div className="text-2xl">{d.emoji}</div>

                <div className={`w-16 ${d.height} ${d.color} rounded-t-2xl`}></div>

                <span className="text-sm text-gray-600">{d.day}</span>

              </div>
            ))}

          </div>

        </div>

        {/* Panic + AI */}

        <div className="grid lg:grid-cols-2 gap-6">

          {/* Panic Mode */}

          <div className="bg-gradient-to-br from-[#E9E0F5]/80 to-[#F5E8F5]/60 rounded-3xl p-8 shadow-sm">

            <h2 className="text-2xl font-bold text-center mb-6">
              Panic Mode
            </h2>

            <div className="flex justify-center mb-8">

              <button
                onClick={toggleBreathing}
                className={`relative w-20 h-20 rounded-full bg-[#FFB3C1] flex items-center justify-center ${
                  breathingActive ? "scale-110" : "hover:scale-105"
                }`}
                style={{
                  animation: breathingActive ? "pulse 2s ease-in-out infinite" : "none",
                }}
              >
                <div className="w-5 h-5 rounded-full bg-white/90"></div>
              </button>

            </div>

            <div className="text-center">

              <div className="font-semibold mb-4">
                {breathingActive ? breathingSteps[currentStep].phase : "INHALE"}
              </div>

              {breathingActive && (
                <div className="text-3xl font-bold mb-4">
                  ({countdown})
                </div>
              )}

              <div className="text-sm text-gray-600">
                INHALE HOLD (4)
                <br/>
                EXHALE HOLD (4)
              </div>

            </div>

          </div>

          {/* AI Companion */}

          <div className="bg-white/70 rounded-3xl p-6 shadow-sm">

            <div className="flex items-start gap-3 mb-6">

              <img
                src="https://i.pravatar.cc/150?img=47"
                className="w-12 h-12 rounded-full"
              />

              <div className="bg-purple-50 rounded-2xl p-4">
                Hello! I'm here to listen. What's on your mind today?
              </div>

            </div>

            <div ref={chatRef} className="h-48 overflow-y-auto space-y-3 mb-4">

              {messages.map((m,i)=>(
                <div key={i} className={`flex ${m.role==="user"?"justify-end":"justify-start"}`}>
                  <div className={`px-4 py-2 rounded-2xl ${
                    m.role==="user"
                      ? "bg-purple-400 text-white"
                      : "bg-purple-100"
                  }`}>
                    {m.text}
                  </div>
                </div>
              ))}

            </div>

            <div className="flex gap-3">

              <input
                value={chatInput}
                onChange={(e)=>setChatInput(e.target.value)}
                onKeyDown={(e)=>{ if(e.key==="Enter") sendMessage(); }}
                placeholder="Type your message..."
                className="flex-1 px-4 py-3 border rounded-xl"
              />

              <button
                onClick={sendMessage}
                className="px-4 py-3 bg-purple-400 text-white rounded-xl"
              >
                <Sparkles/>
              </button>

            </div>

          </div>

        </div>

      </div>
    </div>
  );
}