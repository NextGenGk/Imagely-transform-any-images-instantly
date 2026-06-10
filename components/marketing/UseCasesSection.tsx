"use client"

import React from 'react';
import { Scissors, Crosshair, ArrowsOut, Crop, ArrowClockwise, FlipHorizontal } from '@phosphor-icons/react';
import { cn } from "@/lib/utils"
import { AnimatedGradientText } from "@/registry/magicui/animated-gradient-text"
import { RippleButton } from "@/registry/magicui/ripple-button"

const useCases = [
  {
    id: 'resize',
    title: 'Resize',
    description: 'Quickly adjust your image to any dimensions. Perfect for social media, banners, or fitting specific layout requirements.',
    promptExample: 'Resize this image to 1920x1080',
    icon: <ArrowsOut size={20} />,
    colors: {
      bg: "bg-amber-50 group-hover:bg-amber-100",
      icon: "text-amber-600",
      card: "border-amber-200/40",
      shadow: "shadow-amber-100/50",
      prompt: "bg-amber-50",
      promptText: "text-amber-800",
      promptLabel: "text-amber-600",
    },
  },
  {
    id: 'crop',
    title: 'Crop',
    description: 'Trim unwanted edges and focus on the most important part of your image with precision cropping.',
    promptExample: 'Crop this image to a square',
    icon: <Crop size={20} />,
    colors: {
      bg: "bg-violet-50 group-hover:bg-violet-100",
      icon: "text-violet-600",
      card: "border-violet-200/40",
      shadow: "shadow-violet-100/50",
      prompt: "bg-violet-50",
      promptText: "text-violet-800",
      promptLabel: "text-violet-600",
    },
  },
  {
    id: 'rotate',
    title: 'Rotate',
    description: 'Easily rotate your image to any angle or flip it horizontally and vertically with a single command.',
    promptExample: 'Rotate this image by 90 degrees',
    icon: <ArrowClockwise size={20} />,
    colors: {
      bg: "bg-blue-50 group-hover:bg-blue-100",
      icon: "text-blue-600",
      card: "border-blue-200/40",
      shadow: "shadow-blue-100/50",
      prompt: "bg-blue-50",
      promptText: "text-blue-800",
      promptLabel: "text-blue-600",
    },
  },
  {
    id: 'flip',
    title: 'Flip',
    description: 'Mirror your image horizontally or vertically to create the perfect composition with zero effort.',
    promptExample: 'Flip this image horizontally',
    icon: <FlipHorizontal size={20} />,
    colors: {
      bg: "bg-emerald-50 group-hover:bg-emerald-100",
      icon: "text-emerald-600",
      card: "border-emerald-200/40",
      shadow: "shadow-emerald-100/50",
      prompt: "bg-emerald-50",
      promptText: "text-emerald-800",
      promptLabel: "text-emerald-600",
    },
  },
  {
    id: 'smart-crop',
    title: 'Smart Crop',
    description: 'Automatically focus on the most important part of an image or a specific object like a face, dog, or car.',
    promptExample: 'Smart crop this photo to focus on the dog',
    icon: <Crosshair size={20} />,
    colors: {
      bg: "bg-cyan-50 group-hover:bg-cyan-100",
      icon: "text-cyan-600",
      card: "border-cyan-200/40",
      shadow: "shadow-cyan-100/50",
      prompt: "bg-cyan-50",
      promptText: "text-cyan-800",
      promptLabel: "text-cyan-600",
    },
  },
  {
    id: 'background-removal',
    title: 'Background Removal',
    description: 'Instantly remove the background from any image. Perfect for product photography and e-commerce.',
    promptExample: 'Remove the background and make it transparent',
    icon: <Scissors size={20} />,
    colors: {
      bg: "bg-pink-50 group-hover:bg-pink-100",
      icon: "text-pink-600",
      card: "border-pink-200/40",
      shadow: "shadow-pink-100/50",
      prompt: "bg-pink-50",
      promptText: "text-pink-800",
      promptLabel: "text-pink-600",
    },
  },
];

export default function UseCasesSection() {
  return (
    <section id="use-cases" className="w-full py-12 md:py-24 bg-white px-4 md:px-6">
      <div className="max-w-[85rem] mx-auto">
        <div className="bg-[#fbf7ff] rounded-[2.5rem] md:rounded-[3rem] px-6 py-16 md:py-24">
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
                  Use Cases
                </AnimatedGradientText>
                <svg className="ml-1 size-4 text-neutral-500 transition-transform duration-300 ease-in-out group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-gray-900 mb-4">
              AI Transformations Use Cases
            </h2>
            <p className="text-lg text-gray-500 max-w-3xl mx-auto">
              Discover the full potential of Imagely. Just type your instructions in natural language, and our AI handles the complex parameters for you.
            </p>
          </div>

          <div className="max-w-6xl mx-auto grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {useCases.map((useCase) => (
              <div
                key={useCase.id}
                className={cn(
                  "group relative rounded-2xl border bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg flex flex-col",
                  useCase.colors.card,
                  useCase.colors.shadow
                )}
              >
                <div className={cn(
                  "w-12 h-12 rounded-xl flex items-center justify-center mb-5 text-xl transition-colors duration-300",
                  useCase.colors.bg,
                  useCase.colors.icon
                )}>
                  {useCase.icon}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  {useCase.title}
                </h3>
                <p className="text-sm text-gray-500 leading-relaxed flex-grow">
                  {useCase.description}
                </p>
                <div className={cn(
                  "mt-6 rounded-xl p-4",
                  useCase.colors.prompt
                )}>
                  <p className={cn(
                    "text-xs font-semibold uppercase tracking-wide mb-2",
                    useCase.colors.promptLabel
                  )}>
                    Try this prompt
                  </p>
                  <p className={cn(
                    "text-sm italic",
                    useCase.colors.promptText
                  )}>
                    &ldquo;{useCase.promptExample}&rdquo;
                  </p>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}
