import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, Edit2, LogOut, Upload, User, ShieldAlert, Award } from 'lucide-react';
import { useApp } from '@/react-app/lib/AppContext';
import { API_BASE } from '../api/config';

export default function Profile() {
  const navigate = useNavigate();
  const { user, setUser, showToast } = useApp();

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Profile data states
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    age: '',
    gender: '',
    bloodGroup: '',
    allergies: '',
    medicalConditions: '',
    emergencyContact: '',
    address: '',
    location: '',
    joinDate: '',
    avatar: ''
  });

  // Wellness statistics
  const [stats, setStats] = useState({
    moodEntries: 0,
    streak: 0,
    wellnessScore: 0
  });

  // Fetch full profile from backend
  const fetchProfile = async () => {
    if (!user?.email) return;
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/api/auth/profile?email=${encodeURIComponent(user.email)}`);
      if (res.ok) {
        const data = await res.json();
        setProfileData({
          name: data.name || '',
          email: data.email || '',
          phone: data.phone || '',
          age: data.age ? String(data.age) : '',
          gender: data.gender || '',
          bloodGroup: data.bloodGroup || '',
          allergies: data.allergies || '',
          medicalConditions: data.medicalConditions || '',
          emergencyContact: data.emergencyContact || '',
          address: data.address || '',
          location: data.location || '',
          joinDate: data.createdAt ? new Date(data.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'N/A',
          avatar: data.avatar || ''
        });
      }
    } catch (err) {
      console.error("Failed to load profile details:", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch mood wellness stats from backend
  const fetchWellnessStats = async () => {
    if (!user?.email) return;
    try {
      const res = await fetch(`${API_BASE}/api/mood/stats?email=${encodeURIComponent(user.email)}`);
      if (res.ok) {
        const data = await res.json();
        setStats({
          moodEntries: data.totalLogs || 0,
          streak: data.streak || 0,
          wellnessScore: data.wellnessScore || 0
        });
      }
    } catch (err) {
      console.error("Failed to fetch wellness stats:", err);
    }
  };

  useEffect(() => {
    if (user?.email) {
      fetchProfile();
      fetchWellnessStats();
    }
  }, [user?.email]);

  const handleSave = async () => {
    if (!user?.email) return;
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/api/auth/profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: user.email,
          name: profileData.name,
          phone: profileData.phone,
          age: profileData.age,
          gender: profileData.gender,
          bloodGroup: profileData.bloodGroup,
          allergies: profileData.allergies,
          medicalConditions: profileData.medicalConditions,
          emergencyContact: profileData.emergencyContact,
          address: profileData.address,
          location: profileData.location
        })
      });

      if (res.ok) {
        const updated = await res.json();
        setUser(updated); // Sync context
        setIsEditing(false);
        showToast("Profile updated successfully!", "success");
      } else {
        const errData = await res.json();
        showToast(errData.message || "Failed to update profile.", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Error occurred while saving profile.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user?.email) return;

    const formData = new FormData();
    formData.append("avatar", file);
    formData.append("email", user.email);

    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/api/auth/profile/avatar`, {
        method: "POST",
        body: formData
      });

      if (res.ok) {
        const data = await res.json();
        setProfileData(prev => ({ ...prev, avatar: data.avatarUrl }));
        setUser({ ...user, avatar: data.avatarUrl }); // Sync context
        showToast("Profile picture uploaded!", "success");
      } else {
        const errData = await res.json();
        showToast(errData.message || "Upload failed.", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Error uploading profile photo.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setUser(null);
    showToast("Successfully Logged Out", "success");
    navigate("/auth");
  };

  const avatarUrlResolved = profileData.avatar
    ? (profileData.avatar.startsWith("http") ? profileData.avatar : `${API_BASE}${profileData.avatar}`)
    : "";

  return (
    <div className="flex-1 overflow-auto bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-955 dark:via-gray-900 dark:to-purple-950/20 text-gray-800 dark:text-gray-100 transition-colors duration-300">
      {/* Header with Back Button */}
      <div className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm border-b border-[#DCD2FD]/30 dark:border-gray-800 px-6 sm:px-8 py-4">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white transition-colors font-medium"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back</span>
        </button>
      </div>

      {/* Main Content */}
      <div className="px-4 sm:px-8 py-8 max-w-4xl mx-auto">
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-3xl p-6 sm:p-8 border border-[#DCD2FD]/40 dark:border-gray-700 shadow-xl">
          
          {/* Profile Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 border-b border-gray-100 dark:border-gray-700 pb-6">
            <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
              <div className="relative group">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#B9A9FB] to-[#FFB7C5] flex items-center justify-center border-4 border-purple-200/50 dark:border-gray-700 overflow-hidden shadow-md">
                  {avatarUrlResolved ? (
                    <img src={avatarUrlResolved} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-12 h-12 text-white" />
                  )}
                </div>
                {/* Upload Hover Overlay */}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer"
                  aria-label="Upload profile photo"
                >
                  <Upload className="w-6 h-6 text-white" />
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleAvatarUpload}
                  accept="image/*"
                  hidden
                />
              </div>

              <div>
                <h1 className="text-3xl font-black text-gray-800 dark:text-white tracking-tight">
                  {profileData.name || "Guest User"}
                </h1>
                <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                  Member since {profileData.joinDate || "N/A"}
                </p>
              </div>
            </div>

            <div className="flex gap-3 justify-center">
              {isEditing ? (
                <>
                  <button
                    onClick={handleSave}
                    disabled={loading}
                    className="px-5 py-2.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-bold hover:shadow-lg transition disabled:opacity-50 text-sm"
                  >
                    {loading ? "Saving..." : "Save Changes"}
                  </button>
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      fetchProfile(); // Reset fields
                    }}
                    className="px-5 py-2.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-650 text-gray-700 dark:text-gray-200 rounded-xl font-semibold transition text-sm"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-5 py-2.5 bg-purple-100 dark:bg-purple-950/40 hover:bg-purple-200 dark:hover:bg-purple-900/60 text-purple-700 dark:text-purple-300 rounded-xl font-bold transition flex items-center gap-2 text-sm"
                >
                  <Edit2 className="w-4 h-4" />
                  Edit Profile
                </button>
              )}
              <button
                onClick={handleLogout}
                className="px-4 py-2.5 bg-red-50 dark:bg-red-950/20 hover:bg-red-100 dark:hover:bg-red-900/35 text-red-600 dark:text-red-400 rounded-xl font-bold transition flex items-center gap-2 text-sm"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>

          {/* Profile Details Grid */}
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white border-b pb-2 flex items-center gap-2">
              <Award className="w-5 h-5 text-purple-500" />
              General Details
            </h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Full Name */}
              <div className="bg-purple-50/30 dark:bg-gray-900/40 rounded-2xl p-4 border border-[#DCD2FD]/20 dark:border-gray-750">
                <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Full Name</p>
                {isEditing ? (
                  <input
                    type="text"
                    value={profileData.name}
                    onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                    className="w-full mt-2 px-3 py-2 text-sm rounded-lg border border-purple-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-300"
                  />
                ) : (
                  <p className="text-gray-800 dark:text-gray-150 font-bold mt-1.5 text-sm sm:text-base">{profileData.name || "N/A"}</p>
                )}
              </div>

              {/* Email */}
              <div className="bg-purple-50/30 dark:bg-gray-900/40 rounded-2xl p-4 border border-[#DCD2FD]/20 dark:border-gray-750">
                <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Email Address</p>
                <p className="text-gray-850 dark:text-gray-150 font-bold mt-2 text-sm sm:text-base">{profileData.email || "N/A"}</p>
              </div>

              {/* Phone */}
              <div className="bg-purple-50/30 dark:bg-gray-900/40 rounded-2xl p-4 border border-[#DCD2FD]/20 dark:border-gray-750">
                <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Phone</p>
                {isEditing ? (
                  <input
                    type="text"
                    value={profileData.phone}
                    onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                    className="w-full mt-2 px-3 py-2 text-sm rounded-lg border border-purple-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-300"
                  />
                ) : (
                  <p className="text-gray-800 dark:text-gray-150 font-bold mt-1.5 text-sm sm:text-base">{profileData.phone || "N/A"}</p>
                )}
              </div>

              {/* Address / Location */}
              <div className="bg-purple-50/30 dark:bg-gray-900/40 rounded-2xl p-4 border border-[#DCD2FD]/20 dark:border-gray-750">
                <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Location / City</p>
                {isEditing ? (
                  <input
                    type="text"
                    value={profileData.location}
                    onChange={(e) => setProfileData({ ...profileData, location: e.target.value })}
                    className="w-full mt-2 px-3 py-2 text-sm rounded-lg border border-purple-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-300"
                  />
                ) : (
                  <p className="text-gray-800 dark:text-gray-150 font-bold mt-1.5 text-sm sm:text-base">{profileData.location || "N/A"}</p>
                )}
              </div>
            </div>

            {/* Medical Metrics */}
            <h2 className="text-xl font-bold text-gray-800 dark:text-white border-b pb-2 pt-4 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-[#FFB7C5]" />
              Medical Profile
            </h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {/* Age */}
              <div className="bg-purple-50/30 dark:bg-gray-900/40 rounded-2xl p-4 border border-[#DCD2FD]/20 dark:border-gray-750">
                <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Age</p>
                {isEditing ? (
                  <input
                    type="number"
                    value={profileData.age}
                    onChange={(e) => setProfileData({ ...profileData, age: e.target.value })}
                    className="w-full mt-2 px-3 py-2 text-sm rounded-lg border border-purple-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-300"
                  />
                ) : (
                  <p className="text-gray-800 dark:text-gray-150 font-bold mt-1.5 text-sm sm:text-base">{profileData.age ? `${profileData.age} Years` : "N/A"}</p>
                )}
              </div>

              {/* Gender */}
              <div className="bg-purple-50/30 dark:bg-gray-900/40 rounded-2xl p-4 border border-[#DCD2FD]/20 dark:border-gray-750">
                <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Gender</p>
                {isEditing ? (
                  <select
                    value={profileData.gender}
                    onChange={(e) => setProfileData({ ...profileData, gender: e.target.value })}
                    className="w-full mt-2 px-3 py-2 text-sm rounded-lg border border-purple-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-850 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-300"
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                ) : (
                  <p className="text-gray-800 dark:text-gray-150 font-bold mt-1.5 text-sm sm:text-base">{profileData.gender || "N/A"}</p>
                )}
              </div>

              {/* Blood Group */}
              <div className="bg-purple-50/30 dark:bg-gray-900/40 rounded-2xl p-4 border border-[#DCD2FD]/20 dark:border-gray-750">
                <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Blood Group</p>
                {isEditing ? (
                  <input
                    type="text"
                    placeholder="e.g. O+"
                    value={profileData.bloodGroup}
                    onChange={(e) => setProfileData({ ...profileData, bloodGroup: e.target.value })}
                    className="w-full mt-2 px-3 py-2 text-sm rounded-lg border border-purple-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-300"
                  />
                ) : (
                  <p className="text-gray-800 dark:text-gray-150 font-bold mt-1.5 text-sm sm:text-base">{profileData.bloodGroup || "N/A"}</p>
                )}
              </div>
            </div>

            {/* Allergies & Conditions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-4">
              {/* Allergies */}
              <div className="bg-purple-50/30 dark:bg-gray-900/40 rounded-2xl p-4 border border-[#DCD2FD]/20 dark:border-gray-750">
                <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Allergies</p>
                {isEditing ? (
                  <textarea
                    value={profileData.allergies}
                    onChange={(e) => setProfileData({ ...profileData, allergies: e.target.value })}
                    className="w-full mt-2 px-3 py-2 text-sm rounded-lg border border-purple-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-300 resize-none"
                    rows={2}
                  />
                ) : (
                  <p className="text-gray-800 dark:text-gray-150 font-medium mt-1.5 text-sm leading-relaxed">{profileData.allergies || "None declared"}</p>
                )}
              </div>

              {/* Medical Conditions */}
              <div className="bg-purple-50/30 dark:bg-gray-900/40 rounded-2xl p-4 border border-[#DCD2FD]/20 dark:border-gray-750">
                <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Existing Medical Conditions</p>
                {isEditing ? (
                  <textarea
                    value={profileData.medicalConditions}
                    onChange={(e) => setProfileData({ ...profileData, medicalConditions: e.target.value })}
                    className="w-full mt-2 px-3 py-2 text-sm rounded-lg border border-purple-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-300 resize-none"
                    rows={2}
                  />
                ) : (
                  <p className="text-gray-800 dark:text-gray-150 font-medium mt-1.5 text-sm leading-relaxed">{profileData.medicalConditions || "None declared"}</p>
                )}
              </div>

              {/* Emergency Contact */}
              <div className="bg-purple-50/30 dark:bg-gray-900/40 rounded-2xl p-4 border border-[#DCD2FD]/20 dark:border-gray-750">
                <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Emergency Contact</p>
                {isEditing ? (
                  <input
                    type="text"
                    value={profileData.emergencyContact}
                    onChange={(e) => setProfileData({ ...profileData, emergencyContact: e.target.value })}
                    className="w-full mt-2 px-3 py-2 text-sm rounded-lg border border-purple-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-300"
                  />
                ) : (
                  <p className="text-gray-800 dark:text-gray-150 font-bold mt-1.5 text-sm sm:text-base">{profileData.emergencyContact || "N/A"}</p>
                )}
              </div>

              {/* Detailed Address */}
              <div className="bg-purple-50/30 dark:bg-gray-900/40 rounded-2xl p-4 border border-[#DCD2FD]/20 dark:border-gray-750">
                <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Address</p>
                {isEditing ? (
                  <input
                    type="text"
                    value={profileData.address}
                    onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
                    className="w-full mt-2 px-3 py-2 text-sm rounded-lg border border-purple-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-300"
                  />
                ) : (
                  <p className="text-gray-800 dark:text-gray-150 font-medium mt-1.5 text-sm truncate">{profileData.address || "N/A"}</p>
                )}
              </div>
            </div>

          </div>

          {/* Stats Section with Real calculations */}
          <div className="mt-8 pt-8 border-t border-purple-200/50 dark:border-gray-750">
            <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">Your Wellness Stats</h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-gradient-to-br from-pink-50 to-purple-50 dark:from-pink-950/20 dark:to-purple-950/20 rounded-2xl p-5 text-center border border-pink-100/50 dark:border-purple-900/35">
                <p className="text-3xl font-black text-purple-600 dark:text-purple-400 mb-1">{stats.moodEntries}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Mood Entries</p>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 rounded-2xl p-5 text-center border border-blue-100/50 dark:border-purple-900/35">
                <p className="text-3xl font-black text-blue-600 dark:text-blue-400 mb-1">{stats.streak}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Days Streak</p>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-purple-50 dark:from-green-955/20 dark:to-purple-955/20 rounded-2xl p-5 text-center border border-green-100/50 dark:border-purple-900/35">
                <p className="text-3xl font-black text-green-600 dark:text-green-400 mb-1">{stats.wellnessScore}%</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Wellness Score</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}