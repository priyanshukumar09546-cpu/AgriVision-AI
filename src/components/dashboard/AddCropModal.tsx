import React, { useState } from 'react';
import { X, Sprout, Plus, Loader2 } from 'lucide-react';
import { addUserCrop } from '../../services/dashboardService';

interface AddCropModalProps {
  isOpen: boolean;
  userId: string;
  onClose: () => void;
  onCropAdded: () => void;
  onToast: (msg: string) => void;
}

const SUPPORTED_CROPS_LIST = [
  { name: 'Tomato', image: '/crops_assets/crop_tomato_2x.jpg' },
  { name: 'Potato', image: '/crops_assets/crop_potato_2x.jpg' },
  { name: 'Chili', image: '/crops_assets/crop_chili_2x.jpg' },
  { name: 'Cotton', image: '/crops_assets/crop_cotton_2x.jpg' },
  { name: 'Wheat', image: '/crops_assets/crop_wheat_2x.jpg' },
  { name: 'Rice', image: '/crops_assets/crop_rice_2x.jpg' },
  { name: 'Maize', image: '/crops_assets/crop_maize_2x.jpg' },
  { name: 'Soybean', image: '/crops_assets/crop_soybean_2x.jpg' },
  { name: 'Apple', image: '/crops_assets/crop_apple_2x.jpg' },
  { name: 'Banana', image: '/crops_assets/crop_banana_2x.jpg' },
  { name: 'Grapes', image: '/crops_assets/crop_grapes_2x.jpg' },
  { name: 'Onion', image: '/crops_assets/crop_onion_2x.jpg' },
  { name: 'Sugarcane', image: '/crops_assets/crop_sugarcane_2x.jpg' },
];

export const AddCropModal: React.FC<AddCropModalProps> = ({
  isOpen,
  userId,
  onClose,
  onCropAdded,
  onToast,
}) => {
  const [selectedCropName, setSelectedCropName] = useState(SUPPORTED_CROPS_LIST[0].name);
  const [plantedDate, setPlantedDate] = useState('Mar 2026');
  const [areaAcres, setAreaAcres] = useState('2.5');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const currentCrop = SUPPORTED_CROPS_LIST.find((c) => c.name === selectedCropName) || SUPPORTED_CROPS_LIST[0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await addUserCrop({
        userId,
        cropName: currentCrop.name,
        cropImage: currentCrop.image,
        plantedDate,
        areaAcres: parseFloat(areaAcres) || 0,
      });

      if (res.success) {
        onToast(`${currentCrop.name} added to your farm crops.`);
        onCropAdded();
        onClose();
      } else {
        onToast(res.error || 'Failed to add crop.');
      }
    } catch {
      onToast('Error saving crop to database.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs select-none">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-[420px] w-full p-5 sm:p-6 shadow-2xl relative text-left animate-in fade-in zoom-in-95">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-[#DCFCE7] text-[#15803D] flex items-center justify-center">
            <Sprout className="w-4 h-4" />
          </div>
          <h3 className="text-base font-bold text-[#0F172A]">Add Crop to My Farm</h3>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Select Crop
            </label>
            <select
              value={selectedCropName}
              onChange={(e) => setSelectedCropName(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-[#15803D] bg-white font-medium text-slate-800"
            >
              {SUPPORTED_CROPS_LIST.map((c) => (
                <option key={c.name} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
            <img
              src={currentCrop.image}
              alt={currentCrop.name}
              className="w-12 h-12 rounded-lg object-cover shrink-0"
            />
            <div>
              <span className="text-xs font-bold text-[#0F172A] block">{currentCrop.name}</span>
              <span className="text-[10.5px] text-slate-500">Standard botanical variety</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Planted Date
              </label>
              <input
                type="text"
                value={plantedDate}
                onChange={(e) => setPlantedDate(e.target.value)}
                placeholder="e.g., Mar 2026"
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-[#15803D]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Area (Acres)
              </label>
              <input
                type="number"
                step="0.1"
                value={areaAcres}
                onChange={(e) => setAreaAcres(e.target.value)}
                placeholder="e.g., 2.5"
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-[#15803D]"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 text-xs font-bold bg-[#15803D] hover:bg-[#166534] text-white rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Crop</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
