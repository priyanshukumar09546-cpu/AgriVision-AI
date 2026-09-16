import React, { useState, useEffect } from 'react';
import { Users, Sprout, ShieldCheck, Leaf } from 'lucide-react';
import { fetchPlatformStats, type PlatformStats } from '../services/insightsService';

export const BottomStats: React.FC = () => {
  const [stats, setStats] = useState<PlatformStats>({
    farmersRegistered: 0,
    cropsCovered: 8,
    totalCropsCataloged: 20,
    verifiedDiseases: 18,
    scansCompleted: 0,
    discussionsCount: 0,
  });

  useEffect(() => {
    fetchPlatformStats().then((data) => setStats(data));
  }, []);

  return (
    <section
      className="relative w-full py-5 sm:py-6 overflow-hidden text-white select-none border-t border-emerald-900/40"
      style={{
        backgroundImage:
          "linear-gradient(to right, rgba(10, 26, 40, 0.46), rgba(10, 26, 40, 0.40)), url('/assets/bottom_banner_clean_2x.jpg')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        imageRendering: 'auto',
      }}
    >
      <div className="max-w-[1240px] mx-auto px-6 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 lg:gap-6 items-center">
          {/* Stat 1: Registered Farmers */}
          <div className="flex items-center gap-3">
            <div className="text-emerald-400 shrink-0 drop-shadow-[0_1px_3px_rgba(0,0,0,0.5)]">
              <Users className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={2.2} />
            </div>
            <div>
              <p className="text-lg sm:text-xl lg:text-2xl font-extrabold text-white leading-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.7)] tracking-tight">
                {stats.farmersRegistered > 0 ? stats.farmersRegistered : 'Active'}
              </p>
              <p className="text-[10.5px] sm:text-[11px] text-slate-200 font-medium leading-tight drop-shadow-xs">
                {stats.farmersRegistered > 0 ? 'Farmers Registered' : 'Farmer Network'}
              </p>
            </div>
          </div>

          {/* Stat 2: Crops Covered */}
          <div className="flex items-center gap-3">
            <div className="text-emerald-400 shrink-0 drop-shadow-[0_1px_3px_rgba(0,0,0,0.5)]">
              <Sprout className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={2.2} />
            </div>
            <div>
              <p className="text-lg sm:text-xl lg:text-2xl font-extrabold text-white leading-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.7)] tracking-tight">
                {stats.totalCropsCataloged}+
              </p>
              <p className="text-[10.5px] sm:text-[11px] text-slate-200 font-medium leading-tight drop-shadow-xs">
                Crops Covered
              </p>
            </div>
          </div>

          {/* Stat 3: Verified Diseases */}
          <div className="flex items-center gap-3">
            <div className="text-emerald-400 shrink-0 drop-shadow-[0_1px_3px_rgba(0,0,0,0.5)]">
              <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={2.2} />
            </div>
            <div>
              <p className="text-lg sm:text-xl lg:text-2xl font-extrabold text-white leading-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.7)] tracking-tight">
                {stats.verifiedDiseases}+
              </p>
              <p className="text-[10.5px] sm:text-[11px] text-slate-200 font-medium leading-tight drop-shadow-xs">
                Verified Diseases
              </p>
            </div>
          </div>

          {/* Stat 4: A Healthier Greener Tomorrow */}
          <div className="flex items-center gap-3">
            <div className="text-emerald-400 shrink-0 drop-shadow-[0_1px_3px_rgba(0,0,0,0.5)]">
              <Leaf className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={2.2} />
            </div>
            <div>
              <p className="text-[11.5px] sm:text-[12.5px] font-medium text-slate-200 leading-tight drop-shadow-xs">
                A Healthier
              </p>
              <p className="text-[11.5px] sm:text-[12.5px] font-bold text-white leading-tight drop-shadow-[0_1px_3px_rgba(0,0,0,0.7)]">
                Greener Tomorrow
              </p>
            </div>
          </div>

          {/* Right Quote with Green Accent Line */}
          <div className="hidden md:flex flex-col items-end text-right">
            <p className="text-[11.5px] text-slate-200 italic leading-snug drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]">
              "Healthy crops today,
            </p>
            <p className="text-[11.5px] text-slate-200 italic leading-snug drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]">
              a brighter Tomorrow."
            </p>
            <div className="w-7 h-[2px] bg-[#22C55E] rounded-full mt-1.5 shadow-[0_0_8px_#22C55E]" />
          </div>
        </div>
      </div>
    </section>
  );
};
