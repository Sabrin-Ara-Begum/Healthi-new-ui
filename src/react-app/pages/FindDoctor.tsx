import { useState } from 'react';
import { Search, MapPin, Phone, Clock } from 'lucide-react';
import Header from '@/react-app/components/Header';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icons in React-Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface FindDoctorProps {
  onNotificationClick: () => void;
}

interface Doctor {
  id: number;
  name: string;
  specialty: string;
  location: string;
  distance: string;
  available: string;
  contact: string;
  avatar: string;
  position: [number, number];
}

const mockDoctors: Doctor[] = [
  {
    id: 1,
    name: 'Dr. Anya Sharma',
    specialty: 'Pedatrics',
    location: '123 Health Ave',
    distance: '5.2 km',
    available: 'Mon-Fri, 9:00-17:00',
    contact: '(555) 123 4567',
    avatar: '👩‍⚕️',
    position: [40.7589, -73.9851]
  },
  {
    id: 2,
    name: 'Dr. Sofia Chen',
    specialty: 'Pedatrics',
    location: '456 Skin Clinic',
    distance: '8.9 km',
    available: 'Mon, Wed Fri: 8:07-16:07',
    contact: '(555) 987-8901',
    avatar: '👨‍⚕️',
    position: [40.7489, -73.9681]
  }
];

export default function FindDoctor({ onNotificationClick }: FindDoctorProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('current');
  const [doctors] = useState<Doctor[]>(mockDoctors);

  return (
    <div className="flex-1 overflow-auto">
      <Header onNotificationClick={onNotificationClick} />

      <div className="px-8 py-8">
        {/* Title */}
        <h1 className="text-4xl font-bold text-gray-800 mb-8">
          Find Your Specialist
        </h1>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Speciality, Doctor, or Condition"
              className="w-full pl-14 pr-6 py-4 rounded-2xl bg-white/80 border border-[#DCD2FD]/40 focus:outline-none focus:ring-2 focus:ring-[#B9A9FB]/50 text-gray-700 placeholder-gray-400"
            />
          </div>
        </div>

        {/* Location Dropdown and Map Container */}
        <div className="bg-white/70 backdrop-blur-sm rounded-3xl overflow-hidden border border-[#DCD2FD]/30 shadow-sm mb-6">
          {/* Location Selector */}
          <div className="p-6 pb-0">
            <div className="relative inline-block w-64">
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="w-full px-4 py-3 pr-10 rounded-xl bg-white/80 border border-[#DCD2FD]/40 focus:outline-none focus:ring-2 focus:ring-[#B9A9FB]/50 text-gray-700 appearance-none cursor-pointer font-medium"
              >
                <option value="current">Your Location</option>
                <option value="custom">Custom Location</option>
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-3 text-sm text-gray-600">
              <MapPin className="w-4 h-4 text-[#B9A9FB]" />
              <span>Current Location (20km raduis)</span>
            </div>
          </div>

          {/* Map */}
          <div className="h-64 mt-4">
            <MapContainer
              center={[40.7589, -73.9751]}
              zoom={13}
              style={{ height: '100%', width: '100%' }}
              zoomControl={false}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
              {doctors.map((doctor) => (
                <Marker key={doctor.id} position={doctor.position}>
                  <Popup>{doctor.name}</Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        </div>

        {/* Doctors List */}
        <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-8 border border-[#DCD2FD]/30 shadow-sm">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            Neaurdy Specialists
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {doctors.map((doctor) => (
              <div
                key={doctor.id}
                className="bg-white/80 rounded-2xl p-6 border border-[#DCD2FD]/30 hover:shadow-lg transition-shadow"
              >
                <div className="flex gap-4 mb-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#DCD2FD] to-[#B9A9FB] flex items-center justify-center text-3xl flex-shrink-0">
                    {doctor.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-bold text-gray-800 mb-1">
                      {doctor.name}
                    </h3>
                    <p className="text-sm text-gray-600">
                      Speciality: {doctor.specialty}
                    </p>
                    <p className="text-sm text-gray-600">
                      Location: {doctor.location}
                    </p>
                    <p className="text-sm text-gray-600">
                      Distance: {doctor.available}
                    </p>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-start gap-2 text-sm">
                    <span className="font-medium text-gray-700 w-20 flex-shrink-0">Disitabie:</span>
                    <span className="text-gray-600">{doctor.distance}</span>
                  </div>
                  <div className="flex items-start gap-2 text-sm">
                    <span className="font-medium text-gray-700 w-20 flex-shrink-0">Available:</span>
                    <span className="text-gray-600">Mon-Fri, 9:(59) 987-4567</span>
                  </div>
                  <div className="flex items-start gap-2 text-sm">
                    <span className="font-medium text-gray-700 w-20 flex-shrink-0">Contact:</span>
                    <span className="text-gray-600">{doctor.contact}</span>
                  </div>
                </div>

                <button className="w-full py-3 bg-[#B9A9FB] hover:bg-[#DCD2FD] text-white rounded-xl font-semibold transition-colors">
                  Book Now
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
