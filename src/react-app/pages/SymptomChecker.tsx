import { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';
import Header from '@/react-app/components/Header';
import { checkSymptoms, getSymptomHistory } from '@/react-app/api/symptomApi';

interface SymptomCheckerProps {
  onNotificationClick: () => void;
}

interface SymptomItem {
  _id?: string;
  symptoms: string;
  result: string;
  createdAt?: string;
}

export default function SymptomChecker({ onNotificationClick }: SymptomCheckerProps) {
  const [symptoms, setSymptoms] = useState('');
  const [results, setResults] = useState('');
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<SymptomItem[]>([]);

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const loadHistory = async () => {
    if (!user?.email) return;

    try {
      const data = await getSymptomHistory(user.email);
      setHistory(data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const handleAnalyze = async () => {
    if (!symptoms.trim()) return;

    setLoading(true);

    try {
      const data = await checkSymptoms(symptoms, user.email);
      setResults(data.result || 'No result found');
      await loadHistory();
    } catch (error) {
      console.log(error);
      setResults('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setSymptoms('');
    setResults('');
  };

  return (
    <div className="flex-1 overflow-auto">
      <Header onNotificationClick={onNotificationClick} />

      <div className="px-8 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Welcome to the Symptom Checker
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
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
                  {loading ? 'Analyzing...' : 'Analyze Symptoms'}
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

            <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-8 border border-[#DCD2FD]/30 shadow-sm">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                Possible Conditions & Insights
              </h2>

              <div className="min-h-[300px] border-2 border-dashed border-[#DCD2FD]/40 rounded-2xl p-6 bg-white/40">
                {loading && (
                  <p className="text-gray-600">Analyzing symptoms...</p>
                )}

                {!loading && results && (
                  <p className="text-gray-700 whitespace-pre-line">
                    {results}
                  </p>
                )}
              </div>
            </div>

            <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-8 border border-[#DCD2FD]/30 shadow-sm">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                Your Symptom History
              </h2>

              <div className="space-y-4 max-h-72 overflow-y-auto">
                {history.length === 0 ? (
                  <p className="text-gray-500">No history yet</p>
                ) : (
                  history.map((item, index) => (
                    <div
                      key={item._id || index}
                      className="bg-white/80 rounded-2xl p-4 border border-[#DCD2FD]/30"
                    >
                      <p className="text-sm text-gray-500 mb-2">
                        <strong>Symptoms:</strong> {item.symptoms}
                      </p>
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">
                        <strong>AI Result:</strong> {item.result}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <div>
            <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-6 border border-[#DCD2FD]/30 shadow-sm">
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
                    Tip
                  </p>
                  <p className="text-gray-600 text-sm">
                    Describe symptoms clearly for better AI suggestions.
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