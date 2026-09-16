import React from 'react';
import { Edit3, Mail, MapPin } from 'lucide-react';

interface DashboardProfileCardProps {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    avatar_url?: string;
    location?: string;
    bio?: string;
    created_at?: string;
  };
  totalScans: number;
  totalCrops: number;
  onEditProfile: () => void;
}

export const DashboardProfileCard: React.FC<DashboardProfileCardProps> = ({
  user,
  totalScans,
  totalCrops,
  onEditProfile,
}) => {
  const formatMemberSince = (createdAt?: string) => {
    if (!createdAt) return 'Recently';
    try {
      const dt = new Date(createdAt);
      return dt.toLocaleDateString(undefined, { month: 'short', year: 'numeric' });
    } catch {
      return 'Recently';
    }
  };

  const initial = user.name ? user.name.charAt(0).toUpperCase() : 'F';
  const roleDisplay = user.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'Farmer';

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-2xs flex flex-col justify-between select-none text-left h-full">
      <div>
        {/* Top Header: Title + Edit Profile Link */}
        <div className="flex items-center justify-between pb-2">
          <h2 className="text-sm font-bold text-[#0F172A]">My Profile</h2>
          <button
            type="button"
            onClick={onEditProfile}
            className="text-[11px] font-bold text-[#15803D] hover:text-[#166534] flex items-center gap-1 cursor-pointer transition-colors"
          >
            <Edit3 className="w-3 h-3" />
            <span>Edit Profile</span>
          </button>
        </div>

        {/* User Identity Center */}
        <div className="flex items-center gap-3.5 pt-2">
          {/* Avatar / Photo */}
          <div className="w-14 h-14 rounded-full overflow-hidden bg-emerald-100 border-2 border-emerald-200 shrink-0 flex items-center justify-center">
            {user.avatar_url ? (
              <img
                src={user.avatar_url}
                alt={user.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            ) : (
              <span className="text-lg font-black text-[#15803D]">{initial}</span>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-extrabold text-[#0F172A] truncate">
                {user.name || 'Farmer'}
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[9.5px] font-bold bg-[#DCFCE7] text-[#15803D]">
                {roleDisplay}
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-1 truncate">
              <Mail className="w-3 h-3 shrink-0 text-slate-400" />
              <span className="truncate">{user.email || 'grower@agrivision.ai'}</span>
            </div>

            <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-0.5 truncate">
              <MapPin className="w-3 h-3 shrink-0 text-slate-400" />
              <span className="truncate">{user.location || 'Regional Farm, India'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3 Metrics Footer matching reference */}
      <div className="grid grid-cols-3 gap-2 pt-3 mt-3 border-t border-slate-100 text-center">
        <div>
          <div className="text-base font-extrabold text-[#0F172A] leading-tight">
            {totalScans}
          </div>
          <span className="text-[10px] text-slate-400 font-medium">Scans</span>
        </div>

        <div>
          <div className="text-base font-extrabold text-[#0F172A] leading-tight">
            {totalCrops}
          </div>
          <span className="text-[10px] text-slate-400 font-medium">Crops</span>
        </div>

        <div>
          <div className="text-[11px] font-extrabold text-[#0F172A] leading-tight">
            {formatMemberSince(user.created_at)}
          </div>
          <span className="text-[10px] text-slate-400 font-medium">Member since</span>
        </div>
      </div>
    </div>
  );
};
