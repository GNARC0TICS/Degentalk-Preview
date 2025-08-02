export const dynamic = 'force-dynamic';
import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Terms of Service - Degentalk | Community Crypto Forum',
  description: 'Read Degentalk\'s terms of service. By using our crypto community forum platform, you agree to these terms and conditions.',
  keywords: 'degentalk terms, terms of service, user agreement, crypto forum terms, platform rules, community guidelines',
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: 'Terms of Service - Degentalk',
    description: 'Terms and conditions for using the Degentalk crypto community forum platform.',
    type: 'website',
    url: 'https://degentalk.net/legal/terms',
  },
  alternates: {
    canonical: 'https://degentalk.net/legal/terms',
  },
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
      name: 'Legal',
      item: 'https://degentalk.net/legal'
    },
    {
      '@type': 'ListItem',
      position: 3,
      name: 'Terms of Service',
      item: 'https://degentalk.net/legal/terms'
    }
  ]
};

// WebPage schema with terms of service markup
const termsSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'Terms of Service',
  description: 'Terms and conditions for using the Degentalk crypto community forum platform.',
  url: 'https://degentalk.net/legal/terms',
  dateModified: '2024-12-19',
  publisher: {
    '@type': 'Organization',
    name: 'Degentalk',
    url: 'https://degentalk.net'
  }
};

