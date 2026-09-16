import React, { useRef, useState } from 'react';
import { UploadCloud, CheckCircle2, X, Sparkles, Loader2 } from 'lucide-react';
import { SAMPLE_LEAVES } from '../data/cropsData';
import type { SampleLeaf } from '../data/cropsData';

interface UploadPanelProps {
  selectedCropId?: string | null;
  onCropSelect?: (cropId: string) => void;
  selectedImage?: string | null;
  imageFileName?: string | null;
  imageFileSize?: string | null;
  onImageSelected?: (fileOrUrl: File | string, fileName?: string, fileSize?: string) => void;
  onImageRemoved?: () => void;
  onDetectDisease?: () => void;
  isAnalyzing?: boolean;
  onViewMoreSamples?: () => void;
}

export const UploadPanel: React.FC<UploadPanelProps> = ({
  onCropSelect,
  selectedImage,
  imageFileName,
  imageFileSize,
  onImageSelected,
  onImageRemoved,
  onDetectDisease,
  isAnalyzing = false,
  onViewMoreSamples,
}) => {
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const processFile = (file: File) => {
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      alert('Please upload a valid JPG, JPEG, or PNG image.');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert('File size exceeds 10MB limit.');
      return;
    }

    const sizeFormatted =
      file.size > 1024 * 1024
        ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
        : `${(file.size / 1024).toFixed(0)} KB`;

    if (onImageSelected) {
      onImageSelected(file, file.name, sizeFormatted);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleSampleClick = (sample: SampleLeaf) => {
    if (onImageSelected) {
      onImageSelected(
        sample.image,
        `Sample_${sample.crop}_Leaf.jpg`,
        '850 KB'
      );
    }
    if (onCropSelect && sample.cropId) {
      onCropSelect(sample.cropId);
    }
  };

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs h-full flex flex-col justify-between">
      {/* Header */}
      <h3 className="text-[14px] font-bold text-[#0F172A] mb-3">
        Upload a Leaf Image
      </h3>

      {/* Main Container with 2 sides: Upload Dropzone + Try a Sample Image */}
      <div className="flex flex-col sm:flex-row items-stretch gap-4 flex-1">
        {/* Left Side: Drag & Drop Dropzone */}
        <div
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          onClick={() => !selectedImage && fileInputRef.current?.click()}
          className={`flex-1 w-full border-2 border-dashed rounded-xl p-3 sm:p-4 flex flex-col items-center justify-center text-center transition-all duration-150 min-h-[175px] ${
            dragActive
              ? 'border-emerald-500 bg-emerald-50/50'
              : selectedImage
              ? 'border-emerald-400 bg-emerald-50/15'
              : 'border-slate-200 bg-slate-50/40 hover:bg-slate-50/80 cursor-pointer'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/jpg"
            onChange={handleFileChange}
            className="hidden"
          />

          {selectedImage ? (
            <div className="w-full flex flex-col items-center justify-center py-1">
              {/* Preview Thumbnail */}
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border-2 border-emerald-500/80 shadow-xs relative mb-2">
                <img
                  src={selectedImage}
                  alt="Selected Crop Leaf Preview"
                  className="w-full h-full object-cover select-none"
                />
              </div>

              {/* Status & Filename */}
              <div className="text-center mb-2">
                <div className="flex items-center justify-center gap-1 text-[11.5px] font-bold text-emerald-800 leading-tight">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span className="truncate max-w-[170px]">{imageFileName || 'Leaf Ready'}</span>
                </div>
                {imageFileSize && (
                  <span className="text-[10px] text-slate-500">{imageFileSize}</span>
                )}
              </div>

              {/* Change / Remove Actions */}
              <div className="flex items-center gap-2.5 text-[11px] mb-2.5">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                  className="font-semibold text-emerald-700 hover:text-emerald-800 hover:underline cursor-pointer"
                >
                  Change
                </button>
                <span className="text-slate-300">•</span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onImageRemoved) onImageRemoved();
                  }}
                  className="font-semibold text-rose-600 hover:underline flex items-center gap-0.5 cursor-pointer"
                >
                  <X className="w-3 h-3" />
                  <span>Remove</span>
                </button>
              </div>

              {/* Functional Detect Disease Action Button */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (onDetectDisease) onDetectDisease();
                }}
                disabled={isAnalyzing}
                className="w-full max-w-[200px] py-2 px-3 bg-[#15803D] hover:bg-[#166534] active:bg-[#14532D] disabled:bg-slate-300 text-white text-[12px] font-bold rounded-lg shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Analyzing...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Detect Disease Now</span>
                  </>
                )}
              </button>
            </div>
          ) : (
            <>
              {/* Cloud Icon with upward arrow matching reference */}
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-[#15803D] mb-1">
                <UploadCloud className="w-6 h-6 stroke-[1.8]" />
              </div>

              <p className="text-[12px] font-semibold text-[#0F172A] leading-tight">
                Drag & drop an image here
              </p>
              <span className="text-[10.5px] text-slate-400 my-0.5">or</span>

              {/* Choose File Button matching reference */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-[#15803D] hover:bg-[#166534] rounded-lg transition-colors shadow-xs cursor-pointer"
              >
                Choose File
              </button>

              <span className="text-[9.5px] text-slate-400 mt-1.5">
                Supports JPG, PNG, JPEG (Max 10MB)
              </span>
            </>
          )}
        </div>

        {/* Right Side: Try a Sample Image */}
        <div className="shrink-0 w-full sm:w-[150px] bg-[#f8faf7] rounded-xl p-3 border border-emerald-100/70 flex flex-col justify-between text-center sm:text-left">
          <span className="text-[11px] font-bold text-slate-700 block mb-2 text-center">
            Try a Sample Image
          </span>

          {/* 6 Sample Thumbnails in 3x2 Grid */}
          <div className="grid grid-cols-3 gap-1.5 justify-items-center">
            {SAMPLE_LEAVES.map((sample) => {
              const isSampleActive = selectedImage === sample.image;
              return (
                <button
                  key={sample.id}
                  onClick={() => handleSampleClick(sample)}
                  type="button"
                  className={`w-[38px] h-[38px] rounded-lg overflow-hidden border transition-all cursor-pointer focus:outline-none ${
                    isSampleActive
                      ? 'border-[#15803D] ring-2 ring-[#15803D]/35'
                      : 'border-slate-200 hover:border-emerald-500 hover:ring-1 hover:ring-emerald-400/40'
                  }`}
                  title={`Sample: ${sample.crop} (${sample.expectedDisease})`}
                >
                  <img
                    src={sample.image}
                    alt={`Sample Leaf ${sample.id}`}
                    width="38"
                    height="38"
                    decoding="async"
                    className="w-full h-full object-cover transition-transform hover:scale-105"
                    style={{ imageRendering: 'auto' }}
                  />
                </button>
              );
            })}
          </div>

          <a
            href="/detect"
            onClick={(e) => {
              if (onViewMoreSamples) {
                e.preventDefault();
                onViewMoreSamples();
              }
            }}
            className="text-[10px] font-semibold text-emerald-700 hover:text-emerald-800 hover:underline block text-center mt-2.5"
          >
            View More Samples →
          </a>
        </div>
      </div>
    </div>
  );
};
