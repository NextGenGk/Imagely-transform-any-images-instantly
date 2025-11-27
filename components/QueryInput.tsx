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
      setQuery(''); // Clear input after successful submission
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
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="query" className="block text-sm font-medium text-gray-700 mb-2">
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
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-fuchsia-500 focus:border-transparent resize-none placeholder:text-gray-400 text-gray-900 bg-white ${error ? 'border-red-500' : 'border-gray-300'
              }`}
            rows={3}
            disabled={isLoading}
          />
          {error && (
            <p className="mt-1 text-sm text-red-600">{error}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading || !query.trim()}
          className="w-full bg-gradient-to-r from-violet-600 via-fuchsia-600 to-pink-600 text-white py-3 px-6 rounded-lg font-medium hover:shadow-lg hover:shadow-fuchsia-500/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
        >
          {isLoading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing...
            </span>
          ) : (
            'Parse Query'
          )}
        </button>
      </form>

      <div className="mt-6">
        <p className="text-sm font-medium text-gray-700 mb-3">Example queries:</p>
        <div className="flex flex-wrap gap-2">
          {EXAMPLE_QUERIES.map((example, index) => (
            <button
              key={index}
              onClick={() => handleExampleClick(example)}
              disabled={isLoading}
              className="text-sm px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {example}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
