import { BrowserRouter as Router, Routes, Route } from "react-router";
import { useState } from "react";
import Sidebar from "@/react-app/components/Sidebar";
import Footer from "@/react-app/components/Footer";
import Header from "@/react-app/components/Header";
import NotificationPanel from "@/react-app/components/NotificationPanel";
import HomePage from "@/react-app/pages/Home";
import MoodTracker from "@/react-app/pages/MoodTracker";
import Auth from "@/react-app/pages/Auth";
import Profile from "@/react-app/pages/Profile";
import SymptomChecker from "@/react-app/pages/SymptomChecker";
import FindDoctor from "./pages/FindDoctor";
import TabletIdentifier from "./pages/TabletIdentifier";
import AIChat from "./pages/AIChat";
import { AppProvider } from "@/react-app/lib/AppContext";


export default function App() {
  const [notificationOpen, setNotificationOpen] = useState(false);

  return (
    <Router>
      <AppProvider>
        <div
          className="flex h-screen overflow-hidden bg-gradient-to-br from-[#F3E8FF] via-[#DCD2FD] to-[#B9A9FB] dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-300"
        >
          <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Routes>
            {/* Unprotected Routes - All visitors can view */}
            <Route path="/auth" element={<Auth />} />
            <Route
              path="/"
              element={<HomePage onNotificationClick={() => setNotificationOpen(true)} />}
            />
            <Route
              path="/chat"
              element={<AIChat onNotificationClick={() => setNotificationOpen(true)} />}
            />
            <Route
              path="/reports"
              element={<ComingSoon title="Reports" onNotificationClick={() => setNotificationOpen(true)} />}
            />
            <Route
              path="/doctors"
              element={<FindDoctor onNotificationClick={() => setNotificationOpen(true)} />}
            />
            <Route
              path="/symptom-checker"
              element={<SymptomChecker onNotificationClick={() => setNotificationOpen(true)} />}
            />
            <Route
              path="/find-doctor"
              element={<FindDoctor onNotificationClick={() => setNotificationOpen(true)} />}
            />
            <Route
              path="/mood-tracker"
              element={<MoodTracker onNotificationClick={() => setNotificationOpen(true)} />}
            />
            <Route path="/profile" element={<Profile />} />
            <Route
              path="/tablet-identifier"
              element={
                <TabletIdentifier
                  onNotificationClick={() => setNotificationOpen(true)}
                />
              }
            />
          </Routes>
          <Footer />
        </div>
        <NotificationPanel
          isOpen={notificationOpen}
          onClose={() => setNotificationOpen(false)}
        />
      </div>
      </AppProvider>
    </Router>
  );
}

function ComingSoon({
  title,
  onNotificationClick,
}: {
  title: string;
  onNotificationClick: () => void;
}) {
  return (
    <>
      <Header onNotificationClick={onNotificationClick} />
      <div className="flex-1 flex items-center justify-center overflow-auto">
        <div className="text-center p-8">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-purple-200 to-pink-200 flex items-center justify-center">
            <div className="text-4xl">✨</div>
          </div>
          <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-4">{title}</h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">Coming soon...</p>
          <p className="text-sm text-purple-600 dark:text-purple-400 mt-2">
            We're working on something amazing!
          </p>
        </div>
      </div>
    </>
  );
}