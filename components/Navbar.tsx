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

  const fetchCredits = () => {
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
  };

  useEffect(() => {
    fetchCredits();

    // Listen for credit updates
    const handleCreditUpdate = () => {
      console.log('Credit update event received');
      fetchCredits();
    };

    window.addEventListener('credit-update', handleCreditUpdate);

    return () => {
      window.removeEventListener('credit-update', handleCreditUpdate);
    };
  }, [isLoaded, isSignedIn]);

  return (
    <>
      <div className="w-full flex justify-center fixed top-4 z-50 px-4">
        <nav className="flex items-center justify-between w-full max-w-[1000px] px-2.5 py-2.5 bg-white border border-gray-100 rounded-xl shadow-sm text-sm text-gray-700">
          <Link href="/" aria-label="Imagely" className="inline-flex items-center gap-2 pl-4">
            <div className="relative h-10 w-28 overflow-hidden">
              <Image
                src="/logo-crop-white.png"
                alt="Imagely Logo"
                fill
                className="object-contain object-left invert"
                priority
              />
            </div>
          </Link>

          {pathname !== '/upload' && (
            <ul className="hidden md:flex items-center space-x-8 font-medium">
              <li><Link href="/#home" className="hover:text-gray-900 transition-colors">Home</Link></li>
              <li><Link href="/#features" className="hover:text-gray-900 transition-colors">Features</Link></li>
              <li><Link href="/#use-cases" className="hover:text-gray-900 transition-colors">Use Cases</Link></li>
              <li><Link href="/#pricing" className="hover:text-gray-900 transition-colors">Pricing</Link></li>
            </ul>
          )}

          <div className="hidden md:flex items-center gap-2 pr-1">
            {isLoaded && isSignedIn ? (
              <>
                <Link href="/upload" className="bg-gradient-to-r from-violet-600 to-[#9938CA] hover:shadow-md text-white px-5 h-10 flex items-center justify-center rounded-lg transition-all font-medium">Upload</Link>
                {credits !== null && (
                  <div className="flex items-center gap-1.5 bg-gray-50 px-4 h-10 rounded-lg border border-gray-200">
                    <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Credits</span>
                    <span className="text-sm font-bold text-gray-900">
                      {credits}/{limit === 999999 ? '∞' : limit}
                    </span>
                  </div>
                )}
                <div className="ml-2 flex items-center">
                  <UserButton />
                </div>
              </>
            ) : (
              <>
                <Link href="/sign-in" className="bg-white hover:bg-gray-50 border border-gray-200 text-gray-800 px-5 h-10 flex items-center justify-center rounded-lg transition-all font-medium shadow-sm">Login</Link>
                <Link href="/sign-up" className="bg-gradient-to-r from-violet-600 to-[#9938CA] hover:shadow-md text-white px-5 h-10 flex items-center justify-center rounded-lg transition-all font-medium">Sign up</Link>
              </>
            )}
          </div>

          <div className="flex md:hidden items-center gap-3 pr-2">
            {isLoaded && isSignedIn && (
              <>
                {credits !== null && (
                  <div className="flex items-center gap-1 bg-gray-50 px-3 h-10 rounded-lg border border-gray-200">
                    <span className="text-xs font-bold text-gray-900">
                      {credits}/{limit === 999999 ? '∞' : limit}
                    </span>
                  </div>
                )}
                <UserButton />
              </>
            )}
            <button aria-label="menu-btn" type="button" className="menu-btn active:scale-90 transition p-2 bg-gray-50 rounded-lg" onClick={() => setOpen(v => !v)}>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
              </svg>
            </button>
          </div>
        </nav>
      </div>

      <div className={`mobile-menu fixed top-24 left-4 right-4 bg-white shadow-lg border border-gray-100 rounded-2xl p-6 md:hidden z-40 transition-all ${open ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4 pointer-events-none"}`}>
        {pathname !== '/upload' && (
          <ul className="flex flex-col space-y-4 text-base font-medium">
            <li><Link href="/#home" onClick={() => setOpen(false)}>Home</Link></li>
            <li><Link href="/#features" onClick={() => setOpen(false)}>Features</Link></li>
            <li><Link href="/#use-cases" onClick={() => setOpen(false)}>Use Cases</Link></li>
            <li><Link href="/#pricing" onClick={() => setOpen(false)}>Pricing</Link></li>
          </ul>
        )}

        <div className="flex flex-col gap-3 mt-6 pt-6 border-t border-gray-100">
          {isLoaded && isSignedIn ? (
            <Link href="/upload" className="bg-gradient-to-r from-violet-600 to-[#9938CA] text-white font-medium hover:shadow-md transition-all h-11 rounded-lg flex items-center justify-center px-6 w-full" onClick={() => setOpen(false)}>
              Upload
            </Link>
          ) : (
            <div className="flex flex-col gap-3">
              <Link href="/sign-in" className="bg-white text-gray-800 border border-gray-200 font-medium hover:bg-gray-50 transition-all h-11 rounded-lg flex items-center justify-center px-6 w-full shadow-sm" onClick={() => setOpen(false)}>
                Login
              </Link>
              <Link href="/sign-up" className="bg-gradient-to-r from-violet-600 to-[#9938CA] text-white font-medium hover:shadow-md transition-all h-11 rounded-lg flex items-center justify-center px-6 w-full" onClick={() => setOpen(false)}>
                Sign up
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
