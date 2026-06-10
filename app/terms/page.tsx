import React from 'react';
import Link from 'next/link';

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-white flex flex-col">
      <div className="w-full py-12 md:py-24 bg-white px-4 md:px-6 flex-1">
        <div className="max-w-[85rem] mx-auto">
          <div className="relative bg-[#fbf7ff] rounded-[2.5rem] md:rounded-[3rem] px-8 py-16 md:px-20 md:py-24 overflow-hidden">
            {/* Subtle gradient background to match theme */}
            <div
              className="absolute inset-0 -z-10 pointer-events-none opacity-50"
              style={{
                backgroundImage: `
                  radial-gradient(at 30% 50%, #f3e8ff 0%, transparent 60%),
                  radial-gradient(at 70% 50%, #ede9fe 0%, transparent 60%)
                `,
                backgroundBlendMode: "normal",
              }}
            />
            
            <div className="relative z-10 max-w-4xl mx-auto space-y-8 text-gray-600">
              <div className="mb-12">
                <Link href="/" className="text-violet-600 hover:text-violet-700 font-medium inline-flex items-center gap-2 mb-8">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Back to Home
                </Link>
                <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Terms of Service</h1>
                <p className="text-lg">Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
              </div>

              <section className="space-y-4">
                <h2 className="text-2xl font-semibold text-gray-900">1. Acceptance of Terms</h2>
                <p>By accessing and using Imagely, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.</p>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-semibold text-gray-900">2. Description of Service</h2>
                <p>Imagely provides an AI-powered image transformation tool. Users can upload images and process them using natural language commands. We reserve the right to modify or discontinue the service with or without notice.</p>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-semibold text-gray-900">3. User Responsibilities</h2>
                <p>You agree to use the service only for lawful purposes. You are prohibited from uploading images that contain illicit, copyrighted (without permission), or offensive material. We reserve the right to terminate accounts that violate these guidelines.</p>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-semibold text-gray-900">4. Service Limitations and Availability</h2>
                <p>While we strive for 99.9% uptime, Imagely is provided on an "as is" and "as available" basis. We do not warrant that the service will be uninterrupted, timely, secure, or error-free.</p>
              </section>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
