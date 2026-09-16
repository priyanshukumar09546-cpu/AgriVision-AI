import React, { useState, useEffect } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import {
  Settings,
  Cpu,
  Key,
  Database,
  Save,
  CheckCircle2,
  Eye,
  EyeOff,
  Loader2,
  ShieldCheck,
  Server
} from 'lucide-react';
import {
  fetchAdminSettings,
  updateAdminSettings,
  fetchAdminAuditLogs
} from '../../services/adminService';

interface AdminSettingsPageProps {
  onRouteChange?: (route: string) => void;
}

export const AdminSettingsPage: React.FC<AdminSettingsPageProps> = ({ onRouteChange }) => {
  const getTabFromUrl = () => {
    if (typeof window === 'undefined') return 'general';
    const params = new URLSearchParams(window.location.search);
    return params.get('tab') || 'general';
  };

  const [activeTab, setActiveTab] = useState<string>(getTabFromUrl());
  const [settings, setSettings] = useState<Record<string, any>>({
    site_name: 'AgriVision AI',
    support_email: 'support@agrivision.ai',
    support_phone: '+91 1800 123 4567',
    maintenance_mode: 'false',
    allow_registrations: 'true',
    ai_model_version: 'PlantVillage-ResNet50-v2.4',
    confidence_threshold: '70',
    weather_auto_triage: 'true',
    weather_api_key: '••••••••••••••••••••••••'
  });

  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const loadData = async () => {
    setIsLoading(true);
    const s = await fetchAdminSettings();
    if (Object.keys(s).length > 0) {
      setSettings(prev => ({ ...prev, ...s }));
    }
    const logsRes = await fetchAdminAuditLogs(1, 30);
    setAuditLogs(logsRes.logs || []);
    setIsLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.set('tab', tab);
      window.history.pushState({}, '', url.toString());
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    const res = await updateAdminSettings(settings);
    setIsSaving(false);
    if (res.success) {
      showToast('Platform settings updated successfully.');
      loadData();
    } else {
      showToast(res.error || 'Failed to save settings.');
    }
  };

  return (
    <AdminLayout activeItem={`settings-${activeTab}`} onRouteChange={onRouteChange}>
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 border border-slate-700 animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <p className="text-xs font-semibold">{toastMsg}</p>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">System Settings & Infrastructure</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure global platform parameters, AI inference model tuning, API credentials, and audit security logs.
          </p>
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        <button
          type="button"
          onClick={() => handleTabChange('general')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
            activeTab === 'general'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>General Platform</span>
        </button>
        <button
          type="button"
          onClick={() => handleTabChange('model')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
            activeTab === 'model'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Cpu className="w-4 h-4" />
          <span>AI & Vision Engine</span>
        </button>
        <button
          type="button"
          onClick={() => handleTabChange('apikeys')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
            activeTab === 'apikeys'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Key className="w-4 h-4" />
          <span>API Keys & Security</span>
        </button>
        <button
          type="button"
          onClick={() => handleTabChange('logs')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
            activeTab === 'logs'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Database className="w-4 h-4" />
          <span>Audit Logs ({auditLogs.length})</span>
        </button>
      </div>

      {isLoading ? (
        <div className="py-24 flex flex-col items-center justify-center text-slate-400 bg-white rounded-2xl border border-slate-200">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-600 mb-2" />
          <p className="text-xs font-semibold">Loading system settings...</p>
        </div>
      ) : activeTab === 'general' ? (
        /* General Settings Form */
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs max-w-2xl">
          <form onSubmit={handleSaveSettings} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Platform Brand Name</label>
              <input
                type="text"
                value={settings.site_name || 'AgriVision AI'}
                onChange={(e) => setSettings({ ...settings, site_name: e.target.value })}
                className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Support Email</label>
                <input
                  type="email"
                  value={settings.support_email || 'support@agrivision.ai'}
                  onChange={(e) => setSettings({ ...settings, support_email: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Helpline Phone</label>
                <input
                  type="text"
                  value={settings.support_phone || '+91 1800 123 4567'}
                  onChange={(e) => setSettings({ ...settings, support_phone: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 space-y-3">
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                <div>
                  <p className="text-xs font-bold text-slate-900">Maintenance Mode</p>
                  <p className="text-[11px] text-slate-500">Temporarily show maintenance banner to non-admin visitors</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.maintenance_mode === 'true' || settings.maintenance_mode === true}
                  onChange={(e) => setSettings({ ...settings, maintenance_mode: e.target.checked ? 'true' : 'false' })}
                  className="w-4 h-4 text-emerald-600 rounded-md focus:ring-emerald-500"
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                <div>
                  <p className="text-xs font-bold text-slate-900">Allow Farmer Sign-ups</p>
                  <p className="text-[11px] text-slate-500">Enable new user self-registration via /signup</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.allow_registrations === 'true' || settings.allow_registrations === true}
                  onChange={(e) => setSettings({ ...settings, allow_registrations: e.target.checked ? 'true' : 'false' })}
                  className="w-4 h-4 text-emerald-600 rounded-md focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={isSaving}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs cursor-pointer flex items-center gap-2"
              >
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                <span>Save Platform Settings</span>
              </button>
            </div>
          </form>
        </div>
      ) : activeTab === 'model' ? (
        /* AI & Model Settings */
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs max-w-2xl">
          <form onSubmit={handleSaveSettings} className="space-y-5">
            <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200 flex items-start gap-3">
              <Cpu className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-emerald-900">PlantVillage Vision Inference Engine</h4>
                <p className="text-[11.5px] text-emerald-800/90 leading-relaxed mt-0.5">
                  The model processes leaf samples through HSV vegetation segmentation and lesion pattern classification mapped against 38 verified PlantVillage crop disease classes.
                </p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Model Identifier / Release</label>
              <input
                type="text"
                disabled
                value={settings.ai_model_version || 'PlantVillage-ResNet50-v2.4'}
                className="w-full px-3.5 py-2 text-xs bg-slate-100 border border-slate-200 rounded-xl text-slate-600 font-mono font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Minimum Confidence Threshold ({settings.confidence_threshold || 70}%)
              </label>
              <input
                type="range"
                min="50"
                max="95"
                step="5"
                value={settings.confidence_threshold || 70}
                onChange={(e) => setSettings({ ...settings, confidence_threshold: e.target.value })}
                className="w-full accent-emerald-600 cursor-pointer"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Scans below this score trigger "Needs Agronomist Attention" state to avoid false treatments.
              </p>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
              <div>
                <p className="text-xs font-bold text-slate-900">Real-time Weather Disease Risk Auto-Triage</p>
                <p className="text-[11px] text-slate-500">Cross-reference local humidity & temperature to correlate fungal risk</p>
              </div>
              <input
                type="checkbox"
                checked={settings.weather_auto_triage === 'true' || settings.weather_auto_triage === true}
                onChange={(e) => setSettings({ ...settings, weather_auto_triage: e.target.checked ? 'true' : 'false' })}
                className="w-4 h-4 text-emerald-600 rounded-md focus:ring-emerald-500"
              />
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={isSaving}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs cursor-pointer flex items-center gap-2"
              >
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                <span>Update AI Configuration</span>
              </button>
            </div>
          </form>
        </div>
      ) : activeTab === 'apikeys' ? (
        /* API Keys */
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs max-w-2xl space-y-5">
          <div>
            <h3 className="text-sm font-bold text-slate-900">External Integrations & Credentials</h3>
            <p className="text-xs text-slate-500 mt-0.5">Manage live weather and cloud service credentials.</p>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Server className="w-4 h-4 text-slate-500" />
                <span className="text-xs font-bold text-slate-800">OpenWeatherMap API</span>
              </div>
              <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">Connected</span>
            </div>
            <div className="relative">
              <input
                type={showApiKey ? 'text' : 'password'}
                value={settings.weather_api_key || 'c58f001272aeef100bfae4e5bfa780d'}
                onChange={(e) => setSettings({ ...settings, weather_api_key: e.target.value })}
                className="w-full pl-3.5 pr-10 py-2 text-xs bg-white border border-slate-200 rounded-xl font-mono text-slate-700"
              />
              <button
                type="button"
                onClick={() => setShowApiKey(!showApiKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span className="text-xs font-bold text-slate-800">Admin Secret Token Engine</span>
              </div>
              <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">SHA-256 Active</span>
            </div>
            <p className="text-xs text-slate-500">
              Administrative sessions are authenticated via SHA-256 HMAC tokens with 24-hour expiration.
            </p>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="button"
              onClick={handleSaveSettings}
              disabled={isSaving}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs cursor-pointer flex items-center gap-2"
            >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>Save API Keys</span>
            </button>
          </div>
        </div>
      ) : (
        /* Audit Logs Table */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          {auditLogs.length === 0 ? (
            <div className="py-20 text-center px-4">
              <div className="w-14 h-14 mx-auto rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
                <Database className="w-7 h-7" />
              </div>
              <h3 className="text-sm font-bold text-slate-800">No audit logs recorded yet</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Administrative actions like user modifications, catalog updates, and settings changes will be logged here.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/70 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="py-3 px-4">Administrator</th>
                    <th className="py-3 px-4">Action</th>
                    <th className="py-3 px-4">Target Entity</th>
                    <th className="py-3 px-4">Details</th>
                    <th className="py-3 px-4">Timestamp</th>
                    <th className="py-3 px-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {auditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-bold text-slate-900">
                        {log.admin_name || 'Administrator'}
                      </td>
                      <td className="py-3 px-4 font-mono text-[11.5px] text-slate-700">
                        {log.action}
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-semibold">
                          {log.entity || 'System'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-600 max-w-xs truncate">
                        {log.details || '—'}
                      </td>
                      <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                        {log.timestamp ? new Date(log.timestamp).toLocaleString('en-GB') : 'Just now'}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10.5px] font-bold bg-emerald-50 text-emerald-700">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          Success
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </AdminLayout>
  );
};
