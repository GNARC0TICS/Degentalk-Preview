'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { trackFAQInteraction } from '@/lib/analytics';

interface FAQItem {
  question: string;
  answer: string;
  id: string;
}

const faqDataFull: FAQItem[] = [
  {
    id: "what-is-degentalk",
    question: "What is Degentalk?",
    answer: "Degentalk is the unholy offspring of a crypto forum and a casino chatroom, raised on 100x leverage dreams and Telegram memes. We're building a satirical cryptocurrency community where degens congregate to share their wins, losses, and questionable life choices. Think WallStreetBets energy but for crypto. It's not financial advice, it's financial comedy."
  },
  {
    id: "when-does-degentalk-launch",
    question: "When does Degentalk launch?",
    answer: "Degentalk is launching soon. Join the waitlist now to secure your spot as a founding member. Early access members will shape the culture, claim OG usernames, and establish themselves before the masses arrive. The waitlist is your ticket to the inner circle - don't sleep on it."
  },
  {
    id: "how-to-join",
    question: "How do I join Degentalk?",
    answer: "Join our waitlist for guaranteed early access. Just enter your email and secure your founding member status. Early members get exclusive badges, first choice of usernames, and the opportunity to accumulate XP before everyone else. The earlier you join, the more legendary your status."
  },
  {
    id: "what-are-dgt-tokens",
    question: "What are DGT tokens?",
    answer: "DGT is Degentalk's native platform currency - your key to unlocking the full degen experience. Earn it through quality posts, active participation, and rain events. Spend it on exclusive cosmetics, access gated forums, boost your visibility, or simply stack it to assert dominance. DGT represents your contribution and status in the Degentalk ecosystem. The more you hold, the more doors open. This is just the beginning."
  },
  {
    id: "what-are-rain-events",
    question: "What are Rain Events?",
    answer: "Rain Events are when the Degentalk gods randomly bless active shoutbox users with DGT tokens. Just for being present and participating, you could catch some digital rain. It's our way of rewarding the community for keeping the vibes alive. Use your rain tokens for cosmetics, forum perks, or stack them to flex on newcomers. The more active you are, the more rain you might catch."
  },
  {
    id: "is-degentalk-safe",
    question: "Is Degentalk safe from scams?",
    answer: "We take security seriously even if we don't take ourselves seriously. Strict moderation keeps out obvious scams, phishing attempts, and \"send me 1 ETH get 2 back\" schemes. But remember: we're a satirical forum, not your financial advisor. Your portfolio losses are comedy gold, but your account security is our priority. DYOR always applies - we're here for the memes, not to shill your bags."
  },
  {
    id: "what-makes-degentalk-different",
    question: "What makes Degentalk different from BitcoinTalk or Reddit?",
    answer: "While BitcoinTalk feels like 2009 and Reddit crypto is overrun with bots, Degentalk is the next evolution: a gamified forum where your contributions earn XP, rain events reward active members with DGT, and the culture celebrates both wins and losses with style. No corporate oversight, no fake gurus, just pure unfiltered crypto discussion with RPG mechanics. We're not just another forum - we're building the definitive home for crypto degens."
  },
  {
    id: "is-this-financial-advice",
    question: "Is this financial advice?",
    answer: "Absolutely not. If you're taking financial advice from a forum that celebrates losing money with style, you belong here but should probably reconsider your life choices. Everything on Degentalk is satire, entertainment, and community banter. We're a place to share stories, memes, and camaraderie - not investment guidance. Trade responsibly (or don't, we'll laugh either way)."
  },
  {
    id: "will-degentalk-have-mobile-apps",
    question: "Will Degentalk have mobile apps?",
    answer: "Mobile apps are on the roadmap. We're focused on nailing the web experience first, then bringing the chaos to your pocket. Waitlist members will get first access to mobile betas when they're ready. Imagine catching rain events while on the toilet - the future is beautiful."
  },
  {
    id: "how-does-xp-system-work",
    question: "How does the XP system work?",
    answer: "XP tracks your contribution to the Degentalk ecosystem. Post quality content, engage with the community, and participate in events to level up. Higher XP unlocks achievements, exclusive forums, and establishes your degen credibility. It's like LinkedIn endorsements but for people who think 'diversification' means buying multiple memecoins."
  },
  {
    id: "what-is-unhinged-mode",
    question: "What is Unhinged Mode?",
    answer: "Unhinged Mode is where the gloves come off. Less moderation, more chaos, pure degen energy. It's opt-in only and not for the faint of heart. What happens in Unhinged Mode stays in Unhinged Mode (unless it's really funny, then we screenshot it)."
  },
  {
    id: "can-i-remain-anonymous",
    question: "Can I remain anonymous on Degentalk?",
    answer: "Absolutely. We respect the degen way - no KYC, no real names required. Pick your username, build your reputation, and let your posts speak for themselves. Your privacy is yours to keep. We're not here to dox, we're here to shitpost."
  }
];

export function FAQFull() {
  const [openItems, setOpenItems] = useState<Set<string>>(new Set());

  const toggleItem = (id: string) => {
    const newOpenItems = new Set(openItems);
    const faqItem = faqDataFull.find(item => item.id === id);
    
    if (newOpenItems.has(id)) {
      newOpenItems.delete(id);
      trackFAQInteraction(faqItem?.question || id, 'close');
    } else {
      newOpenItems.add(id);
      trackFAQInteraction(faqItem?.question || id, 'open');
    }
    setOpenItems(newOpenItems);
  };

  return (
    <motion.div 
      className="space-y-4"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.1 }}
      variants={{
        visible: {
          transition: {
            staggerChildren: 0.05
          }
        }
      }}
    >
      {faqDataFull.map((item) => (
        <motion.div
          key={item.id}
          className="bg-zinc-800/50 rounded-lg border border-zinc-700/50 hover:border-emerald-500/30"
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { 
              opacity: 1, 
              y: 0,
              transition: {
                duration: 0.5,
                ease: "easeOut"
              }
            }
          }}
        >
          <button
            onClick={() => toggleItem(item.id)}
            className="w-full text-left p-6 flex items-center justify-between group focus:outline-none focus:ring-2 focus:ring-emerald-500/50 rounded-lg"
            aria-expanded={openItems.has(item.id)}
            aria-controls={`faq-answer-${item.id}`}
          >
            <h3 className="text-lg font-bold text-white group-hover:text-emerald-400 transition-colors pr-4">
              {item.question}
            </h3>
            <motion.div
              animate={{ rotate: openItems.has(item.id) ? 180 : 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="flex-shrink-0"
            >
              <ChevronDown className="w-5 h-5 text-emerald-400 group-hover:text-emerald-300 transition-colors" />
            </motion.div>
          </button>
          
          <AnimatePresence initial={false}>
            {openItems.has(item.id) && (
              <motion.div
                id={`faq-answer-${item.id}`}
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ 
                  height: { duration: 0.3, ease: "easeInOut" },
                  opacity: { duration: 0.2, ease: "easeInOut" }
                }}
                style={{ overflow: 'hidden' }}
              >
                <div className="px-6 pb-6 pt-2">
                  <p className="text-zinc-300 leading-relaxed font-medium">
                    {item.answer}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      ))}
    </motion.div>
  );
}