import React from 'react';
import { Home, Scan, MessageSquare, Users, User } from 'lucide-react';

interface BottomNavProps {
  activeRoute?: string;
  onRouteChange?: (route: string) => void;
  onOpenAiAssistant?: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeRoute = '/',
  onRouteChange,
  onOpenAiAssistant,
}) => {
  const navItems = [
    {
      id: 'home',
      label: 'Home',
      icon: Home,
      route: '/',
    },
    {
      id: 'scan',
      label: 'Scan',
      icon: Scan,
      route: '/detect',
    },
    {
      id: 'assistant',
      label: 'AI Assistant',
      icon: MessageSquare,
      route: '/insights',
      isModalTrigger: true,
    },
    {
      id: 'community',
      label: 'Community',
      icon: Users,
      route: '/community',
    },
    {
      id: 'profile',
      label: 'Profile',
      icon: User,
      route: '/profile',
    },
  ];

  const handleItemClick = (item: typeof navItems[0]) => {
    if (item.isModalTrigger && onOpenAiAssistant) {
      onOpenAiAssistant();
      return;
    }
    if (onRouteChange) {
      onRouteChange(item.route);
    }
  };

  return (
    <nav aria-label="Mobile Bottom Navigation" className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/80 px-2 py-1.5 flex items-center justify-around shadow-[0_-4px_20px_rgba(0,0,0,0.06)]">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive =
          activeRoute === item.route ||
          (item.route !== '/' && activeRoute.startsWith(item.route));

        return (
          <button
            key={item.id}
            type="button"
            onClick={() => handleItemClick(item)}
            className={`flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all duration-200 cursor-pointer ${
              isActive
                ? 'bg-emerald-100/70 text-emerald-800 font-bold scale-105'
                : 'text-slate-500 hover:text-slate-800 font-medium'
            }`}
          >
            <div className={`p-1 rounded-xl ${isActive ? 'bg-emerald-600 text-white shadow-xs' : ''}`}>
              <Icon className="w-5 h-5" />
            </div>
            <span className="text-[10.5px] tracking-tight mt-0.5 leading-none">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
};
