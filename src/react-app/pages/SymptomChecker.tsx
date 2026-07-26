import { useEffect, useState, useRef } from 'react';
import { Clock, ArrowLeft, Upload, X, Trash2, CheckSquare, Square, AlertCircle, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router';
import Header from '@/react-app/components/Header';
import { 
  checkSymptoms, 
  getSymptomHistory, 
  uploadMedicalReport, 
  deleteSymptomHistory, 
  deleteMultipleSymptomHistory, 
  deleteAllSymptomHistory 
} from '@/react-app/api/symptomApi';
import { useApp } from '@/react-app/lib/AppContext';

interface SymptomCheckerProps {
  onNotificationClick: () => void;
}

interface UploadedFile {
  name: string;
  url: string;
}

interface SymptomItem {
  _id: string;
  symptoms: string;
  result: string;
  reply?: string;
  severity?: string;
  createdAt?: string;
  confidence?: number;
}

export default function SymptomChecker({ onNotificationClick }: SymptomCheckerProps) {
  const navigate = useNavigate();
  const { user, fetchNotifications } = useApp();

  // Basic fields
  const [symptoms, setSymptoms] = useState('');
  
  // Advanced fields
  const [severity, setSeverity] = useState('');
  const [duration, setDuration] = useState('');
  const [age, setAge] = useState(user?.age ? String(user.age) : '');
  const [gender, setGender] = useState(user?.gender || '');
  const [existingConditions, setExistingConditions] = useState(user?.medicalConditions || '');
  const [currentMedications, setCurrentMedications] = useState('');
  const [allergies, setAllergies] = useState(user?.allergies || '');
  const [temperature, setTemperature] = useState('');
  const [bloodPressure, setBloodPressure] = useState('');
  
  // Files
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  // History
  const [history, setHistory] = useState<SymptomItem[]>([]);
  const [selectedHistoryIds, setSelectedHistoryIds] = useState<Set<string>>(new Set());

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
    // Pre-fill from autocomplete search if available
    const prefilled = localStorage.getItem("prefilledSymptom");
    if (prefilled) {
      setSymptoms(prefilled);
      localStorage.removeItem("prefilledSymptom");
    }
  }, [user?.email]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const data = await uploadMedicalReport(file);
      setUploadedFiles(prev => [...prev, { name: data.name, url: data.url }]);
    } catch (error) {
      alert("Failed to upload file");
      console.error(error);
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleAnalyze = async () => {
    if (!symptoms.trim()) {
      alert("Please enter your symptoms.");
      return;
    }

    setLoading(true);
    setResults(null);

    const payload = {
      symptoms,
      userEmail: user?.email,
      severity,
      duration,
      age,
      gender,
      existingConditions,
      currentMedications,
      allergies,
      temperature,
      bloodPressure,
      uploadedFiles
    };

    try {
      const data = await checkSymptoms(payload);
      setResults(data);
      if (user?.email) {
        await loadHistory();
        fetchNotifications();
      }
    } catch (error) {
      console.log(error);
      alert('Failed to analyze symptoms.');
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setSymptoms('');
    setSeverity('');
    setDuration('');
    setCurrentMedications('');
    setTemperature('');
    setBloodPressure('');
    setUploadedFiles([]);
    setResults(null);
  };

  // --- History Management ---
  const toggleSelectHistory = (id: string) => {
    const next = new Set(selectedHistoryIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedHistoryIds(next);
  };

  const deleteSingle = async (id: string) => {
    if (!confirm("Delete this history record?")) return;
    try {
      await deleteSymptomHistory(id);
      await loadHistory();
    } catch (err) {
      console.error(err);
      alert("Failed to delete");
    }
  };

  const deleteSelected = async () => {
    if (selectedHistoryIds.size === 0) return;
    if (!confirm(`Delete ${selectedHistoryIds.size} records?`)) return;
    try {
      await deleteMultipleSymptomHistory(Array.from(selectedHistoryIds));
      setSelectedHistoryIds(new Set());
      await loadHistory();
    } catch (err) {
      console.error(err);
      alert("Failed to delete selected");
    }
  };

  const deleteAll = async () => {
    if (!user?.email) return;
    if (!confirm("Are you sure you want to delete ALL symptom history? This cannot be undone.")) return;
    try {
      await deleteAllSymptomHistory(user.email);
      setSelectedHistoryIds(new Set());
      await loadHistory();
    } catch (err) {
      console.error(err);
      alert("Failed to clear history");
    }
  };

  return (
    <div className="flex-1 overflow-auto bg-gray-50/50 dark:bg-gray-900 transition-colors duration-300">
      <Header onNotificationClick={onNotificationClick} />

      <div className="px-6 py-4 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border-b border-[#DCD2FD]/30 dark:border-gray-700">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white transition-colors font-medium"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back</span>
        </button>
      </div>

      <div className="px-4 sm:px-8 py-8 max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 dark:text-white mb-2">
            Symptom Checker
          </h1>
          <p className="text-gray-600 dark:text-gray-400">Describe your symptoms to receive AI-powered insights and recommendations.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            
            {/* Input Form */}
            <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-3xl p-6 sm:p-8 border border-[#DCD2FD]/30 dark:border-gray-700 shadow-sm">
              <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-6 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-purple-500" />
                Describe your condition
              </h2>

              <textarea
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                placeholder="E.g., headache, fever, sore throat, fatigue..."
                className="w-full px-5 py-4 rounded-2xl bg-white dark:bg-gray-900 border border-[#DCD2FD]/40 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-[#B9A9FB]/50 text-gray-800 dark:text-gray-100 placeholder-gray-400 resize-none min-h-[120px] mb-6 shadow-inner"
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider">Severity</label>
                  <select
                    value={severity}
                    onChange={(e) => setSeverity(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-gray-900 border border-[#DCD2FD]/40 dark:border-gray-700 text-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-purple-300 outline-none"
                  >
                    <option value="">Select Severity</option>
                    <option value="Mild">Mild</option>
                    <option value="Moderate">Moderate</option>
                    <option value="Severe">Severe</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider">Duration</label>
                  <input
                    type="text"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    placeholder="e.g., 2 days, 1 week"
                    className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-gray-900 border border-[#DCD2FD]/40 dark:border-gray-700 text-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-purple-300 outline-none"
                  />
                </div>
              </div>

              {/* Upload Documents */}
              <div className="mb-6">
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wider">Upload Reports (Optional)</label>
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="flex items-center gap-2 px-4 py-2 bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-300 border border-purple-200 dark:border-purple-800 rounded-xl hover:bg-purple-100 transition text-sm font-medium"
                  >
                    {uploading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                    {uploading ? "Uploading..." : "Upload File"}
                  </button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    className="hidden"
                    accept=".pdf,.jpg,.jpeg,.png,.webp"
                  />
                  {uploadedFiles.map((file, i) => (
                    <div key={i} className="flex items-center gap-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5 text-xs text-gray-600 dark:text-gray-300">
                      <span className="truncate max-w-[120px]">{file.name}</span>
                      <button onClick={() => removeFile(i)} className="text-red-400 hover:text-red-600">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Advanced Context Section */}
              <details className="mb-6 group">
                <summary className="cursor-pointer text-sm font-semibold text-purple-600 dark:text-purple-400 flex items-center gap-2 hover:text-purple-700">
                  <span>+ Advanced Context (Age, Vitals, Conditions)</span>
                </summary>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 pt-4 border-t border-purple-100 dark:border-gray-700">
                  <div>
                    <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Age</label>
                    <input type="number" value={age} onChange={(e) => setAge(e.target.value)} className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200 outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Gender</label>
                    <select value={gender} onChange={(e) => setGender(e.target.value)} className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200 outline-none">
                      <option value="">Select</option><option value="Male">Male</option><option value="Female">Female</option><option value="Other">Other</option>
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Existing Conditions</label>
                    <input type="text" value={existingConditions} onChange={(e) => setExistingConditions(e.target.value)} placeholder="e.g. Diabetes, Asthma" className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200 outline-none" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Allergies</label>
                    <input type="text" value={allergies} onChange={(e) => setAllergies(e.target.value)} placeholder="e.g. Peanuts, Penicillin" className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200 outline-none" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Current Medications</label>
                    <input type="text" value={currentMedications} onChange={(e) => setCurrentMedications(e.target.value)} className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200 outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Temperature</label>
                    <input type="text" placeholder="e.g. 98.6°F" value={temperature} onChange={(e) => setTemperature(e.target.value)} className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200 outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Blood Pressure</label>
                    <input type="text" placeholder="e.g. 120/80" value={bloodPressure} onChange={(e) => setBloodPressure(e.target.value)} className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200 outline-none" />
                  </div>
                </div>
              </details>

              <div className="flex items-center justify-between pt-4 border-t border-purple-100 dark:border-gray-700">
                <button
                  onClick={handleAnalyze}
                  disabled={loading}
                  className="px-6 py-3 bg-gradient-to-r from-purple-500 to-[#B9A9FB] hover:from-purple-600 hover:to-purple-500 text-white rounded-xl font-bold transition-all shadow-md disabled:opacity-70 flex items-center justify-center min-w-[160px]"
                >
                  {loading ? (
                    <span className="flex items-center gap-2"><RefreshCw className="w-5 h-5 animate-spin" /> Analyzing...</span>
                  ) : "Analyze Symptoms"}
                </button>

                <button
                  onClick={handleClear}
                  className="flex items-center gap-2 px-4 py-2 text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 transition-colors font-medium text-sm"
                >
                  <Clock className="w-4 h-4" /> Clear All
                </button>
              </div>
            </div>

            {/* Results Display */}
            {loading && (
              <div className="bg-white/70 dark:bg-gray-800/70 rounded-3xl p-10 shadow-sm border border-purple-100 dark:border-gray-700 flex flex-col items-center justify-center">
                <div className="w-12 h-12 border-4 border-[#E7D8FF] border-t-[#B89AF8] rounded-full animate-spin"></div>
                <p className="mt-5 text-gray-700 dark:text-gray-200 font-medium text-lg">AI is analyzing your condition...</p>
                <p className="text-sm text-gray-400 mt-2">Correlating symptoms and medical context.</p>
              </div>
            )}

            {!loading && results && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                
                {/* Urgency */}
                {results.urgency && (
                  <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm overflow-hidden border border-[#F2DDF2] dark:border-gray-700">
                    <div className="bg-[#9C82D2] text-white px-6 py-4 font-bold text-lg">{results.urgency.title || "Urgency & Action Plan"}</div>
                    <div className="p-6">
                      <ul className="space-y-3 text-gray-700 dark:text-gray-200">
                        {results.urgency.points.map((pt: string, i: number) => (
                          <li key={i} className="flex gap-3"><span className="text-purple-500 mt-0.5">•</span><span>{pt}</span></li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                {/* Causes */}
                {results.causes && (
                  <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm overflow-hidden border border-gray-100 dark:border-gray-700">
                    <div className="bg-[#8C72CA] text-white px-6 py-4 font-bold text-lg">{results.causes.title || "Possible Causes"}</div>
                    <div className="p-6">
                      <ul className="space-y-3 text-gray-700 dark:text-gray-200">
                        {results.causes.points.map((pt: string, i: number) => (
                          <li key={i} className="flex gap-3"><span className="text-purple-500 mt-0.5">•</span><span>{pt}</span></li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                {/* Home Care */}
                {results.homeCare && (
                  <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm overflow-hidden border border-gray-100 dark:border-gray-700">
                    <div className="bg-[#9C82D2] text-white px-6 py-4 font-bold text-lg">{results.homeCare.title || "Home Care"}</div>
                    <div className="p-6">
                      <ul className="space-y-3 text-gray-700 dark:text-gray-200">
                        {results.homeCare.points.map((pt: string, i: number) => (
                          <li key={i} className="flex gap-3"><span className="text-purple-500 mt-0.5">•</span><span>{pt}</span></li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                {/* Avoid */}
                {results.avoid && (
                  <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm overflow-hidden border border-gray-100 dark:border-gray-700">
                    <div className="bg-[#9C82D2] text-white px-6 py-4 font-bold text-lg">{results.avoid.title || "Things to Avoid"}</div>
                    <div className="p-6">
                      <ul className="space-y-3 text-gray-700 dark:text-gray-200">
                        {results.avoid.points.map((pt: string, i: number) => (
                          <li key={i} className="flex gap-3"><span className="text-purple-500 mt-0.5">•</span><span>{pt}</span></li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                {/* Emergency */}
                {results.emergency && (
                  <div className="bg-red-50 dark:bg-red-900/10 rounded-3xl shadow-sm overflow-hidden border border-red-100 dark:border-red-900/30">
                    <div className="bg-red-500 text-white px-6 py-4 font-bold text-lg flex items-center gap-2">
                      <AlertCircle className="w-5 h-5" />
                      {results.emergency.title || "Emergency Warning Signs"}
                    </div>
                    <div className="p-6">
                      <ul className="space-y-3 text-gray-800 dark:text-gray-200 font-medium">
                        {results.emergency.points.map((pt: string, i: number) => (
                          <li key={i} className="flex gap-3"><span className="text-red-500 mt-0.5">🚨</span><span>{pt}</span></li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                {/* Specialist Recommendation */}
                {results.specialist && (
                  <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm overflow-hidden border border-purple-200 dark:border-gray-700">
                    <div className="bg-[#9C82D2] text-white px-6 py-4 font-bold text-lg">👨‍⚕️ Specialist to Consult</div>
                    <div className="p-6 sm:p-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                      <div>
                        <h3 className="text-2xl font-black text-purple-700 dark:text-purple-400">{results.specialist.name}</h3>
                        <p className="text-gray-600 dark:text-gray-300 mt-2 text-sm leading-relaxed max-w-md">{results.specialist.reason}</p>
                      </div>
                      <button
                        onClick={() => {
                          localStorage.setItem("recommendedSpecialist", results.specialist.name);
                          navigate("/doctors");
                        }}
                        className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl font-bold whitespace-nowrap shadow-md transition"
                      >
                        Find Doctors
                      </button>
                    </div>
                  </div>
                )}

              </div>
            )}
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            
            {/* History Panel */}
            <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-3xl p-6 border border-[#DCD2FD]/30 dark:border-gray-700 shadow-sm flex flex-col h-[500px]">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold text-gray-800 dark:text-white">Recent Checks</h2>
                {user?.email && history.length > 0 && (
                  <button onClick={deleteAll} className="text-xs text-red-500 hover:text-red-700 font-semibold px-2 py-1 bg-red-50 dark:bg-red-900/20 rounded-md">
                    Clear All
                  </button>
                )}
              </div>

              {selectedHistoryIds.size > 0 && (
                <div className="bg-purple-50 dark:bg-purple-900/20 p-2 mb-3 rounded-xl flex justify-between items-center">
                  <span className="text-xs font-bold text-purple-700 dark:text-purple-300 ml-2">{selectedHistoryIds.size} Selected</span>
                  <button onClick={deleteSelected} className="text-xs bg-white dark:bg-gray-800 text-red-600 px-3 py-1.5 rounded-lg font-bold border border-purple-100 dark:border-gray-700 shadow-sm flex items-center gap-1 hover:bg-red-50 transition">
                    <Trash2 className="w-3.5 h-3.5" /> Delete
                  </button>
                </div>
              )}

              <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-thin">
                {!user?.email ? (
                  <p className="text-sm text-gray-500 text-center mt-10">Log in to view history.</p>
                ) : history.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center mt-10">No recent diagnoses.</p>
                ) : (
                  history.map((item) => (
                    <div
                      key={item._id}
                      className={`relative rounded-xl p-4 border transition-colors ${
                        selectedHistoryIds.has(item._id) 
                        ? 'bg-purple-50 dark:bg-purple-900/20 border-purple-300' 
                        : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 hover:border-purple-200'
                      }`}
                    >
                      <button
                        onClick={() => toggleSelectHistory(item._id)}
                        className="absolute top-3 right-3 text-gray-400 hover:text-purple-500"
                      >
                        {selectedHistoryIds.has(item._id) ? <CheckSquare className="w-5 h-5 text-purple-600" /> : <Square className="w-5 h-5" />}
                      </button>
                      
                      <div className="pr-8">
                        <p className="text-xs text-gray-400 mb-1">{item.createdAt ? new Date(item.createdAt).toLocaleString() : ''}</p>
                        <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2 truncate">
                          "{item.symptoms}"
                        </p>
                        <div className="flex items-center gap-2 mt-3">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${item.severity === 'Severe' ? 'bg-red-100 text-red-700' : item.severity === 'Moderate' ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'}`}>
                            {item.severity || "Standard"}
                          </span>
                          <button onClick={() => deleteSingle(item._id)} className="text-xs text-red-400 hover:text-red-600 ml-auto">Delete</button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* AI Assistant Help Card */}
            <div className="bg-gradient-to-br from-[#DCD2FD]/40 to-[#B9A9FB]/40 dark:from-purple-900/30 dark:to-purple-800/30 backdrop-blur-sm rounded-3xl p-6 border border-[#B9A9FB]/30 shadow-sm text-center">
               <div className="w-16 h-16 mx-auto rounded-full bg-white dark:bg-gray-800 shadow-md flex items-center justify-center mb-4">
                 <span className="text-2xl">🤖</span>
               </div>
               <h3 className="font-bold text-gray-800 dark:text-white mb-2">Smart Health Assistant</h3>
               <p className="text-sm text-gray-600 dark:text-gray-300">
                 Adding details like duration, severity, and existing conditions greatly improves diagnosis accuracy.
               </p>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}