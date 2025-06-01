import React from 'react';
import { Link } from 'wouter';
import { Users, MessageSquare, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AnimatedLogo } from '@/components/ui/animated-logo';

export function HeroSection() {
  return (
    <section className="relative overflow-hidden">
      {/* Background image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ 
          backgroundImage: 'url("/images/19FA32BC-BF64-4CE2-990E-BDB147C2A159.png")'
        }}
      />
      {/* Gradient overlay - lighter */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/40 to-black/60 pointer-events-none" />
      
      {/* Subtle grid pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMyMDIwMjAiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRoLTJ2LTRoMnY0em0wLTZoLTJ2LTRoMnY0em0wLTZoLTJ2LTRoMnY0em0wLTZoLTJWNmgydjR6bTAgMzBoLTJ2LTRoMnY0em0wLTZoLTJ2LTRoMnY0ek0zMCAzNGgtMnYtNGgydjR6bTAtNmgtMnYtNGgydjR6bTAtNmgtMnYtNGgydjR6bTAtNmgtMlY2aDJ2NHptMCAzMGgtMnYtNGgydjR6bTAtNmgtMnYtNGgydjR6TTI0IDM0aC0ydi00aDJ2NHptMC02aC0ydi00aDJ2NHptMC02aC0ydi00aDJ2NHptMC02aC0yVjZoMnY0em0wIDMwaC0ydi00aDJ2NHptMC02aC0ydi00aDJ2NHoiIC8+PC9nPjwvZz48L3N2Zz4=')] opacity-30" />
      
      <div className="container mx-auto px-4 py-16 md:py-24 lg:py-32 relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 text-white [text-shadow:_0_2px_8px_rgba(255,255,255,0.15),_0_4px_12px_rgba(255,255,255,0.1)]">
            {[
              "The playground for those who don't play it safe.",
              "Where Risk and Strategy Connect.",
              "Let's tilt together ;)",
              "The Hub of Degenerates.",
              "From Whispers to Wins",
              "Connect, Bet, Win.",
              "Post your wins. Hide your losses.",
              "The one–stop shop for all things Degen.",
              "Fortune Favors the Bold.",
              "From Ideas to Wins.",
              "It's About Seeing the Play Before It Happens.",
              "Read the Trends. See the Patterns. Make the Play.",
              "No charts. Just vibes.",
              "Rugged? Good. Now you're one of us.",
              "Built different. Just not financially stable.",
              "Degens don't cry—we redeposit.",
              "Who needs therapy when you have leverage",
              "Where Risk Meets Reward.",
              "For Those Who Play to Win.",
              "If There's Odds, We're In.",
              "The High-Stakes Playground.",
              "The Edge You Need.",
              "Every degen's playground for market chaos.",
              "No Limits. No Filters. All Degen."
            ][Math.floor(Math.random() * 24)]}
          </h1>
          
          <p className="text-lg md:text-xl text-white mb-8 md:mb-10 flex items-center gap-2 justify-center font-semibold">
            <span className="drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]">Discover</span>, <span className="drop-shadow-[0_0_8px_rgba(234,179,8,0.5)]">Discuss</span>, <span className="drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]">Degen.</span>
          </p>
          
          <div className="flex flex-wrap gap-4 justify-center">
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white"
              onClick={() => window.location.href = '/forum'}
            >
              <Users className="w-5 h-5 mr-2" />
              Join Community
            </Button>
          </div>
          
          <div className="mt-8 md:mt-12 flex justify-center">
            <Link href="/forum">
              <div className="flex items-center text-emerald-400 hover:text-emerald-300 transition-colors text-sm">
                <span>Insert success story here (or not)</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </div>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
