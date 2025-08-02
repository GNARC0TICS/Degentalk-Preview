'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { SectionBackground } from '@/components/ViewportBackground';
import { ArrowLeft } from 'lucide-react';
import { Link } from '@/lib/router-compat';

export function TermsOfService() {
  return (
    <SectionBackground variant="solid" intensity={0.15} className="min-h-screen py-16 sm:py-20 md:py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
        
        {/* Back to Home */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <a 
            href="/"
            className="inline-flex items-center text-emerald-400 hover:text-emerald-300 transition-colors duration-200 group"
          >
            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform duration-200" />
            Back to Degentalk
          </a>
        </motion.div>

        {/* Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white mb-4 tracking-tight">
            Terms of Service
          </h1>
          <p className="text-lg text-zinc-300 max-w-2xl mx-auto">
            The rules of engagement for your journey into degeneracy.
          </p>
          <p className="text-sm text-zinc-400 mt-2">
            Last updated: December 19, 2024
          </p>
        </motion.div>

        {/* Content */}
        <motion.div
          className="prose prose-invert prose-emerald max-w-none"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <div className="space-y-8 text-zinc-300">

            <section>
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
                  <strong>Degentalk™ Forums:</strong> A blockchain-based community platform for traders, 
                  crypto enthusiasts, and anyone who enjoys calculated risks with their investments.
                </p>
                <p>
                  <strong>Beta Access:</strong> Waitlist members get early access to features, DGT tokens, 
                  and founding member benefits when we launch.
                </p>
                <p>
                  <strong>Community Standards:</strong> We maintain high standards for discourse while 
                  embracing the satirical nature of crypto culture.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">Account and Waitlist</h2>
              <div className="space-y-4">
                <p>
                  <strong>Eligibility:</strong> You must be at least 18 years old to join our waitlist or use our services.
                </p>
                <p>
                  <strong>Account Security:</strong> You're responsible for maintaining the security of your account credentials.
                </p>
                <p>
                  <strong>Accurate Information:</strong> Provide truthful information when signing up. We use this to notify you about launches and updates.
                </p>
                <p>
                  <strong>One Account:</strong> Multiple accounts or gaming the waitlist system is prohibited.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">Community Guidelines</h2>
              <div className="space-y-4">
                <p>
                  <strong>Respectful Discourse:</strong> Satirical humor is welcome, but harassment, doxxing, or personal attacks are not tolerated.
                </p>
                <p>
                  <strong>No Financial Advice:</strong> All content is for entertainment and educational purposes only. Nothing on Degentalk™ constitutes financial advice.
                </p>
                <p>
                  <strong>Content Ownership:</strong> You retain rights to your content, but grant us license to display and moderate it within our platform.
                </p>
                <p>
                  <strong>Prohibited Activities:</strong> No spam, scams, illegal activities, or attempts to manipulate markets or prices.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">DGT Token Economy</h2>
              <div className="space-y-4">
                <p>
                  <strong>Utility Token:</strong> DGT tokens are utility tokens used for tipping, purchasing cosmetics, and platform features.
                </p>
                <p>
                  <strong>No Investment Promise:</strong> DGT tokens are not investments and have no guaranteed value or returns.
                </p>
                <p>
                  <strong>Platform Use Only:</strong> Tokens are designed for use within the Degentalk™ ecosystem only.
                </p>
                <p>
                  <strong>Founding Members:</strong> Early community members receive token allocations as recognition for early support.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">Disclaimers and Risks</h2>
              <div className="space-y-4">
                <p>
                  <strong>Not Financial Advice:</strong> Everything on Degentalk™ is for entertainment. We are not financial advisors, and our content should not be used for investment decisions.
                </p>
                <p>
                  <strong>Crypto Risks:</strong> Cryptocurrency trading involves substantial risk of loss. Only invest what you can afford to lose.
                </p>
                <p>
                  <strong>Platform Risks:</strong> Beta software may have bugs. Use at your own risk during early access periods.
                </p>
                <p>
                  <strong>Community Content:</strong> User-generated content represents individual opinions, not platform endorsements.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">Intellectual Property</h2>
              <div className="space-y-4">
                <p>
                  <strong>Our IP:</strong> Degentalk™'s branding, software, and unique features are our intellectual property.
                </p>
                <p>
                  <strong>User Content:</strong> You retain ownership of your posts and content, but grant us rights to display and moderate them.
                </p>
                <p>
                  <strong>Third-Party Content:</strong> Respect copyright and intellectual property rights when sharing content.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">Limitation of Liability</h2>
              <div className="space-y-4">
                <p>
                  <strong>Platform Availability:</strong> We strive for high uptime but cannot guarantee uninterrupted service.
                </p>
                <p>
                  <strong>Financial Losses:</strong> We are not liable for any financial losses resulting from your trading decisions or use of our platform.
                </p>
                <p>
                  <strong>User Interactions:</strong> We facilitate community interaction but are not responsible for disputes between users.
                </p>
                <p>
                  <strong>Maximum Liability:</strong> Our total liability is limited to $100 or the amount you've paid us, whichever is greater.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">Termination</h2>
              <div className="space-y-4">
                <p>
                  <strong>Your Right:</strong> You can stop using our services and request account deletion at any time.
                </p>
                <p>
                  <strong>Our Right:</strong> We may terminate accounts that violate these terms or engage in harmful behavior.
                </p>
                <p>
                  <strong>Effect:</strong> Upon termination, your access ends, but certain provisions (like disclaimers) survive.
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
              <div className="mt-4 p-4 bg-zinc-800/50 rounded-lg border border-zinc-700/50">
                <p><strong>Email:</strong> degentalk.io@gmail.com</p>
                <p><strong>Alternative:</strong> admin@degentalk.info</p>
                <p><strong>Websites:</strong> degentalk.io • degentalk.xyz • degentalk.net • degentalk.org • degentalk.info • degentalk.app</p>
                <p className="text-sm text-zinc-400 mt-2">
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
        </motion.div>
      </div>
    </SectionBackground>
  );
}