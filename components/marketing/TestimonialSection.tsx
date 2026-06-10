'use client';

import React, { useState } from 'react';
import { CaretLeft, CaretRight } from '@phosphor-icons/react';
import { cn } from "@/lib/utils"
import { AnimatedGradientText } from "@/registry/magicui/animated-gradient-text"
import { RippleButton } from "@/registry/magicui/ripple-button"

const testimonials = [
  {
    quote: "We used to spend hours manually resizing and compressing images for our e-commerce site. Imagely cut that down to minutes. Our page load times dropped by 40% and we haven't looked back.",
    name: "Priya Sharma",
    title: "Software Engineer",
    image: "https://i.pravatar.cc/150?img=45"
  },
  {
    quote: "Batch converting thousands of RAW files used to be a nightmare. Now I just drag, drop, and walk away. The quality preservation is incredible — even at maximum compression.",
    name: "Rahul Verma",
    title: "Photographer & Creative Director",
    image: "https://i.pravatar.cc/150?img=68"
  },
  {
    quote: "The real win for us was the API. We plugged it into our CMS and every uploaded image is automatically converted to WebP with the perfect quality settings. Zero manual work.",
    name: "Kavita Desai",
    title: "Product Manager",
    image: "https://i.pravatar.cc/150?img=23"
  }
];

export default function TestimonialSection() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === testimonials.length - 1 ? 0 : prev + 1));
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? testimonials.length - 1 : prev - 1));
  };

  const currentTestimonial = testimonials[currentIndex];

  return (
    <section className="w-full py-6 md:py-12 px-4 md:px-6 bg-white relative overflow-hidden">
      <div className="max-w-[85rem] mx-auto">
        <div className="relative rounded-[2.5rem] md:rounded-[3rem] overflow-hidden px-6 py-20 md:py-32 bg-[#f4f7fb] flex flex-col items-center text-center">
          
          {/* Faint Grid/Shapes Background */}
          <div className="absolute inset-0 -z-10 opacity-40">
            <div className="absolute top-[20%] left-[10%] w-12 h-12 rounded-2xl border-2 border-blue-200/50" />
            <div className="absolute top-[40%] left-[15%] w-16 h-16 rounded-2xl bg-blue-100/50" />
            <div className="absolute top-[60%] left-[8%] w-10 h-10 rounded-xl border-2 border-blue-200/50" />
            <div className="absolute top-[80%] left-[20%] w-14 h-14 rounded-2xl border-2 border-blue-200/50" />
            
            <div className="absolute top-[15%] right-[15%] w-14 h-14 rounded-2xl bg-blue-100/50" />
            <div className="absolute top-[35%] right-[10%] w-12 h-12 rounded-2xl border-2 border-blue-200/50" />
            <div className="absolute top-[55%] right-[20%] w-16 h-16 rounded-2xl border-2 border-blue-200/50" />
            <div className="absolute top-[75%] right-[12%] w-10 h-10 rounded-xl border-2 border-blue-200/50" />
          </div>

          {/* Top Pill */}
          <div className="group relative mx-auto flex items-center justify-center rounded-full px-4 py-1.5 shadow-[inset_0_-8px_10px_#8fdfff1f] transition-shadow duration-500 ease-out hover:shadow-[inset_0_-5px_10px_#8fdfff3f] mb-8">
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
              Wall of love
            </AnimatedGradientText>
            <CaretRight className="ml-1 size-4 text-neutral-500 transition-transform duration-300 ease-in-out group-hover:translate-x-0.5" />
          </div>

          <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-[#1a1c35] mb-4">
            You're in good company
          </h2>
          
          <p className="text-lg text-gray-600 mb-16">
            Don't just take our word for it—hear from our customers.
          </p>

          {/* Testimonial Card Area */}
          <div className="relative w-full max-w-3xl mx-auto flex items-center justify-center mb-24">
            {/* Left Arrow */}
            <RippleButton
              onClick={handlePrev}
              rippleColor="rgba(0,0,0,0.1)"
              className="absolute left-0 md:-left-12 z-20 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-md text-gray-400 hover:text-gray-900 hover:scale-105 active:scale-95 transition-all border-0 p-0"
            >
              <CaretLeft className="w-5 h-5" />
            </RippleButton>

            {/* Stacked Cards Background */}
            <div className="absolute inset-0 bg-white/60 rounded-3xl transform translate-y-3 scale-[0.98] -z-10 shadow-sm transition-transform duration-300" />
            <div className="absolute inset-0 bg-white/40 rounded-3xl transform translate-y-6 scale-[0.95] -z-20 shadow-sm transition-transform duration-300" />

            {/* Main Card */}
            <div className="bg-white rounded-3xl p-8 md:p-12 shadow-xl text-left w-full relative z-10 border border-gray-100/50 min-h-[250px] flex flex-col justify-between">
              <p className="text-xl md:text-3xl text-[#2a2b4a] font-medium leading-snug mb-10 transition-opacity duration-300">
                “{currentTestimonial.quote}”
              </p>
              
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200 shrink-0">
                  <img src={currentTestimonial.image} alt={currentTestimonial.name} className="w-full h-full object-cover" />
                </div>
                <div>
                  <div className="font-semibold text-gray-900">{currentTestimonial.name}</div>
                  <div className="text-sm text-gray-500">{currentTestimonial.title}</div>
                </div>
              </div>
            </div>

            {/* Right Arrow */}
            <RippleButton
              onClick={handleNext}
              rippleColor="rgba(0,0,0,0.1)"
              className="absolute right-0 md:-right-12 z-20 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-md text-gray-400 hover:text-gray-900 hover:scale-105 active:scale-95 transition-all border-0 p-0"
            >
              <CaretRight className="w-5 h-5" />
            </RippleButton>
          </div>

        </div>
      </div>
    </section>
  );
}
