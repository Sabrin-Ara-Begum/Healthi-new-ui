import { useEffect, useState } from "react";
import { Search, MapPin, UserCircle2, ArrowLeft, Heart } from "lucide-react";
import { useNavigate } from "react-router";
import Header from "@/react-app/components/Header";
import { findDoctors, getBookmarks, bookmarkDoctor, removeBookmark } from "@/react-app/api/doctorsApi";
import { useApp } from "@/react-app/lib/AppContext";

interface FindDoctorProps {
  onNotificationClick: () => void;
}

interface Doctor {
  id: string;
  name: string;
  specialty: string;
  hospital: string;
  location: string;
  phone: string;
  experience: string;
  qualification: string;
  rating: number;
  fee: string;
  availability: string;
  languages: string | string[];
  image: string;
  mapsUrl: string;
}

const specialties = [
  "All",
  "General Physician",
  "Cardiologist",
  "Neurologist",
  "Dermatologist",
  "ENT Specialist",
  "Pediatrician",
  "Orthopedic Surgeon",
  "Gynecologist",
];

export default function FindDoctor({ onNotificationClick }: FindDoctorProps) {
  const navigate = useNavigate();
  const { user, fetchNotifications } = useApp();

  const [search, setSearch] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState("All");
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(false);
  const [userLocation, setUserLocation] = useState("Sivasagar");
  
  const [bookmarks, setBookmarks] = useState<any[]>([]);

  useEffect(() => {
    const specialist = localStorage.getItem("recommendedSpecialist");
    if (specialist) {
      setSearch(specialist);
      setSelectedSpecialty(specialist);
      localStorage.removeItem("recommendedSpecialist");
      setTimeout(() => fetchDoctorsApi(specialist, userLocation), 100);
    }
  }, [userLocation]);

  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          const data = await response.json();
          const city =
            data.address.city ||
            data.address.town ||
            data.address.village ||
            "Sivasagar";
          setUserLocation(city);
        } catch {
          setUserLocation("Sivasagar");
        }
      },
      () => {
        setUserLocation("Sivasagar");
      }
    );
  }, []);

  const loadBookmarks = async () => {
    if (!user?.email) return;
    try {
      const data = await getBookmarks(user.email);
      setBookmarks(data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    loadBookmarks();
  }, [user?.email]);

  const fetchDoctorsApi = async (specialtyQuery: string, loc: string) => {
    if (!specialtyQuery.trim()) return;
    try {
      setLoading(true);
      const data = await findDoctors(specialtyQuery === "All" ? "Doctor" : specialtyQuery, loc);
      setDoctors(data.doctors || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchClick = () => {
    fetchDoctorsApi(search || selectedSpecialty, userLocation);
  };

  const handleBookmarkToggle = async (doc: Doctor) => {
    if (!user?.email) {
      alert("Please login to bookmark doctors.");
      return;
    }
    
    const existing = bookmarks.find((b) => b.doctorId === doc.id);
    try {
      if (existing) {
        await removeBookmark(existing._id);
      } else {
        await bookmarkDoctor({
          email: user.email,
          doctorId: doc.id,
          name: doc.name,
          specialty: doc.specialty,
          location: doc.location,
          hospital: doc.hospital,
          mapsUrl: doc.mapsUrl,
          rating: doc.rating,
          experience: doc.experience,
          fee: doc.fee,
          availability: doc.availability,
          phone: doc.phone
        });
      }
      await loadBookmarks();
      fetchNotifications();
    } catch (error) {
      console.error(error);
      alert("Failed to update bookmark.");
    }
  };

  const filteredDoctors = doctors.filter((doctor) => {
    const query = search.toLowerCase();
    if (!query) return true;
    return (
      doctor.name.toLowerCase().includes(query) ||
      doctor.specialty.toLowerCase().includes(query) ||
      doctor.location.toLowerCase().includes(query) ||
      doctor.hospital.toLowerCase().includes(query)
    );
  });

  const quotes = [
    { quote: "Your body hears everything your mind says.", author: "Naomi Judd" },
    { quote: "Health is not valued till sickness comes.", author: "Thomas Fuller" },
    { quote: "Take care of your body. It's the only place you have to live.", author: "Jim Rohn" },
    { quote: "A healthy outside starts from the inside.", author: "Robert Urich" },
    { quote: "The greatest wealth is health.", author: "Virgil" },
    { quote: "Every small healthy habit compounds into a healthier life.", author: "Healthi" },
    { quote: "Drink water, move your body, and rest well. Your future self will thank you.", author: "Healthi" },
    { quote: "Healing isn't a race. Give yourself the time you deserve.", author: "Healthi" },
  ];

  const today = new Date().getDate();
  const dailyQuote = quotes[today % quotes.length];

  return (
    <div className="flex-1 overflow-auto bg-gray-50/50 dark:bg-gray-900 transition-colors duration-300 pb-20">
      <Header onNotificationClick={onNotificationClick} />

      <div className="px-6 py-4 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border-b border-[#DCD2FD]/30 dark:border-gray-700 sticky top-0 z-10">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white transition-colors font-medium"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back</span>
        </button>
      </div>

      <div className="px-4 sm:px-10 py-8 space-y-8 max-w-7xl mx-auto">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 dark:text-white">
            Find the Right Doctor
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2 text-lg">
            Search specialists, hospitals and clinics recommended for your health.
          </p>
          <p className="text-sm text-purple-600 dark:text-purple-400 mt-2 flex items-center gap-1">
            <MapPin className="w-4 h-4" /> Searching doctors near <strong>{userLocation}</strong>
          </p>
        </div>

        {/* Search */}
        <div className="flex flex-col sm:flex-row items-center gap-3 mb-6">
          <div className="relative flex-1 w-full max-w-xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              disabled={loading}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !loading) {
                  handleSearchClick();
                }
              }}
              placeholder="Search doctor or specialty..."
              className="w-full pl-12 pr-4 py-3 sm:py-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-400 shadow-sm"
            />
          </div>
          <button
            onClick={handleSearchClick}
            disabled={loading}
            className={`w-full sm:w-auto px-8 py-3 sm:py-4 rounded-xl font-bold transition shadow-md whitespace-nowrap ${
              loading
                ? "bg-gray-400 text-white cursor-not-allowed"
                : "bg-purple-600 text-white hover:bg-purple-700"
            }`}
          >
            {loading ? "Searching..." : "Search"}
          </button>
        </div>

        <div className="flex flex-wrap gap-2 sm:gap-3 mb-8">
          {specialties.map((specialty) => (
            <button
              key={specialty}
              onClick={() => {
                if (selectedSpecialty === specialty) {
                  setSelectedSpecialty("All");
                  setSearch("");
                } else {
                  setSelectedSpecialty(specialty);
                  setSearch(specialty);
                  fetchDoctorsApi(specialty, userLocation);
                }
              }}
              className={`px-4 py-2 sm:px-5 sm:py-2.5 rounded-full text-sm sm:text-base font-medium transition shadow-sm ${
                selectedSpecialty === specialty
                  ? "bg-purple-600 text-white border border-purple-600"
                  : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-purple-50 dark:hover:bg-gray-700"
              }`}
            >
              {specialty}
            </button>
          ))}
        </div>

        {loading && (
          <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-xl p-6 text-center animate-pulse">
            <div className="w-10 h-10 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-purple-800 dark:text-purple-300 font-medium">Searching nearby doctors...</p>
            <p className="text-sm text-purple-600/70 dark:text-purple-400 mt-1">Please wait a few seconds.</p>
          </div>
        )}

        {/* Doctor Cards */}
        <div id="doctor-list" className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredDoctors.length > 0 ? (
            filteredDoctors.map((doctor) => {
              const isBookmarked = bookmarks.some((b) => b.doctorId === doctor.id);
              
              return (
                <div
                  key={doctor.id}
                  className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow relative flex flex-col h-full"
                >
                  <button 
                    onClick={() => handleBookmarkToggle(doctor)}
                    className="absolute top-4 right-4 p-2 rounded-full bg-gray-50 dark:bg-gray-700 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors group"
                  >
                    <Heart 
                      className={`w-5 h-5 transition-colors ${isBookmarked ? 'fill-red-500 text-red-500' : 'text-gray-400 group-hover:text-red-400'}`} 
                    />
                  </button>

                  <div className="flex gap-4 items-start mb-4">
                    {doctor.image ? (
                      <img
                        src={doctor.image}
                        alt={doctor.name}
                        className="w-16 h-16 rounded-full object-cover border-2 border-purple-200 shadow-sm shrink-0"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-purple-50 dark:bg-gray-700 flex items-center justify-center border-2 border-purple-100 dark:border-gray-600 shrink-0">
                        <UserCircle2 className="w-8 h-8 text-purple-300 dark:text-gray-400" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0 pr-8">
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white truncate">
                        {doctor.name}
                      </h3>
                      <p className="text-purple-600 dark:text-purple-400 font-semibold text-sm truncate">
                        {doctor.specialty}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 truncate">
                        {doctor.hospital}
                      </p>
                    </div>
                  </div>

                  <a
                    href={doctor.mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 hover:underline mb-5 w-fit"
                  >
                    <MapPin className="w-4 h-4 shrink-0" />
                    <span className="truncate">{doctor.location}</span>
                  </a>

                  <div className="grid grid-cols-2 gap-2 mt-auto mb-5">
                    <div className="bg-purple-50 dark:bg-gray-700/50 rounded-xl p-2.5 text-center">
                      <p className="text-[10px] uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-0.5">Rating</p>
                      <p className="font-bold text-gray-800 dark:text-gray-200 text-sm">⭐ {doctor.rating}</p>
                    </div>
                    <div className="bg-blue-50 dark:bg-gray-700/50 rounded-xl p-2.5 text-center">
                      <p className="text-[10px] uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-0.5">Exp</p>
                      <p className="font-bold text-gray-800 dark:text-gray-200 text-sm truncate">{doctor.experience}</p>
                    </div>
                    <div className="bg-green-50 dark:bg-gray-700/50 rounded-xl p-2.5 text-center">
                      <p className="text-[10px] uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-0.5">Fee</p>
                      <p className="font-bold text-gray-800 dark:text-gray-200 text-sm">{doctor.fee}</p>
                    </div>
                    <div className="bg-orange-50 dark:bg-gray-700/50 rounded-xl p-2.5 text-center">
                      <p className="text-[10px] uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-0.5">Avail</p>
                      <p className="font-bold text-gray-800 dark:text-gray-200 text-sm truncate">{doctor.availability}</p>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-auto">
                    <button
                      onClick={() => setSelectedDoctor(doctor)}
                      className="flex-1 border border-purple-300 dark:border-purple-600 text-purple-700 dark:text-purple-300 rounded-xl py-2 font-semibold hover:bg-purple-50 dark:hover:bg-purple-900/30 transition text-sm"
                    >
                      View Profile
                    </button>
                    {doctor.phone ? (
                      <a
                        href={`tel:${doctor.phone}`}
                        className="flex-1 bg-purple-600 text-white rounded-xl py-2 flex items-center justify-center font-semibold hover:bg-purple-700 transition shadow-sm text-sm"
                      >
                        📞 Call
                      </a>
                    ) : (
                      <button disabled className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 rounded-xl py-2 flex items-center justify-center font-semibold text-sm cursor-not-allowed">
                        📞 N/A
                      </button>
                    )}
                    
                    {doctor.phone && (
                      <a
                        href={`https://wa.me/${doctor.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent("Hello Doctor, I found your profile through Healthi AI and would like to book an appointment. Could you please let me know your available timings?")}`}
                        target="_blank" rel="noopener noreferrer"
                        className="shrink-0 w-10 h-10 bg-green-500 hover:bg-green-600 text-white rounded-xl flex items-center justify-center transition shadow-sm"
                        title="WhatsApp Appointment"
                      >
                        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                        </svg>
                      </a>
                    )}
                  </div>
                </div>
              );
            })
          ) : search && !loading ? (
            <div className="col-span-full bg-white dark:bg-gray-800 rounded-3xl p-12 text-center shadow-sm border border-gray-100 dark:border-gray-700">
              <div className="text-5xl mb-4">🩺</div>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                No Doctors Found
              </h2>
              <p className="text-gray-500 dark:text-gray-400 mt-2">
                Try searching with another specialty or location.
              </p>
            </div>
          ) : null}
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-pink-500 text-white rounded-3xl p-8 sm:p-10 shadow-lg relative overflow-hidden mt-12">
          <div className="absolute top-0 right-0 -mr-8 -mt-8 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl mix-blend-overlay"></div>
          <div className="relative z-10 text-center">
            <h2 className="text-2xl sm:text-3xl font-bold flex items-center justify-center gap-2">
              <Heart className="w-8 h-8 fill-white" /> Daily Health Motivation
            </h2>
            <p className="mt-2 opacity-90 text-purple-100">
              A small reminder from Healthi
            </p>
          </div>
          <div className="relative z-10 bg-white/20 backdrop-blur-md rounded-2xl p-6 sm:p-8 mt-8 border border-white/20">
            <p className="text-xl sm:text-2xl italic leading-relaxed text-center font-medium">
              "{dailyQuote.quote}"
            </p>
            <p className="mt-6 text-right font-semibold text-lg opacity-90">
              — {dailyQuote.author}
            </p>
          </div>
        </div>

        <div className="mt-8 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/30 rounded-3xl p-6 sm:p-8 shadow-sm">
          <h2 className="text-xl font-bold text-red-600 dark:text-red-400 flex items-center gap-2">
            🚨 Emergency?
          </h2>
          <p className="mt-3 text-gray-700 dark:text-gray-300 leading-relaxed font-medium">
            If you experience chest pain, difficulty breathing,
            severe bleeding or loss of consciousness,
            please visit the nearest emergency department immediately or dial emergency services.
          </p>
        </div>

        {selectedDoctor && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-3xl w-full max-w-md p-6 sm:p-8 shadow-2xl relative animate-in zoom-in-95 duration-200 overflow-y-auto max-h-[90vh]">
              <button
                onClick={() => setSelectedDoctor(null)}
                className="absolute right-4 top-4 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 bg-gray-100 dark:bg-gray-700 rounded-full transition"
              >
                ✕
              </button>

              <div className="flex flex-col items-center text-center mt-2">
                {selectedDoctor.image ? (
                  <img
                    src={selectedDoctor.image}
                    className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover shadow-md border-4 border-white dark:border-gray-800 -mt-12"
                  />
                ) : (
                  <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-purple-100 dark:bg-gray-700 flex items-center justify-center shadow-md border-4 border-white dark:border-gray-800 -mt-12">
                    <UserCircle2 className="w-12 h-12 text-purple-300 dark:text-gray-400" />
                  </div>
                )}
                
                <h2 className="text-2xl font-bold mt-4 text-gray-900 dark:text-white">
                  {selectedDoctor.name}
                </h2>
                <p className="text-purple-600 dark:text-purple-400 font-semibold mt-1">
                  {selectedDoctor.specialty}
                </p>
                <div className="flex items-center gap-2 mt-2">
                   <span className="bg-yellow-100 text-yellow-800 text-xs font-bold px-2 py-0.5 rounded flex items-center gap-1">⭐ {selectedDoctor.rating}</span>
                </div>
              </div>

              <div className="mt-8 space-y-4 text-sm">
                <div className="flex gap-3 items-start">
                  <div className="w-8 h-8 rounded-full bg-purple-50 dark:bg-gray-700 flex items-center justify-center shrink-0">🏥</div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">{selectedDoctor.hospital}</p>
                    <p className="text-gray-500 dark:text-gray-400 text-xs">{selectedDoctor.location}</p>
                  </div>
                </div>
                <div className="flex gap-3 items-center">
                   <div className="w-8 h-8 rounded-full bg-purple-50 dark:bg-gray-700 flex items-center justify-center shrink-0">🎓</div>
                   <p className="font-medium text-gray-700 dark:text-gray-200">{selectedDoctor.qualification}</p>
                </div>
                <div className="flex gap-3 items-center">
                   <div className="w-8 h-8 rounded-full bg-purple-50 dark:bg-gray-700 flex items-center justify-center shrink-0">🩺</div>
                   <p className="font-medium text-gray-700 dark:text-gray-200">{selectedDoctor.experience} Experience</p>
                </div>
                <div className="flex gap-3 items-center">
                   <div className="w-8 h-8 rounded-full bg-purple-50 dark:bg-gray-700 flex items-center justify-center shrink-0">💰</div>
                   <p className="font-medium text-gray-700 dark:text-gray-200">{selectedDoctor.fee} per Consultation</p>
                </div>
                <div className="flex gap-3 items-center">
                   <div className="w-8 h-8 rounded-full bg-purple-50 dark:bg-gray-700 flex items-center justify-center shrink-0">🕒</div>
                   <p className="font-medium text-gray-700 dark:text-gray-200">{selectedDoctor.availability}</p>
                </div>
                <div className="flex gap-3 items-center">
                   <div className="w-8 h-8 rounded-full bg-purple-50 dark:bg-gray-700 flex items-center justify-center shrink-0">🌐</div>
                   <p className="font-medium text-gray-700 dark:text-gray-200">
                     {Array.isArray(selectedDoctor.languages) ? selectedDoctor.languages.join(", ") : selectedDoctor.languages}
                   </p>
                </div>
              </div>

              <div className="flex gap-2 mt-8">
                <button 
                  onClick={() => handleBookmarkToggle(selectedDoctor)}
                  className={`p-3 rounded-xl border flex items-center justify-center transition-colors ${
                    bookmarks.some(b => b.doctorId === selectedDoctor.id) 
                      ? 'bg-red-50 border-red-200 text-red-500 dark:bg-red-900/20 dark:border-red-800' 
                      : 'border-gray-200 dark:border-gray-700 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  <Heart className={bookmarks.some(b => b.doctorId === selectedDoctor.id) ? "fill-current" : ""} />
                </button>
                {selectedDoctor.phone ? (
                  <a href={`tel:${selectedDoctor.phone}`} className="flex-1 bg-purple-600 hover:bg-purple-700 text-white rounded-xl py-3 flex items-center justify-center font-bold shadow-md transition">
                    📞 Call
                  </a>
                ) : (
                  <button disabled className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 rounded-xl py-3 flex items-center justify-center font-bold shadow-sm transition cursor-not-allowed">
                    📞 Not Available
                  </button>
                )}
                
                {selectedDoctor.phone && (
                  <a
                    href={`https://wa.me/${selectedDoctor.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent("Hello Doctor, I found your profile through Healthi AI and would like to book an appointment. Could you please let me know your available timings?")}`}
                    target="_blank" rel="noopener noreferrer"
                    className="shrink-0 w-12 h-12 bg-green-500 hover:bg-green-600 text-white rounded-xl flex items-center justify-center transition shadow-md"
                    title="WhatsApp Appointment"
                  >
                    <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg>
                  </a>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}