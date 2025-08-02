import { FAQ } from '@/components/sections/faq';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Frequently Asked Questions - Degentalk',
  description: 'Get answers to common questions about Degentalk, the premier crypto community platform. Learn about features, launch dates, and how to join.',
  keywords: 'degentalk faq, crypto forum questions, cryptocurrency community faq, degentalk help',
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

// FAQ Schema for rich snippets - comprehensive version
const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'What is Degentalk?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Degentalk is the unholy offspring of a crypto forum and a casino chatroom, raised on 100x leverage dreams and Telegram memes. We\'re building a satirical cryptocurrency community where degens congregate to share their wins, losses, and questionable life choices. Think WallStreetBets energy but for crypto.'
      }
    },
    {
      '@type': 'Question',
      name: 'When does Degentalk launch?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Degentalk is launching soon. Join the waitlist now to secure your spot as a founding member. Early access members will shape the culture, claim OG usernames, and establish themselves before the masses arrive.'
      }
    },
    {
      '@type': 'Question',
      name: 'How do I join Degentalk?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Join our waitlist for guaranteed early access. Just enter your email and secure your founding member status. Early members get exclusive badges, first choice of usernames, and the opportunity to accumulate XP before everyone else.'
      }
    },
    {
      '@type': 'Question',
      name: 'What are DGT tokens?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'DGT is Degentalk\'s native platform currency. Earn it through quality posts, active participation, and rain events. Spend it on exclusive cosmetics, access gated forums, boost your visibility, or stack it to assert dominance in the ecosystem.'
      }
    },
    {
      '@type': 'Question',
      name: 'What are Rain Events?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Rain Events are when the Degentalk system randomly blesses active shoutbox users with DGT tokens. Just for being present and participating, you could catch some digital rain. It\'s our way of rewarding the community for keeping the vibes alive.'
      }
    },
    {
      '@type': 'Question',
      name: 'Is Degentalk safe from scams?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'We take security seriously even if we don\'t take ourselves seriously. Strict moderation keeps out obvious scams and phishing attempts. But remember: we\'re a satirical forum, not your financial advisor. DYOR always applies.'
      }
    },
    {
      '@type': 'Question',
      name: 'What makes Degentalk different from BitcoinTalk or Reddit?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Degentalk is the next evolution: a gamified forum where your contributions earn XP, rain events reward active members, and the culture celebrates both wins and losses with style. No corporate oversight, no fake gurus, just pure unfiltered crypto discussion with RPG mechanics.'
      }
    },
    {
      '@type': 'Question',
      name: 'Is this financial advice?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Absolutely not. Everything on Degentalk is satire, entertainment, and community banter. We\'re a place to share stories, memes, and camaraderie - not investment guidance. Trade responsibly or don\'t, we\'ll laugh either way.'
      }
    },
    {
      '@type': 'Question',
      name: 'Will Degentalk have mobile apps?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Mobile apps are on the roadmap. We\'re focused on nailing the web experience first, then bringing the chaos to your pocket. Waitlist members will get first access to mobile betas when they\'re ready.'
      }
    },
    {
      '@type': 'Question',
      name: 'How does the XP system work?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'XP tracks your contribution to the Degentalk ecosystem. Post quality content, engage with the community, and participate in events to level up. Higher XP unlocks achievements, exclusive forums, and establishes your degen credibility.'
      }
    },
    {
      '@type': 'Question',
      name: 'What is Unhinged Mode?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Unhinged Mode is where the gloves come off. Less moderation, more chaos, pure degen energy. It\'s opt-in only and not for the faint of heart. What happens in Unhinged Mode stays in Unhinged Mode.'
      }
    },
    {
      '@type': 'Question',
      name: 'Can I remain anonymous on Degentalk?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Absolutely. We respect the degen way - no KYC, no real names required. Pick your username, build your reputation, and let your posts speak for themselves. Your privacy is yours to keep.'
      }
    }
  ]
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
      
      <div className="min-h-screen bg-gradient-to-b from-zinc-950 to-black">
        <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                Frequently Asked Questions
              </h1>
              <p className="text-lg text-zinc-400">
                Everything you need to know about Degentalk
              </p>
            </div>
            
            <FAQ />
            
            <div className="mt-12 text-center">
              <p className="text-zinc-400 mb-6">
                Still have questions? We're here to help.
              </p>
              <a
                href="/contact"
                className="inline-flex items-center px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-colors"
              >
                Contact Us
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}