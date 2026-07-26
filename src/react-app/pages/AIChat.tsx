import { useState, useEffect, useRef } from "react";
import { Send, Plus, MessageSquare, Trash2, ArrowLeft, Bot, User, Loader2, Sparkles, Mic, Menu, X, Volume2, VolumeX } from "lucide-react";
import { useNavigate } from "react-router";
import { useApp } from "@/react-app/lib/AppContext";
import { 
  createChatSession, 
  getChatSessions, 
  getSessionMessages, 
  sendChatMessage, 
  deleteChatSession 
} from "@/react-app/api/chatApi";

interface AIChatProps {
  onNotificationClick?: () => void;
}

export default function AIChat({}: AIChatProps) {
  const navigate = useNavigate();
  const { user, fetchNotifications } = useApp();

  const [sessions, setSessions] = useState<any[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [isListening, setIsListening] = useState(false);
  
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<any>(null);

  // Initialize Web Speech API
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        recognition.onstart = () => setIsListening(true);
        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setInputText((prev) => (prev ? prev + " " + transcript : transcript));
        };
        recognition.onerror = (event: any) => {
          console.error("Speech recognition error", event.error);
          setIsListening(false);
        };
        recognition.onend = () => {
          setIsListening(false);
        };
        
        recognitionRef.current = recognition;
      }
      
      // Load available voices early
      window.speechSynthesis?.getVoices();
    }
    
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
      window.speechSynthesis?.cancel();
    };
  }, []);

  const loadSessions = async () => {
    if (!user?.email) return;
    try {
      const data = await getChatSessions(user.email);
      setSessions(data);
      if (data.length > 0 && !activeSessionId) {
        setActiveSessionId(data[0]._id);
      } else if (data.length === 0) {
        handleNewSession();
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (!user?.email) {
      setSessions([]);
      setActiveSessionId(null);
      setMessages([]);
      return;
    }
    loadSessions();
  }, [user?.email]);

  useEffect(() => {
    if (activeSessionId) {
      loadMessages(activeSessionId);
    }
  }, [activeSessionId]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, sending]);

  const loadMessages = async (id: string) => {
    if (!user?.email) return;
    try {
      setLoading(true);
      const data = await getSessionMessages(id, user.email);
      setMessages(data.messages || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleNewSession = async () => {
    if (!user?.email) return;
    try {
      const session = await createChatSession(user.email);
      await loadSessions();
      setActiveSessionId(session._id);
      setIsSidebarOpen(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteSession = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this chat history?")) return;
    if (!user?.email) return;
    try {
      await deleteChatSession(id, user.email);
      if (activeSessionId === id) {
        setActiveSessionId(null);
        setMessages([]);
      }
      await loadSessions();
    } catch (err) {
      console.error(err);
    }
  };

  const toggleListen = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      recognitionRef.current?.start();
    }
  };

  const speakText = (text: string) => {
    if (!voiceEnabled || !window.speechSynthesis) return;
    
    // Stop any current speech
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Attempt to find a warm female voice if possible
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(v => 
      v.name.includes("Female") || v.name.includes("Samantha") || v.name.includes("Google US English")
    ) || voices[0];
    
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }
    
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    window.speechSynthesis.speak(utterance);
  };

  const handleSendMessage = async () => {
    if (!inputText.trim() || !activeSessionId) return;

    const userMessage = { role: "user", text: inputText, createdAt: new Date() };
    setMessages((prev) => [...prev, userMessage]);
    setInputText("");
    setSending(true);

    try {
      const data = await sendChatMessage(activeSessionId, userMessage.text);
      setMessages((prev) => [...prev, { role: "bot", text: data.reply, createdAt: new Date() }]);
      fetchNotifications();
      // Reload sessions to update title if it was the first message
      loadSessions();
      speakText(data.reply);
    } catch (err) {
      console.error(err);
      alert("Failed to send message. Please try again.");
      // Rollback optimistic update
      setMessages((prev) => prev.filter(m => m !== userMessage));
    } finally {
      setSending(false);
      // Auto-focus input after bot replies
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-[100dvh] overflow-hidden bg-white dark:bg-gray-900 transition-colors duration-300">
      
      {/* Sleek Top Bar */}
      <div className="flex items-center justify-between px-4 py-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-b border-purple-100 dark:border-gray-700 shrink-0 sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <button onClick={() => { window.speechSynthesis?.cancel(); navigate(-1); }} className="p-2 -ml-2 text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white transition">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-sm">
               <Bot className="w-4 h-4 text-white" />
            </div>
            <h1 className="text-lg font-bold text-gray-800 dark:text-white">Healthi AI</h1>
          </div>
        </div>
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Voice toggle button */}
          <button
            onClick={() => {
              if (voiceEnabled) window.speechSynthesis?.cancel();
              setVoiceEnabled(!voiceEnabled);
            }}
            className={`p-2 rounded-full transition ${voiceEnabled ? "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300" : "text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"}`}
            title={voiceEnabled ? "Voice Enabled" : "Voice Disabled"}
          >
            {voiceEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
          </button>
          {/* Sidebar toggle button */}
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)} 
            className="p-2 text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white transition rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
            title="Chat History"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden relative">
        
        {/* Sidebar Overlay */}
        {isSidebarOpen && (
          <div 
            className="absolute inset-0 bg-black/40 backdrop-blur-sm z-30 transition-opacity duration-300"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
        
        {/* Sidebar Drawer */}
        <div className={`absolute left-0 top-0 bottom-0 w-[85%] max-w-[320px] bg-white dark:bg-gray-800 border-r border-purple-100 dark:border-gray-700 flex flex-col z-40 shadow-2xl transition-transform duration-300 transform ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
          <div className="p-4 border-b border-purple-100 dark:border-gray-700 flex items-center justify-between">
            <h2 className="font-bold text-gray-800 dark:text-white flex items-center gap-2">
               <MessageSquare className="w-5 h-5 text-purple-500" /> History
            </h2>
            <button onClick={() => setIsSidebarOpen(false)} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 transition">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="p-4 border-b border-purple-100 dark:border-gray-700">
            <button
              onClick={handleNewSession}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl transition-colors shadow-sm"
            >
              <Plus className="w-5 h-5" /> New Conversation
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-1.5 scrollbar-thin">
            {sessions.map(session => (
              <div
                key={session._id}
                onClick={() => {
                  setActiveSessionId(session._id);
                  setIsSidebarOpen(false);
                }}
                className={`group flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all border ${
                  activeSessionId === session._id 
                    ? "bg-purple-50 dark:bg-purple-900/20 border-purple-300 shadow-sm" 
                    : "border-transparent hover:bg-gray-50 dark:hover:bg-gray-700/50"
                }`}
              >
                <div className="flex flex-col overflow-hidden min-w-0 pr-2">
                  <span className={`text-sm font-semibold truncate ${activeSessionId === session._id ? "text-purple-800 dark:text-purple-200" : "text-gray-700 dark:text-gray-300"}`}>
                    {session.title || "New Chat Session"}
                  </span>
                  <span className="text-xs text-gray-400 truncate mt-0.5">
                    {new Date(session.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <button
                  onClick={(e) => handleDeleteSession(session._id, e)}
                  className="opacity-0 group-hover:opacity-100 p-2 text-gray-400 hover:text-red-500 transition-opacity shrink-0"
                  title="Delete Session"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
            {sessions.length === 0 && (
              <div className="text-center p-6 text-gray-400 text-sm">
                No past conversations.
              </div>
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col bg-gray-50/30 dark:bg-transparent relative w-full">
          
          {/* Main Chat View */}
          {!user?.email ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center h-full">
               <Bot className="w-20 h-20 text-purple-200 dark:text-gray-700 mb-6" />
               <h2 className="text-2xl font-bold text-gray-700 dark:text-gray-300 mb-2">Login Required</h2>
               <p className="text-gray-500 dark:text-gray-400">Please log in to chat with the AI Health Companion.</p>
            </div>
          ) : !activeSessionId ? (
            <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-8 text-center h-full">
               <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg mb-6">
                 <Bot className="w-12 h-12 text-white" />
               </div>
               <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white mb-3">How can I help you today?</h2>
               <p className="text-gray-500 dark:text-gray-400 max-w-sm text-sm sm:text-base">
                 Start a new conversation to get compassionate support, health guidance, and answers to your wellness questions.
               </p>
               <button
                  onClick={handleNewSession}
                  className="mt-8 flex items-center justify-center gap-2 py-3 px-8 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl transition-colors shadow-md"
                >
                  <Plus className="w-5 h-5" /> Start New Chat
                </button>
            </div>
          ) : loading ? (
             <div className="flex-1 flex items-center justify-center">
                <Loader2 className="w-10 h-10 text-purple-500 animate-spin" />
             </div>
          ) : (
            <>
              {/* Messages Container */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 scrollbar-thin">
                {messages.length === 0 && (
                  <div className="h-full flex flex-col items-center justify-center text-center max-w-md mx-auto opacity-80">
                    <div className="w-16 h-16 bg-purple-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-5 shadow-inner">
                      <Sparkles className="w-8 h-8 text-purple-500" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-2">Hello, I'm here to listen.</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Feel free to share how you're feeling, ask health questions, or just talk. I'm a safe, judgment-free space.</p>
                  </div>
                )}
                
                {messages.map((m, i) => (
                  <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"} animate-in fade-in slide-in-from-bottom-2`}>
                    <div className={`flex max-w-[90%] sm:max-w-[80%] gap-3 ${m.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                      
                      {/* Avatar */}
                      <div className="shrink-0 mt-auto hidden sm:block">
                        {m.role === "user" ? (
                          <div className="w-8 h-8 rounded-full bg-purple-200 dark:bg-purple-900 flex items-center justify-center border-2 border-white dark:border-gray-800 shadow-sm">
                             <User className="w-4 h-4 text-purple-700 dark:text-purple-300" />
                          </div>
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-sm">
                             <Bot className="w-4 h-4 text-white" />
                          </div>
                        )}
                      </div>

                      {/* Bubble */}
                      <div className={`px-4 py-3 sm:px-5 sm:py-3.5 rounded-3xl shadow-sm text-sm sm:text-base leading-relaxed whitespace-pre-wrap break-words ${
                        m.role === "user" 
                          ? "bg-purple-600 text-white rounded-br-sm" 
                          : "bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-gray-100 dark:border-gray-700 rounded-bl-sm"
                      }`}>
                        {m.text}
                      </div>
                    </div>
                  </div>
                ))}
                
                {/* Typing Indicator */}
                {sending && (
                  <div className="flex justify-start animate-in fade-in slide-in-from-bottom-2">
                    <div className="flex max-w-[90%] gap-3">
                      <div className="shrink-0 mt-auto hidden sm:block">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-sm">
                           <Bot className="w-4 h-4 text-white" />
                        </div>
                      </div>
                      <div className="px-5 py-4 rounded-3xl rounded-bl-sm bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-purple-400 animate-bounce"></div>
                        <div className="w-2 h-2 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                        <div className="w-2 h-2 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: "0.4s" }}></div>
                      </div>
                    </div>
                  </div>
                )}
                
                <div ref={chatEndRef} />
              </div>

              {/* Compact Input Area */}
              <div className="px-3 py-3 sm:px-4 sm:py-4 bg-white dark:bg-gray-900 border-t border-purple-100 dark:border-gray-800">
                <div className="max-w-4xl mx-auto relative flex items-end gap-2">
                  <div className="flex-1 relative bg-gray-50/50 dark:bg-gray-800/50 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-sm focus-within:ring-2 focus-within:ring-purple-400 focus-within:border-transparent transition-all flex items-center">
                    <textarea
                      ref={inputRef}
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                      placeholder={isListening ? "Listening..." : "Message Healthi AI..."}
                      disabled={sending}
                      rows={1}
                      className="flex-1 max-h-32 px-5 py-3.5 bg-transparent border-none focus:outline-none focus:ring-0 text-gray-800 dark:text-gray-100 resize-none text-[15px]"
                      style={{ minHeight: "52px" }}
                    />
                    {recognitionRef.current && (
                      <button
                        onClick={toggleListen}
                        className={`p-2.5 mr-1 rounded-full transition ${isListening ? "bg-red-100 text-red-500 animate-pulse" : "text-gray-400 hover:text-purple-600 hover:bg-gray-100 dark:hover:bg-gray-700"}`}
                        title="Voice Dictation"
                      >
                        <Mic className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                  <button
                    onClick={handleSendMessage}
                    disabled={sending || (!inputText.trim() && !isListening)}
                    className="shrink-0 w-[52px] h-[52px] bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 dark:disabled:bg-gray-700 text-white rounded-full transition-all shadow-md flex items-center justify-center"
                  >
                    {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5 ml-1" />}
                  </button>
                </div>
                <div className="text-center mt-2">
                  <span className="text-[10px] sm:text-[11px] text-gray-400 font-medium tracking-wide">Healthi AI can make mistakes. Consider verifying important information.</span>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
