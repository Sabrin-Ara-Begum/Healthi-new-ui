import { useState } from "react";
import { Search, MapPin } from "lucide-react";
import Header from "@/react-app/components/Header";

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

const doctors: Doctor[] = [
  {
    id: 1,
    name: "Dr. Anya Sharma",
    specialty: "Pediatrics",

    hospital: "City Hospital",

    location: "Guwahati",

    phone: "+91 98765 43210",

    experience: "12 Years",

    qualification: "MBBS, MD (Pediatrics)",

    rating: 4.9,

    fee: "₹600",

    availability: "Mon - Sat",

    languages: ["English", "Hindi", "Assamese"],

    image: "https://i.pravatar.cc/150?img=32",

    mapsUrl: "https://maps.google.com",
  },

  {
    id: 2,
    name: "Dr. Sofia Chen",
    specialty: "Dermatology",

    hospital: "Skin Care Clinic",

    location: "Silchar",

    phone: "+91 98765 11111",

    experience: "9 Years",

    qualification: "MBBS, MD (Dermatology)",

    rating: 4.8,

    fee: "₹700",

    availability: "Mon - Fri",

    languages: ["English", "Hindi"],

    image: "https://i.pravatar.cc/150?img=48",

    mapsUrl: "https://maps.google.com",
  },
];
const specialties = [
  "All",
  "General",
  "Cardiology",
  "Neurology",
  "Dermatology",
  "ENT",
  "Pediatrics",
  "Orthopedics",
  "Gynecology",
];

export default function FindDoctor({ onNotificationClick }: FindDoctorProps) {
  const [search, setSearch] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState("All");
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);

 const filteredDoctors = doctors.filter((doctor) => {
  const query = search.toLowerCase();

  const matchesSearch =
    doctor.name.toLowerCase().includes(query) ||
    doctor.specialty.toLowerCase().includes(query) ||
    doctor.location.toLowerCase().includes(query);

  const matchesSpecialty =
    selectedSpecialty === "All" ||
    doctor.specialty === selectedSpecialty;

  return matchesSearch && matchesSpecialty;
});
  return (
    <div className="flex-1 overflow-auto">
      <Header onNotificationClick={onNotificationClick} />

      <div className="mb-8">
  <h1 className="text-4xl font-bold text-gray-800">
    Find the Right Doctor
  </h1>

  <p className="text-gray-500 mt-2 text-lg">
    Search specialists, hospitals and clinics recommended for your health.
  </p>

        {/* Search */}
        <div className="mb-6 relative">
          <Search className="absolute left-4 top-4 w-5 h-5 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search doctor, specialty or hospital..."
            className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200"
          />
        </div>
        <div className="flex flex-wrap gap-3 mb-8">
  {specialties.map((specialty) => (
    <button
  key={specialty}
  onClick={() =>
    setSelectedSpecialty(
      selectedSpecialty === specialty ? "All" : specialty
    )
  }
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
<div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-3xl p-8 mb-10 shadow-lg">

  <h2 className="text-2xl font-bold">
    ✨ AI Recommendation
  </h2>

  <p className="mt-3 opacity-90">
    Based on your recent symptom analysis.
  </p>

  <div className="bg-white/20 rounded-2xl p-5 mt-6">

    <p className="text-lg font-semibold">
      Recommended Specialist
    </p>

    <h3 className="text-3xl font-bold mt-2">
      General Physician
    </h3>

    <p className="mt-3">
      Your symptoms suggest starting with a General Physician.
      They can evaluate your condition and refer you to a specialist if needed.
    </p>

    <button className="mt-6 bg-white text-purple-700 px-6 py-3 rounded-xl font-semibold hover:bg-gray-100">
      View Doctors
    </button>

  </div>

</div>

        {/* Doctor Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
  {filteredDoctors.length > 0 ? (
    filteredDoctors.map((doctor) => (
      <div
        key={doctor.id}
        className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm"
      >
        <h3 className="text-lg font-bold">{doctor.name}</h3>

        <p className="text-gray-600">{doctor.specialty}</p>

        <div className="flex items-center gap-2 mt-2 text-gray-500">
          <MapPin className="w-4 h-4" />
          {doctor.location}
        </div>

        <p className="mt-2 text-gray-500">{doctor.phone}</p>

        <div className="mt-3 space-y-2 text-sm text-gray-600">
          <p>⭐ {doctor.rating} Rating</p>
          <p>🩺 {doctor.experience} Experience</p>
          <p>💰 {doctor.fee}</p>
        </div>

        <div className="flex gap-3 mt-5">
         <button
  onClick={() => setSelectedDoctor(doctor)}
  className="flex-1 border border-purple-300 rounded-xl py-2 hover:bg-purple-50"
>
  View Profile
</button>

          <button className="flex-1 bg-purple-500 text-white rounded-xl py-2 hover:bg-purple-600">
            Book
          </button>
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