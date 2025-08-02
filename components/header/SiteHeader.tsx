'use client';

import React, { useState, useEffect } from 'react';
import { Logo } from './Logo';
import { PrimaryNav } from './PrimaryNav';
import { LandingSearchBox } from './LandingSearchBox';
import { trackCTAClick } from '@/lib/analytics';
import { Search as SearchIcon, Menu as MenuIcon, X as XIcon } from 'lucide-react';

export function SiteHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);

  // Lock body scroll when mobile nav is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.classList.add('overflow-hidden');
    } else {
      document.body.classList.remove('overflow-hidden');
    }
  }, [mobileOpen]);

  return (
    <header className="bg-zinc-900/80 backdrop-blur-sm border-b border-zinc-800 sticky top-0 z-50 shadow-md">
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

          {/* Mobile Search Button */}
          <button
            className="lg:hidden p-2 text-zinc-300 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500/50 rounded-lg mr-2"
            aria-label="Search"
            onClick={() => {
              // TODO: Implement search modal for mobile if needed
              console.log('Mobile search clicked');
            }}
          >
            <SearchIcon className="w-5 h-5" />
          </button>

          {/* Hamburger */}
          <button
            className="lg:hidden p-2 text-zinc-300 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500/50 rounded-lg"
            aria-label="Toggle navigation menu"
            aria-expanded={mobileOpen}
            aria-controls="mobile-nav"
            onClick={() => setMobileOpen((prev) => !prev)}
          >
            {mobileOpen ? <XIcon className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
          </button>
        </div>
      </nav>

      {/* Mobile dropdown */}
      <div
        id="mobile-nav"
        className={`lg:hidden bg-black w-full overflow-hidden transition-all duration-300 ease-in-out ${mobileOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'}`}
      >
        <div className="px-6 py-4">
          <PrimaryNav orientation="vertical" showOnMobile />
          {/* You can optionally add the FAQ / Contact CTA here for mobile */}
          <div className="flex flex-col mt-6 space-y-2">
            <a
              href="/faq"
              onClick={() => {
                trackCTAClick('faq_header_mobile', 'header');
                setMobileOpen(false);
              }}
              className="text-zinc-300 hover:text-white py-2 w-full text-left"
            >
              FAQ
            </a>
            <a
              href="/contact"
              onClick={() => {
                trackCTAClick('contact_header_mobile', 'header');
                setMobileOpen(false);
              }}
              className="text-zinc-300 hover:text-white py-2 w-full text-left"
            >
              Contact Us
            </a>
          </div>
        </div>
      </div>

      {/* Overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/70 backdrop-blur-sm z-40"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}
    </header>
  );
}
