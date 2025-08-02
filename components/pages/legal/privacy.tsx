'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { SectionBackground } from '@/components/ViewportBackground';
import { ArrowLeft } from 'lucide-react';
import { Link } from '@/lib/router-compat';

export function PrivacyPolicy() {
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
            Privacy Policy
          </h1>
          <p className="text-lg text-zinc-300 max-w-2xl mx-auto">
            Your privacy matters to us. Here's how we handle your data responsibly.
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
              <h2 className="text-2xl font-bold text-white mb-4">Information We Collect</h2>
              <div className="space-y-4">
                <p>
                  <strong>Email Addresses:</strong> When you join our waitlist, we collect your email address to notify you about Degentalk™'s launch and provide updates about the platform.
                </p>
                <p>
                  <strong>Analytics Data:</strong> We use Google Analytics to understand how visitors interact with our site. This includes anonymous data about page views, time spent on site, and general location information.
                </p>
                <p>
                  <strong>Browser Data:</strong> We store basic information in your browser's local storage to track site analytics and provide a better user experience. This data never leaves your device.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">How We Use Your Information</h2>
              <ul className="list-disc list-inside space-y-2">
                <li>Send you updates about Degentalk™'s launch and development</li>
                <li>Provide early access to beta features and founding member benefits</li>
                <li>Improve our website and user experience through analytics</li>
                <li>Comply with legal obligations and protect our rights</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">Data Sharing and Disclosure</h2>
              <p>
                We don't sell your personal information. We may share your data only in these limited circumstances:
              </p>
              <ul className="list-disc list-inside space-y-2 mt-4">
                <li><strong>Service Providers:</strong> Third-party services like EmailJS and Google Analytics that help us operate our website</li>
                <li><strong>Legal Requirements:</strong> When required by law or to protect our rights and safety</li>
                <li><strong>Business Transfers:</strong> In the event of a merger or acquisition (users will be notified)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">Your Rights and Choices</h2>
              <div className="space-y-4">
                <p>
                  <strong>Unsubscribe:</strong> You can unsubscribe from our emails at any time using the link in every email we send.
                </p>
                <p>
                  <strong>Data Access:</strong> You can request access to the personal information we have about you.
                </p>
                <p>
                  <strong>Data Deletion:</strong> You can request that we delete your personal information, subject to certain legal limitations.
                </p>
                <p>
                  <strong>Analytics Opt-out:</strong> You can opt out of Google Analytics tracking by using the Google Analytics Opt-out Browser Add-on.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">Data Security</h2>
              <p>
                We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no internet transmission is 100% secure, so we cannot guarantee absolute security.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">Cookies and Tracking</h2>
              <div className="space-y-4">
                <p>
                  <strong>Essential Functionality:</strong> We use local storage to remember your preferences and provide core site functionality.
                </p>
                <p>
                  <strong>Analytics:</strong> Google Analytics uses cookies to help us understand site usage. These are used for statistical purposes only.
                </p>
                <p>
                  <strong>No Advertising Cookies:</strong> We don't use cookies for advertising or marketing tracking.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">International Users</h2>
              <p>
                Our services are hosted in the United States. If you're accessing our site from outside the US, your information may be transferred to and processed in the United States. By using our services, you consent to this transfer.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">Children's Privacy</h2>
              <p>
                Degentalk™ is not intended for users under 18 years of age. We do not knowingly collect personal information from children under 18. If we become aware that we have collected such information, we will delete it promptly.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">Changes to This Policy</h2>
              <p>
                We may update this privacy policy from time to time. We will notify users of any material changes by email and by posting a notice on our website. Your continued use of our services after such modifications constitutes acceptance of the updated policy.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">Contact Us</h2>
              <p>
                If you have any questions about this Privacy Policy or our data practices, please contact us at:
              </p>
              <div className="mt-4 p-4 bg-zinc-800/50 rounded-lg border border-zinc-700/50">
                <p><strong>Email:</strong> degentalk.io@gmail.com</p>
                <p><strong>Alternative:</strong> admin@degentalk.info</p>
                <p><strong>Websites:</strong> degentalk.io • degentalk.xyz • degentalk.net • degentalk.org • degentalk.info • degentalk.app</p>
                <p className="text-sm text-zinc-400 mt-2">
                  We aim to respond to all privacy inquiries within 30 days.
                </p>
              </div>
            </section>

            <section className="border-t border-zinc-700 pt-8 mt-12">
              <p className="text-sm text-zinc-400 italic hover:text-emerald-400 transition-colors duration-300">
                While we take your privacy seriously, we can't protect your portfolio from your own trading decisions. 
                That's between you and the market. Side effects of using Degentalk™ may include increased awareness 
                of your own poor financial choices, but enhanced entertainment value.
              </p>
            </section>

          </div>
        </motion.div>
      </div>
    </SectionBackground>
  );
}