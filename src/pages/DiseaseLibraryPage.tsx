import React, { useState, useMemo, useEffect } from 'react';
import { Navbar } from '../components/Navbar';
import { LibraryHero } from '../components/library/LibraryHero';
import { LibrarySidebar } from '../components/library/LibrarySidebar';
import { DiseaseGrid } from '../components/library/DiseaseGrid';
import { DiseaseDetailModal } from '../components/library/DiseaseDetailModal';
import { DISEASES_DATA } from '../data/diseasesData';
import type { Disease, DiseaseType, SeverityLevel } from '../data/diseasesData';
import { fetchDiseasesFromDB } from '../services/diseasesService';

interface DiseaseLibraryPageProps {
  onRouteChange?: (route: string) => void;
}

export const DiseaseLibraryPage: React.FC<DiseaseLibraryPageProps> = ({
  onRouteChange,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCrop, setSelectedCrop] = useState('All Crops');
  // Initialize with Fungal checked to match reference UI, but show all 18 by default unless user interacts
  const [selectedTypes, setSelectedTypes] = useState<DiseaseType[]>(['Fungal']);
  const [hasInteractedWithType, setHasInteractedWithType] = useState(false);
  const [selectedSeverity, setSelectedSeverity] = useState<SeverityLevel | 'All'>('All');
  const [sortBy, setSortBy] = useState('most-common');
  const [selectedDisease, setSelectedDisease] = useState<Disease | null>(null);
  const [diseasesList, setDiseasesList] = useState<Disease[]>(DISEASES_DATA);
  const [_isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    fetchDiseasesFromDB().then((data) => {
      if (data && data.length > 0) {
        setDiseasesList(data);
      }
      setIsLoading(false);
    }).catch(() => setIsLoading(false));
  }, []);

  // Check URL pathname for deep-linked disease detail route (/diseases/:id)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname;
      if (path.startsWith('/diseases/')) {
        const slug = path.replace('/diseases/', '');
        const found = DISEASES_DATA.find((d) => d.id === slug || d.id.startsWith(slug));
        if (found) {
          setSelectedDisease(found);
        }
      }
    }
  }, []);

  const handleSelectDisease = (disease: Disease) => {
    setSelectedDisease(disease);
    if (typeof window !== 'undefined') {
      window.history.pushState({}, '', `/diseases/${disease.id}`);
    }
  };

  const handleCloseModal = () => {
    setSelectedDisease(null);
    if (typeof window !== 'undefined') {
      window.history.pushState({}, '', '/library');
    }
  };

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const handleToggleType = (type: DiseaseType) => {
    setHasInteractedWithType(true);
    setSelectedTypes((prev) => {
      if (prev.includes(type)) {
        return prev.filter((t) => t !== type);
      } else {
        return [...prev, type];
      }
    });
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCrop('All Crops');
    setSelectedTypes(['Fungal']);
    setHasInteractedWithType(false);
    setSelectedSeverity('All');
    setSortBy('most-common');
  };

  const handleNavigateToDetect = (cropName?: string) => {
    if (onRouteChange) {
      if (cropName && typeof window !== 'undefined') {
        try {
          sessionStorage.setItem('agrivision_preselected_crop', cropName);
        } catch {
          // ignore
        }
      }
      onRouteChange('/detect');
    }
  };

  // Filtered & Sorted Diseases
  const filteredDiseases = useMemo(() => {
    let list = [...diseasesList];

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (d) =>
          d.name.toLowerCase().includes(q) ||
          d.crop.toLowerCase().includes(q) ||
          d.type.toLowerCase().includes(q) ||
          d.shortDescription.toLowerCase().includes(q) ||
          d.scientificName.toLowerCase().includes(q) ||
          d.symptoms.some((s) => s.toLowerCase().includes(q))
      );
    }

    // Crop filter
    if (selectedCrop !== 'All Crops') {
      list = list.filter(
        (d) => d.crop.toLowerCase() === selectedCrop.toLowerCase()
      );
    }

    // Type filter: apply when user specifically filters
    if (hasInteractedWithType && selectedTypes.length > 0) {
      list = list.filter((d) => selectedTypes.includes(d.type));
    }

    // Severity filter
    if (selectedSeverity !== 'All') {
      list = list.filter((d) => d.severity === selectedSeverity);
    }

    // Sorting
    switch (sortBy) {
      case 'name-asc':
        list.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'name-desc':
        list.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case 'severity-desc':
        const severityRank: Record<SeverityLevel, number> = { High: 3, Moderate: 2, Mild: 1 };
        list.sort((a, b) => severityRank[b.severity] - severityRank[a.severity]);
        break;
      case 'most-common':
      default:
        // preserve original reference ordering
        break;
    }

    return list;
  }, [diseasesList, searchQuery, selectedCrop, hasInteractedWithType, selectedTypes, selectedSeverity, sortBy]);

  return (
    <div className="min-h-screen bg-[#FAFDFB] flex flex-col selection:bg-emerald-100 selection:text-emerald-900 font-sans">
      {/* Top Navigation */}
      <Navbar
        activeRoute="/library"
        onRouteChange={onRouteChange}
      />

      {/* Hero Section */}
      <LibraryHero />

      {/* Main Two-Column Content Area matching reference */}
      <main className="flex-1 w-full max-w-[1240px] mx-auto px-6 py-6">
        <div className="flex flex-col lg:flex-row gap-6 items-start">
          {/* Left: Filter Sidebar & CTA Card */}
          <LibrarySidebar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            selectedCrop={selectedCrop}
            onSelectCrop={setSelectedCrop}
            selectedTypes={selectedTypes}
            onToggleType={handleToggleType}
            selectedSeverity={selectedSeverity}
            onSelectSeverity={setSelectedSeverity}
            sortBy={sortBy}
            onSortByChange={setSortBy}
            onResetFilters={handleResetFilters}
            onNavigateToDetect={() => handleNavigateToDetect()}
          />

          {/* Right: Disease Grid */}
          <DiseaseGrid
            diseases={filteredDiseases}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            onSelectDisease={handleSelectDisease}
          />
        </div>
      </main>

      {/* Disease Detail Modal */}
      <DiseaseDetailModal
        disease={selectedDisease}
        onClose={handleCloseModal}
        onNavigateToDetect={handleNavigateToDetect}
      />

      {/* Bottom Footer */}
      <footer className="w-full bg-white border-t border-slate-100 py-6 mt-12">
        <div className="max-w-[1240px] mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-bold text-[#0F172A]">AgriVision AI</span>
            <span>—</span>
            <span>Healthy Crops. Brighter Tomorrow.</span>
          </div>
          <div className="flex items-center gap-6">
            <a href="/" onClick={(e) => { e.preventDefault(); onRouteChange?.('/'); }} className="hover:text-[#15803D]">Home</a>
            <a href="/detect" onClick={(e) => { e.preventDefault(); onRouteChange?.('/detect'); }} className="hover:text-[#15803D]">Detect Disease</a>
            <a href="/crops" onClick={(e) => { e.preventDefault(); onRouteChange?.('/crops'); }} className="hover:text-[#15803D]">Crops</a>
            <a href="/library" onClick={(e) => { e.preventDefault(); onRouteChange?.('/library'); }} className="text-[#15803D] font-semibold">Disease Library</a>
          </div>
        </div>
      </footer>
    </div>
  );
};
