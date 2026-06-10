import React from 'react';
import Link from 'next/link';

export default function PrivacyPage() {
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
                <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Privacy Policy</h1>
                <p className="text-lg">Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
              </div>

              <section className="space-y-4">
                <h2 className="text-2xl font-semibold text-gray-900">1. Information We Collect</h2>
                <p>We collect information you provide when creating an account, including your name and email address. When you upload images, we process them temporarily to deliver our service but do not permanently store your uploads beyond the processing session.</p>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-semibold text-gray-900">2. How We Use Your Information</h2>
                <p>We use your information to provide, maintain, and improve our services, process your image transformations, communicate with you about your account, and ensure the security of our platform.</p>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-semibold text-gray-900">3. Data Security</h2>
                <p>We implement industry-standard security measures including encryption at rest and in transit. Your images are automatically deleted from our servers after processing. We never share your personal data with third parties for marketing purposes.</p>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-semibold text-gray-900">4. Cookies</h2>
                <p>We use essential cookies to maintain your session and authentication. Optional analytics cookies help us improve our service. You can manage cookie preferences in your browser settings at any time.</p>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-semibold text-gray-900">5. Your Rights</h2>
                <p>You have the right to access, update, or delete your account data at any time. Contact us at support@imagely.app to exercise these rights. We will respond to your request within 30 days.</p>
              </section>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
