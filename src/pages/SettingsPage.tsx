import React, { useState, useEffect } from 'react';
import { Navbar } from '../components/Navbar';
import { DashboardSidebar } from '../components/dashboard/DashboardSidebar';
import {
  Settings,
  User,
  Shield,
  Bell,
  Eye,
  Trash2,
  Save,
  Lock,
  Check,
  AlertCircle,
  AlertTriangle,
  Loader2
} from 'lucide-react';
import { getStoredAuthUser, clearAuthUser } from '../services/authService';
import type { AuthUser } from '../services/authService';
import {
  fetchUserSettings,
  updateUserSettings,
  changePassword,
  deleteUserAccount,
  fetchUserProfile,
  updateUserProfile,
} from '../services/accountService';
import { navigateTo } from '../utils/navigation';

interface SettingsPageProps {
  onRouteChange?: (route: string) => void;
}

type TabKey = 'general' | 'notifications' | 'privacy' | 'appearance' | 'language';

export const SettingsPage: React.FC<SettingsPageProps> = ({ onRouteChange }) => {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => getStoredAuthUser());
  const [activeTab, setActiveTab] = useState<TabKey>('general');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // General settings state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [language, setLanguage] = useState('English');
  const [measurementUnit, setMeasurementUnit] = useState('Metric');

  // Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMsg, setPasswordMsg] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [isChangingPass, setIsChangingPass] = useState(false);

  // Notification toggles
  const [notifScanResults, setNotifScanResults] = useState(true);
  const [notifDiseaseAlerts, setNotifDiseaseAlerts] = useState(true);
  const [notifCommunity, setNotifCommunity] = useState(true);
  const [notifCropReminders, setNotifCropReminders] = useState(true);
  const [appearanceTheme, setAppearanceTheme] = useState('light');

  // Delete account modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmPassword, setDeleteConfirmPassword] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const nav = (route: string) => navigateTo(route, onRouteChange);

  useEffect(() => {
    const user = getStoredAuthUser();
    if (!user) {
      nav('/login');
    } else {
      setCurrentUser(user);
    }
  }, []);

  const loadData = async () => {
    if (!currentUser) return;
    setIsLoading(true);
    const [profileRes, settingsRes] = await Promise.all([
      fetchUserProfile(currentUser.id),
      fetchUserSettings(currentUser.id)
    ]);

    if (profileRes?.user) {
      setName(profileRes.user.name || '');
      setEmail(profileRes.user.email || '');
      setPhone(profileRes.user.phone || '');
      setLanguage(profileRes.user.language || 'English');
      setMeasurementUnit(profileRes.user.measurementUnit || 'Metric');
    }

    if (settingsRes) {
      setNotifScanResults(settingsRes.scanResults);
      setNotifDiseaseAlerts(settingsRes.diseaseAlerts);
      setNotifCommunity(settingsRes.communityActivity);
      setNotifCropReminders(settingsRes.cropReminders);
      setAppearanceTheme(settingsRes.appearance || 'light');
    }

    setIsLoading(false);
  };

  useEffect(() => {
    if (currentUser) {
      loadData();
    }
  }, [currentUser]);

  const handleSaveGeneral = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    setIsSaving(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    const res = await updateUserProfile({
      userId: currentUser.id,
      name,
      phone,
      language,
      measurementUnit,
    });

    setIsSaving(false);
    if (res.success) {
      setSuccessMsg('Account settings saved successfully.');
      // Update local storage
      const updatedUser = { ...currentUser, name };
      localStorage.setItem('agrivision_auth_user', JSON.stringify(updatedUser));
      setCurrentUser(updatedUser);
      setTimeout(() => setSuccessMsg(null), 3500);
    } else {
      setErrorMsg(res.error || 'Failed to save settings.');
    }
  };

  const handleToggleNotification = async (key: 'scanResults' | 'diseaseAlerts' | 'communityActivity' | 'cropReminders', val: boolean) => {
    if (!currentUser) return;
    if (key === 'scanResults') setNotifScanResults(val);
    if (key === 'diseaseAlerts') setNotifDiseaseAlerts(val);
    if (key === 'communityActivity') setNotifCommunity(val);
    if (key === 'cropReminders') setNotifCropReminders(val);

    await updateUserSettings({
      userId: currentUser.id,
      [key]: val,
    });
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    setPasswordError(null);
    setPasswordMsg(null);

    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match.');
      return;
    }

    setIsChangingPass(true);
    const res = await changePassword({
      userId: currentUser.id,
      currentPassword,
      newPassword,
    });
    setIsChangingPass(false);

    if (res.success) {
      setPasswordMsg('Password changed successfully.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPasswordMsg(null), 3500);
    } else {
      setPasswordError(res.error || 'Failed to change password.');
    }
  };

  const handleDeleteAccount = async () => {
    if (!currentUser) return;
    if (!deleteConfirmPassword) {
      setDeleteError('Please enter your password to confirm deletion.');
      return;
    }
    setIsDeleting(true);
    setDeleteError(null);
    const res = await deleteUserAccount(currentUser.id);
    setIsDeleting(false);

    if (res.success) {
      clearAuthUser();
      nav('/login');
    } else {
      setDeleteError(res.error || 'Failed to delete account.');
    }
  };

  if (!currentUser) return null;

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col antialiased text-slate-800">
      <Navbar activeRoute="/settings" onRouteChange={onRouteChange} />

      <div className="flex flex-1 w-full max-w-[1500px] mx-auto pt-3 sm:pt-5 pb-12 px-3 sm:px-6 lg:px-8 gap-6">
        {/* Left Sidebar */}
        <div className="hidden lg:block w-56 xl:w-60 shrink-0">
          <div className="sticky top-20">
            <DashboardSidebar activeItem="settings" onRouteChange={nav} />
          </div>
        </div>

        {/* Main Content Workspace */}
        <div className="flex-1 min-w-0 space-y-6">
          {/* Header Banner */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-2xs">
            <h1 className="text-xl sm:text-2xl font-extrabold text-[#0F172A] tracking-tight flex items-center gap-2.5">
              <Settings className="w-6 h-6 text-[#15803D]" />
              Settings
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
              Manage your account preferences, notifications, and security
            </p>

            {/* Sub Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto mt-6 border-b border-slate-100 pb-3 no-scrollbar">
              {[
                { key: 'general', label: 'General' },
                { key: 'notifications', label: 'Notifications' },
                { key: 'privacy', label: 'Privacy & Security' },
                { key: 'appearance', label: 'Appearance' },
                { key: 'language', label: 'Language & Region' },
              ].map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveTab(tab.key as TabKey)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors whitespace-nowrap cursor-pointer ${
                    activeTab === tab.key
                      ? 'bg-[#15803D] text-white shadow-xs'
                      : 'bg-slate-100/80 text-slate-600 hover:bg-slate-200/80'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {isLoading ? (
            <div className="bg-white border border-slate-200/90 rounded-2xl p-16 flex flex-col items-center justify-center text-center shadow-2xs">
              <Loader2 className="w-8 h-8 text-[#15803D] animate-spin mb-3" />
              <p className="text-sm font-semibold text-slate-600">Loading settings...</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* SECTION 1: Account Settings (General / Language) */}
              {(activeTab === 'general' || activeTab === 'language') && (
                <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-2xs">
                  <div className="flex items-center gap-2 mb-4">
                    <User className="w-5 h-5 text-[#15803D]" />
                    <h3 className="text-base font-bold text-slate-900">Account Settings</h3>
                  </div>

                  {successMsg && (
                    <div className="p-3 mb-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-600" />
                      {successMsg}
                    </div>
                  )}
                  {errorMsg && (
                    <div className="p-3 mb-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-red-500" />
                      {errorMsg}
                    </div>
                  )}

                  <form onSubmit={handleSaveGeneral} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">Full Name</label>
                        <input
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          required
                          className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-[#15803D] font-medium"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">Email Address</label>
                        <input
                          type="email"
                          value={email}
                          disabled
                          className="w-full px-3.5 py-2 text-xs bg-slate-100 border border-slate-200 rounded-xl text-slate-500 font-medium cursor-not-allowed"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">Phone Number</label>
                        <input
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="+91 98765 43210"
                          className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-[#15803D] font-medium"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">Preferred Language</label>
                        <select
                          value={language}
                          onChange={(e) => setLanguage(e.target.value)}
                          className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-[#15803D] font-medium cursor-pointer"
                        >
                          <option value="English">English</option>
                          <option value="Hindi">हिंदी (Hindi)</option>
                          <option value="Punjabi">ਪੰਜਾਬੀ (Punjabi)</option>
                          <option value="Marathi">मराठी (Marathi)</option>
                          <option value="Telugu">తెలుగు (Telugu)</option>
                          <option value="Tamil">தமிழ் (Tamil)</option>
                          <option value="Gujarati">ગુજરાતી (Gujarati)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">Measurement Units</label>
                        <select
                          value={measurementUnit}
                          onChange={(e) => setMeasurementUnit(e.target.value)}
                          className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-[#15803D] font-medium cursor-pointer"
                        >
                          <option value="Metric">Metric (Hectares, Kg, °C)</option>
                          <option value="Imperial">Imperial (Acres, Lb, °F)</option>
                        </select>
                      </div>
                    </div>

                    <div className="pt-2 flex justify-end">
                      <button
                        type="submit"
                        disabled={isSaving}
                        className="px-5 py-2 bg-[#15803D] hover:bg-[#166534] disabled:bg-slate-300 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                      >
                        {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                        <span>Save Account Changes</span>
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* SECTION 2: Password & Security */}
              {(activeTab === 'general' || activeTab === 'privacy') && (
                <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-2xs">
                  <div className="flex items-center gap-2 mb-4">
                    <Lock className="w-5 h-5 text-[#15803D]" />
                    <h3 className="text-base font-bold text-slate-900">Password & Security</h3>
                  </div>

                  {passwordMsg && (
                    <div className="p-3 mb-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-600" />
                      {passwordMsg}
                    </div>
                  )}
                  {passwordError && (
                    <div className="p-3 mb-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-red-500" />
                      {passwordError}
                    </div>
                  )}

                  <form onSubmit={handleChangePassword} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">Current Password</label>
                        <input
                          type="password"
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          required
                          placeholder="••••••••"
                          className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-[#15803D] font-medium"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">New Password</label>
                        <input
                          type="password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          required
                          placeholder="At least 6 characters"
                          className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-[#15803D] font-medium"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">Confirm New Password</label>
                        <input
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          required
                          placeholder="Repeat new password"
                          className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-[#15803D] font-medium"
                        />
                      </div>
                    </div>

                    <div className="pt-2 flex justify-end">
                      <button
                        type="submit"
                        disabled={isChangingPass}
                        className="px-5 py-2 bg-slate-800 hover:bg-slate-900 disabled:bg-slate-300 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                      >
                        {isChangingPass ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Shield className="w-3.5 h-3.5" />}
                        <span>Update Password</span>
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* SECTION 3: Notification Preferences */}
              {(activeTab === 'general' || activeTab === 'notifications') && (
                <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-2xs">
                  <div className="flex items-center gap-2 mb-4">
                    <Bell className="w-5 h-5 text-[#15803D]" />
                    <h3 className="text-base font-bold text-slate-900">Notification Preferences</h3>
                  </div>

                  <div className="divide-y divide-slate-100">
                    <div className="py-3.5 flex items-center justify-between">
                      <div>
                        <p className="text-xs sm:text-sm font-bold text-slate-800">Disease Alerts & Warnings</p>
                        <p className="text-[11px] text-slate-500">Receive instant warnings about crop disease outbreaks in your region</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={notifDiseaseAlerts}
                          onChange={(e) => handleToggleNotification('diseaseAlerts', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-10 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#15803D]"></div>
                      </label>
                    </div>

                    <div className="py-3.5 flex items-center justify-between">
                      <div>
                        <p className="text-xs sm:text-sm font-bold text-slate-800">Scan Results Ready</p>
                        <p className="text-[11px] text-slate-500">Get notified immediately when your AI crop scan analysis is ready</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={notifScanResults}
                          onChange={(e) => handleToggleNotification('scanResults', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-10 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#15803D]"></div>
                      </label>
                    </div>

                    <div className="py-3.5 flex items-center justify-between">
                      <div>
                        <p className="text-xs sm:text-sm font-bold text-slate-800">Community Activity & Replies</p>
                        <p className="text-[11px] text-slate-500">Receive updates when other farmers like or comment on your discussions</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={notifCommunity}
                          onChange={(e) => handleToggleNotification('communityActivity', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-10 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#15803D]"></div>
                      </label>
                    </div>

                    <div className="py-3.5 flex items-center justify-between">
                      <div>
                        <p className="text-xs sm:text-sm font-bold text-slate-800">Crop Care Reminders</p>
                        <p className="text-[11px] text-slate-500">Timely watering, fertilizing, and seasonal care alerts for your tracked crops</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={notifCropReminders}
                          onChange={(e) => handleToggleNotification('cropReminders', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-10 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#15803D]"></div>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* SECTION 4: Appearance */}
              {activeTab === 'appearance' && (
                <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-2xs">
                  <div className="flex items-center gap-2 mb-4">
                    <Eye className="w-5 h-5 text-[#15803D]" />
                    <h3 className="text-base font-bold text-slate-900">Appearance Theme</h3>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <div
                      onClick={() => setAppearanceTheme('light')}
                      className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                        appearanceTheme === 'light'
                          ? 'border-[#15803D] bg-emerald-50/20'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="h-10 bg-slate-100 rounded-lg border border-slate-200 mb-2 flex items-center px-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 mr-1.5" />
                        <span className="h-1.5 w-12 bg-slate-300 rounded" />
                      </div>
                      <p className="text-xs font-bold text-slate-800">Light Mode (Default)</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">Clean agricultural white and emerald</p>
                    </div>
                  </div>
                </div>
              )}

              {/* SECTION 5: Danger Zone (Always shown at bottom or on privacy) */}
              <div className="bg-red-50/40 border border-red-200 rounded-2xl p-5 sm:p-6 shadow-2xs">
                <div className="flex items-center gap-2 mb-2 text-red-700">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                  <h3 className="text-base font-bold">Danger Zone</h3>
                </div>
                <p className="text-xs text-red-600/90 leading-relaxed mb-4">
                  Once you delete your account, there is no going back. All of your crop records, disease scan history, saved items, and community contributions will be permanently removed.
                </p>
                <button
                  type="button"
                  onClick={() => setShowDeleteModal(true)}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete My Account</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delete Account Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-red-100 space-y-4">
            <div className="flex items-center gap-3 text-red-600">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900">Are you absolutely sure?</h3>
                <p className="text-xs text-slate-500">This action cannot be undone.</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              This will permanently delete your AgriVision AI account, removing all tracked crops, disease scans, bookmarks, and account activity from our database.
            </p>

            {deleteError && (
              <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
                {deleteError}
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Enter your password to confirm
              </label>
              <input
                type="password"
                value={deleteConfirmPassword}
                onChange={(e) => setDeleteConfirmPassword(e.target.value)}
                placeholder="Your password"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-red-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteConfirmPassword('');
                  setDeleteError(null);
                }}
                disabled={isDeleting}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteAccount}
                disabled={isDeleting}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer disabled:bg-red-300"
              >
                {isDeleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                <span>Permanently Delete Account</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
