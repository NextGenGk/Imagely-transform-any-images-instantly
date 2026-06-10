'use client';

import { useState } from 'react';

interface QueryInputProps {
  onSubmit: (query: string) => Promise<void>;
  isLoading: boolean;
}

const EXAMPLE_QUERIES = [
  "convert this to a passport photo 300 ppi",
  "resize to 1280x720",
  "US passport photo with blue background",
  "compress to 500KB in PNG format",
  "remove background and resize to 800x600 pixels"
];

export default function QueryInput({ onSubmit, isLoading }: QueryInputProps) {
  const [query, setQuery] = useState('');
  const [error, setError] = useState('');

  const validateQuery = (value: string): boolean => {
    if (!value.trim()) {
      setError('Query cannot be empty');
      return false;
    }
    setError('');
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateQuery(query)) {
      return;
    }

    try {
      await onSubmit(query);
      setQuery('');
    } catch (err) {
      setError('Failed to process query. Please try again.');
    }
  };

  const handleExampleClick = (example: string) => {
    setQuery(example);
    setError('');
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="relative">
        <div className="absolute -inset-1 bg-gradient-to-r from-violet-500 via-[#9938CA] to-[#E0724A] rounded-2xl blur-lg opacity-20" />
        <div className="relative bg-white rounded-xl shadow-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="query" className="block text-sm font-semibold text-gray-700 mb-2">
                Describe your image processing request
              </label>
              <textarea
                id="query"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  if (error) setError('');
                }}
                placeholder="e.g., convert this to a passport photo 300 ppi"
                className={`w-full px-4 py-3.5 border rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent resize-none placeholder:text-gray-400 text-gray-900 bg-white/80 transition-all ${
                  error ? 'border-red-300 bg-red-50/30' : 'border-gray-200 hover:border-gray-300'
                }`}
                rows={3}
                disabled={isLoading}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    if (!isLoading && query.trim()) {
                      handleSubmit(e as any);
                    }
                  }
                }}
              />
              {error && (
                <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {error}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading || !query.trim()}
              className="w-full bg-gradient-to-r from-violet-600 via-[#9938CA] to-[#E0724A] text-white py-3.5 px-6 rounded-xl font-semibold hover:shadow-lg hover:shadow-violet-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 active:scale-[0.98]"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-3">
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Processing your image...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  Transform Image
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
              )}
            </button>
          </form>

          <div className="mt-8">
            <p className="text-sm font-semibold text-gray-700 mb-3">Try an example:</p>
            <div className="flex flex-wrap gap-2">
              {EXAMPLE_QUERIES.map((example, index) => (
                <button
                  key={index}
                  onClick={() => handleExampleClick(example)}
                  disabled={isLoading}
                  className="text-sm px-4 py-2 bg-gradient-to-r from-violet-50 to-fuchsia-50 hover:from-violet-100 hover:to-fuchsia-100 text-gray-700 rounded-full transition-all border border-violet-100 hover:border-violet-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {example}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
