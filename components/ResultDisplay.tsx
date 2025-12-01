'use client';

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
  const handleDownload = () => {
    if (!processedImageUrl) {
      console.error('No processed image URL available for download');
      return;
    }

    console.log('Downloading image from:', processedImageUrl);

    // For ImageKit URLs, we need to fetch and download
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
        // Fallback: try direct link
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

  const formatJson = (obj: any): string => {
    return JSON.stringify(obj, null, 2);
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

  console.log('ResultDisplay - processedImageUrl:', processedImageUrl);
  console.log('ResultDisplay - jsonOutput:', jsonOutput);

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Debug Info */}
      {!processedImageUrl && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-800">
            ⚠️ No processed image URL available. The transformation may have failed.
          </p>
        </div>
      )}

      {/* Processed Image Preview */}
      {processedImageUrl && (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="p-6 flex justify-center bg-gradient-to-br from-gray-50 to-gray-100">
            <img
              src={processedImageUrl}
              alt="Processed result"
              className="max-h-[500px] rounded-lg shadow-xl"
            />
          </div>
          <div className="px-6 py-4 bg-white border-t border-gray-200 flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-600">Your image is ready!</p>
              <p className="text-xs text-gray-500 mt-1">Task: {getTaskTypeLabel(jsonOutput.task_type)}</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => window.open(processedImageUrl, '_blank')}
                className="flex items-center gap-2 bg-gray-600 text-white py-2 px-6 rounded-lg font-medium hover:bg-gray-700 transition-colors"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
                View URL
              </button>
              <button
                onClick={handleDownload}
                className="flex items-center gap-2 bg-gradient-to-r from-violet-600 via-fuchsia-600 to-pink-600 text-white py-2 px-6 rounded-lg font-medium hover:shadow-lg hover:shadow-fuchsia-500/25 transition-all duration-200"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                  />
                </svg>
                Download
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Processing Summary */}
      {/* Aggressive Compression Warning */}
      {jsonOutput.max_file_size_mb && jsonOutput.max_file_size_mb < 0.05 && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <svg className="w-6 h-6 text-orange-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div>
              <h4 className="text-sm font-semibold text-orange-900 mb-1">Aggressive Compression Applied</h4>
              <p className="text-sm text-orange-800">
                Target file size is very small ({(jsonOutput.max_file_size_mb * 1024).toFixed(1)}KB).
                The image has been compressed with reduced quality and dimensions to meet this target.
                Expect visible quality loss.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Background Processing Info */}
      {jsonOutput.task_type === 'background_change' && processedImageUrl && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <svg className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <svg className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div>
              <h4 className="text-sm font-semibold text-yellow-900 mb-1">Background Processing Unavailable</h4>
              <p className="text-sm text-yellow-800">
                Background removal failed. Please try again or contact support if the issue persists.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Processing Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-start gap-3">
            <div className="bg-blue-100 rounded-lg p-2">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">Task Type</p>
              <p className="text-base text-gray-900">{getTaskTypeLabel(jsonOutput.task_type)}</p>
            </div>
          </div>

          {(jsonOutput.dimensions.width_px || jsonOutput.dimensions.width_mm) && (
            <div className="flex items-start gap-3">
              <div className="bg-green-100 rounded-lg p-2">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Dimensions</p>
                <p className="text-base text-gray-900">
                  {jsonOutput.dimensions.width_px
                    ? `${jsonOutput.dimensions.width_px} × ${jsonOutput.dimensions.height_px} px`
                    : `${jsonOutput.dimensions.width_mm} × ${jsonOutput.dimensions.height_mm} mm`
                  }
                </p>
              </div>
            </div>
          )}

          {jsonOutput.dpi && (
            <div className="flex items-start gap-3">
              <div className="bg-purple-100 rounded-lg p-2">
                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Resolution</p>
                <p className="text-base text-gray-900">{jsonOutput.dpi} DPI</p>
              </div>
            </div>
          )}

          {jsonOutput.background && jsonOutput.background !== 'original' && (
            <div className="flex items-start gap-3">
              <div className="bg-yellow-100 rounded-lg p-2">
                <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Background</p>
                <p className="text-base text-gray-900 capitalize">{jsonOutput.background}</p>
              </div>
            </div>
          )}

          {jsonOutput.format && (
            <div className="flex items-start gap-3">
              <div className="bg-red-100 rounded-lg p-2">
                <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Format</p>
                <p className="text-base text-gray-900">{jsonOutput.format.toUpperCase()}</p>
              </div>
            </div>
          )}

          {jsonOutput.max_file_size_mb && (
            <div className="flex items-start gap-3">
              <div className="bg-fuchsia-100 rounded-lg p-2">
                <svg className="w-5 h-5 text-fuchsia-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Max File Size</p>
                <p className="text-base text-gray-900">{jsonOutput.max_file_size_mb} MB</p>
              </div>
            </div>
          )}
        </div>

        {jsonOutput.additional_notes && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-sm font-medium text-gray-700 mb-1">Additional Notes</p>
            <p className="text-sm text-gray-600">{jsonOutput.additional_notes}</p>
          </div>
        )}
      </div>
    </div>
  );
}
