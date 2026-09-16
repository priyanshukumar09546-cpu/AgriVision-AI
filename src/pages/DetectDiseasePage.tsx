import React, { useState } from 'react';
import { Navbar } from '../components/Navbar';
import { DetectHeader } from '../components/detect/DetectHeader';
import { UploadSection } from '../components/detect/UploadSection';
import { CropSelectSection } from '../components/detect/CropSelectSection';
import { SupportedCropsSection } from '../components/detect/SupportedCropsSection';
import { DetectionResultModal } from '../components/detect/DetectionResultModal';
import { InfoStrip } from '../components/detect/InfoStrip';
import { HowItWorksSection } from '../components/detect/HowItWorksSection';
import { ScanHistoryView } from '../components/detect/ScanHistoryView';
import type { UserScanRecord } from '../services/diseaseDetectionService';
import { Footer } from '../components/Footer';
import { SUPPORTED_CROPS } from '../data/cropsData';
import type { CropInfo } from '../data/cropsData';
import { detectCropDisease } from '../services/diseaseDetectionService';
import type { DiseaseDetectionResult } from '../services/diseaseDetectionService';

import { BottomNav } from '../components/BottomNav';
import { GeminiAssistantModal } from '../components/ai/GeminiAssistantModal';

interface DetectDiseasePageProps {
  onRouteChange?: (route: string) => void;
}

