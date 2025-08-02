'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, HelpCircle } from 'lucide-react';
import { trackFAQInteraction, trackCTAClick } from '@/lib/analytics';

interface FAQItem {
  question: string;
  answer: string;
  id: string;
}

const faqData: FAQItem[] = [
  {
    id: "what-is-degentalk",
    question: "What is Degentalk?",
    answer: "Degentalk is the unholy offspring of a crypto forum and a casino chatroom, raised on 100x leverage dreams and Telegram memes. We're building a satirical cryptocurrency community where degens congregate to share their wins, losses, and questionable life choices. Think WallStreetBets energy but for crypto - where \"strategy meets satire\" and everyone's just trying to hit that one moonshot. It's not financial advice, it's financial comedy."
  },
  {
    id: "how-to-join-crypto-community",
    question: "How do I join Degentalk's crypto community?",
    answer: "Join our waitlist for guaranteed early access. No token pre-sales, no paid groups, no BS. Just enter your email and secure your founding member status. Early members get exclusive badges, first choice of usernames, and the opportunity to accumulate XP before everyone else. The earlier you join, the more legendary your status."
  },
  {
    id: "what-makes-degentalk-different",
    question: "What makes Degentalk different from other crypto forums?",
    answer: "While BitcoinTalk feels like 2009 and Reddit crypto is overrun with bots, Degentalk is the next evolution: a gamified forum where your contributions earn XP, rain events reward active members with DGT, and the culture celebrates both wins and losses with style. No corporate oversight, no fake gurus, just pure unfiltered crypto discussion with RPG mechanics. We're not just another forum - we're building the definitive home for crypto degens."
  },
  {
    id: "is-degentalk-safe",
    question: "Is Degentalk safe from crypto scams?",
    answer: "We take security seriously even if we don't take ourselves seriously. Strict moderation keeps out obvious scams, phishing attempts, and \"send me 1 ETH get 2 back\" schemes. But remember: we're a satirical forum, not your financial advisor. Your portfolio losses are comedy gold, but your account security is our priority. DYOR always applies - we're here for the memes, not to shill your bags."
  },
  {
    id: "what-are-dgt-tokens",
    question: "What can I do with DGT tokens?",
    answer: "DGT is Degentalk's native platform currency - your key to unlocking the full degen experience. Earn it through quality posts, active participation, and rain events. Spend it on exclusive cosmetics, access gated forums, boost your visibility, or simply stack it to assert dominance. DGT represents your contribution and status in the Degentalk ecosystem. The more you hold, the more doors open. This is just the beginning."
  },
  {
    id: "when-does-degentalk-launch",
    question: "When does Degentalk launch?",
    answer: "Degentalk is launching soon. Join the waitlist now to secure your spot as a founding member. Early access members will shape the culture, claim OG usernames, and establish themselves before the masses arrive. The waitlist is your ticket to the inner circle - don't sleep on it."
  },
  {
    id: "what-are-rain-events",
    question: "What are Rain Events on Degentalk?",
    answer: "Rain Events are when the Degentalk gods randomly bless active shoutbox users with DGT tokens. Just for being present and participating, you could catch some digital rain. It's our way of rewarding the community for keeping the vibes alive. Use your rain tokens for cosmetics, forum perks, or stack them to flex on newcomers. The more active you are, the more rain you might catch."
  },
  {
    id: "is-this-financial-advice",
    question: "Is Degentalk providing financial advice?",
    answer: "Absolutely not. If you're taking financial advice from a forum that celebrates losing money with style, you belong here but should probably reconsider your life choices. Everything on Degentalk is satire, entertainment, and community banter. We're a place to share stories, memes, and camaraderie - not investment guidance. Trade responsibly (or don't, we'll laugh either way)."
  }
];

interface FAQProps {
  showHeader?: boolean;
}

export function FAQ({ showHeader = true }: FAQProps = {}) {
  const [openItems, setOpenItems] = useState<Set<string>>(new Set());

  const toggleItem = (id: string) => {
    const newOpenItems = new Set(openItems);
    const faqItem = faqData.find(item => item.id === id);
    
    if (newOpenItems.has(id)) {
      newOpenItems.delete(id);
      trackFAQInteraction(faqItem?.question || id, 'close');
    } else {
      newOpenItems.add(id);
      trackFAQInteraction(faqItem?.question || id, 'open');
    }
    setOpenItems(newOpenItems);
  };

  // Generate FAQ schema for SEO
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqData.map(item => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer
      }
    }))
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqSchema),
        }}
      />
      <section id="faq" className={showHeader ? "py-16 sm:py-20 md:py-24 relative scroll-mt-16" : ""}>
        <div className={showHeader ? "container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl relative z-10" : ""}>
          
          {/* Section Header */}
          {showHeader && (
            <motion.div
              className="text-center mb-12 sm:mb-16"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <div className="flex items-center justify-center gap-3 mb-6">
                <HelpCircle className="w-8 h-8 text-emerald-400" />
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight">
                  Frequently Asked Questions
                </h2>
              </div>
              <p className="text-base sm:text-lg text-zinc-300 max-w-2xl mx-auto font-medium">
                Everything you need to know about joining the most satirical crypto forum on the internet.
              </p>
            </motion.div>
          )}

          {/* FAQ Items */}
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
            {faqData.map((item, index) => (
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

          {/* CTA Section */}
          {showHeader && (
            <motion.div
              className="text-center mt-12"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              viewport={{ once: true }}
            >
              <p className="text-zinc-400 text-sm mb-4">
                Still have questions? Join our community and ask away.
              </p>
              <motion.button
                onClick={() => {
                  trackCTAClick('join_waitlist', 'faq_section');
                  document.getElementById('newsletter-signup')?.scrollIntoView({ 
                    behavior: 'smooth' 
                  });
                }}
                className="inline-flex items-center px-6 py-3 text-sm font-semibold text-emerald-400 border border-emerald-500/30 rounded-lg hover:bg-emerald-500/10 hover:border-emerald-500/50 transition-all duration-200"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Join the Waitlist
              </motion.button>
            </motion.div>
          )}
        </div>
      </section>
    </>
  );
}