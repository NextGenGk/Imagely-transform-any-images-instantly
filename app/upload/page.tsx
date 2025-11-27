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

  // Require auth: redirect guests to sign-in once auth state is loaded
  useEffect(() => {
    if (!isLoaded) return;
    if (!userId) router.push('/sign-in');
  }, [isLoaded, userId, router]);

  // Load selected query from history if present
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
      <main className="flex min-h-screen items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="space-y-8">
          {!uploadedImage && !result && (
            <section>
              <div className="text-center mb-6">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Upload Your Image</h1>
                <p className="text-gray-600">Drag and drop your image or click to browse</p>
              </div>
              <ImageUpload onUpload={handleImageSelect} acceptedFormats={['image/jpeg', 'image/png', 'image/webp']} maxSizeMB={10} />
            </section>
          )}

          {uploadedImage && !result && (
            <section>
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">What would you like to do with this image?</h2>
                <p className="text-gray-600">Describe your image processing request in plain English</p>
              </div>
              <div className="mb-6 flex justify-center">
                <div className="relative">
                  <img src={URL.createObjectURL(uploadedImage)} alt="Uploaded" className="max-h-48 rounded-lg shadow-md" />
                  <button onClick={handleReset} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600" title="Remove image">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
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
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Your Processed Image</h2>
                <p className="text-gray-600">{result.originalQuery}</p>
              </div>
              <ResultDisplay jsonOutput={result.jsonOutput} processedImageUrl={result.processedImageUrl} originalQuery={result.originalQuery} />
              <div className="mt-6 text-center">
                <button onClick={handleReset} className="bg-gradient-to-r from-violet-600 via-fuchsia-600 to-pink-600 text-white py-3 px-8 rounded-lg font-medium hover:shadow-lg hover:shadow-fuchsia-500/25 transition-all duration-200">
                  Process Another Image
                </button>
              </div>
            </section>
          )}
        </div>
      </div>
    </main>
  );
}
