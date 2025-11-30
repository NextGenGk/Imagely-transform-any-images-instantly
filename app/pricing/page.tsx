'use client'

import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function PricingPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [loading, setLoading] = useState<string | null>(null);
  const [subscriptionStatus, setSubscriptionStatus] = useState<any>(null);
  const { userId, isLoaded } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Load Razorpay script
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);

    // Fetch subscription status if user is logged in
    if (isLoaded && userId) {
      fetchSubscriptionStatus();
    }

    return () => {
      document.body.removeChild(script);
    };
  }, [isLoaded, userId]);

  const fetchSubscriptionStatus = async () => {
    try {
      const response = await fetch('/api/subscription/status');
      const data = await response.json();
      if (data.success) {
        setSubscriptionStatus(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch subscription status:', error);
    }
  };

  const handleSubscribe = async (planId: string, planName: string, price: number) => {
    if (!userId) {
      router.push('/sign-in');
      return;
    }

    setLoading(planId);

    try {
      // Create subscription
      const createResponse = await fetch('/api/subscription/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId }),
      });

      const createData = await createResponse.json();

      if (!createData.success) {
        throw new Error(createData.error?.message || 'Failed to create subscription');
      }

      const { subscriptionId } = createData.data;

      // Initialize Razorpay
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        subscription_id: subscriptionId,
        name: 'Imagely',
        description: `${planName} Plan Subscription`,
        image: '/favicon-black.ico',
        handler: async function (response: any) {
          try {
            // Verify payment
            const verifyResponse = await fetch('/api/subscription/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_subscription_id: response.razorpay_subscription_id,
                razorpay_signature: response.razorpay_signature,
                planId,
              }),
            });

            const verifyData = await verifyResponse.json();

            if (verifyData.success) {
              alert('Subscription activated successfully!');
              router.push('/upload');
            } else {
              throw new Error('Payment verification failed');
            }
          } catch (error) {
            console.error('Payment verification error:', error);
            alert('Payment verification failed. Please contact support.');
          }
        },
        prefill: {
          email: '',
          contact: '',
        },
        theme: {
          color: '#4F46E5',
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error('Subscription error:', error);
      alert(error instanceof Error ? error.message : 'Failed to initiate subscription. Please try again.');
    } finally {
      setLoading(null);
    }
  };

  const plans = [
    {
      id: 'basic',
      name: 'Basic',
      price: 299,
      currency: '₹',
      period: '/month',
      description: 'Perfect for individuals',
      features: [
        '50 image processing requests/month',
        'All image transformations',
        'Natural language processing',
        'Standard support',
        'Up to 10MB file size',
      ],
      popular: false,
    },
    {
      id: 'pro',
      name: 'Pro',
      price: 599,
      currency: '₹',
      period: '/month',
      description: 'Best for professionals',
      features: [
        'Unlimited image processing',
        'All image transformations',
        'Natural language processing',
        'Priority support',
        'Unlimited file size',
        'Batch processing',
        'API access',
      ],
      popular: true,
    },
  ];

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

      {/* Pricing Cards */}
      <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <div className="grid md:grid-cols-2 gap-8">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`relative bg-white rounded-2xl shadow-lg border-2 transition-all hover:shadow-xl ${plan.popular ? 'border-indigo-600' : 'border-gray-200'
                }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                <p className="text-gray-600 mb-6">{plan.description}</p>

                <div className="mb-6">
                  <span className="text-5xl font-bold text-gray-900">{plan.currency}{plan.price}</span>
                  <span className="text-gray-600">{plan.period}</span>
                </div>

                <button
                  onClick={() => handleSubscribe(plan.id, plan.name, plan.price)}
                  disabled={loading === plan.id || (subscriptionStatus?.planId === plan.id) || (!subscriptionStatus?.planId && plan.id === 'basic')}
                  className={`w-full py-3 px-6 rounded-lg font-semibold transition-all ${plan.popular
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:shadow-lg disabled:opacity-50'
                    : 'bg-gray-100 text-gray-900 hover:bg-gray-200 disabled:opacity-50'
                    }`}
                >
                  {loading === plan.id
                    ? 'Processing...'
                    : (subscriptionStatus?.planId === plan.id) || (!subscriptionStatus?.planId && plan.id === 'basic')
                      ? 'Current Plan'
                      : 'Subscribe Now'}
                </button>

                <ul className="mt-8 space-y-4">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <svg
                        className="w-5 h-5 text-indigo-600 mr-3 mt-0.5 shrink-0"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
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
