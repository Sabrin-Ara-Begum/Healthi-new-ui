import { useEffect, useState } from "react";
import { Search, MapPin } from "lucide-react";
import Header from "@/react-app/components/Header";
import { UserCircle2 } from "lucide-react";

interface FindDoctorProps {
  onNotificationClick: () => void;
}
interface Doctor {
  id: number;
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

  languages: string[];

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
  const [search, setSearch] = useState("");
  useEffect(() => {
const specialist = localStorage.getItem("recommendedSpecialist");

if (specialist) {
setSearch(specialist);
localStorage.removeItem("recommendedSpecialist");
}
}, []);
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

const fetchDoctors = async () => {
  if (!search.trim()) return;

  try {
    setLoading(true);
    console.log("Searching:", {
      specialty: search,
      location: userLocation,
    });

    const response = await fetch("http://localhost:5001/api/doctors/find", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
  specialty: search,
  location: userLocation,
}),
    });

    const data = await response.json();

    console.log("Doctors:", data);

    setDoctors(data.doctors || []);
  } catch (err) {
    console.error(err);
  } finally {
    setLoading(false);
  }
};
  const [selectedSpecialty, setSelectedSpecialty] = useState("All");
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(false);
  const [userLocation, setUserLocation] = useState("Sivasagar");
  const filteredDoctors = doctors.filter((doctor) => {
const query = search.toLowerCase();

return (
doctor.name.toLowerCase().includes(query) ||
doctor.specialty.toLowerCase().includes(query) ||
doctor.location.toLowerCase().includes(query) ||
doctor.hospital.toLowerCase().includes(query)
);
});
const quotes = [
  {
    quote: "Your body hears everything your mind says.",
    author: "Naomi Judd",
  },
  {
    quote: "Health is not valued till sickness comes.",
    author: "Thomas Fuller",
  },
  {
    quote: "Take care of your body. It's the only place you have to live.",
    author: "Jim Rohn",
  },
  {
    quote: "A healthy outside starts from the inside.",
    author: "Robert Urich",
  },
  {
    quote: "The greatest wealth is health.",
    author: "Virgil",
  },
  {
    quote: "Every small healthy habit compounds into a healthier life.",
    author: "Healthi",
  },
  {
    quote: "Drink water, move your body, and rest well. Your future self will thank you.",
    author: "Healthi",
  },
  {
    quote: "Healing isn't a race. Give yourself the time you deserve.",
    author: "Healthi",
  },
];

