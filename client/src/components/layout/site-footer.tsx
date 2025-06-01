import React from 'react';
import { Link } from 'wouter';

export function SiteFooter() {
  return (
    <footer className="bg-zinc-900/50 border-t border-zinc-800 py-8 mt-auto">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-bold mb-4 text-white">
              Degentalk
            </h3>
            <p className="text-zinc-400 text-sm">
              The premier crypto-native forum and social platform for enthusiasts, traders, and developers.
            </p>
          </div>
          
          <div>
            <h4 className="font-medium mb-3 text-zinc-300">Navigation</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="text-zinc-400 hover:text-emerald-400 transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/forum" className="text-zinc-400 hover:text-emerald-400 transition-colors">
                  Forum
                </Link>
              </li>
              <li>
                <Link href="/shop" className="text-zinc-400 hover:text-emerald-400 transition-colors">
                  Shop
                </Link>
              </li>
              <li>
                <Link href="/leaderboard" className="text-zinc-400 hover:text-emerald-400 transition-colors">
                  Leaderboard
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium mb-3 text-zinc-300">Resources</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="text-zinc-400 hover:text-emerald-400 transition-colors">
                  Documentation
                </a>
              </li>
              <li>
                <a href="#" className="text-zinc-400 hover:text-emerald-400 transition-colors">
                  API References
                </a>
              </li>
              <li>
                <a href="#" className="text-zinc-400 hover:text-emerald-400 transition-colors">
                  Token Economics
                </a>
              </li>
              <li>
                <a href="#" className="text-zinc-400 hover:text-emerald-400 transition-colors">
                  Platform FAQ
                </a>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium mb-3 text-zinc-300">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="text-zinc-400 hover:text-emerald-400 transition-colors">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="text-zinc-400 hover:text-emerald-400 transition-colors">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="#" className="text-zinc-400 hover:text-emerald-400 transition-colors">
                  Cookie Policy
                </a>
              </li>
              <li>
                <a href="#" className="text-zinc-400 hover:text-emerald-400 transition-colors">
                  Disclaimer
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-zinc-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-zinc-500">
          <div className="order-2 md:order-1">
            &copy; {new Date().getFullYear()} Degentalk. All rights reserved.
          </div>
          <div className="order-1 md:order-2 mb-4 md:mb-0 italic">
            {[
              "This is not financial advice. But if it works, you're welcome.",
              "Degentalk is powered by caffeine, cope, and completely unlicensed opinions.",
              "We are not financial advisors. We just yell louder when we're right.",
              "Not financial advice. Consult your local psychic for better accuracy.",
              "Any gains you make are pure coincidence. Any losses are definitely your fault.",
              "This isn't financial advice. It's just aggressive optimism with a side of chaos.",
              "If this feels like good advice, please reconsider everything.",
              "Everything here is entirely theoretical. Especially your profits.",
              "Don't sue us. Sue the market.",
              "Side effects of listening to Degentalk may include delusion, euphoria, or margin calls.",
              "DYOR. Then ignore it and ape anyway.",
              "This is not financial advice, seriously.",
              "Shoutout to the guy who lost his paycheck today.",
              "Up only... in spirit.",
              "Post your wins. Hide your losses.",
              "No charts. Just vibes.",
              "Rugged? Good. Now you're one of us.",
              "Built different. Just not financially stable.",
              "Degens don't cry—we redeposit.",
              "Who needs therapy when you have leverage?",
              "Your portfolio is our entertainment.",
              "Welcome to group therapy with bonus rounds.",
              "0xFaith, 100x Cope.",
              "Lose fast, post faster.",
              "If this site loads, you haven't been liquidated yet.",
              "Do NOT try this at home. Try it on-chain."
            ][Math.floor(Math.random() * 26)]}
          </div>
        </div>
      </div>
    </footer>
  );
}