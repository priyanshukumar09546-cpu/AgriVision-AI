import React, { useState, useEffect } from 'react';
import { Navbar } from '../components/Navbar';
import { DashboardSidebar } from '../components/dashboard/DashboardSidebar';
import {
  Sprout,
  Plus,
  Trash2,
  Edit2,
  Calendar,
  Layers,
  Camera,
  Loader2,
  Activity,
  Bell,
  FileText,
  LayoutDashboard
} from 'lucide-react';
import { getStoredAuthUser } from '../services/authService';
import type { AuthUser } from '../services/authService';
import {
  fetchUserCrops,
  updateUserCrop,
  deleteUserCrop,
} from '../services/accountService';
import type { UserCrop } from '../services/accountService';
import { AddCropModal } from '../components/dashboard/AddCropModal';
import { navigateTo } from '../utils/navigation';

interface MyCropsPageProps {
  onRouteChange?: (route: string) => void;
}

export const MyCropsPage: React.FC<MyCropsPageProps> = ({ onRouteChange }) => {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => getStoredAuthUser());
  const [crops, setCrops] = useState<UserCrop[]>([]);
  const [activeTab, setActiveTab] = useState<'All Crops' | 'Growing' | 'Harvested' | 'Needs Attention'>('All Crops');
  const [isLoading, setIsLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingCrop, setEditingCrop] = useState<UserCrop | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const nav = (route: string) => navigateTo(route, onRouteChange);

  useEffect(() => {
    const user = getStoredAuthUser();
    if (!user) {
      nav('/login');
    } else {
      setCurrentUser(user);
    }
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const loadCrops = async () => {
    if (!currentUser) return;
    setIsLoading(true);
    const data = await fetchUserCrops(currentUser.id);
    setCrops(data);
    setIsLoading(false);
  };

  useEffect(() => {
    loadCrops();
  }, [currentUser?.id]);

  const handleDelete = async (cropId: string, cropName: string) => {
    if (!window.confirm(`Are you sure you want to remove ${cropName} from your crops?`)) return;
    if (!currentUser) return;
    const ok = await deleteUserCrop(cropId, currentUser.id);
    if (ok) {
      showToast(`${cropName} removed from your crops.`);
      loadCrops();
    } else {
      showToast('Failed to remove crop.');
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCrop || !currentUser) return;
    const res = await updateUserCrop(editingCrop.id, {
      userId: currentUser.id,
      plantedDate: editingCrop.plantedDate,
      areaAcres: Number(editingCrop.areaAcres) || 0,
      status: editingCrop.status || 'Growing',
    });
    if (res.success) {
      showToast('Crop updated successfully.');
      setEditingCrop(null);
      loadCrops();
    } else {
      showToast(res.error || 'Failed to update crop.');
    }
  };

  // Filter crops by active tab
  const filteredCrops = crops.filter((crop) => {
    if (activeTab === 'All Crops') return true;
    if (activeTab === 'Growing') return (crop.status || 'Growing').toLowerCase() === 'growing';
    if (activeTab === 'Harvested') return (crop.status || '').toLowerCase() === 'harvested';
    if (activeTab === 'Needs Attention') {
      return (
        (crop.status || '').toLowerCase().includes('attention') ||
        (crop.healthStatus || '').toLowerCase().includes('attention') ||
        crop.scanCount > 1
      );
    }
    return true;
  });

  if (!currentUser) return null;

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col antialiased text-slate-800">
      <Navbar activeRoute="/my-crops" onRouteChange={onRouteChange} />

      <div className="flex flex-1 w-full max-w-[1500px] mx-auto pt-3 sm:pt-5 pb-12 px-3 sm:px-6 lg:px-8 gap-6">
        {/* Left Sidebar */}
        <div className="hidden lg:block w-56 xl:w-60 shrink-0">
          <div className="sticky top-20">
            <DashboardSidebar activeItem="crops" onRouteChange={nav} />
          </div>
        </div>

        {/* Main Workspace */}
        <div className="flex-1 min-w-0 space-y-6">
          {/* Header Card */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-2xs">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4">
              <div>
                <h1 className="text-xl sm:text-2xl font-extrabold text-[#0F172A] tracking-tight">
                  My Crops
                </h1>
                <p className="text-xs text-slate-500 mt-1">
                  Manage your crops, track their health and get personalized insights.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsAddModalOpen(true)}
                className="px-4 py-2 bg-[#15803D] hover:bg-[#166534] text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer self-stretch sm:self-auto justify-center"
              >
                <Plus className="w-4 h-4" />
                <span>Add Crop</span>
              </button>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-2 pt-2 border-t border-slate-100 overflow-x-auto">
              {(['All Crops', 'Growing', 'Harvested', 'Needs Attention'] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    activeTab === tab
                      ? 'bg-[#DCFCE7] text-[#15803D]'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Crops Grid / Empty State */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-2xs">
            {isLoading ? (
              <div className="py-16 text-center">
                <Loader2 className="w-8 h-8 text-[#15803D] animate-spin mx-auto mb-2" />
                <p className="text-xs text-slate-400">Loading your farm crops...</p>
              </div>
            ) : filteredCrops.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredCrops.map((crop) => (
                  <div
                    key={crop.id}
                    className="border border-slate-200/90 rounded-2xl overflow-hidden hover:shadow-md transition-all group bg-white flex flex-col justify-between"
                  >
                    <div>
                      {/* Crop Image */}
                      <div className="relative h-36 w-full bg-slate-100 overflow-hidden">
                        <img
                          src={crop.image || '/crops/tomato.png'}
                          alt={crop.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                        <span className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/90 backdrop-blur-xs text-slate-800 shadow-2xs">
                          {crop.status || 'Growing'}
                        </span>
                      </div>

                      {/* Crop Details */}
                      <div className="p-4 space-y-2">
                        <div className="flex items-center justify-between">
                          <h3 className="text-sm font-bold text-[#0F172A]">{crop.name}</h3>
                          <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                            {crop.scanCount} {crop.scanCount === 1 ? 'scan' : 'scans'}
                          </span>
                        </div>

                        <div className="text-xs text-slate-500 space-y-1">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            <span>{crop.plantedDate || 'Recently planted'}</span>
                          </div>
                          {crop.areaAcres > 0 && (
                            <div className="flex items-center gap-1.5">
                              <Layers className="w-3.5 h-3.5 text-slate-400" />
                              <span>{crop.areaAcres} Acres</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="px-4 py-3 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
                      <button
                        type="button"
                        onClick={() => nav('/detect')}
                        className="text-xs font-bold text-[#15803D] hover:underline flex items-center gap-1"
                      >
                        <Camera className="w-3.5 h-3.5" />
                        <span>Scan Leaf</span>
                      </button>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setEditingCrop(crop)}
                          className="p-1 text-slate-400 hover:text-slate-700 transition-colors"
                          title="Edit Crop"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(crop.id, crop.name)}
                          className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                          title="Delete Crop"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* Honest Empty State matching reference */
              <div className="py-16 text-center max-w-md mx-auto space-y-4 select-none">
                <div className="w-16 h-16 rounded-full bg-emerald-50 text-[#15803D] flex items-center justify-center mx-auto border border-emerald-100">
                  <Sprout className="w-8 h-8 stroke-[2]" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-[#0F172A]">No crops added yet</h2>
                  <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                    Start by adding your first crop to get personalized insights, disease alerts and farming recommendations.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(true)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#15803D] hover:bg-[#166534] text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Your First Crop</span>
                </button>
              </div>
            )}
          </div>

          {/* Bottom Box: Why add crops? matching reference */}
          <div className="bg-emerald-50/50 border border-emerald-100 rounded-2xl p-5 sm:p-6 select-none">
            <h3 className="text-xs font-bold text-emerald-900 flex items-center gap-1.5 mb-4">
              <span>💡</span>
              <span>Why add crops?</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="bg-white/90 border border-emerald-100/80 rounded-xl p-3.5 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-100/70 text-[#15803D] flex items-center justify-center shrink-0">
                  <Activity className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-slate-800">Track crop health</span>
              </div>

              <div className="bg-white/90 border border-emerald-100/80 rounded-xl p-3.5 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-100/70 text-[#15803D] flex items-center justify-center shrink-0">
                  <Bell className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-slate-800">Get disease alerts</span>
              </div>

              <div className="bg-white/90 border border-emerald-100/80 rounded-xl p-3.5 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-100/70 text-[#15803D] flex items-center justify-center shrink-0">
                  <FileText className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-slate-800">Personalized recommendations</span>
              </div>

              <div className="bg-white/90 border border-emerald-100/80 rounded-xl p-3.5 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-100/70 text-[#15803D] flex items-center justify-center shrink-0">
                  <LayoutDashboard className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-slate-800">Better yield planning</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Crop Modal */}
      {isAddModalOpen && (
        <AddCropModal
          isOpen={isAddModalOpen}
          userId={currentUser.id}
          onClose={() => setIsAddModalOpen(false)}
          onCropAdded={() => {
            loadCrops();
          }}
          onToast={(msg) => showToast(msg)}
        />
      )}

      {/* Edit Crop Modal */}
      {editingCrop && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-xl border border-slate-200">
            <h3 className="text-sm font-bold text-[#0F172A] mb-4">Edit {editingCrop.name}</h3>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Planted Date</label>
                <input
                  type="text"
                  value={editingCrop.plantedDate}
                  onChange={(e) => setEditingCrop({ ...editingCrop, plantedDate: e.target.value })}
                  placeholder="e.g. Planted Mar 2026"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Area (Acres)</label>
                <input
                  type="number"
                  step="0.1"
                  value={editingCrop.areaAcres}
                  onChange={(e) => setEditingCrop({ ...editingCrop, areaAcres: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Growth Status</label>
                <select
                  value={editingCrop.status || 'Growing'}
                  onChange={(e) => setEditingCrop({ ...editingCrop, status: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                >
                  <option value="Growing">Growing</option>
                  <option value="Harvested">Harvested</option>
                  <option value="Needs Attention">Needs Attention</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingCrop(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#15803D] hover:bg-[#166534] text-white text-xs font-bold rounded-xl shadow-xs"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Floating Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 animate-fade-in border border-slate-700">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};
