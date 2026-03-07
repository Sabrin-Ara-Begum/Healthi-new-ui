import { useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, Mail, Phone, MapPin, Calendar, Edit2, LogOut } from 'lucide-react';

export default function Profile() {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);

  // TODO: Replace with actual user data
  const [userData, setUserData] = useState({
    name: 'Jane Doe',
    email: 'jane.doe@example.com',
    phone: '+1 (555) 123-4567',
    location: 'San Francisco, CA',
    joinDate: 'January 2024',
    avatar: 'https://i.pravatar.cc/150?img=47'
  });

  const handleLogout = () => {
    // TODO: Implement actual logout
    navigate('/auth');
  };

  return (
    <div className="flex-1 overflow-auto">
      {/* Header */}
      <div className="bg-white/60 backdrop-blur-sm border-b border-purple-200/30 px-8 py-4">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back</span>
        </button>
      </div>

      {/* Main Content */}
      <div className="px-8 py-8 max-w-4xl mx-auto">
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 border border-purple-200/50 shadow-lg">
          {/* Profile Header */}
          <div className="flex items-start justify-between mb-8">
            <div className="flex items-center gap-6">
              <div className="relative">
                <img
                  src={userData.avatar}
                  alt={userData.name}
                  className="w-24 h-24 rounded-full border-4 border-purple-200/50"
                />
                <div className="absolute bottom-0 right-0 w-6 h-6 bg-green-400 border-2 border-white rounded-full"></div>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-800 mb-1">
                  {userData.name}
                </h1>
                <p className="text-gray-600">Member since {userData.joinDate}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="px-4 py-2 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-xl font-medium transition-colors flex items-center gap-2"
              >
                <Edit2 className="w-4 h-4" />
                {isEditing ? 'Cancel' : 'Edit Profile'}
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl font-medium transition-colors flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>

          {/* Profile Details */}
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Email */}
              <div className="bg-purple-50/50 rounded-2xl p-5">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-purple-200/50 rounded-lg flex items-center justify-center">
                    <Mail className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Email</p>
                    {isEditing ? (
                      <input
                        type="email"
                        value={userData.email}
                        onChange={(e) => setUserData({ ...userData, email: e.target.value })}
                        className="text-gray-800 font-medium bg-white px-2 py-1 rounded border border-purple-200"
                      />
                    ) : (
                      <p className="text-gray-800 font-medium">{userData.email}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Phone */}
              <div className="bg-purple-50/50 rounded-2xl p-5">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-purple-200/50 rounded-lg flex items-center justify-center">
                    <Phone className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Phone</p>
                    {isEditing ? (
                      <input
                        type="tel"
                        value={userData.phone}
                        onChange={(e) => setUserData({ ...userData, phone: e.target.value })}
                        className="text-gray-800 font-medium bg-white px-2 py-1 rounded border border-purple-200"
                      />
                    ) : (
                      <p className="text-gray-800 font-medium">{userData.phone}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Location */}
              <div className="bg-purple-50/50 rounded-2xl p-5">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-purple-200/50 rounded-lg flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Location</p>
                    {isEditing ? (
                      <input
                        type="text"
                        value={userData.location}
                        onChange={(e) => setUserData({ ...userData, location: e.target.value })}
                        className="text-gray-800 font-medium bg-white px-2 py-1 rounded border border-purple-200"
                      />
                    ) : (
                      <p className="text-gray-800 font-medium">{userData.location}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Join Date */}
              <div className="bg-purple-50/50 rounded-2xl p-5">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-purple-200/50 rounded-lg flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Member Since</p>
                    <p className="text-gray-800 font-medium">{userData.joinDate}</p>
                  </div>
                </div>
              </div>
            </div>

            {isEditing && (
              <div className="flex justify-end gap-3 pt-4">
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    // TODO: Save changes
                  }}
                  className="px-6 py-2 bg-gradient-to-r from-purple-400 to-pink-400 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
                >
                  Save Changes
                </button>
              </div>
            )}
          </div>

          {/* Stats Section */}
          <div className="mt-8 pt-8 border-t border-purple-200/50">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Your Wellness Stats</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-gradient-to-br from-pink-50 to-purple-50 rounded-2xl p-5 text-center">
                <p className="text-3xl font-bold text-purple-600 mb-1">24</p>
                <p className="text-sm text-gray-600">Mood Entries</p>
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-5 text-center">
                <p className="text-3xl font-bold text-blue-600 mb-1">12</p>
                <p className="text-sm text-gray-600">Days Streak</p>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-purple-50 rounded-2xl p-5 text-center">
                <p className="text-3xl font-bold text-green-600 mb-1">85%</p>
                <p className="text-sm text-gray-600">Wellness Score</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
