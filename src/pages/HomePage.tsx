import React, { useState } from 'react';
import { Navbar } from '../components/Navbar';
import { HeroSection } from '../components/HeroSection';
import { FeatureCards } from '../components/FeatureCards';
import { PopularCropsSection } from '../components/PopularCropsSection';
import { LatestInsightsSection } from '../components/LatestInsightsSection';
import { BottomNav } from '../components/BottomNav';
import { GeminiAssistantModal } from '../components/ai/GeminiAssistantModal';

interface HomePageProps {
  onRouteChange?: (route: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onRouteChange }) => {
  const [activeRoute, setActiveRoute] = useState('/');
  const [notification, setNotification] = useState<string | null>(null);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleRouteChange = (route: string) => {
    setActiveRoute(route);
    if (onRouteChange) {
      onRouteChange(route);
    } else if (route !== '/') {
      showNotification(`Navigating to ${route}`);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col selection:bg-emerald-100 selection:text-emerald-900 font-sans antialiased text-[#0F172A] pb-16 md:pb-0">
      {/* 1. Exact Reference Header & Navbar */}
      <Navbar activeRoute={activeRoute} onRouteChange={handleRouteChange} />

      {/* Temporary Toast for user actions */}
      {notification && (
        <div className="fixed top-16 right-6 z-50 bg-[#0F172A] text-white text-xs px-4 py-2 rounded-xl shadow-lg border border-slate-700 animate-in fade-in flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>{notification}</span>
        </div>
      )}

      <main className="flex-1 flex flex-col space-y-2">
        {/* 2. Reference Hero Card */}
        <HeroSection
          onDetectClick={() => handleRouteChange('/detect')}
          onLearnMoreClick={() => handleRouteChange('/crops')}
        />

        {/* 3 & 4. Quick Action Cards (Scan Plant, My Crops, Weather, Community) + AI Assistant Banner */}
        <FeatureCards
          onRouteChange={handleRouteChange}
          onOpenAiAssistant={() => setIsAiModalOpen(true)}
        />

        {/* 5. Popular Crops Section (Rice, Wheat, Maize, Tomato, Potato) */}
        <PopularCropsSection
          onCropClick={() => handleRouteChange('/crops')}
          onViewAllClick={() => handleRouteChange('/crops')}
        />

        {/* 6. Latest Insights Section (Real persisted articles or honest empty state) */}
        <LatestInsightsSection
          onViewAllClick={() => handleRouteChange('/insights')}
          onArticleClick={() => handleRouteChange('/insights')}
        />

        {/* Build Verification Tag */}
        <div className="py-3 text-center text-[10.5px] font-semibold text-slate-400 bg-white border-t border-slate-100">
          <span>AgriVision AI • Build: ec7ef11-prod</span>
        </div>
      </main>

      {/* Real Gemini AI Assistant Modal */}
      <GeminiAssistantModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
      />

      {/* 7. Fixed Mobile Bottom Navigation */}
      <BottomNav
        activeRoute={activeRoute}
        onRouteChange={handleRouteChange}
        onOpenAiAssistant={() => setIsAiModalOpen(true)}
      />
    </div>
  );
};

export default HomePage;
