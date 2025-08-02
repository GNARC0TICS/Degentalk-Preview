'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

/**
 * MobileNav – lightweight, self-contained mobile navigation for the waitlist page.
 *
 * Behaviour
 *  • Hamburger icon animates into an ❌ when open
 *  • Full-width dropdown appears below the header with dark styling
 *  • Clicking outside the menu or selecting a link closes it
 *  • Body scroll-lock while the menu is open
 *
 * TailwindCSS classes are used for all styling/animation – no external deps.
 */
const MENU_ITEMS = [
  { label: 'About', href: '/about' },
  { label: 'Terms', href: '/legal/terms' },
  { label: 'Privacy', href: '/legal/privacy' },
  { label: 'Disclaimer', href: '/legal/disclaimer' },
] as const;

export default function MobileNav() {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  // ─── Body Scroll Lock ─────────────────────────────────────────────────────
  useEffect(() => {
    if (open) {
      // Prevent body from scrolling while menu is open
      document.body.classList.add('overflow-hidden');
    } else {
      document.body.classList.remove('overflow-hidden');
    }
  }, [open]);

  // ─── Close on Escape Key ──────────────────────────────────────────────────
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  // ─── Click-outside to close ───────────────────────────────────────────────
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (open && menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) {
      window.addEventListener('mousedown', handleClickOutside);
    }
    return () => window.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  // ─── Scroll To Waitlist CTA ───────────────────────────────────────────────
  const handleWaitlistClick = () => {
    const waitlistEl = document.getElementById('waitlist');
    if (waitlistEl) {
      waitlistEl.scrollIntoView({ behavior: 'smooth' });
    }
    setOpen(false);
  };

  return (
    <nav className="md:hidden fixed top-0 left-0 w-full z-50">
      {/* Header Bar */}
      <div className="flex items-center justify-between px-4 py-4 bg-black/90 backdrop-blur-sm">
        <span className="text-lg font-bold text-white">Degentalk</span>
        {/* Hamburger button */}
        <button
          aria-label="Toggle menu"
          aria-expanded={open}
          aria-controls="mobile-nav-menu"
          onClick={() => setOpen((prev) => !prev)}
          className="relative w-8 h-8 focus:outline-none"
        >
          <span
            className={`absolute left-0 top-1/2 w-8 h-0.5 bg-white transition-transform duration-300 ease-in-out ${
              open ? 'rotate-45 translate-y-0' : '-translate-y-2'
            }`}
          />
          <span
            className={`absolute left-0 top-1/2 w-8 h-0.5 bg-white transition-opacity duration-300 ${
              open ? 'opacity-0' : 'opacity-100'
            }`}
          />
          <span
            className={`absolute left-0 top-1/2 w-8 h-0.5 bg-white transition-transform duration-300 ease-in-out ${
              open ? '-rotate-45 translate-y-0' : 'translate-y-2'
            }`}
          />
        </button>
      </div>

      {/* Dropdown Menu */}
      <div
        id="mobile-nav-menu"
        ref={menuRef}
        className={`bg-black text-white w-full overflow-hidden transition-all duration-300 ease-in-out ${
          open ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <ul className="flex flex-col px-6 py-4 space-y-4 text-lg">
          {MENU_ITEMS.map((item) => (
            <li key={item.label}>
              <Link
                href={item.href}
                className="w-full inline-block py-2" // block link for easier tapping
                onClick={() => setOpen(false)}
              >
                {item.label}
              </Link>
            </li>
          ))}
          <li>
            <button
              className="w-full text-left py-2 font-semibold"
              onClick={handleWaitlistClick}
            >
              Join the Waitlist
            </button>
          </li>
        </ul>
      </div>

      {/* Overlay */}
      {open && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40" aria-hidden="true" />
      )}
    </nav>
  );
}
