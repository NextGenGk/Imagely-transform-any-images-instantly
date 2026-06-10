'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import ImageUpload from '@/components/ImageUpload';
import QueryInput from '@/components/QueryInput';
import ResultDisplay from '@/components/ResultDisplay';
import ErrorDisplay from '@/components/ErrorDisplay';
import { ImageProcessingSpec, ProcessingRequest } from '@/lib/types';

export default function UploadPage() {
  const { userId, isLoaded } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [result, setResult] = useState<{
    jsonOutput: ImageProcessingSpec;
    originalQuery: string;
    processedImageUrl?: string;
  } | null>(null);
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    if (!isLoaded) return;
    if (!userId) router.push('/sign-in');
  }, [isLoaded, userId, router]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const selectedQueryStr = sessionStorage.getItem('selectedQuery');
      if (selectedQueryStr) {
        try {
          const selectedQuery: ProcessingRequest = JSON.parse(selectedQueryStr);
          setResult({
            jsonOutput: selectedQuery.jsonOutput,
            originalQuery: selectedQuery.query,
            processedImageUrl: selectedQuery.processedImageUrl,
          });
          sessionStorage.removeItem('selectedQuery');
        } catch (err) {
          console.error('Failed to parse selected query:', err);
          setError('Failed to load selected query from history');
        }
      }
    }
  }, []);

  const handleImageSelect = (file: File) => {
    setUploadedImage(file);
    setError(null);
  };

  const handleQuerySubmit = async (query: string) => {
    if (!uploadedImage) {
      setError({ message: 'Please upload an image first' });
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const parseResponse = await fetch('/api/parse-query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      });
      const parseData = await parseResponse.json();
      if (!parseResponse.ok || !parseData.success) {
        setError(parseData.error || { message: 'Failed to parse query' });
        return;
      }

      const formData = new FormData();
      formData.append('image', uploadedImage);
      formData.append('specifications', JSON.stringify(parseData.data));

      const processResponse = await fetch('/api/process-image', {
        method: 'POST',
        body: formData,
      });
      const processData = await processResponse.json();

      if (!processResponse.ok || !processData.success) {
        setError(processData.error || { message: 'Failed to process image' });
        return;
      }
      if (!processData.imageUrl) {
        setError({ message: 'Image processing succeeded but no URL was returned' });
        return;
      }

      setResult({ jsonOutput: parseData.data, originalQuery: query, processedImageUrl: processData.imageUrl });

      window.dispatchEvent(new Event('credit-update'));
    } catch (err) {
      setError({ message: err instanceof Error ? err.message : 'An error occurred while processing your request' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setUploadedImage(null);
    setResult(null);
    setError(null);
  };

  if (!isLoaded) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-4 border-violet-200 border-t-violet-600 animate-spin" />
          <p className="text-violet-600 font-medium">Loading your workspace...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white flex flex-col justify-center">
      <div className="w-full pt-24 pb-4 md:pt-24 md:pb-8 bg-white px-4 md:px-6">
        <div className="max-w-[85rem] mx-auto">
          <div className="relative bg-[#fbf7ff] rounded-[2.5rem] md:rounded-[3rem] px-8 py-6 md:px-16 md:py-8 overflow-hidden">
            {/* Decorative background gradients */}
            <div
                className="absolute inset-0 -z-10 pointer-events-none"
                style={{
                backgroundImage: `
                    radial-gradient(at 30% 50%, #f3e8ff 0%, transparent 60%),
                    radial-gradient(at 70% 50%, #ede9fe 0%, transparent 60%)
                `,
                backgroundBlendMode: "normal",
                }}
            />

            <div className="relative z-10 space-y-6">
              {!uploadedImage && !result && (
                <section>
                  <div className="text-center max-w-2xl mx-auto mb-6">
                    <div className="inline-flex items-center justify-center p-[1px] rounded-full bg-gradient-to-r from-violet-500 via-[#9938CA] to-[#E0724A] mb-4">
                      <div className="bg-white px-4 py-1.5 rounded-full flex items-center">
                        <p className="text-sm font-medium bg-gradient-to-r from-violet-600 via-[#9938CA] to-[#E0724A] bg-clip-text text-transparent">
                          Get Started
                        </p>
                      </div>
                    </div>
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-gray-800 mb-3">
                      Upload Your Image
                    </h1>
                    <p className="text-base text-gray-500">
                      Drag and drop your image or click to browse — we support JPEG, PNG, and WebP formats.
                    </p>
                  </div>
                  <ImageUpload onUpload={handleImageSelect} acceptedFormats={['image/jpeg', 'image/png', 'image/webp']} maxSizeMB={10} />
                </section>
              )}

              {uploadedImage && !result && (
                <section>
                  <div className="text-center max-w-2xl mx-auto mb-6">
                    <div className="inline-flex items-center justify-center p-[1px] rounded-full bg-gradient-to-r from-violet-500 via-[#9938CA] to-[#E0724A] mb-4">
                      <div className="bg-white px-4 py-1.5 rounded-full flex items-center">
                        <p className="text-sm font-medium bg-gradient-to-r from-violet-600 via-[#9938CA] to-[#E0724A] bg-clip-text text-transparent">
                          Step 2 of 2
                        </p>
                      </div>
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-800 mb-2">What would you like to do with this image?</h2>
                    <p className="text-base text-gray-500">Describe your image processing request in plain English</p>
                  </div>
                  <div className="mb-4 flex justify-center">
                    <div className="relative group">
                      <div className="absolute -inset-1 bg-gradient-to-r from-violet-500 via-[#9938CA] to-[#E0724A] rounded-2xl blur-lg opacity-30 group-hover:opacity-50 transition-opacity" />
                      <div className="relative bg-white p-2 rounded-xl shadow-lg">
                        <img src={URL.createObjectURL(uploadedImage)} alt="Uploaded" className="max-h-32 rounded-lg" />
                        <button onClick={handleReset} className="absolute -top-2 -right-2 bg-white text-red-500 rounded-full p-1.5 shadow-lg hover:bg-red-50 hover:text-red-600 transition-all border border-red-200" title="Remove image">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                  <QueryInput onSubmit={handleQuerySubmit} isLoading={isLoading} />
                </section>
              )}

              {error && (
                <ErrorDisplay error={error} onDismiss={() => setError(null)} />
              )}

              {result && (
                <section>
                  <div className="text-center max-w-2xl mx-auto mb-6">
                    <div className="inline-flex items-center justify-center p-[1px] rounded-full bg-gradient-to-r from-violet-500 via-[#9938CA] to-[#E0724A] mb-4">
                      <div className="bg-white px-4 py-1.5 rounded-full flex items-center">
                        <svg className="w-4 h-4 text-green-500 mr-1.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        <p className="text-sm font-medium text-gray-700">Processing Complete</p>
                      </div>
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-800 mb-2">Your Processed Image</h2>
                    <p className="text-base text-gray-500 max-w-xl mx-auto">&ldquo;{result.originalQuery}&rdquo;</p>
                  </div>
                  <ResultDisplay jsonOutput={result.jsonOutput} processedImageUrl={result.processedImageUrl} originalQuery={result.originalQuery} />
                  <div className="mt-6 text-center">
                    <button onClick={handleReset} className="inline-flex items-center gap-2 bg-gradient-to-r from-violet-600 to-[#9938CA] text-white py-3 px-8 rounded-xl font-medium shadow-lg shadow-violet-200 hover:shadow-xl hover:shadow-violet-300 transition-all duration-200 active:scale-[0.98]">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Process Another Image
                    </button>
                  </div>
                </section>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
