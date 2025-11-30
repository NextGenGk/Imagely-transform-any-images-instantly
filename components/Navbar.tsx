"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { UserButton } from "@/components/auth";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { isLoaded, isSignedIn } = useAuth();
  const pathname = usePathname();
  const [credits, setCredits] = useState<number | null>(null);
  const [limit, setLimit] = useState<number | null>(null);

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      console.log('Fetching credits...');
      fetch('/api/user/credits')
        .then(res => res.json())
        .then(data => {
          console.log('Credits fetched:', data);
          if (data.credits !== undefined) {
            setCredits(data.credits);
            setLimit(data.monthlyCreditLimit);
          }
        })
        .catch(err => console.error('Error fetching credits:', err));
    }
  }, [isLoaded, isSignedIn]);

  return (
    <>
      <div className="text-sm text-white w-full text-center font-medium py-2 bg-gradient-to-r from-violet-500 via-[#9938CA] to-[#E0724A]">
        <p>
          Transform images instantly with AI! <span className="underline underline-offset-2">Try it free today!</span>
        </p>
      </div>

      <nav className="sticky top-0 z-50 h-[70px] flex items-center justify-between px-6 md:px-16 lg:px-24 xl:px-32 py-4 bg-white text-gray-900 text-sm transition-all shadow">
        <Link href="/" aria-label="Imagely" className="inline-flex items-center gap-2">
          <div className="relative h-10 w-32 overflow-hidden">
            <Image
              src="/logo-crop-white.png"
              alt="Imagely Logo"
              fill
              className="object-contain object-center invert"
              priority
            />
          </div>
        </Link>

        {pathname !== '/upload' && (
          <ul className="hidden md:flex items-center space-x-8 md:pl-28 font-semibold">
            <li><Link href="/#home">Home</Link></li>
            <li><Link href="/#features">Features</Link></li>
            <li><Link href="/#pricing">Pricing</Link></li>
          </ul>
        )}

        <div className="hidden md:flex items-center gap-3 ml-20">
          {isLoaded && isSignedIn ? (
            <>
              <Link href="/upload" className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-full active:scale-95 transition-all">Upload</Link>
              {credits !== null && (
                <div className="flex items-center gap-1 bg-gray-100 px-3 py-1.5 rounded-full border border-gray-200">
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Credits</span>
                  <span className="text-sm font-bold text-indigo-600">
                    {credits}/{limit === 999999 ? '∞' : limit}
                  </span>
                </div>
              )}
              <UserButton />
            </>
          ) : (
            <>
              <Link href="/sign-in" className="bg-white hover:bg-gray-50 border border-gray-300 px-6 py-2 rounded-full active:scale-95 transition-all">Login</Link>
              <Link href="/sign-up" className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-full active:scale-95 transition-all">Sign up</Link>
            </>
          )}
        </div>

        <button aria-label="menu-btn" type="button" className="menu-btn inline-block md:hidden active:scale-90 transition" onClick={() => setOpen(v => !v)}>
          <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 30 30">
            <path d="M3 7a1 1 0 1 0 0 2h24a1 1 0 1 0 0-2zm0 7a1 1 0 1 0 0 2h24a1 1 0 1 0 0-2zm0 7a1 1 0 1 0 0 2h24a1 1 0 1 0 0-2z" />
          </svg>
        </button>

        <div className={`mobile-menu absolute top-[70px] left-0 w-full bg-white shadow-sm p-6 md:hidden ${open ? "" : "hidden"}`}>
          {pathname !== '/upload' && (
            <ul className="flex flex-col space-y-4 text-lg">
              <li><Link href="/#home" className="text-sm">Home</Link></li>
              <li><Link href="/#features" className="text-sm">Features</Link></li>
              <li><Link href="#how-it-works" className="text-sm">How it works</Link></li>
              <li><Link href="#examples" className="text-sm">Examples</Link></li>
              <li><Link href="/#pricing" className="text-sm">Pricing</Link></li>
            </ul>
          )}

          <div className="flex flex-col gap-3 mt-6">
            {isLoaded && isSignedIn ? (
              <>
                <div className="flex items-center justify-between w-full">
                  {credits !== null && (
                    <div className="flex items-center gap-1 bg-gray-100 px-3 py-1.5 rounded-full border border-gray-200">
                      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Credits</span>
                      <span className="text-sm font-bold text-indigo-600">
                        {credits}/{limit === 999999 ? '∞' : limit}
                      </span>
                    </div>
                  )}
                  <UserButton />
                </div>
                <Link href="/upload" className="bg-indigo-600 text-white text-sm hover:bg-indigo-700 active:scale-95 transition-all h-11 rounded-full inline-flex items-center justify-center px-6 w-full">
                  Upload
                </Link>
              </>
            ) : (
              <div className="flex gap-3">
                <Link href="/sign-in" className="bg-white text-gray-700 border border-gray-300 text-sm hover:bg-gray-50 active:scale-95 transition-all h-11 rounded-full inline-flex items-center justify-center px-6 flex-1">
                  Login
                </Link>
                <Link href="/sign-up" className="bg-indigo-600 text-white text-sm hover:bg-indigo-700 active:scale-95 transition-all h-11 rounded-full inline-flex items-center justify-center px-6 flex-1">
                  Sign up
                </Link>
              </div>
            )}
          </div>
        </div>
      </nav>
    </>
  );
}