export const DetectDiseasePage: React.FC<DetectDiseasePageProps> = ({
  onRouteChange,
}) => {
  // Crop selection state (default to Tomato per reference)
  const [selectedCrop, setSelectedCrop] = useState<CropInfo>(SUPPORTED_CROPS[0]);

  // Image upload state
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageFileName, setImageFileName] = useState<string | null>(null);
  const [imageFileSize, setImageFileSize] = useState<string | null>(null);
  const [rawFile, setRawFile] = useState<File | null>(null);

  // Analysis / Diagnostic state
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStage, setAnalysisStage] = useState<string>('');
  const [analysisProgress, setAnalysisProgress] = useState<number>(0);
  const [detectionResult, setDetectionResult] = useState<DiseaseDetectionResult | null>(null);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);

  // User notification toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'detect' | 'history'>('detect');

  const handleSelectHistoricalScan = (scan: UserScanRecord) => {
    setDetectionResult({
      scanId: scan.id,
      isMock: false,
      crop: scan.crop,
      disease: scan.disease,
      scientificName: scan.scientificName,
      confidence: scan.confidence,
      severity: scan.severity as any,
      symptoms: scan.symptoms || [],
      causes: [],
      treatments: scan.treatments || { organic: [], chemical: [], preventive: [] },
      imageUrl: scan.imageUrl,
      analyzedAt: new Date(scan.createdAt).toLocaleTimeString(),
    });
    setSelectedImage(scan.imageUrl || '/crops/tomato.png');
  };


  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
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

  const handleSampleClicked = (cropName: string) => {
    const matchedCrop = SUPPORTED_CROPS.find(
      (c) => c.name.toLowerCase() === cropName.toLowerCase()
    );
    if (matchedCrop) {
      setSelectedCrop(matchedCrop);
    }
    showToast(`Loaded sample leaf for ${cropName}`);
  };

  const handleRunDetection = async () => {
    if (!selectedImage) {
      showToast('⚠️ Please upload or choose a leaf image first.');
      return;
    }

    setIsAnalyzing(true);
    setAnalysisProgress(15);
    setAnalysisStage('Initiating visual diagnostics...');

    try {
      const target = rawFile || selectedImage;
      const result = await detectCropDisease(
        target,
        selectedCrop.id,
        (stage, percent) => {
          setAnalysisStage(stage);
          setAnalysisProgress(percent);
        }
      );

      setDetectionResult(result);
    } catch (err) {
      console.error(err);
      showToast('Error analyzing leaf. Please try again.');
    } finally {
      setIsAnalyzing(false);
      setAnalysisProgress(0);
      setAnalysisStage('');
    }
  };

  const handleResetDetection = () => {
    setDetectionResult(null);
    handleImageRemoved();
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col selection:bg-emerald-100 selection:text-emerald-900 font-sans antialiased text-[#0F172A]">
      {/* 1. Navbar with active Detect Disease link */}
      <Navbar
        activeRoute="/detect"
        onRouteChange={onRouteChange}
      />

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed top-16 right-6 z-50 bg-[#0F172A] text-white text-xs px-4 py-2.5 rounded-xl shadow-xl border border-slate-700 animate-in fade-in flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-[1240px] w-full mx-auto px-6 py-4 space-y-6">
        {/* 2. Page Header & Upper Right Promotional Visual */}
        <DetectHeader />

        {/* Sub-navigation Tabs: AI Diagnosis vs Scan History */}
        <div className="flex items-center gap-2 border-b border-slate-200/80 pb-3">
          <button
            type="button"
            onClick={() => setActiveTab('detect')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              activeTab === 'detect'
                ? 'bg-[#15803D] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 bg-white border border-slate-200 hover:bg-slate-50'
            }`}
          >
            Instant AI Diagnosis
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              activeTab === 'history'
                ? 'bg-[#15803D] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 bg-white border border-slate-200 hover:bg-slate-50'
            }`}
          >
            Scan History
          </button>
        </div>

        {activeTab === 'history' ? (
          <ScanHistoryView
            onSelectScan={handleSelectHistoricalScan}
            onNewScan={() => setActiveTab('detect')}
            onToast={showToast}
          />
        ) : (
          <>
        {/* 3. Main Detection Area: Three Columns matching reference */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
          {/* Column 1: Upload Leaf Image (Col-span 5) */}
          <div className="lg:col-span-5 flex flex-col">
            <UploadSection
              selectedImage={selectedImage}
              imageFileName={imageFileName}
              imageFileSize={imageFileSize}
              onImageSelected={handleImageSelected}
              onImageRemoved={handleImageRemoved}
              onSampleClicked={handleSampleClicked}
            />
          </div>

          {/* Column 2: Select Crop (Optional) & Detect Action (Col-span 3) */}
          <div className="lg:col-span-3 flex flex-col">
            <CropSelectSection
              selectedCrop={selectedCrop}
              onCropChange={(crop) => {
                setSelectedCrop(crop);
                showToast(`Selected crop: ${crop.name}`);
              }}
              onDetectClick={handleRunDetection}
              isAnalyzing={isAnalyzing}
              hasImage={!!selectedImage}
              analysisStage={analysisStage}
              analysisProgress={analysisProgress}
            />
          </div>

          {/* Column 3: Supported Crops Grid (Col-span 4) */}
          <div className="lg:col-span-4 flex flex-col">
            <SupportedCropsSection
              selectedCropId={selectedCrop.id}
              onCropClick={(crop) => {
                setSelectedCrop(crop);
                showToast(`Selected crop: ${crop.name}`);
              }}
              onViewAllClick={() => {
                if (onRouteChange) {
                  onRouteChange('/crops');
                } else {
                  showToast('Viewing all 20+ supported crops');
                }
              }}
            />
          </div>
        </section>

        {/* 4. Information Strip: Four Benefit Cards */}
        <InfoStrip />

        {/* 5. How It Works Section */}
        <HowItWorksSection />
        </>
        )}
      </main>

      {/* 6. Clean White Footer */}
      <Footer
        activeRoute="/detect"
        onRouteChange={onRouteChange}
      />

      {/* 7. Detailed Diagnostics Modal upon detection completion */}
      {detectionResult && selectedImage && (
        <DetectionResultModal
          result={detectionResult}
          imageUrl={selectedImage}
          onClose={() => setDetectionResult(null)}
          onReset={handleResetDetection}
        />
      )}

      {/* 8. AI Assistant Modal */}
      <GeminiAssistantModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
      />

      {/* 9. Mobile Bottom Navigation */}
      <BottomNav
        activeRoute="/detect"
        onRouteChange={onRouteChange}
        onOpenAiAssistant={() => setIsAiModalOpen(true)}
      />
    </div>
  );
};

export default DetectDiseasePage;
