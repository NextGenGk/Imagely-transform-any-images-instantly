'use client';

import { useState, useEffect } from 'react';
import { ImageProcessingSpec } from '@/lib/types';

interface ResultDisplayProps {
  jsonOutput: ImageProcessingSpec;
  processedImageUrl?: string;
  originalQuery: string;
}

export default function ResultDisplay({
  jsonOutput,
  processedImageUrl,
  originalQuery
}: ResultDisplayProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [resolvedImageUrl, setResolvedImageUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!processedImageUrl) return;

    let active = true;
    let timeoutId: NodeJS.Timeout;

    setResolvedImageUrl(null);
    setImageLoaded(false);
    setImageError(false);

    const pollImage = async () => {
      if (!active) return;
      
      try {
        const testUrl = processedImageUrl + (processedImageUrl.includes('?') ? '&' : '?') + 'poll=' + Date.now();
        const response = await fetch(testUrl, { method: 'HEAD' });
        
        if (response.ok) {
          if (active) setResolvedImageUrl(testUrl);
        } else if ([404, 423, 202].includes(response.status)) {
          // ImageKit is still processing the image
          if (active) timeoutId = setTimeout(pollImage, 2500);
        } else {
          // Some other error
          if (active) setImageError(true);
        }
      } catch (err) {
        // Fallback if fetch fails due to CORS or network
        const img = new Image();
        const testUrl = processedImageUrl + (processedImageUrl.includes('?') ? '&' : '?') + 'poll=' + Date.now();
        img.onload = () => { if (active) setResolvedImageUrl(testUrl); };
        img.onerror = () => { if (active) timeoutId = setTimeout(pollImage, 2500); };
        img.src = testUrl;
      }
    };

    pollImage();

    return () => {
      active = false;
      clearTimeout(timeoutId);
    };
  }, [processedImageUrl]);

  const handleDownload = () => {
    if (!processedImageUrl) {
      console.error('No processed image URL available for download');
      return;
    }

    fetch(processedImageUrl)
      .then(response => response.blob())
      .then(blob => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `processed-image-${Date.now()}.jpg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      })
      .catch(error => {
        console.error('Download failed:', error);
        const link = document.createElement('a');
        link.href = processedImageUrl;
        link.download = `processed-image-${Date.now()}.jpg`;
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      });
  };

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(jsonOutput, null, 2));
  };

  const getTaskTypeLabel = (taskType: string): string => {
    const labels: Record<string, string> = {
      passport_photo: 'Passport Photo',
      resize: 'Resize Image',
      compress: 'Compress Image',
      background_change: 'Background Change',
      enhance: 'Enhance Image',
      format_change: 'Format Conversion',
      custom: 'Custom Processing'
    };
    return labels[taskType] || taskType;
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8">
      {/* Debug Info */}
      {!processedImageUrl && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-5">
          <div className="flex items-start gap-3">
            <svg className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <p className="text-sm text-red-800 font-medium">No processed image URL available. The transformation may have failed.</p>
          </div>
        </div>
      )}

      {/* Processed Image Preview */}
      {processedImageUrl && (
        <div className="relative">
          <div className="absolute -inset-1 bg-gradient-to-r from-violet-500 via-[#9938CA] to-[#E0724A] rounded-2xl blur-lg opacity-20" />
          <div className="relative bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="p-6 flex justify-center bg-gradient-to-br from-gray-50 to-gray-100 min-h-[300px] items-center relative">
              {!imageLoaded && !imageError && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 z-10 backdrop-blur-sm">
                  <div className="w-10 h-10 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin"></div>
                  <p className="mt-4 text-sm text-gray-600 font-medium animate-pulse">Applying transformations...</p>
                </div>
              )}
              {imageError && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-red-500 bg-red-50/50 z-10">
                  <svg className="w-10 h-10 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  <p className="text-sm font-medium">Failed to load processed image. It might have timed out.</p>
                </div>
              )}
              {resolvedImageUrl && (
                <img
                  src={resolvedImageUrl}
                  alt="Processed result"
                  className={`max-h-[500px] rounded-lg shadow-xl transition-opacity duration-500 relative z-0 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
                  onLoad={() => setImageLoaded(true)}
                  onError={() => setImageError(true)}
                />
              )}
            </div>
            <div className="px-6 py-5 bg-white border-t border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4">
              <div>
                <p className="text-sm font-semibold text-gray-900">Your image is ready!</p>
                <p className="text-xs text-gray-500 mt-0.5">Task: {getTaskTypeLabel(jsonOutput.task_type)}</p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => window.open(resolvedImageUrl || processedImageUrl, '_blank')}
                  disabled={!resolvedImageUrl}
                  className="inline-flex items-center gap-2 bg-gray-100 text-gray-700 py-2.5 px-5 rounded-xl font-medium hover:bg-gray-200 transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  View
                </button>
                <button
                  onClick={handleDownload}
                  disabled={!resolvedImageUrl}
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-violet-600 via-[#9938CA] to-[#E0724A] text-white py-2.5 px-5 rounded-xl font-medium hover:shadow-lg hover:shadow-violet-200 transition-all duration-200 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Aggressive Compression Warning */}
      {jsonOutput.max_file_size_mb && jsonOutput.max_file_size_mb < 0.05 && (
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-5">
          <div className="flex items-start gap-3">
            <svg className="w-6 h-6 text-orange-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div>
              <h4 className="text-sm font-semibold text-orange-900 mb-1">Aggressive Compression Applied</h4>
              <p className="text-sm text-orange-800">
                Target file size is very small ({(jsonOutput.max_file_size_mb * 1024).toFixed(1)}KB).
                The image has been compressed with reduced quality and dimensions to meet this target.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Background Processing Info */}
      {jsonOutput.task_type === 'background_change' && processedImageUrl && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-5">
          <div className="flex items-start gap-3">
            <svg className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h4 className="text-sm font-semibold text-green-900 mb-1">Background Processed Successfully</h4>
              <p className="text-sm text-green-800">
                Your image background has been processed using AI-powered background removal.
                {jsonOutput.background && jsonOutput.background !== 'transparent' && (
                  <span> The new background color has been applied: <strong>{jsonOutput.background}</strong></span>
                )}
              </p>
            </div>
          </div>
        </div>
      )}

      {jsonOutput.task_type === 'background_change' && !processedImageUrl && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-5">
          <div className="flex items-start gap-3">
            <svg className="w-6 h-6 text-yellow-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div>
              <h4 className="text-sm font-semibold text-yellow-900 mb-1">Background Processing Unavailable</h4>
              <p className="text-sm text-yellow-800">Background removal failed. Please try again or contact support if the issue persists.</p>
            </div>
          </div>
        </div>
      )}

      {/* Processing Summary */}
      <div className="relative">
        <div className="absolute -inset-1 bg-gradient-to-r from-violet-500 via-[#9938CA] to-[#E0724A] rounded-2xl blur-lg opacity-10" />
        <div className="relative bg-white rounded-xl shadow-lg p-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-900">Processing Summary</h3>
            <button
              onClick={handleCopyJson}
              className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-violet-600 bg-gray-50 hover:bg-violet-50 px-3 py-1.5 rounded-lg transition-all"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Copy JSON
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-start gap-4">
              <div className="bg-gradient-to-br from-violet-100 to-violet-50 rounded-xl p-3">
                <svg className="w-5 h-5 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Task Type</p>
                <p className="text-base font-semibold text-gray-900 mt-0.5">{getTaskTypeLabel(jsonOutput.task_type)}</p>
              </div>
            </div>

            {(jsonOutput.dimensions.width_px || jsonOutput.dimensions.width_mm) && (
              <div className="flex items-start gap-4">
                <div className="bg-gradient-to-br from-emerald-100 to-emerald-50 rounded-xl p-3">
                  <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Dimensions</p>
                  <p className="text-base font-semibold text-gray-900 mt-0.5">
                    {jsonOutput.dimensions.width_px
                      ? `${jsonOutput.dimensions.width_px} × ${jsonOutput.dimensions.height_px} px`
                      : `${jsonOutput.dimensions.width_mm} × ${jsonOutput.dimensions.height_mm} mm`
                    }
                  </p>
                </div>
              </div>
            )}

            {jsonOutput.dpi && (
              <div className="flex items-start gap-4">
                <div className="bg-gradient-to-br from-purple-100 to-purple-50 rounded-xl p-3">
                  <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Resolution</p>
                  <p className="text-base font-semibold text-gray-900 mt-0.5">{jsonOutput.dpi} DPI</p>
                </div>
              </div>
            )}

            {jsonOutput.background && jsonOutput.background !== 'original' && (
              <div className="flex items-start gap-4">
                <div className="bg-gradient-to-br from-amber-100 to-amber-50 rounded-xl p-3">
                  <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Background</p>
                  <p className="text-base font-semibold text-gray-900 mt-0.5 capitalize">{jsonOutput.background}</p>
                </div>
              </div>
            )}

            {jsonOutput.format && (
              <div className="flex items-start gap-4">
                <div className="bg-gradient-to-br from-rose-100 to-rose-50 rounded-xl p-3">
                  <svg className="w-5 h-5 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Format</p>
                  <p className="text-base font-semibold text-gray-900 mt-0.5">{jsonOutput.format.toUpperCase()}</p>
                </div>
              </div>
            )}

            {jsonOutput.max_file_size_mb && (
              <div className="flex items-start gap-4">
                <div className="bg-gradient-to-br from-fuchsia-100 to-fuchsia-50 rounded-xl p-3">
                  <svg className="w-5 h-5 text-fuchsia-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Max File Size</p>
                  <p className="text-base font-semibold text-gray-900 mt-0.5">{jsonOutput.max_file_size_mb} MB</p>
                </div>
              </div>
            )}
          </div>

          {jsonOutput.additional_notes && (
            <div className="mt-6 pt-6 border-t border-gray-100">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">Additional Notes</p>
              <p className="text-sm text-gray-600">{jsonOutput.additional_notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
