"use client";

import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { cn } from "@/lib/utils";
import { ReactNode } from 'react';
import { motion, Variants, useScroll, useTransform } from 'framer-motion';
import { useRouter } from "next/navigation";
import { Safari } from "@/registry/magicui/safari";
import { RippleButton } from "@/registry/magicui/ripple-button";

export default function HeroSection_05() {
  const router = useRouter();
  const gradientRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"]
  });

  const videoScale = useTransform(scrollYProgress, [0, 1], [1, 1.25]);
  const videoY = useTransform(scrollYProgress, [0, 1], [0, -40]);

  const transitionVariants = {
    item: {
      hidden: {
        opacity: 0,
        filter: "blur(12px)",
        y: 12,
      },
      visible: {
        opacity: 1,
        filter: "blur(0px)",
        y: 0,
        transition: {
          type: "spring" as const,
          bounce: 0.3,
          duration: 1.5,
        },
      },
    },
  };

  useEffect(() => {
    if (!gradientRef.current) return;
    gsap.fromTo(
      gradientRef.current,
      { opacity: 0, y: -30 },
      { opacity: 1, y: 0, duration: 1.6, ease: "power3.out" }
    );
  }, []);

  return (
    <section className="w-full pt-16 md:pt-24 pb-6 md:pb-12 bg-white px-4 md:px-6">
      <div className="max-w-[85rem] mx-auto relative rounded-[2.5rem] md:rounded-[3rem] overflow-hidden">
        <div ref={sectionRef} className="h-[160vh] w-full relative bg-[#fbf7ff]">
          <div className="sticky top-0 min-h-[100dvh] w-full flex flex-col items-center justify-center py-10 md:py-16 px-6">
            <div
                ref={gradientRef}
                className="absolute inset-0 -z-10"
                style={{
                backgroundImage: `
                    radial-gradient(at 30% 50%, #f3e8ff 0%, transparent 60%),
                    radial-gradient(at 70% 50%, #ede9fe 0%, transparent 60%)
                `,
                backgroundBlendMode: "normal",
                }}
            />

            <div className="relative z-10 flex flex-col items-center w-full">
              <div className="pb-4 sm:pb-6 text-center w-full">
                <div className="relative max-w-2xl mx-auto">
                  <div className="inline-flex items-center justify-center p-[1px] rounded-full bg-gradient-to-r from-violet-500 via-[#9938CA] to-[#E0724A] mb-4">
                    <div className="bg-white px-4 py-1.5 rounded-full flex items-center">
                      <p className="text-sm font-medium bg-gradient-to-r from-violet-600 via-[#9938CA] to-[#E0724A] bg-clip-text text-transparent">
                        Introducing Imagely
                      </p>
                    </div>
                  </div>
                  <h1 className="text-5xl sm:text-6xl md:text-7xl text-gray-800 font-bold tracking-tight">
                      Convert Ideas into Images. Instantly.
                  </h1>
                  <p className="mt-4 text-lg text-gray-500">
                      Stop fighting with complex photo editors. With Imagely, simply type what you want to change, and let our AI seamlessly resize, crop, filter, and reimagine your photos.
                  </p>
                  <AnimatedGroup
                      variants={{
                      container: {
                          visible: {
                          transition: {
                              staggerChildren: 0.05,
                              delayChildren: 0.75,
                          },
                          },
                      },
                      ...transitionVariants,
                      }}
                      className="mt-6 flex flex-col items-center justify-center gap-2 md:flex-row"
                  >
                      <div key={1}>
                      <RippleButton
                        className="rounded-xl px-5 py-2.5 text-base bg-gradient-to-r from-violet-600 to-[#9938CA] text-white border-0 shadow-lg shadow-violet-200 font-medium"
                        onClick={() => router.push("/upload")}
                      >
                        <span className="text-nowrap">Start Creating Now</span>
                      </RippleButton>
                      </div>
                  </AnimatedGroup>
                </div>
              </div>

              <div ref={videoRef} className="w-full max-w-5xl mx-auto mt-10">
                <motion.div style={{ scale: videoScale, y: videoY }}>
                  <Safari
                    url="imagely.app"
                    videoSrc="https://videos.pexels.com/video-files/27180348/12091515_2560_1440_50fps.mp4"
                    className="w-full h-auto aspect-video"
                  />
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

type PresetType =
  | 'fade'
  | 'slide'
  | 'scale'
  | 'blur'
  | 'blur-slide'
  | 'zoom'
  | 'flip'
  | 'bounce'
  | 'rotate'
  | 'swing';

type AnimatedGroupProps = {
  children: ReactNode;
  className?: string;
  variants?: {
    container?: Variants;
    item?: Variants;
  };
  preset?: PresetType;
};

const defaultContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const defaultItemVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

const presetVariants: Record<
  PresetType,
  { container: Variants; item: Variants }
> = {
  fade: {
    container: defaultContainerVariants,
    item: {
      hidden: { opacity: 0 },
      visible: { opacity: 1 },
    },
  },
  slide: {
    container: defaultContainerVariants,
    item: {
      hidden: { opacity: 0, y: 20 },
      visible: { opacity: 1, y: 0 },
    },
  },
  scale: {
    container: defaultContainerVariants,
    item: {
      hidden: { opacity: 0, scale: 0.8 },
      visible: { opacity: 1, scale: 1 },
    },
  },
  blur: {
    container: defaultContainerVariants,
    item: {
      hidden: { opacity: 0, filter: 'blur(4px)' },
      visible: { opacity: 1, filter: 'blur(0px)' },
    },
  },
  'blur-slide': {
    container: defaultContainerVariants,
    item: {
      hidden: { opacity: 0, filter: 'blur(4px)', y: 20 },
      visible: { opacity: 1, filter: 'blur(0px)', y: 0 },
    },
  },
  zoom: {
    container: defaultContainerVariants,
    item: {
      hidden: { opacity: 0, scale: 0.5 },
      visible: {
        opacity: 1,
        scale: 1,
        transition: { type: "spring" as const, stiffness: 300, damping: 20 },
      },
    },
  },
  flip: {
    container: defaultContainerVariants,
    item: {
      hidden: { opacity: 0, rotateX: -90 },
      visible: {
        opacity: 1,
        rotateX: 0,
        transition: { type: "spring" as const, stiffness: 300, damping: 20 },
      },
    },
  },
  bounce: {
    container: defaultContainerVariants,
    item: {
      hidden: { opacity: 0, y: -50 },
      visible: {
        opacity: 1,
        y: 0,
        transition: { type: "spring" as const, stiffness: 400, damping: 10 },
      },
    },
  },
  rotate: {
    container: defaultContainerVariants,
    item: {
      hidden: { opacity: 0, rotate: -180 },
      visible: {
        opacity: 1,
        rotate: 0,
        transition: { type: "spring" as const, stiffness: 200, damping: 15 },
      },
    },
  },
  swing: {
    container: defaultContainerVariants,
    item: {
      hidden: { opacity: 0, rotate: -10 },
      visible: {
        opacity: 1,
        rotate: 0,
        transition: { type: "spring" as const, stiffness: 300, damping: 8 },
      },
    },
  },
};

function AnimatedGroup({
  children,
  className,
  variants,
  preset,
}: AnimatedGroupProps) {
  const selectedVariants = preset
    ? presetVariants[preset]
    : { container: defaultContainerVariants, item: defaultItemVariants };
  const containerVariants = variants?.container || selectedVariants.container;
  const itemVariants = variants?.item || selectedVariants.item;

  return (
    <motion.div
      initial='hidden'
      animate='visible'
      variants={containerVariants}
      className={cn(className)}
    >
      {React.Children.map(children, (child, index) => (
        <motion.div key={index} variants={itemVariants}>
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
}

export { AnimatedGroup };
