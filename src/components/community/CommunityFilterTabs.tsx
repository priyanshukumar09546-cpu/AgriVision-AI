import React from 'react';

export type CommunityTab =
  | 'latest'
  | 'trending'
  | 'unanswered'
  | 'success'
  | 'expert';

interface CommunityFilterTabsProps {
  activeTab: CommunityTab;
  onTabChange: (tab: CommunityTab) => void;
}

export const CommunityFilterTabs: React.FC<CommunityFilterTabsProps> = ({
  activeTab,
  onTabChange,
}) => {
  const tabs: { id: CommunityTab; label: string }[] = [
    { id: 'latest', label: 'Latest' },
    { id: 'trending', label: 'Trending' },
    { id: 'unanswered', label: 'Unanswered' },
    { id: 'success', label: 'Success Stories' },
    { id: 'expert', label: 'Expert Advice' },
  ];

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none select-none">
      {tabs.map((t) => {
        const isActive = activeTab === t.id;
        return (
          <button
            key={t.id}
            type="button"
            onClick={() => onTabChange(t.id)}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap shadow-2xs ${
              isActive
                ? 'bg-[#15803D] text-white shadow-xs'
                : 'bg-white hover:bg-slate-50 border border-slate-200/90 text-slate-700'
            }`}
          >
            {t.label}
          </button>
        );
      })}
    </div>
  );
};
