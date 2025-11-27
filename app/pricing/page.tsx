'use client'

import { useState } from 'react';
import { PricingTable } from '@clerk/nextjs';

export default function PricingPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqsData = [
    {
      question: 'What image formats are supported?',
      answer: 'Imagely supports all major image formats including JPG, PNG, WebP, GIF, and more. You can easily convert between formats using natural language commands.'
    },
    {
      question: 'How does the AI image processing work?',
      answer: 'Simply describe what you want to do with your image in plain English. Our AI understands your intent and applies the appropriate transformations like resize, crop, rotate, filters, and more.'
    },
    {
      question: 'Is there a file size limit?',
      answer: 'Free users can process images up to 10MB. Pro users get unlimited file sizes and can process multiple images in batches for maximum efficiency.'
    },
    {
      question: 'Can I process multiple images at once?',
      answer: 'Yes! Pro users have access to batch processing, allowing you to apply the same transformations to multiple images simultaneously, saving you valuable time.'
    },
    {
      question: 'How secure is my data?',
      answer: 'We take security seriously. All images are processed securely and are automatically deleted from our servers after processing. We never store or share your images without permission.'
    },
    {
      question: 'What transformations can I apply?',
      answer: 'You can resize, crop, rotate, flip, apply filters (grayscale, blur, sharpen), adjust brightness and contrast, change formats, compress images, and much more using simple natural language commands.'
    },
    {
      question: 'Do I need technical knowledge to use Imagely?',
      answer: 'Not at all! Imagely is designed for everyone. Just describe what you want in plain English, and our AI handles the technical details for you.'
    },
    {
      question: 'Can I cancel my subscription anytime?',
      answer: 'Yes, you can cancel your Pro subscription at any time. There are no long-term commitments, and you\'ll retain access until the end of your billing period.'
    }
  ];

  return (
    <main id="pricing" className="min-h-screen bg-gray-50 pt-12 pb-0">
      {/* Header */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <p className="text-indigo-600 font-semibold text-sm mb-3">Pricing</p>
          <h1 className="text-5xl md:text-6xl font-bold text-slate-900 mb-6">
            Pricing that scales with you
          </h1>
          <p className="text-lg text-slate-700 max-w-2xl mx-auto">
            Simple, transparent pricing. No hidden fees. Start for free and upgrade as you grow.
          </p>
        </div>
      </div>

      {/* Clerk Pricing Table */}
      <div className="w-full max-w-lg mx-auto px-4 sm:px-6 lg:px-8">
        <PricingTable />
      </div>


      {/* FAQ Section */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mt-24 flex flex-col items-center text-center text-slate-800">
          <p className="text-base font-medium text-indigo-600">FAQ</p>
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mt-2">Frequently Asked Questions</h2>
          <p className="text-lg text-slate-700 mt-4 max-w-2xl">
            Everything you need to know about Imagely and how it can transform your image processing workflow.
          </p>

          <div className="max-w-3xl w-full mt-12 flex flex-col gap-4 items-start text-left">
            {faqsData.map((faq, index) => (
              <div key={index} className="flex flex-col items-start w-full">
                <div
                  className="flex items-center justify-between w-full cursor-pointer border border-indigo-100 bg-white hover:border-indigo-200 p-5 rounded-lg transition-all"
                  onClick={() => setOpenIndex(openIndex === index ? null : index)}
                >
                  <h3 className="text-base font-medium text-slate-900">{faq.question}</h3>
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 18 18"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className={`${openIndex === index ? "rotate-180" : ""} transition-all duration-300 ease-in-out flex-shrink-0 ml-4`}
                  >
                    <path
                      d="m4.5 7.2 3.793 3.793a1 1 0 0 0 1.414 0L13.5 7.2"
                      stroke="#4F46E5"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <div
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${openIndex === index ? "max-h-[300px] opacity-100" : "max-h-0 opacity-0"
                    }`}
                >
                  <p className="text-sm text-slate-600 px-5 pt-4 pb-2">
                    {faq.answer}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section - Full Width */}
      <div className="w-full py-24 px-4 sm:px-6 lg:px-8 max-md:text-center flex flex-col md:flex-row items-center justify-center md:justify-between text-left bg-gradient-to-b from-[#4C0083] to-[#180047] text-white mt-16">
        <div className="max-w-7xl w-full mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <div>
            <h2 className="text-4xl md:text-[46px] md:leading-[60px] font-semibold text-white">
              Ready to transform your images?
            </h2>
            <p className="text-white text-lg">
              Start processing images with AI-powered tools in seconds.
            </p>
          </div>
          <a href="/sign-up" className="px-12 py-3 text-slate-800 bg-white rounded-full text-sm hover:bg-gray-100 transition-colors font-medium flex-shrink-0">
            Get Started
          </a>
        </div>
      </div>
    </main>
  )
}
