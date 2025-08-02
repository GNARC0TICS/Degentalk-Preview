import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, ChevronDown, HelpCircle } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Frequently Asked Questions - Degentalk | Community Crypto Forum',
  description: 'Get answers to common questions about Degentalk, the premier crypto community platform. Learn about features, launch dates, and how to join.',
  keywords: 'degentalk faq, crypto forum questions, cryptocurrency community faq, degentalk help',
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: 'Degentalk FAQ - Your Questions Answered',
    description: 'Everything you need to know about joining Degentalk, the future of crypto forums.',
    type: 'website',
    url: 'https://degentalk.net/faq',
  },
  alternates: {
    canonical: 'https://degentalk.net/faq',
  },
};

// FAQ data - all 12 questions
const faqData = [
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
    answer: "Mobile apps are on the roadmap. We're focused on nailing the web experience first, then bringing the chaos to your pocket. Waitlist members will get first access to mobile betas when they're ready. Imagine shitposting mid-flush while pretending we're all gonna make it. The future is beautiful."
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

// FAQ Schema for rich snippets
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

// Breadcrumb schema
const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    {
      '@type': 'ListItem',
      position: 1,
      name: 'Home',
      item: 'https://degentalk.net'
    },
    {
      '@type': 'ListItem',
      position: 2,
      name: 'FAQ',
      item: 'https://degentalk.net/faq'
    }
  ]
};

export default function FAQPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqSchema),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbSchema),
        }}
      />
      
      <div className="min-h-screen py-16 sm:py-20 md:py-24 bg-gradient-to-b from-zinc-950 to-black">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
          
          {/* Back to Home - matching Contact page */}
          <div className="mb-8">
            <Link 
              href="/"
              className="inline-flex items-center text-emerald-400 hover:text-emerald-300 transition-colors duration-200 group"
            >
              <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform duration-200" />
              Back to Degentalk
            </Link>
          </div>

          {/* Header - matching Contact page font styling */}
          <div className="text-center mb-12">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-display uppercase tracking-wide text-white mb-4">
              Frequently Asked Questions
            </h1>
            <p className="text-lg text-zinc-300 max-w-2xl mx-auto">
              Everything you need to know about joining the most satirical crypto forum on the internet
            </p>
          </div>
          
          {/* FAQ Items */}
          <div className="space-y-4">
            {faqData.map((item) => (
              <details 
                key={item.id} 
                className="group bg-zinc-800/50 rounded-lg border border-zinc-700/50 hover:border-emerald-500/30 transition-all duration-300"
              >
                <summary className="w-full p-6 flex items-center justify-between cursor-pointer list-none">
                  <h3 className="text-lg font-bold text-white group-hover:text-emerald-400 transition-colors pr-4">
                    {item.question}
                  </h3>
                  <div className="flex-shrink-0 text-emerald-400 group-hover:text-emerald-300 transition-all duration-300 group-open:rotate-180">
                    <ChevronDown className="w-5 h-5" />
                  </div>
                </summary>
                
                <div className="px-6 pb-6 pt-0">
                  <p className="text-zinc-300 leading-relaxed">
                    {item.answer}
                  </p>
                </div>
              </details>
            ))}
          </div>

          {/* Footer CTA */}
          <div className="mt-16 text-center">
            <div className="bg-zinc-800/30 rounded-lg p-8 border border-zinc-700/50">
              <div className="flex items-center justify-center gap-3 mb-4">
                <HelpCircle className="w-8 h-8 text-emerald-400" />
                <h2 className="text-2xl font-bold text-white">Still Have Questions?</h2>
              </div>
              <p className="text-zinc-300 mb-6">
                Can't find what you're looking for? We're here to help.
              </p>
              <Link 
                href="/contact" 
                className="inline-flex items-center px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-colors"
              >
                Contact Us
              </Link>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}