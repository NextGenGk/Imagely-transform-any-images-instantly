'use client';

import React from 'react';
import { Check, CaretRight } from '@phosphor-icons/react';
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils"
import { AnimatedGradientText } from "@/registry/magicui/animated-gradient-text"
import { RippleButton } from "@/registry/magicui/ripple-button"

const plans = [
  {
    name: "Free",
    price: "0",
    description: "Perfect for individuals",
    href: "/sign-up",
    features: [
      "10 image processing requests/month",
      "Natural language processing",
      "Resize, crop, rotate, flip",
      "Background removal",
      "Passport photo",
      "Standard support 3-5 days",
    ],
    popular: false,
  },
  {
    name: "Pro",
    price: "99",
    description: "Best for professionals",
    href: "/sign-up",
    features: [
      "500 image processing requests/month",
      "Natural language processing",
      "Resize, crop, rotate, flip",
      "Background removal & change",
      "Drop shadow, retouch, upscale",
      "Face crop & smart crop",
      "Priority support within 24 hours",
    ],
    popular: true,
  },
];

export default function PricingSection() {
  const router = useRouter();
  return (
    <section className="w-full py-6 md:py-12 bg-white px-4 md:px-6">
      <div className="max-w-[85rem] mx-auto">
        <div className="bg-[#fbf7ff] rounded-[2.5rem] md:rounded-[3rem] px-8 py-20 md:px-16 md:py-28">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <div className="flex justify-center mb-6">
              <div className="group relative mx-auto flex items-center justify-center rounded-full px-4 py-1.5 shadow-[inset_0_-8px_10px_#8fdfff1f] transition-shadow duration-500 ease-out hover:shadow-[inset_0_-5px_10px_#8fdfff3f]">
                <span
                  className={cn(
                    "animate-gradient absolute inset-0 block h-full w-full rounded-[inherit] bg-gradient-to-r from-[#ffaa40]/50 via-[#9c40ff]/50 to-[#ffaa40]/50 bg-[length:300%_100%] p-[1px]"
                  )}
                  style={{
                    WebkitMask:
                      "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                    WebkitMaskComposite: "destination-out",
                    mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                    maskComposite: "subtract",
                    WebkitClipPath: "padding-box",
                  }}
                />
                <AnimatedGradientText className="text-sm font-medium">
                  Simple Pricing
                </AnimatedGradientText>
                <CaretRight className="ml-1 size-4 text-neutral-500 transition-transform duration-300 ease-in-out group-hover:translate-x-0.5" />
              </div>
            </div>
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-gray-900 mb-3">
              Simple pricing
            </h2>
            <p className="text-lg text-gray-500">Start free, upgrade when you need more.</p>
          </div>

          <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-6">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`relative rounded-2xl bg-white p-8 ${
                  plan.popular
                    ? 'border-2 border-violet-200 shadow-md'
                    : 'border border-gray-200 shadow-sm'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-gradient-to-r from-violet-600 to-[#9938CA] text-white px-4 py-1 rounded-full text-xs font-semibold whitespace-nowrap">
                      Most Popular
                    </span>
                  </div>
                )}
                <h3 className="text-lg font-semibold text-gray-900 mb-1">{plan.name}</h3>
                <p className="text-sm text-gray-500 mb-6">{plan.description}</p>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-gray-900">₹{plan.price}</span>
                  <span className="text-gray-500 text-sm ml-1">/month</span>
                </div>
                <RippleButton
                  onClick={() => router.push(plan.href)}
                  rippleColor="rgba(255,255,255,0.3)"
                  className="w-full py-2.5 px-6 rounded-lg text-sm font-semibold text-center border-0 bg-gradient-to-r from-violet-600 to-[#9938CA] text-white shadow-lg shadow-violet-200"
                >
                  {plan.name === "Free" ? "Get Started" : "Subscribe Now"}
                </RippleButton>
                <ul className="mt-8 space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-3 text-sm text-gray-600">
                      <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
