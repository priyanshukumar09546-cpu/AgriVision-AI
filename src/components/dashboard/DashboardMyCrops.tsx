import React, { useState } from 'react';
import { Plus, Trash2, Sprout } from 'lucide-react';
import type { UserCropItem } from '../../services/dashboardService';
import { deleteUserCrop } from '../../services/dashboardService';
import { AddCropModal } from './AddCropModal';

interface DashboardMyCropsProps {
  crops: UserCropItem[];
  userId: string;
  onRefresh: () => void;
  onViewAll: () => void;
  onToast: (msg: string) => void;
}

export const DashboardMyCrops: React.FC<DashboardMyCropsProps> = ({
  crops,
  userId,
  onRefresh,
  onViewAll,
  onToast,
}) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (cropId: string, cropName: string) => {
    if (!window.confirm(`Remove ${cropName} from your crops?`)) return;
    setDeletingId(cropId);
    const ok = await deleteUserCrop(cropId, userId);
    if (ok) {
      onToast(`${cropName} removed.`);
      onRefresh();
    } else {
      onToast('Failed to remove crop.');
    }
    setDeletingId(null);
  };

  return (
    <div id="dashboard-my-crops" className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-2xs select-none text-left">
      {/* Header matching reference */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <h2 className="text-sm font-bold text-[#0F172A]">My Crops</h2>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onViewAll}
            className="text-xs font-bold text-[#15803D] hover:text-[#166534] cursor-pointer"
          >
            View All
          </button>
          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="px-2.5 py-1 bg-[#15803D] hover:bg-[#166534] text-white text-[11px] font-bold rounded-lg shadow-2xs flex items-center gap-1 cursor-pointer transition-colors"
          >
            <Plus className="w-3 h-3" />
            <span>Add Crop</span>
          </button>
        </div>
      </div>

      {/* Crops Horizontal Row matching reference */}
      <div className="pt-3">
        {crops.length === 0 ? (
          <div className="py-6 text-center text-xs text-slate-400 space-y-2">
            <Sprout className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="font-semibold text-slate-600">No crops added yet.</p>
            <p className="text-[10.5px]">Click "+ Add Crop" to track your field crops.</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
            {crops.map((crop) => (
              <div
                key={crop.id}
                className="group relative bg-slate-50/70 border border-slate-200/80 rounded-xl p-2 flex flex-col justify-between hover:border-emerald-300 transition-all text-left"
              >
                {/* Crop Image */}
                <div className="w-full aspect-[4/3] rounded-lg overflow-hidden bg-slate-100 mb-2 relative">
                  <img
                    src={crop.image || '/crops_assets/crop_tomato_2x.jpg'}
                    alt={crop.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                  {/* Delete button on hover */}
                  <button
                    type="button"
                    title="Delete crop"
                    onClick={() => handleDelete(crop.id, crop.name)}
                    disabled={deletingId === crop.id}
                    className="absolute top-1 right-1 p-1 bg-white/90 rounded-md text-slate-400 hover:text-rose-600 opacity-0 group-hover:opacity-100 transition-opacity shadow-2xs"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-[#0F172A] leading-tight truncate">
                    {crop.name}
                  </h4>
                  <div className="text-[9.5px] text-slate-400 leading-tight mt-0.5 truncate">
                    {crop.plantedDate ? `Planted ${crop.plantedDate}` : 'Planted recently'}
                  </div>
                  <div className="text-[9.5px] font-semibold text-emerald-800 leading-tight mt-0.5">
                    {crop.scanCount} {crop.scanCount === 1 ? 'scan' : 'scans'}
                  </div>
                </div>
              </div>
            ))}

            {/* "+ Add Crop" card button matching reference */}
            <button
              type="button"
              onClick={() => setIsAddModalOpen(true)}
              className="bg-slate-50/70 hover:bg-emerald-50/50 border border-dashed border-slate-300 hover:border-emerald-400 rounded-xl p-2 flex flex-col items-center justify-center text-center transition-all cursor-pointer min-h-[110px]"
            >
              <div className="w-8 h-8 rounded-full bg-white text-[#15803D] flex items-center justify-center shadow-2xs mb-1.5 border border-slate-200/80">
                <Plus className="w-4 h-4" />
              </div>
              <span className="text-[11px] font-bold text-[#15803D]">Add Crop</span>
            </button>
          </div>
        )}
      </div>

      {/* Add Crop Modal */}
      <AddCropModal
        isOpen={isAddModalOpen}
        userId={userId}
        onClose={() => setIsAddModalOpen(false)}
        onCropAdded={onRefresh}
        onToast={onToast}
      />
    </div>
  );
};
