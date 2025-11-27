'use client';

import { useState, useRef, DragEvent, ChangeEvent } from 'react';

interface ImageUploadProps {
  onUpload: (file: File) => void;
  acceptedFormats: string[];
  maxSizeMB: number;
}

export default function ImageUpload({ onUpload, acceptedFormats, maxSizeMB }: ImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState('');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): boolean => {
    // Check file type
    if (!acceptedFormats.includes(file.type)) {
      setError(`Invalid file type. Accepted formats: ${acceptedFormats.join(', ')}`);
      return false;
    }

    // Check file size
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > maxSizeMB) {
      setError(`File size exceeds ${maxSizeMB}MB limit. Your file is ${fileSizeMB.toFixed(2)}MB`);
      return false;
    }

    setError('');
    return true;
  };

  const handleFile = (file: File) => {
    if (!validateFile(file)) {
      return;
    }

    // show preview and call onUpload with the file
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    onUpload(file);
  };

  const handleDragEnter = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleFileInput = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleRemove = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    setError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };



  return (
    <div className="w-full max-w-4xl mx-auto">
      <div
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className="relative"
      >
        {!previewUrl ? (
          <div className={`relative overflow-hidden rounded-2xl border-2 border-dashed transition-all duration-300 ${isDragging
            ? 'border-fuchsia-500 bg-fuchsia-50/50 scale-[1.02]'
            : error
              ? 'border-red-300 bg-red-50/30'
              : 'border-gray-300 bg-white hover:border-fuchsia-400 hover:bg-gray-50/50'
            }`}>
            {/* Animated background gradient */}
            <div className={`absolute inset-0 bg-gradient-to-br from-violet-500/5 via-fuchsia-500/5 to-pink-500/5 transition-opacity duration-300 ${isDragging ? 'opacity-100' : 'opacity-0'
              }`} />

            <div className="relative px-6 py-16 sm:px-12 sm:py-20">
              <div className="flex flex-col items-center text-center space-y-6">
                {/* Icon */}
                <div className={`relative transition-all duration-300 ${isDragging ? 'scale-110' : 'scale-100'}`}>
                  <div className="absolute inset-0 bg-fuchsia-500/20 blur-2xl rounded-full" />
                  <div className="relative bg-gradient-to-br from-violet-500 to-fuchsia-600 p-4 rounded-2xl shadow-lg">
                    <svg
                      className="w-12 h-12 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                      />
                    </svg>
                  </div>
                </div>

                {/* Text content */}
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold text-gray-900">
                    {isDragging ? 'Drop your image here' : 'Upload your image'}
                  </h3>
                  <p className="text-sm text-gray-600 max-w-sm">
                    Drag and drop your image here, or click to browse
                  </p>
                </div>

                {/* Upload button */}
                <div className="pt-2">
                  <label
                    htmlFor="file-upload"
                    className="group relative inline-flex items-center gap-2 bg-gradient-to-r from-violet-600 via-fuchsia-600 to-pink-600 text-white px-8 py-3 rounded-xl font-medium cursor-pointer transition-all duration-200 hover:shadow-lg hover:shadow-fuchsia-500/50 hover:-translate-y-0.5 active:translate-y-0"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Choose Image
                  </label>
                  <input
                    id="file-upload"
                    ref={fileInputRef}
                    type="file"
                    className="sr-only"
                    accept={acceptedFormats.join(',')}
                    onChange={handleFileInput}
                  />
                </div>

                {/* File requirements */}
                <div className="flex items-center gap-4 text-xs text-gray-500 pt-2">
                  <div className="flex items-center gap-1.5">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span>{acceptedFormats.map(f => f.split('/')[1].toUpperCase()).join(', ')}</span>
                  </div>
                  <div className="w-1 h-1 rounded-full bg-gray-400" />
                  <div className="flex items-center gap-1.5">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                    </svg>
                    <span>Max {maxSizeMB}MB</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-8">
              <div className="flex flex-col sm:flex-row items-center gap-6">
                {/* Image preview */}
                <div className="relative group flex-shrink-0">
                  <div className="w-32 h-32 rounded-xl overflow-hidden ring-2 ring-fuchsia-100 shadow-md">
                    <img
                      src={previewUrl!}
                      alt="preview"
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                  <div className="absolute -top-2 -right-2 bg-green-500 text-white p-1.5 rounded-full shadow-lg">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>

                {/* Info and actions */}
                <div className="flex-1 text-center sm:text-left space-y-4">
                  <div>
                    <div className="flex items-center justify-center sm:justify-start gap-2">
                      <h4 className="text-lg font-semibold text-gray-900">Image ready</h4>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Uploaded
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      Your image is ready to process. You can replace or remove it below.
                    </p>
                  </div>

                  {/* Action buttons */}
                  <div className="flex items-center justify-center sm:justify-start gap-3">
                    <label
                      htmlFor="file-upload"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-colors cursor-pointer"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Replace
                    </label>
                    <button
                      onClick={handleRemove}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 border border-red-200 rounded-lg text-sm font-medium text-red-700 hover:bg-red-100 hover:border-red-300 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
            <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <p className="text-sm text-red-800 font-medium">{error}</p>
          </div>
        )}
      </div>
    </div>
  );
}

