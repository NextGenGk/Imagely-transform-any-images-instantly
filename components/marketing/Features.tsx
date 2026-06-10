"use client"

import { Lightning, ChatText, ClockCounterClockwise, Image, Sliders, ShieldCheck, CaretRight } from '@phosphor-icons/react';
import { cn } from "@/lib/utils"
import { AnimatedGradientText } from "@/registry/magicui/animated-gradient-text"

const features = [
  {
    icon: Lightning,
    title: "Lightning-fast processing",
    description: "Transform your images in seconds with our AI-powered processing engine. No waiting, no hassle—just instant results.",
    colors: {
      bg: "bg-amber-50 group-hover:bg-amber-100",
      icon: "text-amber-600",
      card: "border-amber-200/40",
      shadow: "shadow-amber-100/50",
    },
  },
  {
    icon: ChatText,
    title: "Natural language commands",
    description: "Simply describe what you want in plain English. Our AI understands your intent and applies the perfect transformations.",
    colors: {
      bg: "bg-violet-50 group-hover:bg-violet-100",
      icon: "text-violet-600",
      card: "border-violet-200/40",
      shadow: "shadow-violet-100/50",
    },
  },
  {
    icon: ClockCounterClockwise,
    title: "Complete processing history",
    description: "Track all your image transformations with detailed history. Review, download, and reuse your processed images anytime.",
    colors: {
      bg: "bg-blue-50 group-hover:bg-blue-100",
      icon: "text-blue-600",
      card: "border-blue-200/40",
      shadow: "shadow-blue-100/50",
    },
  },
  {
    icon: Image,
    title: "Multiple format support",
    description: "Work with JPEG, PNG, and WebP formats seamlessly. Upload in one format, download in another—it's that simple.",
    colors: {
      bg: "bg-emerald-50 group-hover:bg-emerald-100",
      icon: "text-emerald-600",
      card: "border-emerald-200/40",
      shadow: "shadow-emerald-100/50",
    },
  },
  {
    icon: Sliders,
    title: "Advanced transformations",
    description: "Resize, crop, rotate, adjust colors, apply filters, and more. All powered by intelligent AI that understands your creative vision.",
    colors: {
      bg: "bg-pink-50 group-hover:bg-pink-100",
      icon: "text-pink-600",
      card: "border-pink-200/40",
      shadow: "shadow-pink-100/50",
    },
  },
  {
    icon: ShieldCheck,
    title: "Secure and private",
    description: "Your images are processed securely with enterprise-grade encryption. We respect your privacy and never share your data.",
    colors: {
      bg: "bg-indigo-50 group-hover:bg-indigo-100",
      icon: "text-indigo-600",
      card: "border-indigo-200/40",
      shadow: "shadow-indigo-100/50",
    },
  },
];

export default function Features() {
  return (
    <section id="features" className="w-full py-6 md:py-12 bg-white px-4 md:px-6">
      <div className="max-w-[85rem] mx-auto">
        <div className="bg-[#fbf7ff] rounded-[2.5rem] md:rounded-[3rem] px-6 py-16 md:py-24">
          <div className="text-center max-w-2xl mx-auto mb-12">
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
                  Features
                </AnimatedGradientText>
                <CaretRight className="ml-1 size-4 text-neutral-500 transition-transform duration-300 ease-in-out group-hover:translate-x-0.5" />
              </div>
            </div>
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-gray-900 mb-4">
              Everything you need to edit images with AI
            </h2>
            <p className="text-lg text-gray-500 max-w-3xl mx-auto">
              Transform your images with AI-powered tools that understand natural language.
              No complex software needed—just describe what you want and watch the magic happen.
            </p>
          </div>

          <div className="max-w-6xl mx-auto grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className={cn(
                    "group relative rounded-2xl border bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg",
                    feature.colors.card,
                    feature.colors.shadow
                  )}
                >
                  <div className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center mb-5 transition-colors duration-300",
                    feature.colors.bg,
                    feature.colors.icon
                  )}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-gray-500 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
