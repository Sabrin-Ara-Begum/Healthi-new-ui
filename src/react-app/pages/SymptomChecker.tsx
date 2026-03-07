import { useState } from 'react';
import { Clock } from 'lucide-react';
import Header from '@/react-app/components/Header';

interface SymptomCheckerProps {
  onNotificationClick: () => void;
}

export default function SymptomChecker({ onNotificationClick }: SymptomCheckerProps) {
  const [symptoms, setSymptoms] = useState('');
  const [results, setResults] = useState('');

  const handleAnalyze = () => {
    // TODO: Implement actual symptom analysis
    setResults('Analysis results will appear here...');
  };

  const handleClear = () => {
    setSymptoms('');
    setResults('');
  };

  return (
    <div className="flex-1 overflow-auto">
      <Header onNotificationClick={onNotificationClick} />

      {/* Main Content */}
      <div className="px-8 py-8">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Welcome to yor the Symptom Checker
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Describe your symptoms */}
            <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-8 border border-[#DCD2FD]/30 shadow-sm">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                Describe your symptoms
              </h2>
              
              <textarea
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                placeholder="E.g, headache, fever, sore throat.. fatigue..."
                className="w-full px-6 py-4 rounded-2xl bg-white/80 border border-[#DCD2FD]/40 focus:outline-none focus:ring-2 focus:ring-[#B9A9FB]/50 text-gray-700 placeholder-gray-400 resize-none h-24 mb-6"
              />

              <div className="flex items-center justify-between">
                <button
                  onClick={handleAnalyze}
                  className="px-8 py-3 bg-[#B9A9FB] hover:bg-[#DCD2FD] text-white rounded-xl font-semibold transition-colors"
                >
                  Analyze Symptoms
                </button>
                <button
                  onClick={handleClear}
                  className="flex items-center gap-2 px-6 py-3 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  <Clock className="w-5 h-5" />
                  <span className="font-medium">Clear</span>
                </button>
              </div>
            </div>

            {/* Possible Conditions & Insights */}
            <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-8 border border-[#DCD2FD]/30 shadow-sm">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                Possible Conditions & Insights
              </h2>
              
              <div className="min-h-[300px] border-2 border-dashed border-[#DCD2FD]/40 rounded-2xl p-6 bg-white/40">
                {results ? (
                  <p className="text-gray-700">{results}</p>
                ) : (
                  <div className="h-full"></div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - AI Health Assistant */}
          <div>
            <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-6 border border-[#DCD2FD]/30 shadow-sm">
              {/* AI Assistant Icon */}
              <div className="flex justify-center mb-6">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#DCD2FD] to-[#B9A9FB] flex items-center justify-center">
                  <div className="w-20 h-20 rounded-full bg-white/90 flex items-center justify-center">
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-2 mb-1">
                        <div className="w-2 h-2 bg-gray-700 rounded-full"></div>
                        <div className="w-2 h-2 bg-gray-700 rounded-full"></div>
                      </div>
                      <div className="w-8 h-1 bg-[#B9A9FB] rounded-full mx-auto"></div>
                    </div>
                  </div>
                </div>
              </div>

              <h3 className="text-xl font-bold text-gray-800 text-center mb-4">
                AI Health Assistant
              </h3>

              <div className="space-y-4">
                <div className="bg-purple-50/80 rounded-2xl p-4 border border-[#DCD2FD]/30">
                  <p className="text-gray-700 text-sm font-medium mb-2">
                    You might have...
                  </p>
                  <p className="text-gray-600 text-sm">
                    Hello! I'm here at help. Describe ou symptoms today.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
