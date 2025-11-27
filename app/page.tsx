'use client';

import { useAuth } from '@clerk/nextjs';
import Hero from '@/components/marketing/Hero';
import Features from '@/components/marketing/Features';
import PricingPage from './pricing/page';

export default function Home() {
  const { isLoaded } = useAuth();

  if (!isLoaded) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Marketing hero section (always visible) */}
      <Hero />

      {/* Features section */}
      <Features />

      <PricingPage />
    </main>
  );
}
