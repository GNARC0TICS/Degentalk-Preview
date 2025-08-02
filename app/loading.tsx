'use client';

import { useState, useEffect } from 'react';

const loadingMessages = [
  "Loading your unrecoverable…",
  "Loading the thread that gets you banned…",
  "Loading charts drawn in MS Paint…",
  "Loading utility… again…",
  "Loading alpha from a guy named Chad…",
  "Loading bags, please lift with legs…",
  "Loading sentiment: max pain…",
  "Loading one final cope candle…",
  "Loading the mod's 3rd warning…",
  "Loading airdrop that you missed…",
  "Loading floor price lies…",
  "Loading tokenomics, please stand by…",
  "Loading regrets per transaction…",
  "Loading liquidity exit routes…",
  "Loading XP like it matters…",
  "Loading bear market coping guide…",
  "Loading hope… corrupted file detected…",
  "Loading your next delusion…",
  "Loading DCA into oblivion…",
  "Loading forum post with zero replies…",
  "Loading your rank downgrade…",
  "Loading a reply nobody asked for…",
  "Loading utility for the 5th time…",
  "Loading vibes… and that's it…",
  "Loading the guy who called the top…",
  "Loading next rug in 3… 2…",
  "Loading volatility straight to the face…",
  "Loading unsolicited shill…",
  "Loading your XP refund request… denied.",
  "Loading conviction… please wait…"
];

export default function Loading() {
  const [message, setMessage] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Select a random message on mount
    const randomIndex = Math.floor(Math.random() * loadingMessages.length);
    setMessage(loadingMessages[randomIndex]);
  }, []);

  // During SSR or before mount, show a safe fallback
  if (!mounted || !message) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 mb-4">
            <div className="w-12 h-12 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
          </div>
          <p className="text-zinc-400 animate-pulse">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center max-w-md px-4">
        <div className="inline-flex items-center justify-center w-16 h-16 mb-4">
          <div className="w-12 h-12 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
        </div>
        <p className="text-zinc-400 animate-pulse">{message}</p>
      </div>
    </div>
  );
}