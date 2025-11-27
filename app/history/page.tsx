'use client';

import { useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import HistoryList from '@/components/HistoryList';
import { UserButton } from '@/components/auth';
import { ProcessingRequest } from '@/lib/types';

export default function HistoryPage() {
  const { userId, isLoaded } = useAuth();
  const router = useRouter();
  const [selectedQuery, setSelectedQuery] = useState<ProcessingRequest | null>(null);

  // Redirect to sign-in if not authenticated
  if (isLoaded && !userId) {
    router.push('/sign-in');
    return null;
  }

  if (!isLoaded) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </main>
    );
  }

  const handleSelectQuery = (query: ProcessingRequest) => {
    setSelectedQuery(query);
    // Navigate back to home page with the query
    // Store in sessionStorage so home page can pick it up
    sessionStorage.setItem('selectedQuery', JSON.stringify(query));
    router.push('/');
  };

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Processing History
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                View and reuse your previous image processing requests
              </p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/')}
                className="text-sm text-gray-700 hover:text-gray-900 font-medium"
              >
                ← Back to Home
              </button>
              <UserButton />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900">
              Your Processing Requests
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Click on any request to reuse it on the home page
            </p>
          </div>

          <HistoryList userId={userId!} onSelectQuery={handleSelectQuery} />
        </div>
      </div>
    </main>
  );
}
