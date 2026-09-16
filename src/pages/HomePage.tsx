import React, { useState } from 'react';
import { Navbar } from '../components/Navbar';
import { HeroSection } from '../components/HeroSection';
import { CropSelector } from '../components/CropSelector';
import { UploadPanel } from '../components/UploadPanel';
import { FeatureCards } from '../components/FeatureCards';
import { BottomStats } from '../components/BottomStats';
import { BottomNav } from '../components/BottomNav';
import { GeminiAssistantModal } from '../components/ai/GeminiAssistantModal';
import { DetectionResultModal } from '../components/detect/DetectionResultModal';
import { detectCropDisease } from '../services/diseaseDetectionService';
import type { DiseaseDetectionResult } from '../services/diseaseDetectionService';
import { SUPPORTED_CROPS } from '../data/cropsData';

interface HomePageProps {
  onRouteChange?: (route: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onRouteChange }) => {
  const [activeRoute, setActiveRoute] = useState('/');
  const [notification, setNotification] = useState<string | null>(null);

  // Centralized crop selection state (default to Tomato per reference)
  const [selectedCropId, setSelectedCropId] = useState<string>('tomato');

  // Leaf image upload state
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageFileName, setImageFileName] = useState<string | null>(null);
  const [imageFileSize, setImageFileSize] = useState<string | null>(null);
  const [rawFile, setRawFile] = useState<File | null>(null);

  // Diagnostic / AI analysis state
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [detectionResult, setDetectionResult] = useState<DiseaseDetectionResult | null>(null);
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

  const handleCropSelect = (cropId: string) => {
    setSelectedCropId(cropId);
    const matched = SUPPORTED_CROPS.find(
      (c) => c.id.toLowerCase() === cropId.toLowerCase()
    );
    showNotification(`Selected crop: ${matched ? matched.name : cropId}`);
  };

  const handleImageSelected = (
    fileOrUrl: File | string,
    fileName?: string,
    fileSize?: string
  ) => {
    if (typeof fileOrUrl === 'string') {
      setSelectedImage(fileOrUrl);
      setImageFileName(fileName || 'Sample Leaf');
      setImageFileSize(fileSize || '850 KB');
      setRawFile(null);
    } else {
      const url = URL.createObjectURL(fileOrUrl);
      setSelectedImage(url);
      setImageFileName(fileName || fileOrUrl.name);
      setImageFileSize(fileSize || `${(fileOrUrl.size / 1024).toFixed(0)} KB`);
      setRawFile(fileOrUrl);
    }
  };

  const handleImageRemoved = () => {
    setSelectedImage(null);
    setImageFileName(null);
    setImageFileSize(null);
    setRawFile(null);
  };

  const handleRunDetection = async () => {
    if (!selectedImage) {
      showNotification('⚠️ Please upload or choose a leaf image first.');
      const el = document.getElementById('crops-section');
      el?.scrollIntoView({ behavior: 'smooth' });
      return;
    }

    setIsAnalyzing(true);

    try {
      const target = rawFile || selectedImage;
      const result = await detectCropDisease(target, selectedCropId);
      setDetectionResult(result);
    } catch (err) {
      showNotification('Error during disease detection. Please try again.');
      console.error(err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col selection:bg-emerald-100 selection:text-emerald-900 font-sans antialiased text-[#0F172A] pb-16 md:pb-0">
      {/* 1. Exact Navbar */}
      <Navbar activeRoute={activeRoute} onRouteChange={handleRouteChange} />

      {/* Temporary Toast for user actions */}
      {notification && (
        <div className="fixed top-16 right-6 z-50 bg-[#0F172A] text-white text-xs px-4 py-2 rounded-xl shadow-lg border border-slate-700 animate-in fade-in flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>{notification}</span>
        </div>
      )}

      <main className="flex-1 flex flex-col">
        {/* 2 & 3 & 4. Hero Section with exact leaf & AI scanning overlay */}
        <HeroSection
          onDetectClick={() => {
            if (selectedImage) {
              handleRunDetection();
            } else {
              handleRouteChange('/detect');
            }
          }}
          onLearnMoreClick={() => {
            const el = document.getElementById('crops-section');
            el?.scrollIntoView({ behavior: 'smooth' });
          }}
        />

        {/* 5 & 6. Crop Selection & Upload Leaf Image Panel */}
        <section id="crops-section" className="py-6 bg-white border-b border-slate-200/80">
          <div className="max-w-[1240px] mx-auto px-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
              {/* Left Column: Select a Crop to Get Started (8 cards) */}
              <div className="lg:col-span-7">
                <CropSelector
                  selectedCropId={selectedCropId}
                  onCropSelect={handleCropSelect}
                  onViewAllClick={() => handleRouteChange('/crops')}
                />
              </div>

              {/* Right Column: Upload a Leaf Image Panel */}
              <div className="lg:col-span-5">
                <UploadPanel
                  selectedCropId={selectedCropId}
                  onCropSelect={handleCropSelect}
                  selectedImage={selectedImage}
                  imageFileName={imageFileName}
                  imageFileSize={imageFileSize}
                  onImageSelected={handleImageSelected}
                  onImageRemoved={handleImageRemoved}
                  onDetectDisease={handleRunDetection}
                  isAnalyzing={isAnalyzing}
                  onViewMoreSamples={() => handleRouteChange('/detect')}
                />
              </div>
            </div>
          </div>
        </section>

        {/* 7. Four Feature Cards & AI Assistant Banner */}
        <FeatureCards
          onRouteChange={handleRouteChange}
          onOpenAiAssistant={() => setIsAiModalOpen(true)}
        />

        {/* 8. Bottom Statistics Banner */}
        <BottomStats />
      </main>

      {/* Disease Detection Result Modal */}
      {detectionResult && selectedImage && (
        <DetectionResultModal
          result={detectionResult}
          imageUrl={selectedImage}
          onClose={() => setDetectionResult(null)}
          onReset={() => {
            setDetectionResult(null);
            handleImageRemoved();
          }}
        />
      )}

      {/* AI Assistant Modal */}
      <GeminiAssistantModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
      />

      {/* Mobile Bottom Navigation */}
      <BottomNav
        activeRoute={activeRoute}
        onRouteChange={handleRouteChange}
        onOpenAiAssistant={() => setIsAiModalOpen(true)}
      />
    </div>
  );
};

export default HomePage;
