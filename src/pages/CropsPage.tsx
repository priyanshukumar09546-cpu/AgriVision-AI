import React, { useState, useMemo, useEffect } from 'react';
import { Navbar } from '../components/Navbar';
import { CropsHero } from '../components/crops/CropsHero';
import { CropsSidebar } from '../components/crops/CropsSidebar';
import { CropsGrid } from '../components/crops/CropsGrid';
import { CropDetailModal } from '../components/crops/CropDetailModal';
import { CropsBottomBanner } from '../components/crops/CropsBottomBanner';
import { ALL_CROPS } from '../data/cropsData';
import type { CropInfo } from '../data/cropsData';
import { fetchCropsFromDB } from '../services/cropsService';

interface CropsPageProps {
  onRouteChange?: (route: string) => void;
}

export const CropsPage: React.FC<CropsPageProps> = ({ onRouteChange }) => {
  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>(['All']);
  const [selectedSeasons, setSelectedSeasons] = useState<string[]>([]);
  const [selectedPopularity, setSelectedPopularity] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState('Popularity');
  const [cropsList, setCropsList] = useState<CropInfo[]>(ALL_CROPS);
  const [_isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    fetchCropsFromDB().then((data) => {
      if (data && data.length > 0) {
        setCropsList(data);
      }
      setIsLoading(false);
    }).catch(() => setIsLoading(false));
  }, []);

  // Selected crop for modal
  const [activeCropDetail, setActiveCropDetail] = useState<CropInfo | null>(null);

  // Toast notifications
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleCategoryToggle = (cat: string) => {
    if (cat === 'All') {
      setSelectedCategories(['All']);
      return;
    }

    let updated = selectedCategories.filter((c) => c !== 'All');
    if (updated.includes(cat)) {
      updated = updated.filter((c) => c !== cat);
    } else {
      updated.push(cat);
    }

    if (updated.length === 0) {
      updated = ['All'];
    }

    setSelectedCategories(updated);
  };

  const handleSeasonToggle = (season: string) => {
    if (selectedSeasons.includes(season)) {
      setSelectedSeasons(selectedSeasons.filter((s) => s !== season));
    } else {
      setSelectedSeasons([...selectedSeasons, season]);
    }
  };

  const handlePopularityToggle = (pop: string) => {
    if (selectedPopularity.includes(pop)) {
      setSelectedPopularity(selectedPopularity.filter((p) => p !== pop));
    } else {
      setSelectedPopularity([...selectedPopularity, pop]);
    }
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategories(['All']);
    setSelectedSeasons([]);
    setSelectedPopularity([]);
    setSortBy('Popularity');
    showToast('Filters reset to default');
  };

  // Filter and sort the crops
  const filteredCrops = useMemo(() => {
    return cropsList.filter((crop) => {
      // 1. Search Query Filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = crop.name.toLowerCase().includes(q);
        const matchesCategory = crop.category.toLowerCase().includes(q);
        const matchesDisease = crop.commonDiseases.some((d) => d.toLowerCase().includes(q));
        if (!matchesName && !matchesCategory && !matchesDisease) {
          return false;
        }
      }

      // 2. Category Filter
      if (selectedCategories.length > 0 && !selectedCategories.includes('All')) {
        if (!selectedCategories.includes(crop.category)) {
          return false;
        }
      }

      // 3. Season Filter
      if (selectedSeasons.length > 0) {
        const matchesSeason =
          crop.season === 'All Season' || selectedSeasons.includes(crop.season);
        if (!matchesSeason) {
          return false;
        }
      }

      // 4. Popularity Filter
      if (selectedPopularity.length > 0) {
        if (!selectedPopularity.includes(crop.isPopular)) {
          return false;
        }
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'Name A–Z') {
        return a.name.localeCompare(b.name);
      }
      if (sortBy === 'Name Z–A') {
        return b.name.localeCompare(a.name);
      }
      if (sortBy === 'Most Diseases') {
        return b.diseaseCount - a.diseaseCount;
      }
      if (sortBy === 'Least Diseases') {
        return a.diseaseCount - b.diseaseCount;
      }
      // 'Popularity' maintains reference order
      return 0;
    });
  }, [cropsList, searchQuery, selectedCategories, selectedSeasons, selectedPopularity, sortBy]);

  const handleScanClick = (crop: CropInfo) => {
    setActiveCropDetail(null);
    if (onRouteChange) {
      onRouteChange('/detect');
    }
    showToast(`Redirecting to disease scanner for ${crop.name}...`);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col selection:bg-emerald-100 selection:text-emerald-900 font-sans antialiased text-[#0F172A]">
      {/* 1. Navbar with active Crops link */}
      <Navbar
        activeRoute="/crops"
        onRouteChange={onRouteChange}
      />

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed top-16 right-6 z-50 bg-[#0F172A] text-white text-xs px-4 py-2.5 rounded-xl shadow-xl border border-slate-700 animate-in fade-in flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 2. Hero Section: Crops We Support */}
      <CropsHero />

      {/* Main Content: Two-Column Layout */}
      <main className="flex-1 max-w-[1240px] w-full mx-auto px-6 py-6 space-y-7">
        <div className="flex flex-col lg:flex-row items-start gap-6">
          {/* Left Column: Filters Sidebar (width ~210px) */}
          <div className="w-full lg:w-[210px] shrink-0">
            <CropsSidebar
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              selectedCategories={selectedCategories}
              onCategoryToggle={handleCategoryToggle}
              selectedSeasons={selectedSeasons}
              onSeasonToggle={handleSeasonToggle}
              selectedPopularity={selectedPopularity}
              onPopularityToggle={handlePopularityToggle}
              onResetFilters={handleResetFilters}
            />
          </div>

          {/* Right Column: 6-Column Crop Grid */}
          <CropsGrid
            crops={filteredCrops}
            sortBy={sortBy}
            onSortChange={setSortBy}
            onCropClick={(crop) => setActiveCropDetail(crop)}
          />
        </div>

        {/* 3. Bottom Information Banner */}
        <CropsBottomBanner />
      </main>

      {/* 4. Crop Detail Modal */}
      {activeCropDetail && (
        <CropDetailModal
          crop={activeCropDetail}
          onClose={() => setActiveCropDetail(null)}
          onScanClick={handleScanClick}
        />
      )}
    </div>
  );
};

export default CropsPage;
