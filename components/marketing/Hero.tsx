'use client';

import { useAuth } from '@clerk/nextjs';

export default function Hero() {
  const { isSignedIn } = useAuth();
  const getStartedHref = isSignedIn ? '/upload' : '/sign-up';

  return (
    <section id="home" className="relative overflow-hidden">
      {/* Background grid SVG */}
      <svg className="size-full absolute -z-10 inset-0" width="1440" height="720" viewBox="0 0 1440 720" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
        <path stroke="#E2E8F0" strokeOpacity=".7" d="M-15.227 702.342H1439.7" />
        <circle cx="711.819" cy="372.562" r="308.334" stroke="#E2E8F0" strokeOpacity=".7" />
        <circle cx="16.942" cy="20.834" r="308.334" stroke="#E2E8F0" strokeOpacity=".7" />
        <path stroke="#E2E8F0" strokeOpacity=".7" d="M-15.227 573.66H1439.7M-15.227 164.029H1439.7" />
        <circle cx="782.595" cy="411.166" r="308.334" stroke="#E2E8F0" strokeOpacity=".7" />
      </svg>

      {/* Content */}
      <div className="flex flex-col max-md:gap-20 md:flex-row pb-20 items-center justify-between mt-20 px-4 md:px-16 lg:px-24 xl:px-32">
        <div className="flex flex-col items-center md:items-start">
          <div className="inline-flex items-center justify-center p-[1px] rounded-full bg-gradient-to-r from-purple-600 via-fuchsia-600 to-pink-600">
            <div className="bg-white px-4 py-1.5 rounded-full flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-fuchsia-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-fuchsia-500"></span>
              </span>
              <p className="text-sm font-medium bg-gradient-to-r from-purple-600 via-fuchsia-600 to-pink-600 bg-clip-text text-transparent">
                Introducing Imagely
              </p>
            </div>
          </div>
          <h1 className="text-center md:text-left text-6xl leading-none md:text-7xl md:leading-none font-bold max-w-xl text-slate-900 mt-4">
            Transform anything. Instantly.
          </h1>
          <p className="text-center md:text-left text-base text-slate-700 max-w-lg mt-4">
            No complex software needed. Just describe what you want in plain English, and watch our AI instantly transform your images—resize, crop, filter, and more.
          </p>
          <div className="flex items-center gap-4 mt-8 text-sm">
            <a className="bg-white text-indigo-700 border border-indigo-200 hover:bg-indigo-50 active:scale-95 rounded-md px-7 h-11 inline-flex items-center justify-center" href={getStartedHref}>
              Get Started
            </a>
          </div>
        </div>
        <img src="https://raw.githubusercontent.com/prebuiltui/prebuiltui/main/assets/hero/hero-section-showcase-4.png" alt="hero" className="max-w-xs sm:max-w-sm lg:max-w-md transition-all duration-300" />
      </div>
    </section>
  );
}
