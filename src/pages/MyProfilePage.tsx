import React, { useState, useEffect } from 'react';
import { Navbar } from '../components/Navbar';
import { DashboardSidebar } from '../components/dashboard/DashboardSidebar';
import {
  Camera,
  Sprout,
  Bookmark,
  Users,
  Edit3,
  Eye,
  Check,
  AlertCircle,
  Loader2,
  MapPin,
  ShieldCheck,
  ArrowRight
} from 'lucide-react';
import { getStoredAuthUser } from '../services/authService';
import type { AuthUser } from '../services/authService';
import {
  fetchUserProfile,
  updateUserProfile,
} from '../services/accountService';
import type { UserProfileData, UserStats } from '../services/accountService';
import { navigateTo } from '../utils/navigation';

interface MyProfilePageProps {
  onRouteChange?: (route: string) => void;
}

export const MyProfilePage: React.FC<MyProfilePageProps> = ({ onRouteChange }) => {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => getStoredAuthUser());
  const [profile, setProfile] = useState<UserProfileData | null>(null);
  const [stats, setStats] = useState<UserStats>({
    totalScans: 0,
    myCrops: 0,
    savedItems: 0,
    communityPosts: 0,
  });
  const [activeTab, setActiveTab] = useState<'personal' | 'farming' | 'preferences' | 'security'>('personal');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [role, setRole] = useState('Farmer');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [bio, setBio] = useState('');
  const [farmSize, setFarmSize] = useState<number | string>(0);
  const [primaryCrops, setPrimaryCrops] = useState('');
  const [farmingType, setFarmingType] = useState('Organic');
  const [soilType, setSoilType] = useState('Loamy');
  const [language, setLanguage] = useState('English');
  const [measurementUnit, setMeasurementUnit] = useState('Metric');
  const [newsletter, setNewsletter] = useState(true);

  const nav = (route: string) => navigateTo(route, onRouteChange);

  // Authentication protection
  useEffect(() => {
    const user = getStoredAuthUser();
    if (!user) {
      nav('/login');
    } else {
      setCurrentUser(user);
    }
  }, []);

  // Fetch real data from DB
  const loadProfile = async () => {
    if (!currentUser) return;
    setIsLoading(true);
    const data = await fetchUserProfile(currentUser.id);
    if (data) {
      setProfile(data.user);
      setStats(data.stats);
      setName(data.user.name || '');
      setRole(data.user.role || 'Farmer');
      setEmail(data.user.email || '');
      setPhone(data.user.phone || '');
      setLocation(data.user.location || '');
      setBio(data.user.bio || '');
      setFarmSize(data.user.farmSize || 0);
      setPrimaryCrops(data.user.primaryCrops || '');
      setFarmingType(data.user.farmingType || 'Organic');
      setSoilType(data.user.soilType || 'Loamy');
      setLanguage(data.user.language || 'English');
      setMeasurementUnit(data.user.measurementUnit || 'Metric');
      setNewsletter(data.user.newsletter !== undefined ? data.user.newsletter : true);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    loadProfile();
  }, [currentUser?.id]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    setIsSaving(true);
    setSuccessMsg(null);
    setErrorMsg(null);

    const res = await updateUserProfile({
      userId: currentUser.id,
      name,
      role,
      phone,
      location,
      bio,
      farmSize: Number(farmSize) || 0,
      primaryCrops,
      farmingType,
      soilType,
      language,
      measurementUnit,
      newsletter,
    });

    setIsSaving(false);
    if (res.success && res.user) {
      setSuccessMsg('Profile updated successfully.');
      setProfile(res.user);
      // Update stored auth user in localStorage
      const updatedAuth: AuthUser = {
        ...currentUser,
        name: res.user.name,
        role: (res.user.role as any) || 'farmer',
        location: res.user.location,
        bio: res.user.bio,
      };
      localStorage.setItem('agrivision_auth_user', JSON.stringify(updatedAuth));
      setCurrentUser(updatedAuth);
      setTimeout(() => setSuccessMsg(null), 4000);
    } else {
      setErrorMsg(res.error || 'Failed to update profile.');
    }
  };

  if (!currentUser) return null;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col antialiased text-slate-800">
        <Navbar activeRoute="/profile" onRouteChange={onRouteChange} />
        <div className="flex-1 flex items-center justify-center p-12">
          <Loader2 className="w-8 h-8 text-[#15803D] animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col antialiased text-slate-800">
      <Navbar activeRoute="/profile" onRouteChange={onRouteChange} />

      <div className="flex flex-1 w-full max-w-[1500px] mx-auto pt-3 sm:pt-5 pb-12 px-3 sm:px-6 lg:px-8 gap-6">
        {/* Left Sidebar */}
        <div className="hidden lg:block w-56 xl:w-60 shrink-0">
          <div className="sticky top-20">
            <DashboardSidebar activeItem="profile" onRouteChange={nav} />
          </div>
        </div>

        {/* Main Workspace */}
        <div className="flex-1 min-w-0 space-y-6">
          {/* Top Profile Header Card matching reference */}
          <div className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-2xs">
            {/* Cover Banner */}
            <div className="relative h-36 sm:h-44 w-full overflow-hidden">
              <img
                src="/auth_assets/auth_hero_desktop.jpg"
                alt="Profile Landscape Banner"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            </div>

            {/* Profile Info Bar */}
            <div className="px-5 sm:px-7 pb-6 pt-0 relative">
              <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 -mt-12 sm:-mt-14 mb-4">
                {/* Avatar */}
                <div className="relative">
                  <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full border-4 border-white shadow-md bg-[#15803D] text-white flex items-center justify-center overflow-hidden font-extrabold text-3xl">
                    {profile?.avatarUrl ? (
                      <img src={profile.avatarUrl} alt={name} className="w-full h-full object-cover" />
                    ) : (
                      <span>{name ? name.charAt(0).toUpperCase() : 'P'}</span>
                    )}
                  </div>
                  <div className="absolute bottom-1 right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-white" title="Active" />
                </div>

                {/* Right Action Buttons */}
                <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
                  <button
                    type="button"
                    onClick={() => setActiveTab('personal')}
                    className="px-3.5 py-1.5 bg-[#15803D] hover:bg-[#166534] text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit Profile</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => nav('/community')}
                    className="px-3.5 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5 text-slate-400" />
                    <span>View Public Profile</span>
                  </button>
                </div>
              </div>

              {/* Name, Role & Bio */}
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-xl sm:text-2xl font-extrabold text-[#0F172A] tracking-tight">
                    {name || 'Farmer'}
                  </h1>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-[#15803D] text-xs font-bold capitalize">
                    {role || 'Farmer'}
                  </span>
                </div>
                <p className="text-xs text-slate-500 italic max-w-2xl leading-relaxed">
                  {bio ? `"${bio}"` : '"Passionate about sustainable farming and using AI to build a healthier tomorrow. 🌱"'}
                </p>
                {location && (
                  <div className="flex items-center gap-1 text-xs text-slate-500 pt-1">
                    <MapPin className="w-3.5 h-3.5 text-emerald-700" />
                    <span>{location}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 4 Statistics Cards (Real Database Data Only) */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Scans */}
            <div
              onClick={() => nav('/history')}
              className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs hover:border-emerald-300 transition-all cursor-pointer group select-none"
            >
              <div className="flex items-center justify-between pb-2">
                <span className="text-xs font-semibold text-slate-500">Total Scans</span>
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-[#15803D] flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Camera className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-extrabold text-[#0F172A]">{stats.totalScans}</div>
              <div className="flex items-center gap-1 text-[11px] font-bold text-[#15803D] mt-1 group-hover:underline">
                <span>View scans</span>
                <ArrowRight className="w-3 h-3" />
              </div>
            </div>

            {/* My Crops */}
            <div
              onClick={() => nav('/my-crops')}
              className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs hover:border-emerald-300 transition-all cursor-pointer group select-none"
            >
              <div className="flex items-center justify-between pb-2">
                <span className="text-xs font-semibold text-slate-500">My Crops</span>
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-[#15803D] flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Sprout className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-extrabold text-[#0F172A]">{stats.myCrops}</div>
              <div className="flex items-center gap-1 text-[11px] font-bold text-[#15803D] mt-1 group-hover:underline">
                <span>Manage crops</span>
                <ArrowRight className="w-3 h-3" />
              </div>
            </div>

            {/* Saved Items */}
            <div
              onClick={() => nav('/saved')}
              className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs hover:border-amber-300 transition-all cursor-pointer group select-none"
            >
              <div className="flex items-center justify-between pb-2">
                <span className="text-xs font-semibold text-slate-500">Saved Items</span>
                <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Bookmark className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-extrabold text-[#0F172A]">{stats.savedItems}</div>
              <div className="flex items-center gap-1 text-[11px] font-bold text-amber-700 mt-1 group-hover:underline">
                <span>View saved</span>
                <ArrowRight className="w-3 h-3" />
              </div>
            </div>

            {/* Community Posts */}
            <div
              onClick={() => nav('/community')}
              className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs hover:border-purple-300 transition-all cursor-pointer group select-none"
            >
              <div className="flex items-center justify-between pb-2">
                <span className="text-xs font-semibold text-slate-500">Community Posts</span>
                <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Users className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-extrabold text-[#0F172A]">{stats.communityPosts}</div>
              <div className="flex items-center gap-1 text-[11px] font-bold text-purple-700 mt-1 group-hover:underline">
                <span>View posts</span>
                <ArrowRight className="w-3 h-3" />
              </div>
            </div>
          </div>

          {/* Profile Tabs & Form Container matching reference */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-2xs">
            {/* Tabs Header */}
            <div className="flex items-center gap-2 border-b border-slate-100 pb-4 overflow-x-auto">
              <button
                type="button"
                onClick={() => setActiveTab('personal')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === 'personal'
                    ? 'bg-[#DCFCE7] text-[#15803D]'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                Personal Information
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('farming')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === 'farming'
                    ? 'bg-[#DCFCE7] text-[#15803D]'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                Farming Details
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('preferences')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === 'preferences'
                    ? 'bg-[#DCFCE7] text-[#15803D]'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                Preferences
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('security')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === 'security'
                    ? 'bg-[#DCFCE7] text-[#15803D]'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                Account & Security
              </button>
            </div>

            {/* Notifications Alert banner */}
            {successMsg && (
              <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-xl flex items-center gap-2 animate-fade-in">
                <Check className="w-4 h-4 text-[#15803D]" />
                <span>{successMsg}</span>
              </div>
            )}
            {errorMsg && (
              <div className="mt-4 p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold rounded-xl flex items-center gap-2 animate-fade-in">
                <AlertCircle className="w-4 h-4 text-rose-600" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Tab 1: Personal Information Form */}
            {activeTab === 'personal' && (
              <form onSubmit={handleSave} className="mt-6 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Full Name */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      placeholder="Your full name"
                      className="w-full px-3.5 py-2.5 bg-[#F8FAFC] border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:border-[#15803D] focus:bg-white transition-all"
                    />
                  </div>

                  {/* Email Address */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={email}
                      disabled
                      className="w-full px-3.5 py-2.5 bg-slate-100/70 border border-slate-200 rounded-xl text-xs font-medium text-slate-500 cursor-not-allowed"
                    />
                  </div>

                  {/* Role */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Role
                    </label>
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-[#F8FAFC] border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:border-[#15803D] focus:bg-white transition-all cursor-pointer"
                    >
                      <option value="Farmer">Farmer</option>
                      <option value="Student">Student / Researcher</option>
                      <option value="Expert">Agronomist / Expert</option>
                    </select>
                  </div>

                  {/* Phone Number */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Phone Number
                    </label>
                    <div className="flex items-center bg-[#F8FAFC] border border-slate-200 rounded-xl focus-within:border-[#15803D] focus-within:bg-white transition-all overflow-hidden">
                      <span className="px-3 text-xs font-bold text-slate-600 bg-slate-100/60 border-r border-slate-200 py-2.5">
                        🇮🇳 +91
                      </span>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="Enter phone number"
                        className="w-full px-3 py-2 text-xs font-medium text-slate-800 bg-transparent focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Location */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Location
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Enter your city, state or district (e.g. Ghaziabad, Uttar Pradesh)"
                    className="w-full px-3.5 py-2.5 bg-[#F8FAFC] border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:border-[#15803D] focus:bg-white transition-all"
                  />
                </div>

                {/* Bio */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-slate-700">Bio</label>
                    <span className="text-[11px] text-slate-400">{bio.length}/200</span>
                  </div>
                  <textarea
                    rows={3}
                    maxLength={200}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Tell us about yourself and your agricultural practice..."
                    className="w-full px-3.5 py-2.5 bg-[#F8FAFC] border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:border-[#15803D] focus:bg-white transition-all resize-none"
                  />
                </div>

                {/* Submit Button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-5 py-2.5 bg-[#15803D] hover:bg-[#166534] disabled:bg-emerald-300 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer"
                  >
                    {isSaving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    <span>{isSaving ? 'Saving Changes...' : 'Save Changes'}</span>
                  </button>
                </div>
              </form>
            )}

            {/* Tab 2: Farming Details */}
            {activeTab === 'farming' && (
              <form onSubmit={handleSave} className="mt-6 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Total Farm Area (Acres)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={farmSize}
                      onChange={(e) => setFarmSize(e.target.value)}
                      placeholder="e.g. 5.5"
                      className="w-full px-3.5 py-2.5 bg-[#F8FAFC] border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:border-[#15803D] focus:bg-white transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Primary Crops Grown
                    </label>
                    <input
                      type="text"
                      value={primaryCrops}
                      onChange={(e) => setPrimaryCrops(e.target.value)}
                      placeholder="e.g. Wheat, Tomato, Cotton"
                      className="w-full px-3.5 py-2.5 bg-[#F8FAFC] border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:border-[#15803D] focus:bg-white transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Farming Method
                    </label>
                    <select
                      value={farmingType}
                      onChange={(e) => setFarmingType(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-[#F8FAFC] border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:border-[#15803D] focus:bg-white transition-all cursor-pointer"
                    >
                      <option value="Organic">Organic Farming</option>
                      <option value="Conventional">Conventional Farming</option>
                      <option value="Integrated">Integrated Pest Management (IPM)</option>
                      <option value="Hydroponic">Hydroponic / Protected</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Soil Type
                    </label>
                    <select
                      value={soilType}
                      onChange={(e) => setSoilType(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-[#F8FAFC] border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:border-[#15803D] focus:bg-white transition-all cursor-pointer"
                    >
                      <option value="Loamy">Alluvial / Loamy Soil</option>
                      <option value="Clay">Black / Clayey Soil</option>
                      <option value="Red">Red & Yellow Soil</option>
                      <option value="Sandy">Sandy Loam</option>
                    </select>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-5 py-2.5 bg-[#15803D] hover:bg-[#166534] disabled:bg-emerald-300 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer"
                  >
                    {isSaving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    <span>{isSaving ? 'Saving...' : 'Save Farming Details'}</span>
                  </button>
                </div>
              </form>
            )}

            {/* Tab 3: Preferences */}
            {activeTab === 'preferences' && (
              <form onSubmit={handleSave} className="mt-6 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Preferred Language
                    </label>
                    <select
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-[#F8FAFC] border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:border-[#15803D] focus:bg-white transition-all cursor-pointer"
                    >
                      <option value="English">English</option>
                      <option value="Hindi">हिंदी (Hindi)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Measurement System
                    </label>
                    <select
                      value={measurementUnit}
                      onChange={(e) => setMeasurementUnit(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-[#F8FAFC] border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:border-[#15803D] focus:bg-white transition-all cursor-pointer"
                    >
                      <option value="Metric">Metric (Hectares, °C, kg)</option>
                      <option value="Imperial">Imperial (Acres, °F, lbs)</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <input
                    type="checkbox"
                    id="pref-newsletter"
                    checked={newsletter}
                    onChange={(e) => setNewsletter(e.target.checked)}
                    className="w-4 h-4 text-[#15803D] rounded border-slate-300 focus:ring-emerald-500"
                  />
                  <label htmlFor="pref-newsletter" className="text-xs font-semibold text-slate-700 cursor-pointer">
                    Receive agricultural weather alerts and seasonal disease prevention advisories
                  </label>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-5 py-2.5 bg-[#15803D] hover:bg-[#166534] disabled:bg-emerald-300 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer"
                  >
                    {isSaving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    <span>{isSaving ? 'Saving...' : 'Save Preferences'}</span>
                  </button>
                </div>
              </form>
            )}

            {/* Tab 4: Account & Security */}
            {activeTab === 'security' && (
              <div className="mt-6 space-y-4">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-[#15803D]" />
                    <span className="text-xs font-bold text-slate-800">Account Integrity & Authentication</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Your account is securely encrypted and connected to real agricultural database sessions.
                    You can change your password or manage notification permissions in Settings.
                  </p>
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => nav('/settings')}
                      className="px-3.5 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 text-xs font-bold rounded-xl shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>Manage Security & Password in Settings</span>
                      <ArrowRight className="w-3 h-3 text-slate-400" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
