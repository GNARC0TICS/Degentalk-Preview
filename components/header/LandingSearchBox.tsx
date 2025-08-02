'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { IconRenderer } from '@/components/icons/iconRenderer';

const funnyPlaceholders = [
  "Type 'wen moon' for disappointment",
  "Search for your lost gains...",
  "Find who rugged you",
  "Locate exit liquidity",
  "Search for financial advice (don't)",
  "Type 'gm' to get banned",
  "Find the next 100x (lol)",
  "Search for cope strategies",
  "Look up 'buy high sell low'",
  "Find your bags",
  "Search 'why am I poor'",
  "Locate the bottom (it's lower)",
  "Find Satoshi (good luck)",
  "Search for green candles",
  "Type 'HODL' if you hate money",
  "Find the sell button (broken)",
  "Search 'wen recovery'",
  "Locate smart money (not here)",
  "Find the top (you bought it)",
  "Search for hopium dealers"
];

interface LandingSearchBoxProps {
  className?: string;
}

export function LandingSearchBox({ className = '' }: LandingSearchBoxProps) {
  const [searchValue, setSearchValue] = useState('');
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Memoize the current placeholder to prevent unnecessary re-renders
  const currentPlaceholder = useMemo(() => funnyPlaceholders[placeholderIndex], [placeholderIndex]);

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
    
    // Easter egg responses for specific searches
    const searchLower = searchValue.toLowerCase().trim();
    
    // Use a more subtle notification instead of alert
    const showMessage = (message: string) => {
      // For now, we'll use console.log - in production, you'd use a toast notification
      console.log('Easter egg:', message);
      
      // Visual feedback: briefly highlight the search box
      const input = e.currentTarget.querySelector('input');
      if (input) {
        input.classList.add('ring-2', 'ring-emerald-500');
        setTimeout(() => {
          input.classList.remove('ring-2', 'ring-emerald-500');
        }, 300);
      }
    };
    
    if (searchLower === 'wen moon') {
      showMessage('After you sell, obviously.');
    } else if (searchLower === 'gm') {
      showMessage('BANNED! (just kidding... or am I?)');
    } else if (searchLower === 'wagmi') {
      showMessage('Narrator: They were not all gonna make it.');
    } else if (searchLower.includes('lambo')) {
      showMessage('Sir, this is a Wendy\'s.');
    } else if (searchValue) {
      showMessage(`"${searchValue}"? Never heard of it. Probably rugged already.`);
    }
    
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
        type="search"
        value={searchValue}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder={isMounted ? currentPlaceholder : funnyPlaceholders[0]}
        className="pl-10 pr-4 py-2 bg-zinc-800/50 border border-zinc-700 rounded-md text-sm w-full text-zinc-300 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-300"
        aria-label="Search"
        autoComplete="off"
        spellCheck="false"
      />
    </form>
  );
}