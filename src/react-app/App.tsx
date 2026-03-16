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

export default function App() {
  const [notificationOpen, setNotificationOpen] = useState(false);

  return (
    <Router>
      <div
        className="flex h-screen overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #F3E8FF 0%, #DCD2FD 50%, #B9A9FB 100%)",
        }}
      >
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Routes>
            <Route
              path="/"
              element={<HomePage onNotificationClick={() => setNotificationOpen(true)} />}
            />
            <Route
              path="/chat"
              element={<ComingSoon title="AI Chat" onNotificationClick={() => setNotificationOpen(true)} />}
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
            <Route
              path="/tablet-identifier"
              element={<ComingSoon title="Tablet Identifier" onNotificationClick={() => setNotificationOpen(true)} />}
            />
            <Route path="/auth" element={<Auth />} />
            <Route path="/profile" element={<Profile />} />
          </Routes>
          <Footer />
        </div>
        <NotificationPanel
          isOpen={notificationOpen}
          onClose={() => setNotificationOpen(false)}
        />
      </div>
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
          <h1 className="text-4xl font-bold text-gray-800 mb-4">{title}</h1>
          <p className="text-xl text-gray-600">Coming soon...</p>
          <p className="text-sm text-purple-600 mt-2">
            We're working on something amazing!
          </p>
        </div>
      </div>
    </>
  );
}