export default function TermsOfServicePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbSchema),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(termsSchema),
        }}
      />
      
      <div className="min-h-screen py-16 sm:py-20 md:py-24 bg-gradient-to-b from-zinc-950 to-black">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
          
          {/* Back to Home - matching Contact/FAQ pages */}
          <div className="mb-8">
            <Link 
              href="/"
              className="inline-flex items-center text-emerald-400 hover:text-emerald-300 transition-colors duration-200 group"
            >
              <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform duration-200" />
              Back to Degentalk
            </Link>
          </div>

          {/* Header - matching Contact/FAQ pages */}
          <div className="text-center mb-12">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-display uppercase tracking-wide text-white mb-4">
              Terms of Service
            </h1>
            <p className="text-lg text-zinc-300 max-w-2xl mx-auto">
              The rules of engagement for your journey into degeneracy.
            </p>
            <p className="text-sm text-zinc-400 mt-2">
              Last updated: December 19, 2024
            </p>
          </div>

          {/* Content */}
          <div className="prose prose-invert prose-emerald max-w-none">
            <div className="space-y-12 text-zinc-300">

              <section className="bg-zinc-800/30 rounded-lg p-6 border border-zinc-700/50">
                <h2 className="text-2xl font-bold text-white mb-4">Welcome to Degentalk</h2>
                <p>
                  By joining our waitlist or using our services, you agree to these Terms of Service. 
                  If you don't agree with these terms, please don't use our platform. We're building 
                  something special here, and we need everyone to play by the rules.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">What We're Building</h2>
                <div className="space-y-4">
                  <p>
                    <strong className="text-emerald-400">Degentalk™ Forums:</strong> A blockchain-based community platform for traders, 
                    crypto enthusiasts, and anyone who enjoys calculated risks with their investments.
                  </p>
                  <p>
                    <strong className="text-emerald-400">Beta Access:</strong> Waitlist members get early access to features, DGT tokens, 
                    and founding member benefits when we launch.
                  </p>
                  <p>
                    <strong className="text-emerald-400">Community Standards:</strong> We maintain high standards for discourse while 
                    embracing the satirical nature of crypto culture.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">Account and Waitlist</h2>
                <div className="space-y-4">
                  <p>
                    <strong className="text-emerald-400">Eligibility:</strong> You must be at least 18 years old to join our waitlist or use our services.
                  </p>
                  <p>
                    <strong className="text-emerald-400">Account Security:</strong> You're responsible for maintaining the security of your account credentials.
                  </p>
                  <p>
                    <strong className="text-emerald-400">Accurate Information:</strong> Provide truthful information when signing up. We use this to notify you about launches and updates.
                  </p>
                  <p>
                    <strong className="text-emerald-400">One Account:</strong> Multiple accounts or gaming the waitlist system is prohibited.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">Community Guidelines</h2>
                <div className="space-y-4">
                  <p>
                    <strong className="text-emerald-400">Respectful Discourse:</strong> Satirical humor is welcome, but harassment, doxxing, or personal attacks are not tolerated.
                  </p>
                  <p>
                    <strong className="text-emerald-400">No Financial Advice:</strong> All content is for entertainment and educational purposes only. Nothing on Degentalk™ constitutes financial advice.
                  </p>
                  <p>
                    <strong className="text-emerald-400">Content Ownership:</strong> You retain rights to your content, but grant us license to display and moderate it within our platform.
                  </p>
                  <p>
                    <strong className="text-emerald-400">Prohibited Activities:</strong> No spam, scams, illegal activities, or attempts to manipulate markets or prices.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">DGT Token Economy</h2>
                <div className="space-y-4">
                  <p>
                    <strong className="text-emerald-400">Utility Token:</strong> DGT tokens are utility tokens used for tipping, purchasing cosmetics, and platform features.
                  </p>
                  <p>
                    <strong className="text-emerald-400">No Investment Promise:</strong> DGT tokens are not investments and have no guaranteed value or returns.
                  </p>
                  <p>
                    <strong className="text-emerald-400">Platform Use Only:</strong> Tokens are designed for use within the Degentalk™ ecosystem only.
                  </p>
                  <p>
                    <strong className="text-emerald-400">Founding Members:</strong> Early community members receive token allocations as recognition for early support.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">Disclaimers and Risks</h2>
                <div className="space-y-4">
                  <p>
                    <strong className="text-emerald-400">Not Financial Advice:</strong> Everything on Degentalk™ is for entertainment. We are not financial advisors, and our content should not be used for investment decisions.
                  </p>
                  <p>
                    <strong className="text-emerald-400">Crypto Risks:</strong> Cryptocurrency trading involves substantial risk of loss. Only invest what you can afford to lose.
                  </p>
                  <p>
                    <strong className="text-emerald-400">Platform Risks:</strong> Beta software may have bugs. Use at your own risk during early access periods.
                  </p>
                  <p>
                    <strong className="text-emerald-400">Community Content:</strong> User-generated content represents individual opinions, not platform endorsements.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">Intellectual Property</h2>
                <div className="space-y-4">
                  <p>
                    <strong className="text-emerald-400">Our IP:</strong> Degentalk™'s branding, software, and unique features are our intellectual property.
                  </p>
                  <p>
                    <strong className="text-emerald-400">User Content:</strong> You retain ownership of your posts and content, but grant us rights to display and moderate them.
                  </p>
                  <p>
                    <strong className="text-emerald-400">Third-Party Content:</strong> Respect copyright and intellectual property rights when sharing content.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">Limitation of Liability</h2>
                <div className="space-y-4">
                  <p>
                    <strong className="text-emerald-400">Platform Availability:</strong> We strive for high uptime but cannot guarantee uninterrupted service.
                  </p>
                  <p>
                    <strong className="text-emerald-400">Financial Losses:</strong> We are not liable for any financial losses resulting from your trading decisions or use of our platform.
                  </p>
                  <p>
                    <strong className="text-emerald-400">User Interactions:</strong> We facilitate community interaction but are not responsible for disputes between users.
                  </p>
                  <p>
                    <strong className="text-emerald-400">Maximum Liability:</strong> Our total liability is limited to $100 or the amount you've paid us, whichever is greater.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">Termination</h2>
                <div className="space-y-4">
                  <p>
                    <strong className="text-emerald-400">Your Right:</strong> You can stop using our services and request account deletion at any time.
                  </p>
                  <p>
                    <strong className="text-emerald-400">Our Right:</strong> We may terminate accounts that violate these terms or engage in harmful behavior.
                  </p>
                  <p>
                    <strong className="text-emerald-400">Effect:</strong> Upon termination, your access ends, but certain provisions (like disclaimers) survive.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">Changes to Terms</h2>
                <p>
                  We may update these terms as our platform evolves. Material changes will be communicated via email 
                  and posted on our website. Continued use after changes constitutes acceptance of the new terms.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">Governing Law</h2>
                <p>
                  These terms are governed by the laws of the United States. Any disputes will be resolved in 
                  the appropriate courts of jurisdiction where our company is based.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">Contact Information</h2>
                <p>
                  Questions about these Terms of Service? Reach out to us:
                </p>
                <div className="mt-4 p-6 bg-zinc-800/50 rounded-lg border border-zinc-700/50">
                  <p className="mb-2"><strong className="text-emerald-400">Email:</strong> <a href="mailto:degentalk.io@gmail.com" className="text-emerald-400 hover:text-emerald-300">degentalk.io@gmail.com</a></p>
                  <p className="mb-2"><strong className="text-emerald-400">Alternative:</strong> <a href="mailto:admin@degentalk.info" className="text-emerald-400 hover:text-emerald-300">admin@degentalk.info</a></p>
                  <p className="mb-2"><strong className="text-emerald-400">Websites:</strong> degentalk.io • degentalk.xyz • degentalk.net • degentalk.org • degentalk.info • degentalk.app</p>
                  <p className="text-sm text-zinc-400 mt-4">
                    We respond to all legal inquiries within 30 days.
                  </p>
                </div>
              </section>

              <section className="border-t border-zinc-700 pt-8 mt-12">
                <p className="text-sm text-zinc-400 italic hover:text-emerald-400 transition-colors duration-300">
                  These terms exist to protect both you and us while we build something amazing together. 
                  We're not trying to trick you with legal jargon—we just want to make sure everyone knows 
                  what they're getting into. Trade responsibly, engage respectfully, and welcome to the Degentalk™ community.
                </p>
              </section>

            </div>
          </div>
        </div>
      </div>
    </>
  );
}