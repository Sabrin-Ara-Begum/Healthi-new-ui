import { useState, useRef, useEffect } from "react";
import { identifyMedicine, getTabletHistory, deleteTabletHistory } from "../api/tabletApi";
import Header from "@/react-app/components/Header";
import {
  Camera,
  Upload,
  ScanSearch,
  Trash2,
  Loader2,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  Pill,
  ShieldAlert,
  Search,
  ChevronLeft,
  ChevronRight,
  Clock,
} from "lucide-react";

interface Props {
  onNotificationClick: () => void;
}

interface MedicineResult {
  medicine: string;
  generic: string;
  composition: string;
  uses: string[];
  dosage: string;
  sideEffects: string[];
  warnings: string[];
  confidence: number;
}

export default function TabletIdentifier({ onNotificationClick }: Props) {
  const uploadRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [cameraOpen, setCameraOpen] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<MedicineResult | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Scan History State
  const [historyLogs, setHistoryLogs] = useState<any[]>([]);
  const [historySearch, setHistorySearch] = useState("");
  const [historyPage, setHistoryPage] = useState(1);
  const [historyTotalPages, setHistoryTotalPages] = useState(1);
  const [historyLoading, setHistoryLoading] = useState(false);

  // Check login state
  const userString = localStorage.getItem("user");
  const user = userString ? JSON.parse(userString) : null;
  const userEmail = user?.email || "";

  // Fetch History Logs
  const loadHistory = async (page = 1, searchQuery = "") => {
    if (!userEmail) return;
    try {
      setHistoryLoading(true);
      const data = await getTabletHistory(userEmail, searchQuery, page, 5);
      setHistoryLogs(data.logs || []);
      setHistoryTotalPages(data.pagination?.totalPages || 1);
      setHistoryPage(data.pagination?.currentPage || 1);
    } catch (err) {
      console.error("Failed to load tablet history:", err);
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    if (userEmail) {
      loadHistory(1, historySearch);
    }
  }, [userEmail]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadHistory(1, historySearch);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= historyTotalPages) {
      loadHistory(newPage, historySearch);
    }
  };

  const handleDeleteLog = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this scan from your history?")) return;
    try {
      await deleteTabletHistory(id);
      loadHistory(historyPage, historySearch);
    } catch (err) {
      console.error(err);
      alert("Failed to delete log entry.");
    }
  };

  const handleSelectLog = (log: any) => {
    setResult({
      medicine: log.medicine,
      generic: log.generic,
      composition: log.composition,
      uses: log.uses || [],
      dosage: log.dosage,
      sideEffects: log.sideEffects || [],
      warnings: log.warnings || [],
      confidence: log.confidence,
    });
    setPreview("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleFile = (file: File) => {
    setPreview(URL.createObjectURL(file));
    setResult(null);
    setSelectedFile(file);
  };

  const removeImage = () => {
    setPreview("");
    setResult(null);
    setSelectedFile(null);
  };

  const openCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      streamRef.current = stream;
      setCameraOpen(true);
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      }, 100);
    } catch (err) {
      alert("Unable to access camera.");
      console.error(err);
    }
  };

  const closeCamera = () => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setCameraOpen(false);
  };

  const takePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0);
    canvas.toBlob((blob) => {
      if (!blob) return;
      const file = new File([blob], "medicine.jpg", { type: "image/jpeg" });
      handleFile(file);
      closeCamera();
    }, "image/jpeg");
  };

  const analyzeMedicine = async () => {
    if (!selectedFile) return;
    try {
      setLoading(true);
      const data = await identifyMedicine(selectedFile, userEmail);
      setResult(data);
      if (userEmail) {
        loadHistory(1, historySearch);
      }
    } catch (err) {
      console.error(err);
      alert("Medicine identification failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header onNotificationClick={onNotificationClick} />

      <div className="flex-1 overflow-auto bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-6 sm:py-10">
          {/* Hero Section */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-3 bg-purple-100 dark:bg-purple-900/30 px-5 py-2 rounded-full">
              <Pill className="w-5 h-5 text-purple-600 dark:text-purple-400 flex-shrink-0" />
              <span className="font-semibold text-purple-700 dark:text-purple-300 text-sm sm:text-base">
                AI Powered Medicine Scanner
              </span>
            </div>
            <h1 className="mt-6 text-3xl sm:text-5xl font-black text-gray-800 dark:text-white tracking-tight leading-tight">
              Identify Medicines Instantly
            </h1>
            <p className="mt-4 text-base sm:text-xl text-gray-500 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
              Upload or capture a medicine image. Our AI identifies the tablet and details its composition, uses, dosage, and side effects.
            </p>
          </div>

          {/* Upload / Camera Card */}
          {!preview && (
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragging(false);
                const file = e.dataTransfer.files[0];
                if (file) handleFile(file);
              }}
              className={`transition-all duration-300 rounded-3xl lg:rounded-[40px] border-2 border-dashed p-6 sm:p-14 shadow-xl ${
                dragging
                  ? "border-purple-500 bg-purple-50 dark:bg-purple-900/20 scale-[1.02]"
                  : "border-purple-200 dark:border-gray-700 bg-white dark:bg-gray-800"
              }`}
            >
              <div className="flex flex-col items-center">
                <div className="w-24 h-24 sm:w-36 sm:h-36 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-xl">
                  <ScanSearch className="w-12 h-12 sm:w-20 sm:h-20 text-white" />
                </div>
                <h2 className="text-xl sm:text-3xl font-bold mt-8 sm:mt-10 text-gray-800 dark:text-white text-center">
                  Drag & Drop Medicine Image
                </h2>
                <p className="text-gray-400 mt-2 text-center text-sm sm:text-base max-w-md">
                  Supported formats: PNG • JPG • JPEG • WEBP
                </p>
                <div className="flex flex-col sm:flex-row justify-center gap-4 mt-8 w-full max-w-sm sm:max-w-none px-4">
                  <button
                    onClick={() => uploadRef.current?.click()}
                    className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 sm:px-8 sm:py-4 rounded-xl sm:rounded-2xl shadow-lg flex items-center justify-center gap-3 transition font-semibold text-sm sm:text-base"
                  >
                    <Upload className="w-5 h-5 flex-shrink-0" />
                    Upload Image
                  </button>
                  <button
                    onClick={openCamera}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 sm:px-8 sm:py-4 rounded-xl sm:rounded-2xl shadow-lg flex items-center justify-center gap-3 transition font-semibold text-sm sm:text-base"
                  >
                    <Camera className="w-5 h-5 flex-shrink-0" />
                    Capture
                  </button>
                </div>
                <input
                  hidden
                  ref={uploadRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFile(file);
                  }}
                />
              </div>
            </div>
          )}

          {/* Preview Image Ready for Scan */}
          {preview && !result && (
            <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
              {/* LEFT */}
              <div className="bg-white dark:bg-gray-800 rounded-3xl p-4 sm:p-6 shadow-xl border border-purple-100 dark:border-gray-700">
                <img
                  src={preview}
                  alt="Medicine preview"
                  className="rounded-2xl w-full object-cover max-h-[400px] lg:max-h-[500px]"
                />
              </div>

              {/* RIGHT */}
              <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 sm:p-8 border border-purple-100 dark:border-gray-700 shadow-xl flex flex-col justify-between h-full">
                <div>
                  <div className="inline-flex items-center gap-2 bg-green-100 dark:bg-green-900/30 px-4 py-2 rounded-full">
                    <CheckCircle2 className="text-green-600 dark:text-green-400 w-5 h-5 flex-shrink-0" />
                    <span className="font-semibold text-green-700 dark:text-green-400 text-sm">Image Ready</span>
                  </div>
                  <h2 className="text-2xl sm:text-4xl font-black mt-4 sm:mt-6 text-gray-800 dark:text-white">
                    Ready for AI Analysis
                  </h2>
                  <p className="mt-4 text-gray-500 dark:text-gray-400 leading-relaxed text-sm sm:text-base">
                    Our AI scanner will examine details from this image to identify the medicine strip, tablet print, shape, and label:
                  </p>
                  <ul className="mt-4 space-y-2 text-gray-600 dark:text-gray-300 text-sm sm:text-base font-medium">
                    <li className="flex items-center gap-2">✔ Active Ingredient & Composition</li>
                    <li className="flex items-center gap-2">✔ Intended Health Uses</li>
                    <li className="flex items-center gap-2">✔ Basic Dosage & Warnings</li>
                  </ul>
                </div>
                <div className="mt-8 flex flex-col gap-4">
                  <button
                    onClick={analyzeMedicine}
                    disabled={loading}
                    className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl sm:rounded-2xl py-4 sm:py-5 text-lg font-bold shadow-xl hover:opacity-95 hover:scale-[1.01] transition disabled:opacity-50 disabled:scale-100"
                  >
                    {loading ? (
                      <div className="flex justify-center items-center gap-3">
                        <Loader2 className="animate-spin w-5 h-5" />
                        Analyzing...
                      </div>
                    ) : (
                      "🔍 Analyze Medicine"
                    )}
                  </button>
                  <button
                    onClick={removeImage}
                    className="border-2 border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 rounded-xl sm:rounded-2xl py-3 hover:bg-gray-50 dark:hover:bg-gray-700 flex justify-center items-center gap-3 transition font-semibold"
                  >
                    <Trash2 className="w-5 h-5 flex-shrink-0" />
                    Remove Image
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ================= RESULT CARD ================= */}
          {result && (
            <div className="mt-10">
              <div className="bg-white dark:bg-gray-800 rounded-3xl lg:rounded-[40px] shadow-2xl p-6 sm:p-10 border border-purple-100 dark:border-gray-700">
                <div className="flex justify-between items-center flex-wrap gap-6">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center flex-shrink-0">
                      <Pill className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <h2 className="text-2xl sm:text-4xl font-black text-gray-800 dark:text-white">
                        {result.medicine}
                      </h2>
                      <p className="text-gray-500 dark:text-gray-400 mt-1 font-medium text-sm sm:text-base">
                        {result.generic}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl sm:text-5xl font-black text-purple-600 dark:text-purple-400">
                      {result.confidence}%
                    </div>
                    <p className="text-gray-400 text-xs sm:text-sm font-semibold uppercase tracking-wider">
                      Confidence
                    </p>
                  </div>
                </div>

                <hr className="my-8 sm:my-10 border-gray-100 dark:border-gray-700" />

                <div className="grid lg:grid-cols-2 gap-6 sm:gap-8">
                  {/* USES */}
                  <div className="rounded-2xl sm:rounded-3xl bg-green-50/70 dark:bg-green-900/10 p-5 sm:p-6 border border-green-100 dark:border-green-900/30">
                    <h3 className="text-xl sm:text-2xl font-bold mb-4 text-green-800 dark:text-green-400 flex items-center gap-2">
                      ✅ Uses
                    </h3>
                    <div className="space-y-3">
                      {result.uses && result.uses.length > 0 ? (
                        result.uses.map((item, index) => (
                          <div key={index} className="flex items-start gap-3">
                            <CheckCircle2 className="text-green-600 dark:text-green-500 w-5 h-5 mt-0.5 flex-shrink-0" />
                            <span className="text-gray-700 dark:text-gray-300 text-sm sm:text-base">{item}</span>
                          </div>
                        ))
                      ) : (
                        <p className="text-gray-500 text-sm">No documented uses found.</p>
                      )}
                    </div>
                  </div>

                  {/* SIDE EFFECTS */}
                  <div className="rounded-2xl sm:rounded-3xl bg-red-50/70 dark:bg-red-900/10 p-5 sm:p-6 border border-red-100 dark:border-red-900/30">
                    <h3 className="text-xl sm:text-2xl font-bold mb-4 text-red-800 dark:text-red-400 flex items-center gap-2">
                      ⚠️ Side Effects
                    </h3>
                    <div className="space-y-3">
                      {result.sideEffects && result.sideEffects.length > 0 ? (
                        result.sideEffects.map((item, index) => (
                          <div key={index} className="flex items-start gap-3">
                            <AlertTriangle className="text-red-500 w-5 h-5 mt-0.5 flex-shrink-0" />
                            <span className="text-gray-700 dark:text-gray-300 text-sm sm:text-base">{item}</span>
                          </div>
                        ))
                      ) : (
                        <p className="text-gray-500 text-sm">No documented side effects found.</p>
                      )}
                    </div>
                  </div>

                  {/* DOSAGE */}
                  <div className="rounded-2xl sm:rounded-3xl bg-blue-50/70 dark:bg-blue-900/10 p-5 sm:p-6 border border-blue-100 dark:border-blue-900/30">
                    <h3 className="text-xl sm:text-2xl font-bold mb-4 text-blue-800 dark:text-blue-400 flex items-center gap-2">
                      💊 Dosage
                    </h3>
                    <p className="leading-relaxed text-gray-700 dark:text-gray-300 text-sm sm:text-base">
                      {result.dosage || "Consult your physician for correct dosage instructions."}
                    </p>
                  </div>

                  {/* WARNINGS */}
                  <div className="rounded-2xl sm:rounded-3xl bg-yellow-50/70 dark:bg-yellow-900/10 p-5 sm:p-6 border border-yellow-100 dark:border-yellow-900/30">
                    <h3 className="text-xl sm:text-2xl font-bold mb-4 text-yellow-800 dark:text-yellow-400 flex items-center gap-2">
                      🛡️ Warnings
                    </h3>
                    <div className="space-y-3">
                      {result.warnings && result.warnings.length > 0 ? (
                        result.warnings.map((item, index) => (
                          <div key={index} className="flex items-start gap-3">
                            <ShieldAlert className="text-yellow-600 dark:text-yellow-500 w-5 h-5 mt-0.5 flex-shrink-0" />
                            <span className="text-gray-700 dark:text-gray-300 text-sm sm:text-base">{item}</span>
                          </div>
                        ))
                      ) : (
                        <p className="text-gray-500 text-sm">No specific warnings documented.</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-8 rounded-2xl sm:rounded-3xl bg-purple-50/70 dark:bg-purple-900/10 p-5 sm:p-6 border border-purple-100 dark:border-purple-900/30">
                  <h3 className="text-lg sm:text-xl font-bold mb-2 text-purple-900 dark:text-purple-300">
                    Composition
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300 text-sm sm:text-base">
                    {result.composition || "Unavailable"}
                  </p>
                </div>

                {/* Search Pharmacies / Google buttons */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
                  <a
                    href={`https://www.google.com/search?q=${encodeURIComponent(result.medicine)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="bg-blue-500 hover:bg-blue-600 text-white rounded-xl py-3.5 flex justify-center items-center gap-3 transition font-semibold text-sm"
                  >
                    <Search className="w-5 h-5" />
                    Google Search
                  </a>
                  <a
                    href={`https://www.google.com/maps/search/pharmacy+near+me`}
                    target="_blank"
                    rel="noreferrer"
                    className="bg-green-500 hover:bg-green-600 text-white rounded-xl py-3.5 flex justify-center items-center gap-3 transition font-semibold text-sm"
                  >
                    <MapPin className="w-5 h-5" />
                    Nearby Pharmacy
                  </a>
                  <button
                    onClick={removeImage}
                    className="bg-purple-600 hover:bg-purple-700 text-white rounded-xl py-3.5 hover:scale-[1.01] transition font-semibold text-sm"
                  >
                    Scan Another
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ================= RECENT SCANS HISTORY ================= */}
          {userEmail && (
            <div className="mt-12 bg-white dark:bg-gray-800 rounded-3xl p-6 sm:p-8 border border-purple-100 dark:border-gray-700 shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                    <Clock className="w-6 h-6 text-purple-500" />
                    Recent Scans
                  </h2>
                  <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                    Your tablet scan history. Click on a scan to view details.
                  </p>
                </div>

                {/* History Search Bar */}
                <form onSubmit={handleSearchSubmit} className="flex gap-2 max-w-md w-full sm:w-auto">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search history..."
                      value={historySearch}
                      onChange={(e) => setHistorySearch(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 border border-purple-100 dark:border-gray-700 rounded-xl bg-purple-50/30 dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-300 text-sm dark:text-white"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-xl text-sm font-semibold transition"
                  >
                    Search
                  </button>
                </form>
              </div>

              {/* History list */}
              {historyLoading ? (
                <div className="flex justify-center items-center py-12">
                  <Loader2 className="animate-spin w-8 h-8 text-purple-500" />
                </div>
              ) : historyLogs.length === 0 ? (
                <div className="text-center py-10 border border-dashed border-gray-200 rounded-2xl bg-gray-50/50">
                  <Pill className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 font-medium text-sm">No recent scans found.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {historyLogs.map((log) => (
                    <div
                      key={log._id}
                      onClick={() => handleSelectLog(log)}
                      className="group flex items-center justify-between p-4 border border-purple-50 dark:border-gray-700 hover:border-purple-200 dark:hover:border-purple-500 hover:bg-purple-50/30 dark:hover:bg-gray-700/50 rounded-2xl cursor-pointer transition-all"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                          <Pill className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-bold text-gray-800 dark:text-gray-200 text-sm sm:text-base truncate group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                            {log.medicine}
                          </h4>
                          <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm truncate">
                            {log.generic} {log.composition ? `• ${log.composition}` : ""}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 flex-shrink-0">
                        <div className="hidden sm:block text-right">
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-800">
                            {log.confidence}% Match
                          </span>
                          <p className="text-gray-400 text-xs mt-1">
                            {new Date(log.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <button
                          onClick={(e) => handleDeleteLog(log._id, e)}
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition"
                          aria-label="Delete History Entry"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  ))}

                  {/* Pagination Controls */}
                  {historyTotalPages > 1 && (
                    <div className="flex items-center justify-center gap-4 mt-6">
                      <button
                        onClick={() => handlePageChange(historyPage - 1)}
                        disabled={historyPage === 1}
                        className="p-2 border border-purple-100 hover:bg-purple-50 rounded-xl text-gray-600 disabled:opacity-50 disabled:hover:bg-transparent"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      <span className="text-sm font-semibold text-gray-700">
                        Page {historyPage} of {historyTotalPages}
                      </span>
                      <button
                        onClick={() => handlePageChange(historyPage + 1)}
                        disabled={historyPage === historyTotalPages}
                        className="p-2 border border-purple-100 hover:bg-purple-50 rounded-xl text-gray-600 disabled:opacity-50 disabled:hover:bg-transparent"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Camera Capture Modal overlay */}
          {cameraOpen && (
            <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 sm:p-8 w-full max-w-2xl shadow-2xl relative">
                <h2 className="text-xl sm:text-3xl font-bold text-center mb-6 text-gray-800 dark:text-white">
                  Capture Medicine
                </h2>
                <div className="relative overflow-hidden rounded-2xl bg-black aspect-video flex items-center justify-center">
                  <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                </div>
                <canvas ref={canvasRef} className="hidden" />
                <div className="flex justify-center gap-4 mt-6">
                  <button
                    onClick={takePhoto}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl font-bold transition flex items-center gap-2"
                  >
                    📸 Take Photo
                  </button>
                  <button
                    onClick={closeCamera}
                    className="border border-gray-300 text-gray-600 px-6 py-3 rounded-xl font-semibold hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}