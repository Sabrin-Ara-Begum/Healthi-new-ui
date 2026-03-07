import Header from '@/react-app/components/Header';
import FeatureCard from '@/react-app/components/FeatureCard';

interface HomeProps {
  onNotificationClick: () => void;
}

export default function Home({ onNotificationClick }: HomeProps) {
  return (
    <div className="flex-1 overflow-auto">
      <Header onNotificationClick={onNotificationClick} />

      {/* Main Content */}
      <div className="px-8 py-8">
        {/* Greeting */}
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Welcome back! 👋
          </h1>
          <p className="text-xl text-gray-600">How can I assist you today?</p>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl">
          <FeatureCard
            title="AI Symptom Checker"
            description="Describe your symptoms and get insights"
            icon={
              <div className="relative">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                  <span className="text-2xl">😊</span>
                </div>
                <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-teal-400 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                </div>
              </div>
            }
            gradient="bg-gradient-to-br from-teal-200/80 via-green-200/60 to-pink-200/40"
            path="/symptom-checker"
          />

          <FeatureCard
            title="Find a Doctor"
            description="Search nearby doctors and specialists"
            icon={
              <div className="w-12 h-12">
                <svg viewBox="0 0 80 80" className="w-full h-full">
                  <circle cx="40" cy="25" r="12" fill="#FFE8D6" />
                  <path d="M25 75 C25 55, 25 45, 40 45 C55 45, 55 55, 55 75 Z" fill="#87CEEB" />
                  <circle cx="40" cy="25" r="10" fill="#8B4513" />
                  <circle cx="36" cy="24" r="2" fill="#000" />
                  <circle cx="44" cy="24" r="2" fill="#000" />
                  <path d="M36 28 Q40 30 44 28" stroke="#000" strokeWidth="1.5" fill="none" />
                  <rect x="35" y="50" width="10" height="15" rx="1" fill="#FFF" />
                  <rect x="38" y="48" width="4" height="20" fill="#FFF" />
                </svg>
              </div>
            }
            gradient="bg-gradient-to-br from-blue-200/80 via-purple-200/60 to-pink-200/40"
            path="/find-doctor"
          />

          <FeatureCard
            title="Mood Tracker"
            description="Log your daily mood and emotions"
            icon={
              <div className="relative">
                <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl">😊</span>
                </div>
                <div className="absolute -top-2 -left-2 w-8 h-8 bg-pink-400 rounded-full opacity-60"></div>
              </div>
            }
            gradient="bg-gradient-to-br from-pink-200/80 via-orange-200/60 to-yellow-200/40"
            path="/mood-tracker"
          />

          <FeatureCard
            title="Tablet Identifier"
            description="Identify medications by appearance"
            icon={
              <div className="relative">
                <div className="w-10 h-10 bg-blue-400 rounded-full opacity-80"></div>
                <div className="absolute top-2 left-2 w-10 h-10 bg-purple-300 rounded-full opacity-60"></div>
                <div className="absolute top-1 left-6 w-6 h-6 bg-white rounded-full border-3 border-purple-400 flex items-center justify-center">
                  <svg className="w-3 h-3 text-purple-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <circle cx="11" cy="11" r="8" />
                    <path d="m21 21-4.35-4.35" />
                  </svg>
                </div>
              </div>
            }
            gradient="bg-gradient-to-br from-purple-200/80 via-blue-200/60 to-indigo-200/40"
            path="/tablet-identifier"
          />
        </div>
      </div>
    </div>
  );
}