const today = new Date().getDate();
const dailyQuote = quotes[today % quotes.length];

  return (
    <div className="flex-1 overflow-auto">
      <Header onNotificationClick={onNotificationClick} />

<div className="px-10 py-8 space-y-8 max-w-7xl mx-auto">
  <h1 className="text-4xl font-bold text-gray-800">
    Find the Right Doctor
  </h1>

  <p className="text-gray-500 mt-2 text-lg">
    Search specialists, hospitals and clinics recommended for your health.
  </p>
  <p className="text-sm text-purple-600 mt-2">
📍 Searching doctors near <strong>{userLocation}</strong>
</p>

        {/* Search */}
      <div className="flex items-center gap-3 mb-6">

<div className="relative flex-1 max-w-xl">
<Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />

<input
disabled={loading}
  value={search}
  onChange={(e) => setSearch(e.target.value)}
  onKeyDown={(e) => {
  if (e.key === "Enter" && !loading) {
    fetchDoctors();
  }
}}
    placeholder="Search doctor or specialty..."
  className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-400"/>
  
</div>

<button
  onClick={fetchDoctors}
  disabled={loading}
  className={`px-6 py-3 rounded-xl transition ${
    loading
      ? "bg-gray-400 cursor-not-allowed"
      : "bg-purple-500 text-white hover:bg-purple-600"
  }`}
>
  {loading ? "Searching..." : "Search"}
</button>

</div>
        <div className="flex flex-wrap gap-3 mb-8">
{specialties.map((specialty) => (
<button
  key={specialty}
  onClick={() => {
    if (selectedSpecialty === specialty) {
      setSelectedSpecialty("All");
      setSearch("");
      setDoctors([]);
    } else {
  setSelectedSpecialty(specialty);
  setSearch(specialty);

  setTimeout(() => {
    fetchDoctors();
  }, 0);
}
 setLoading(true);
 }}
  className={`px-5 py-2 rounded-full transition ${
    selectedSpecialty === specialty
      ? "bg-purple-500 text-white"
      : "bg-white border border-purple-200 hover:bg-purple-100"
  }`}
>
  {specialty}
</button>
))}
</div>
{loading && (
<div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
🔎 Searching nearby doctors...

Please wait a few seconds.
</div>
)}

        {/* Doctor Cards */}
    <div
id="doctor-list"
className="grid grid-cols-1 md:grid-cols-2 gap-6">
  {filteredDoctors.length > 0 ? (
    filteredDoctors.map((doctor) => (
      <div
        key={doctor.id}
        className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm"
      >
        <div className="flex justify-between items-start">

<div>

  <h3 className="text-xl font-bold">
    {doctor.name}
  </h3>

  <p className="text-purple-600 font-semibold">
    {doctor.specialty}
  </p>

  <p className="text-sm text-gray-500">
    {doctor.hospital}
  </p>

</div>
{doctor.image ? (
  <img
    src={doctor.image}
    alt={doctor.name}
    className="w-16 h-16 rounded-full object-cover border-2 border-purple-200"/>
) : (
  <UserCircle2 className="w-16 h-16 text-gray-400" />
)}
</div>

<a
  href={doctor.mapsUrl}
  target="_blank"
  rel="noopener noreferrer"
  className="flex items-center gap-2 mt-4 text-blue-600 hover:underline"
>
  <MapPin className="w-4 h-4" />
  <span>{doctor.location}</span>
</a>

<div className="grid grid-cols-2 gap-3 mt-5">

<div className="bg-purple-50 rounded-xl p-3 text-center">
  <p className="text-xs text-gray-500">Rating</p>
  <p className="font-bold">⭐ {doctor.rating}</p>
</div>

<div className="bg-blue-50 rounded-xl p-3 text-center">
  <p className="text-xs text-gray-500">Experience</p>
  <p className="font-bold">{doctor.experience}</p>
</div>

<div className="bg-green-50 rounded-xl p-3 text-center">
  <p className="text-xs text-gray-500">Consultation</p>
  <p className="font-bold">{doctor.fee}</p>
</div>

<div className="bg-orange-50 rounded-xl p-3 text-center">
  <p className="text-xs text-gray-500">Available</p>
  <p className="font-bold">{doctor.availability}</p>
</div>

</div>

        <div className="flex gap-3 mt-5">
        <button
  onClick={() => setSelectedDoctor(doctor)}
  className="flex-1 border border-purple-300 rounded-xl py-2 hover:bg-purple-50"
>
  View Profile
</button>

          <a
href={`tel:${doctor.phone}`}
className="flex-1 bg-purple-500 text-white rounded-xl py-2 text-center hover:bg-purple-600"
>
📞 Call
</a>
        </div>
      </div>
    ))
  ) : (
    <div className="col-span-full bg-white rounded-2xl p-10 text-center shadow-sm">
      <div className="text-6xl mb-4">🔍</div>

      <h2 className="text-2xl font-bold">
        No Doctors Found
      </h2>

      <p className="text-gray-500 mt-2">
        Try searching with another specialty or hospital.
      </p>
    </div>
  )}
</div>
<div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-3xl p-8 shadow-lg">

  <div className="text-center">

    <h2 className="text-3xl font-bold">
      💜 Daily Health Motivation
    </h2>

    <p className="mt-3 opacity-90">
      A small reminder from Healthi
    </p>

  </div>

  <div className="bg-white/20 rounded-2xl p-8 mt-8">

    <p className="text-2xl italic leading-relaxed text-center">
      "{dailyQuote.quote}"
    </p>

    <p className="mt-8 text-right font-semibold text-lg">
      — {dailyQuote.author}
    </p>

  </div>

</div>

        <div className="mt-10 bg-red-50 border border-red-200 rounded-3xl p-6">

  <h2 className="text-xl font-bold text-red-600">
    🚨 Emergency?
  </h2>

  <p className="mt-3 text-gray-700">
    If you experience chest pain, difficulty breathing,
    severe bleeding or loss of consciousness,
    please visit the nearest emergency department immediately.
  </p>

</div>
{selectedDoctor && (
  <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

    <div className="bg-white rounded-3xl w-[500px] p-8 shadow-2xl relative">

      <button
        onClick={() => setSelectedDoctor(null)}
        className="absolute right-5 top-5 text-xl"
      >
        ✕
      </button>

      <div className="flex flex-col items-center">

        <img
  src={selectedDoctor.image}
          className="w-28 h-28 rounded-full"
        />

        <h2 className="text-2xl font-bold mt-4">
          {selectedDoctor.name}
        </h2>

        <p className="text-purple-600 font-semibold">
          {selectedDoctor.specialty}
        </p>

      </div>

      <div className="mt-6 space-y-3">

        <p>⭐ {selectedDoctor.rating}</p>

        <p>🏥 🏥 {selectedDoctor.hospital}</p>

        <p>🩺 {selectedDoctor.experience}</p>

        <p>💰 {selectedDoctor.fee}</p>

        <p>📞 📞 {selectedDoctor.phone}</p>
        <p>🎓 {selectedDoctor.qualification}</p>

<p>🕒 {selectedDoctor.availability}</p>

<p>
  🌐 {selectedDoctor.languages.join(", ")}
</p>

      </div>

      <div className="flex gap-3 mt-8">

        <button className="flex-1 bg-purple-500 text-white rounded-xl py-3">
          Book Appointment
        </button>

        <button className="flex-1 border rounded-xl py-3">
          Call
        </button>

      </div>

    </div>

  </div>
)}
      </div>
    </div>
  );
}