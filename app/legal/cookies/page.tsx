import React from 'react';
import Link from 'next/link';

export default function CookiesPage() {
  return (
    <main className="min-h-screen bg-white flex flex-col">
      <div className="w-full py-12 md:py-24 bg-white px-4 md:px-6 flex-1">
        <div className="max-w-[85rem] mx-auto">
          <div className="relative bg-[#fbf7ff] rounded-[2.5rem] md:rounded-[3rem] px-8 py-16 md:px-20 md:py-24 overflow-hidden">
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
                <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Cookie Policy</h1>
                <p className="text-lg">Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
              </div>

              <section className="space-y-4">
                <h2 className="text-2xl font-semibold text-gray-900">1. What Are Cookies</h2>
                <p>Cookies are small text files stored on your device by your web browser. They help us remember your preferences and improve your experience on our platform.</p>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-semibold text-gray-900">2. How We Use Cookies</h2>
                <p>We use essential cookies for authentication and security. These are necessary for the platform to function. We also use analytics cookies to understand how users interact with our service and help us improve.</p>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-semibold text-gray-900">3. Managing Cookies</h2>
                <p>Most web browsers allow you to control cookies through your browser settings. However, disabling certain cookies may affect the functionality of our platform. Essential cookies cannot be disabled while using our service.</p>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-semibold text-gray-900">4. Third-Party Cookies</h2>
                <p>We use Clerk for authentication, which may set essential cookies. We do not use third-party advertising cookies or sell browsing data to external parties.</p>
              </section>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
