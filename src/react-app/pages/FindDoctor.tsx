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
  location: string;
  contact: string;
}

const doctors: Doctor[] = [
  {
    id: 1,
    name: "Dr. Anya Sharma",
    specialty: "Pediatrics",
    location: "City Hospital",
    contact: "+91 98765 43210",
  },
  {
    id: 2,
    name: "Dr. Sofia Chen",
    specialty: "Dermatology",
    location: "Skin Care Clinic",
    contact: "+91 98765 11111",
  },
];

export default function FindDoctor({ onNotificationClick }: FindDoctorProps) {
  const [search, setSearch] = useState("");

  const filteredDoctors = doctors.filter((d) =>
    d.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex-1 overflow-auto">
      <Header onNotificationClick={onNotificationClick} />

      <div className="px-8 py-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-8">
          Find Your Specialist
        </h1>

        {/* Search */}
        <div className="mb-6 relative">
          <Search className="absolute left-4 top-4 w-5 h-5 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search doctor..."
            className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200"
          />
        </div>

        {/* Doctor Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredDoctors.map((doctor) => (
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

              <p className="mt-2 text-gray-500">{doctor.contact}</p>

              <button className="mt-4 w-full bg-purple-500 text-white py-2 rounded-lg">
                Book Appointment
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}