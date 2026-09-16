import React, { useRef, useState } from 'react';
import { Upload, UploadCloud, ImageIcon, X, CheckCircle2 } from 'lucide-react';
import { SAMPLE_LEAVES } from '../../data/cropsData';

interface UploadSectionProps {
  selectedImage: string | null;
  imageFileName: string | null;
  imageFileSize: string | null;
  onImageSelected: (fileOrUrl: File | string, fileName?: string, fileSize?: string) => void;
  onImageRemoved: () => void;
  onSampleClicked?: (cropName: string) => void;
}

export const UploadSection: React.FC<UploadSectionProps> = ({
  selectedImage,
  imageFileName,
  imageFileSize,
  onImageSelected,
  onImageRemoved,
  onSampleClicked,
}) => {
  const [isDragActive, setIsDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragActive(true);
    } else if (e.type === 'dragleave') {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      processFile(file);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      processFile(file);
    }
  };

  const processFile = (file: File) => {
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      alert('Please upload a valid JPG, JPEG, or PNG image.');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert('Image file size exceeds the 10MB limit.');
      return;
    }

    const sizeFormatted =
      file.size > 1024 * 1024
        ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
        : `${(file.size / 1024).toFixed(0)} KB`;

    onImageSelected(file, file.name, sizeFormatted);
  };

  const handleSampleClick = (sample: typeof SAMPLE_LEAVES[0]) => {
    onImageSelected(sample.image, `Sample_Leaf_${sample.id}_${sample.crop}.jpg`, '850 KB');
    if (onSampleClicked) {
      onSampleClicked(sample.crop);
    }
  };

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs h-full flex flex-col justify-between">
      {/* Card Header with circular green upload icon */}
      <div>
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-xl bg-[#15803D] text-white flex items-center justify-center shrink-0 shadow-2xs">
            <Upload className="w-4 h-4 stroke-[2.2]" />
          </div>
          <div>
            <h2 className="text-[14.5px] font-bold text-[#0F172A] leading-tight">
              Upload Leaf Image
            </h2>
            <p className="text-[11px] text-slate-500 font-medium leading-tight mt-0.5">
              Supports JPG, PNG, JPEG (Max 10MB)
            </p>
          </div>
        </div>

        {/* Large Drag & Drop Box matching reference */}
        <div
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          onClick={() => !selectedImage && fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-5 text-center transition-all duration-150 relative min-h-[175px] flex flex-col items-center justify-center ${
            isDragActive
              ? 'border-emerald-500 bg-emerald-50/50'
              : selectedImage
              ? 'border-emerald-400 bg-emerald-50/20'
              : 'border-slate-200 bg-slate-50/40 hover:bg-slate-50/80 cursor-pointer'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/jpg"
            onChange={handleFileInputChange}
            className="hidden"
          />

          {selectedImage ? (
            /* Selected Image Preview State */
            <div className="w-full flex flex-col items-center justify-center py-1 space-y-2">
              <div className="relative w-24 h-24 rounded-xl overflow-hidden border-2 border-emerald-500/80 shadow-sm group">
                <img
                  src={selectedImage}
                  alt="Selected Crop Leaf"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      fileInputRef.current?.click();
                    }}
                    className="p-1 bg-white rounded-full text-slate-700 shadow-sm hover:bg-slate-100"
                    title="Change image"
                  >
                    <ImageIcon className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-emerald-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span className="truncate max-w-[200px]">{imageFileName || 'Leaf Image Ready'}</span>
                </div>
                {imageFileSize && (
                  <span className="text-[10px] text-slate-500">{imageFileSize}</span>
                )}
              </div>

              <div className="flex items-center gap-3 pt-1">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                  className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 hover:underline"
                >
                  Change Image
                </button>
                <span className="text-slate-300">•</span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onImageRemoved();
                  }}
                  className="text-xs font-semibold text-rose-600 hover:text-rose-700 flex items-center gap-0.5 hover:underline"
                >
                  <X className="w-3 h-3" /> Remove
                </button>
              </div>
            </div>
          ) : (
            /* Empty Upload Dropzone State matching reference */
            <>
              {/* Cloud Icon matching grey cloud in reference */}
              <div className="w-12 h-10 rounded-full flex items-center justify-center text-slate-400 mb-1.5">
                <UploadCloud className="w-10 h-10 stroke-[1.6]" />
              </div>

              <p className="text-[13px] font-semibold text-[#0F172A] leading-tight">
                Drag & drop an image here
              </p>
              <span className="text-[11px] text-slate-400 my-1">or</span>

              {/* Green Choose File Button matching reference */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRef.current?.click();
                }}
                className="inline-flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-[#15803D] hover:bg-[#166534] active:bg-[#14532D] rounded-lg shadow-sm hover:shadow-md transition-all active:scale-[0.98]"
              >
                <ImageIcon className="w-3.5 h-3.5" />
                <span>Choose File</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Sample Images Section matching reference */}
      <div className="pt-4 border-t border-slate-100 mt-4">
        <span className="text-[11px] text-slate-500 font-medium block text-center mb-2.5">
          or try a sample image
        </span>

        {/* 6 Sample Thumbnails in a single horizontal row matching reference */}
        <div className="grid grid-cols-6 gap-2 px-1">
          {SAMPLE_LEAVES.map((sample) => (
            <button
              key={sample.id}
              type="button"
              onClick={() => handleSampleClick(sample)}
              className="group aspect-square rounded-xl overflow-hidden border border-slate-200 hover:border-emerald-500 hover:ring-2 hover:ring-emerald-400/40 transition-all focus:outline-none relative shadow-2xs hover:shadow-xs"
              title={`Load sample ${sample.crop} leaf with ${sample.expectedDisease}`}
            >
              <img
                src={sample.image}
                alt={`Sample Leaf ${sample.id}`}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
              />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
