'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Logo } from './Logo';
import { PrimaryNav } from './PrimaryNav';
import { LandingSearchBox } from './LandingSearchBox';
import { trackCTAClick } from '@/lib/analytics';
import { cn } from '@/lib/utils';
import { useReducedMotion } from '@/components/hooks/useReducedMotion';
import { useWillChange } from '@/components/hooks/useWillChange';
import { useHapticFeedback } from '@/components/hooks/useHapticFeedback';


export function SiteHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const prefersReducedMotion = useReducedMotion();
  const menuRef = useWillChange<HTMLDivElement>(mobileOpen, 'transform, opacity');
  const pathname = usePathname();
  const { medium: hapticMedium } = useHapticFeedback();

  // Lock scroll when mobile nav is open (body only)
  useEffect(() => {
    if (mobileOpen) {
      document.body.classList.add('overflow-hidden');
    } else {
      document.body.classList.remove('overflow-hidden');
    }
    // Cleanup on unmount
    return () => {
      document.body.classList.remove('overflow-hidden');
    };
  }, [mobileOpen]);

  // Close mobile nav on route change
  useEffect(() => {
    if (mobileOpen) {
      setMobileOpen(false);
    }
  }, [pathname]);

  // Close on Escape key
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMobileOpen(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);


  return (
    <>
    <header className="bg-zinc-900/80 backdrop-blur-sm border-b border-zinc-800 sticky top-0 z-50 shadow-md relative">
      <nav
        aria-label="Main navigation"
        className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
      >
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Left Section: Logo + Desktop Navigation */}
          <div className="flex items-center space-x-2 sm:space-x-3 lg:space-x-4">
            <Logo />
            {/* Desktop Nav */}
            <PrimaryNav orientation="horizontal" />
          </div>

          {/* Search Box - Desktop only */}
          <div className="hidden lg:flex flex-1 max-w-xs xl:max-w-sm 2xl:max-w-md mx-4">
            <LandingSearchBox />
          </div>

          {/* CTA buttons - Desktop only */}
          <div className="hidden xl:flex items-center space-x-3">
            <a
              href="/faq"
              onClick={() => trackCTAClick('faq_header', 'header')}
              className="px-4 py-2 text-sm font-medium text-zinc-300 hover:text-white hover:bg-zinc-800/50 transition-colors duration-200 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-zinc-900"
            >
              FAQ
            </a>
            <a
              href="/contact"
              onClick={() => trackCTAClick('contact_header', 'header')}
              className="px-4 py-2 text-sm font-medium text-zinc-300 hover:text-white hover:bg-zinc-800/50 transition-colors duration-200 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-zinc-900"
            >
              Contact Us
            </a>
          </div>

          {/* Hamburger */}
          <button
            className="lg:hidden relative w-8 h-8 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-emerald-500/50 rounded"
            aria-label="Toggle navigation menu"
            aria-expanded={mobileOpen}
            aria-controls="mobile-nav"
            onClick={() => {
              hapticMedium();
              setMobileOpen((prev) => !prev);
            }}
          >
            {/* Hamburger / X lines */}
            <span
              className={cn(
                'absolute block w-6 h-0.5 bg-white transform',
                !prefersReducedMotion && 'transition-transform duration-300 ease-in-out',
                mobileOpen ? 'rotate-45' : '-translate-y-2'
              )}
            />
            <span
              className={cn(
                'absolute block w-6 h-0.5 bg-white',
                !prefersReducedMotion && 'transition-opacity duration-300',
                mobileOpen ? 'opacity-0' : 'opacity-100'
              )}
            />
            <span
              className={cn(
                'absolute block w-6 h-0.5 bg-white transform',
                !prefersReducedMotion && 'transition-transform duration-300 ease-in-out',
                mobileOpen ? '-rotate-45' : 'translate-y-2'
              )}
            />
          </button>
        </div>
      </nav>

      {/* Mobile dropdown */}
      <div
        ref={menuRef}
        id="mobile-nav"
        className={cn(
          'lg:hidden bg-zinc-900 absolute inset-x-0 top-full origin-top transform-gpu overflow-y-auto',
          !prefersReducedMotion && 'transition-transform transition-opacity duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]',
          mobileOpen ? 'translate-y-0 opacity-100' : '-translate-y-4 opacity-0 pointer-events-none',
          'z-50 shadow-2xl'
        )}
      >
        <div className="px-6 py-4">
          <PrimaryNav orientation="vertical" showOnMobile />
          {/* You can optionally add the FAQ / Contact CTA here for mobile */}
          <div className="flex flex-col mt-6 space-y-2">
            <Link
              href="/faq"
              onClick={() => {
                trackCTAClick('faq_header_mobile', 'header');
                setMobileOpen(false);
              }}
              className="text-zinc-300 hover:text-white py-2 w-full text-left"
            >
              FAQ
            </Link>
            <Link
              href="/contact"
              onClick={() => {
                trackCTAClick('contact_header_mobile', 'header');
                setMobileOpen(false);
              }}
              className="text-zinc-300 hover:text-white py-2 w-full text-left"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </div>

    </header>

    {/* Overlay with smooth fade */}
    <div
      className={cn(
        'lg:hidden fixed inset-0 bg-black/70 backdrop-blur-sm z-40',
        'transition-opacity duration-300 ease-out',
        mobileOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
      )}
      onClick={() => setMobileOpen(false)}
      aria-hidden="true"
    />
    </>
  );
}
