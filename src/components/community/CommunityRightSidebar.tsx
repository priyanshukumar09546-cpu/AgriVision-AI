import React, { useState, useEffect } from 'react';
import { Users, MessageSquare, Sprout, Globe, Clock, Crown } from 'lucide-react';
import { COMMUNITY_EVENTS, TOP_CONTRIBUTORS } from '../../data/communityData';
import { fetchPlatformStats } from '../../services/insightsService';
import type { PlatformStats } from '../../services/insightsService';

interface CommunityRightSidebarProps {
  onRegisterEvent?: (eventId: string) => void;
  onJoinMovementClick?: () => void;
  onSeeAllStats?: () => void;
  onViewAllEvents?: () => void;
}

export const CommunityRightSidebar: React.FC<CommunityRightSidebarProps> = ({
  onRegisterEvent,
  onJoinMovementClick,
  onSeeAllStats,
  onViewAllEvents,
}) => {
  const [registeredEvents, setRegisteredEvents] = useState<Record<string, boolean>>({});
  const [stats, setStats] = useState<PlatformStats | null>(null);

  useEffect(() => {
    fetchPlatformStats().then((data) => {
      setStats(data);
    });
  }, []);

  const handleRegister = (id: string) => {
    setRegisteredEvents((prev) => ({ ...prev, [id]: true }));
    onRegisterEvent?.(id);
  };

  return (
    <aside className="w-full space-y-4">
      {/* 1. Community Stats Card */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-[0_1px_3px_rgba(0,0,0,0.02)] text-left">
        <div className="flex items-center justify-between mb-3.5">
          <h3 className="text-xs font-bold text-[#0F172A]">Community Stats</h3>
          <button
            type="button"
            onClick={onSeeAllStats}
            className="text-[11px] font-semibold text-[#15803D] hover:text-[#166534] transition-colors cursor-pointer"
          >
            See All
          </button>
        </div>

        {/* 4 Stats Grid */}
        <div className="grid grid-cols-4 gap-1 text-center py-1">
          {/* Stat 1: Members */}
          <div className="flex flex-col items-center">
            <div className="w-7 h-7 rounded-lg bg-[#E8F5E9] text-[#15803D] flex items-center justify-center mb-1">
              <Users className="w-3.5 h-3.5" />
            </div>
            <span className="text-[12.5px] font-extrabold text-[#0F172A] leading-tight">
              {stats ? ((stats.usersCount ?? stats.farmersRegistered ?? 0) > 0 ? `${stats.usersCount ?? stats.farmersRegistered}` : '1') : '...'}
            </span>
            <span className="text-[9.5px] text-slate-500 leading-tight mt-0.5">Members</span>
          </div>

          {/* Stat 2: Discussions */}
          <div className="flex flex-col items-center">
            <div className="w-7 h-7 rounded-lg bg-[#E8F5E9] text-[#15803D] flex items-center justify-center mb-1">
              <MessageSquare className="w-3.5 h-3.5" />
            </div>
            <span className="text-[12.5px] font-extrabold text-[#0F172A] leading-tight">
              {stats ? `${stats.postsCount ?? stats.discussionsCount ?? 0}` : '...'}
            </span>
            <span className="text-[9.5px] text-slate-500 leading-tight mt-0.5">Discussions</span>
          </div>

          {/* Stat 3: Crops */}
          <div className="flex flex-col items-center">
            <div className="w-7 h-7 rounded-lg bg-[#E8F5E9] text-[#15803D] flex items-center justify-center mb-1">
              <Sprout className="w-3.5 h-3.5" />
            </div>
            <span className="text-[12.5px] font-extrabold text-[#0F172A] leading-tight">
              {stats ? `${stats.cropsCount ?? stats.cropsCovered ?? 8}+` : '24+'}
            </span>
            <span className="text-[9.5px] text-slate-500 leading-tight mt-0.5">Crops</span>
          </div>

          {/* Stat 4: Countries */}
          <div className="flex flex-col items-center">
            <div className="w-7 h-7 rounded-lg bg-[#E8F5E9] text-[#15803D] flex items-center justify-center mb-1">
              <Globe className="w-3.5 h-3.5" />
            </div>
            <span className="text-[12.5px] font-extrabold text-[#0F172A] leading-tight">15+</span>
            <span className="text-[9.5px] text-slate-500 leading-tight mt-0.5">Regions</span>
          </div>
        </div>
      </div>

      {/* 2. Upcoming Events Card */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-[0_1px_3px_rgba(0,0,0,0.02)] text-left">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold text-[#0F172A]">Upcoming Events</h3>
          <button
            type="button"
            onClick={onViewAllEvents}
            className="text-[11px] font-semibold text-[#15803D] hover:text-[#166534] transition-colors cursor-pointer"
          >
            View All
          </button>
        </div>

        {/* Events List */}
        <div className="space-y-3">
          {COMMUNITY_EVENTS.map((evt) => {
            const isRegistered = registeredEvents[evt.id];
            return (
              <div key={evt.id} className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  {/* Date Block */}
                  <div className="w-10 h-11 rounded-lg bg-rose-50 border border-rose-100 flex flex-col items-center justify-center shrink-0">
                    <span className="text-[8.5px] font-bold text-rose-500 leading-tight">
                      {evt.month}
                    </span>
                    <span className="text-[13px] font-black text-slate-800 leading-tight">
                      {evt.day}
                    </span>
                  </div>

                  {/* Title & Time */}
                  <div className="min-w-0">
                    <h4 className="text-[11px] font-bold text-[#0F172A] leading-tight truncate">
                      {evt.title}
                    </h4>
                    <div className="flex items-center gap-1 text-[9.5px] text-slate-500 mt-1">
                      <Clock className="w-2.5 h-2.5" />
                      <span>
                        {evt.time} | {evt.mode}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Register Button */}
                <button
                  type="button"
                  onClick={() => handleRegister(evt.id)}
                  className={`shrink-0 px-3 py-1.5 text-[10.5px] font-semibold rounded-lg transition-colors shadow-2xs cursor-pointer ${
                    isRegistered
                      ? 'bg-slate-100 text-slate-500 cursor-default'
                      : 'bg-[#15803D] hover:bg-[#166534] text-white'
                  }`}
                >
                  {isRegistered ? 'Registered' : 'Register'}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Top Contributors Card */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-[0_1px_3px_rgba(0,0,0,0.02)] text-left">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold text-[#0F172A]">Top Contributors</h3>
          <span className="text-[11px] font-semibold text-[#15803D]">This Month</span>
        </div>

        {/* Ranked List */}
        <div className="space-y-2.5">
          {TOP_CONTRIBUTORS.map((c) => {
            const getRankBadge = (rank: number) => {
              if (rank === 1) return 'bg-[#FEF3C7] text-amber-800 font-bold';
              if (rank === 2) return 'bg-slate-100 text-slate-700 font-bold';
              if (rank === 3) return 'bg-amber-100 text-amber-900 font-bold';
              return 'bg-slate-50 text-slate-500 font-medium';
            };

            const getCrown = (crownType?: string) => {
              if (crownType === 'gold') return <Crown className="w-3.5 h-3.5 text-amber-500 fill-amber-500 shrink-0" />;
              if (crownType === 'silver') return <Crown className="w-3.5 h-3.5 text-slate-400 fill-slate-300 shrink-0" />;
              if (crownType === 'bronze') return <Crown className="w-3.5 h-3.5 text-amber-700 fill-amber-600 shrink-0" />;
              return null;
            };

            return (
              <div key={c.rank} className="flex items-center justify-between gap-2.5">
                <div className="flex items-center gap-2.5 min-w-0">
                  {/* Rank Circle */}
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] shrink-0 ${getRankBadge(
                      c.rank
                    )}`}
                  >
                    {c.rank}
                  </div>

                  {/* Avatar */}
                  <div className="w-7 h-7 rounded-full bg-slate-100 overflow-hidden border border-slate-200 shrink-0">
                    <img
                      src={c.avatar}
                      alt={c.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                  </div>

                  {/* Name & Points */}
                  <div className="min-w-0">
                    <h5 className="text-[11px] font-bold text-[#0F172A] leading-tight truncate">
                      {c.name}
                    </h5>
                    <span className="text-[9.5px] text-slate-500 leading-tight block">
                      {c.points}
                    </span>
                  </div>
                </div>

                {/* Crown Icon if top 3 */}
                {getCrown(c.crownType)}
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Right Bottom Promotional Card */}
      <div className="relative rounded-2xl overflow-hidden border border-slate-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.02)] min-h-[120px] bg-[#F4FCF6] text-left p-4 flex flex-col justify-between">
        {/* Background Image: hands holding seedling */}
        <div
          className="absolute inset-0 bg-no-repeat bg-right bg-cover pointer-events-none"
          style={{
            backgroundImage: 'url("/community_assets/promo_clean_bg_2x.jpg")',
            backgroundPosition: 'right center',
          }}
          aria-hidden="true"
        />

        {/* Soft overlay on left */}
        <div
          className="absolute inset-0 bg-gradient-to-r from-[#F4FCF6] via-[#F4FCF6]/95 via-45% to-transparent pointer-events-none"
          aria-hidden="true"
        />

        {/* Content */}
        <div className="relative z-10 max-w-[155px]">
          <h4 className="text-[12px] font-bold text-[#0F172A] leading-tight mb-3">
            A Stronger Farming Community for a Greener Tomorrow.
          </h4>

          <button
            type="button"
            onClick={onJoinMovementClick}
            className="px-3.5 py-1.5 bg-[#15803D] hover:bg-[#166534] text-white text-[10.5px] font-semibold rounded-lg transition-colors shadow-2xs inline-flex items-center gap-1 cursor-pointer"
          >
            <span>Join the Movement</span>
            <span>→</span>
          </button>
        </div>
      </div>
    </aside>
  );
};
