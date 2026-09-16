import React from 'react';
import { ArrowLeft } from 'lucide-react';

interface AuthMobileHeaderProps {
  onBackClick: () => void;
}

export const AuthMobileHeader: React.FC<AuthMobileHeaderProps> = ({ onBackClick }) => {
  return (
    <div className="relative w-full h-[220px] sm:h-[250px] overflow-hidden select-none bg-slate-900">
      {/* Background Seedling Image with sunlight */}
      <img
        src="/auth_assets/auth_sprout_mobile.jpg"
        alt="AgriVision AI Seedling"
        className="w-full h-full object-cover opacity-85"
      />

      {/* Dark gradient overlay for text readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/25 to-black/70 pointer-events-none" />

      {/* Top Left: Back button */}
      <div className="absolute top-4 left-4 z-20">
        <button
          type="button"
          onClick={onBackClick}
          className="w-9 h-9 rounded-full bg-white/80 hover:bg-white text-slate-800 flex items-center justify-center shadow-md backdrop-blur-xs transition-transform active:scale-95 cursor-pointer"
          aria-label="Back to Home"
        >
          <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
        </button>
      </div>

      {/* Center: Brand Logo & Tagline */}
      <div className="absolute inset-x-0 top-7 z-10 flex flex-col items-center justify-center text-center px-4">
        <div className="flex items-center gap-2">
          <img
            src="/assets/leaf_logo_vector.svg"
            alt="AgriVision AI Leaf Logo"
            className="w-8 h-8 object-contain drop-shadow-md"
            width="32"
            height="32"
          />
          <div className="flex items-baseline tracking-tight">
            <span className="text-xl font-extrabold text-white drop-shadow-xs">
              AgriVision
            </span>
            <span className="text-xl font-extrabold text-[#4ADE80] ml-1 drop-shadow-xs">
              AI
            </span>
          </div>
        </div>
        <span className="text-[11px] font-medium text-slate-200 mt-1 drop-shadow-xs">
          Healthy Crops. Brighter Tomorrow.
        </span>
      </div>
    </div>
  );
};
