'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { IconRenderer } from '@/components/icons/iconRenderer';
import { getCachedSearchResponse } from '@/lib/search-easter-eggs';
import { logger } from '@/lib/logger';

const funnyPlaceholders = [
  "Search for your lost gains...",
  "Find who rugged you",
  "Locate exit liquidity",
  "Search for financial advice (don't)",
  "Find the next 100x (lol)",
  "Search for cope strategies",
  "Look up 'buy high sell low'",
  "Find your bags",
  "Locate the bottom (it's lower)",
  "Find Satoshi (good luck)",
  "Search for green candles",
  "Find the sell button (broken)",
  "Locate smart money (not here)",
  "Find the top (you bought it)",
  "Search for hopium dealers",
  "Discover hidden alpha",
  "Find the dip (this isn't it)",
  "Search for exit strategies",
  "Locate diamond hands",
  "Find paper hands anonymous"
];

interface LandingSearchBoxProps {
  className?: string;
}

export function LandingSearchBox({ className = '' }: LandingSearchBoxProps) {
  const [searchValue, setSearchValue] = useState('');
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Always use the first placeholder until mounted to avoid hydration mismatch
  const currentPlaceholder = useMemo(() => {
    if (!isMounted) return funnyPlaceholders[0];
    return funnyPlaceholders[placeholderIndex];
  }, [placeholderIndex, isMounted]);

  // Handle client-side mounting to avoid hydration issues
  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    // Don't rotate while user is typing or if not mounted
    if (isTyping || !isMounted) return;

    const interval = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % funnyPlaceholders.length);
    }, 8000); // Change every 8 seconds for less frequent rotation

    return () => clearInterval(interval);
  }, [isTyping, isMounted]);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    
    // Don't process empty searches
    if (!searchValue.trim()) return;
    
    // Get intelligent response based on search query
    const response = getCachedSearchResponse(searchValue);
    
    // Show the response
    const showMessage = (message: string) => {
      // Only show on client side
      if (typeof window !== 'undefined') {
        logger.info('Search', 'Easter egg response', { message });
        
        // TODO: In production, show this in a toast notification
      }
      
      // Visual feedback: briefly highlight the search box
      const input = document.getElementById('landing-search-input');
      if (input) {
        input.classList.add('ring-2', 'ring-emerald-500');
        setTimeout(() => {
          input.classList.remove('ring-2', 'ring-emerald-500');
        }, 300);
      }
    };
    
    showMessage(response);
    setSearchValue('');
  }, [searchValue]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchValue(value);
    setIsTyping(value.length > 0);
  }, []);

  const handleBlur = useCallback(() => {
    // Small delay to allow submit to fire if user clicked enter
    setTimeout(() => setIsTyping(false), 100);
  }, []);

  return (
    <form onSubmit={handleSubmit} className={`relative w-full ${className}`}>
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <IconRenderer icon="search" size={16} className="h-4 w-4 text-zinc-500" />
      </div>
      <input
        id="landing-search-input"
        type="search"
        value={searchValue}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder={currentPlaceholder}
        className="pl-10 pr-4 py-2 bg-zinc-800/50 border border-zinc-700 rounded-md text-sm w-full text-zinc-300 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-300"
        aria-label="Search"
        autoComplete="off"
        spellCheck="false"
      />
    </form>
  );
}