import React, { useState } from 'react';
import {
  Home,
  MessageSquare,
  Edit3,
  Bookmark,
  UserCheck,
  Tractor,
  Sprout,
  Bug,
  Wrench,
  Layers,
  Droplets,
  Leaf,
  TrendingUp,
  Landmark,
  Award,
  Users,
} from 'lucide-react';
import { COMMUNITY_TOPICS } from '../../data/communityData';

interface CommunityLeftSidebarProps {
  activeMenu?: string;
  onSelectMenu?: (menu: string) => void;
  activeTopic?: string | null;
  onSelectTopic?: (topicId: string) => void;
  onIntroduceClick?: () => void;
}

export const CommunityLeftSidebar: React.FC<CommunityLeftSidebarProps> = ({
  activeMenu = 'home',
  onSelectMenu,
  activeTopic = null,
  onSelectTopic,
  onIntroduceClick,
}) => {
  const [currentMenu, setCurrentMenu] = useState(activeMenu);

  const getTopicIcon = (iconName: string) => {
    const iconClass = 'w-3.5 h-3.5 text-[#15803D] shrink-0';
    switch (iconName) {
      case 'tractor':
        return <Tractor className={iconClass} />;
      case 'sprout':
        return <Sprout className={iconClass} />;
      case 'bug':
        return <Bug className={iconClass} />;
      case 'wrench':
        return <Wrench className={iconClass} />;
      case 'layers':
        return <Layers className={iconClass} />;
      case 'droplets':
        return <Droplets className={iconClass} />;
      case 'leaf':
        return <Leaf className={iconClass} />;
      case 'trending-up':
        return <TrendingUp className={iconClass} />;
      case 'landmark':
        return <Landmark className={iconClass} />;
      case 'award':
      default:
        return <Award className={iconClass} />;
    }
  };

  const handleMenuClick = (menuId: string) => {
    setCurrentMenu(menuId);
    onSelectMenu?.(menuId);
  };

  return (
    <aside className="w-full space-y-4">
      {/* Top Menu Card */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-3 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
        {/* Navigation List */}
        <nav className="space-y-1">
          {/* Community Home */}
          <button
            type="button"
            onClick={() => handleMenuClick('home')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left text-xs font-bold transition-colors ${
              currentMenu === 'home'
                ? 'bg-[#E8F5E9] text-[#15803D]'
                : 'text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Home className="w-4 h-4 text-[#15803D]" />
            <span>Community Home</span>
          </button>

          {/* All Discussions */}
          <button
            type="button"
            onClick={() => handleMenuClick('all')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left text-xs font-medium transition-colors ${
              currentMenu === 'all'
                ? 'bg-[#E8F5E9] text-[#15803D] font-bold'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <MessageSquare className="w-4 h-4 text-slate-400" />
            <span>All Discussions</span>
          </button>

          {/* My Posts */}
          <button
            type="button"
            onClick={() => handleMenuClick('my-posts')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left text-xs font-medium transition-colors ${
              currentMenu === 'my-posts'
                ? 'bg-[#E8F5E9] text-[#15803D] font-bold'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Edit3 className="w-4 h-4 text-slate-400" />
            <span>My Posts</span>
          </button>

          {/* Bookmarks */}
          <button
            type="button"
            onClick={() => handleMenuClick('bookmarks')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left text-xs font-medium transition-colors ${
              currentMenu === 'bookmarks'
                ? 'bg-[#E8F5E9] text-[#15803D] font-bold'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Bookmark className="w-4 h-4 text-slate-400" />
            <span>Bookmarks</span>
          </button>

          {/* Following */}
          <button
            type="button"
            onClick={() => handleMenuClick('following')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left text-xs font-medium transition-colors ${
              currentMenu === 'following'
                ? 'bg-[#E8F5E9] text-[#15803D] font-bold'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <UserCheck className="w-4 h-4 text-slate-400" />
            <span>Following</span>
          </button>
        </nav>

        {/* TOPICS Heading */}
        <div className="mt-4 pt-3 border-t border-slate-100">
          <h4 className="text-[10px] font-extrabold text-[#0F172A] tracking-wider uppercase px-3 mb-2">
            TOPICS
          </h4>

          {/* Topic Items */}
          <div className="space-y-0.5">
            {COMMUNITY_TOPICS.map((topic) => {
              const isSelected = activeTopic === topic.id;
              return (
                <button
                  key={topic.id}
                  type="button"
                  onClick={() => onSelectTopic?.(topic.id)}
                  className={`w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-left text-[11px] font-medium transition-colors ${
                    isSelected
                      ? 'bg-[#E8F5E9] text-[#15803D] font-bold'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {getTopicIcon(topic.iconName)}
                  <span className="truncate">{topic.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom Card: "New to the Community?" */}
      <div className="bg-[#F0FDF4] border border-[#DCFCE7] rounded-2xl p-4 text-left shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
        <div className="flex items-start gap-3 mb-2.5">
          <div className="w-9 h-9 rounded-xl bg-[#DCFCE7] text-[#15803D] flex items-center justify-center shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h5 className="text-[12px] font-bold text-[#0F172A] leading-tight">
              New to the Community?
            </h5>
            <p className="text-[10px] text-slate-600 leading-snug mt-1">
              Introduce yourself and become a part of our growing farmer network.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onIntroduceClick}
          className="w-full py-2 bg-[#15803D] hover:bg-[#166534] text-white text-[11px] font-semibold rounded-xl transition-colors shadow-2xs cursor-pointer mt-1"
        >
          Introduce Yourself
        </button>
      </div>
    </aside>
  );
};
