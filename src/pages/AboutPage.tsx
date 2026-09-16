import React from 'react';
import { Navbar } from '../components/Navbar';
import { AboutHero } from '../components/about/AboutHero';
import { AboutStatsRow } from '../components/about/AboutStatsRow';
import { AboutStorySection } from '../components/about/AboutStorySection';
import { AboutWhyBuilt } from '../components/about/AboutWhyBuilt';
import { AboutTeam } from '../components/about/AboutTeam';
import { AboutCtaBanner } from '../components/about/AboutCtaBanner';
import { Footer } from '../components/Footer';

interface AboutPageProps {
  onRouteChange?: (route: string) => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ onRouteChange }) => {
  const handleScrollToMission = () => {
    const el = document.getElementById('our-mission-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleJoinChange = () => {
    if (onRouteChange) {
      onRouteChange('/community');
    }
  };

  return (
    <div className="min-h-screen bg-white font-sans antialiased text-[#0F172A] selection:bg-[#DCFCE7] selection:text-[#15803D] flex flex-col">
      {/* 1. Navbar with active About underline */}
      <Navbar activeRoute="/about" onRouteChange={onRouteChange} />

      {/* Main Content Sections in exact reference order */}
      <main className="flex-1">
        {/* 2. Hero Section */}
        <AboutHero onMissionClick={handleScrollToMission} />

        {/* 3. Statistics Row */}
        <AboutStatsRow />

        {/* 4. Our Story Section */}
        <AboutStorySection />

        {/* 5. Why We Built AgriVision AI */}
        <AboutWhyBuilt />

        {/* 6. Our Team Section */}
        <AboutTeam />

        {/* 7. Final CTA Banner */}
        <AboutCtaBanner onJoinChangeClick={handleJoinChange} />
      </main>

      {/* 8. Footer matching reference */}
      <Footer activeRoute="/about" onRouteChange={onRouteChange} />
    </div>
  );
};
