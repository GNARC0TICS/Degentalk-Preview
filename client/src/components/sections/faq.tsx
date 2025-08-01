import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, HelpCircle } from 'lucide-react';
import { SectionBackground } from '@/components/ViewportBackground';
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
    answer: "Degentalk is a cryptocurrency forum and trading community platform designed for crypto traders, DeFi enthusiasts, and blockchain investors. Unlike traditional crypto forums like BitcoinTalk or Reddit, Degentalk combines satirical content with serious cryptocurrency discussion, featuring live trading discussions, token economics, and community-driven investment insights. It's specifically built for experienced crypto traders who thrive on market volatility and advanced trading strategies."
  },
  {
    id: "how-to-join-crypto-community",
    question: "How to join the best crypto trading community?",
    answer: "To join Degentalk crypto community: 1) Sign up for our waitlist for early access 2) Receive founding member benefits including exclusive badges and DGT token allocations 3) Once launched, create your account and start participating in crypto discussions 4) Earn XP through quality trading posts and market analysis 5) Access premium features like live shoutbox, rain events, and trading signals. Early members get priority access to all community features."
  },
  {
    id: "best-crypto-forum-features",
    question: "What makes the best cryptocurrency forum in 2024?",
    answer: "The best crypto forums in 2024 offer: Live trading discussions, real-time market analysis, token-based economy for rewarding quality content, experienced trader community, DeFi project discussions, NFT trading insights, and secure communication channels. Degentalk provides all these features plus unique elements like XP systems, achievement badges, rain events for profit sharing, community roles, and satirical market commentary that makes crypto trading education both informative and entertaining."
  },
  {
    id: "crypto-trading-discussion-platform",
    question: "Where can I discuss crypto trading strategies safely?",
    answer: "Degentalk provides a secure cryptocurrency trading discussion platform with verified community members, anti-scam measures, and moderated discussions. Unlike public crypto forums where scams are common, we implement strict community guidelines, member verification, and real-time moderation. Our platform features encrypted discussions, private trading groups, and educational resources for both beginner and advanced crypto traders, all while maintaining the satirical culture that makes learning about crypto markets enjoyable."
  },
  {
    id: "degentalk-vs-other-forums",
    question: "How does Degentalk compare to BitcoinTalk and Reddit crypto?",
    answer: "Degentalk differs from traditional crypto forums like BitcoinTalk, Reddit r/cryptocurrency, and Discord servers by offering: 1) Token-based economy with DGT rewards for quality posts 2) Live shoutbox for real-time trading discussions 3) Gamified experience with XP, levels, and achievements 4) Professional trading tools integrated with community features 5) Satirical approach that makes crypto education engaging 6) Smaller, curated community of serious traders vs mass public forums 7) Advanced moderation preventing common crypto scams found on larger platforms."
  },
  {
    id: "dgt-token-cryptocurrency",
    question: "What is DGT token and how does crypto forum tokenomics work?",
    answer: "DGT (Degentalk Token) is our native cryptocurrency that powers the forum economy. DGT token use cases include: tipping quality posts and market analysis, purchasing premium cosmetics and profile upgrades, accessing exclusive trading discussion rooms, participating in rain events where profits are shared, and voting on community governance decisions. Token holders get enhanced privileges, early access to new features, and revenue sharing from platform activities. It's designed to reward valuable community contributions and create sustainable tokenomics for long-term growth."
  },
  {
    id: "crypto-community-safety",
    question: "Is Degentalk crypto forum safe from scams?",
    answer: "Yes, Degentalk implements comprehensive safety measures for crypto community members: verified user accounts, anti-scam detection systems, moderated discussions preventing pump-and-dump schemes, secure communication channels, educational resources about crypto security, and community reporting tools. While we embrace satirical content about market losses, we maintain strict policies against actual scams, phishing attempts, rug pulls, and malicious projects. Your portfolio losses are entertainment, but your account security is our priority."
  },
  {
    id: "when-degentalk-launch",
    question: "When does Degentalk cryptocurrency forum launch?",
    answer: "Degentalk is currently in development with beta testing planned for Q1 2025. Join our waitlist now to secure early access, founding member status, and exclusive DGT token allocation. Waitlist members receive: priority beta access, founding member badges, early DGT token distribution, exclusive community roles, and lifetime premium features. We'll notify all waitlist subscribers 48 hours before public launch with step-by-step onboarding instructions."
  }
];

export function FAQ() {
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

  return (
    <SectionBackground variant="solid" intensity={0.15} className="py-16 sm:py-20 md:py-24">
      <section id="faq" className="relative scroll-mt-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl relative z-10">
          
          {/* Section Header */}
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
        </div>
      </section>
    </SectionBackground>
  );
}