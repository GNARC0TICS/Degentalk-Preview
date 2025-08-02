'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { SectionBackground } from '@/components/ViewportBackground';
import { ArrowLeft, Mail, MessageCircle, Github, Twitter, Send } from 'lucide-react';
import { Link } from '@/lib/router-compat';

export function Contact() {
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
          <Link 
            href="/"
            className="inline-flex items-center text-emerald-400 hover:text-emerald-300 transition-colors duration-200 group"
          >
            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform duration-200" />
            Back to Degentalk
          </Link>
        </motion.div>

        {/* Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-display uppercase tracking-wide text-white mb-4">
            Contact Us
          </h1>
          <p className="text-lg text-zinc-300 max-w-2xl mx-auto">
            Get in touch with the Degentalk team. We're here to help.
          </p>
        </motion.div>

        {/* Contact Methods */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          
          {/* General Contact */}
          <div className="bg-zinc-800/50 rounded-lg p-6 border border-zinc-700/50 hover:border-emerald-500/30 transition-all duration-300">
            <div className="flex items-center mb-4">
              <Mail className="w-8 h-8 text-emerald-400 mr-3" />
              <h2 className="text-xl font-bold text-white">General Inquiries</h2>
            </div>
            <p className="text-zinc-300 mb-4">
              Questions about Degentalk, partnerships, or general support.
            </p>
            <div className="space-y-1">
              <a 
                href="mailto:degentalk.io@gmail.com"
                className="block text-emerald-400 hover:text-emerald-300 transition-colors duration-200"
              >
                degentalk.io@gmail.com
              </a>
              <a 
                href="mailto:admin@degentalk.info"
                className="block text-emerald-400 hover:text-emerald-300 transition-colors duration-200"
              >
                admin@degentalk.info
              </a>
            </div>
          </div>

          {/* Community */}
          <div className="bg-zinc-800/50 rounded-lg p-6 border border-zinc-700/50 hover:border-emerald-500/30 transition-all duration-300">
            <div className="flex items-center mb-4">
              <MessageCircle className="w-8 h-8 text-emerald-400 mr-3" />
              <h2 className="text-xl font-bold text-white">Community</h2>
            </div>
            <p className="text-zinc-300 mb-4">
              Join our community channels for real-time updates and discussions.
            </p>
            <div className="space-y-2">
              <a 
                href="https://twitter.com/Degentalk_"
                className="flex items-center text-emerald-400 hover:text-emerald-300 transition-colors duration-200"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Twitter className="w-4 h-4 mr-2" />
                @Degentalk_
              </a>
              <span 
                className="flex items-center text-zinc-600 cursor-not-allowed"
              >
                <Github className="w-4 h-4 mr-2" />
                GitHub (Coming Soon)
              </span>
              <div className="text-xs text-zinc-500 mt-2">
                <strong>Mirror Sites:</strong> degentalk.io • degentalk.xyz • degentalk.net • degentalk.org • degentalk.info • degentalk.app
              </div>
            </div>
          </div>

        </motion.div>

        {/* Specific Contact Types */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          
          <div className="bg-zinc-800/30 rounded-lg p-6 border border-zinc-700/50 text-center">
            <h3 className="text-lg font-bold text-white mb-3">Technical Support</h3>
            <p className="text-zinc-400 text-sm mb-3">
              Bug reports, technical issues, or platform problems.
            </p>
            <div className="space-y-1">
              <a 
                href="mailto:degentalk.io@gmail.com"
                className="block text-emerald-400 hover:text-emerald-300 transition-colors duration-200 text-sm"
              >
                degentalk.io@gmail.com
              </a>
              <a 
                href="mailto:admin@degentalk.info"
                className="block text-emerald-400 hover:text-emerald-300 transition-colors duration-200 text-sm"
              >
                admin@degentalk.info
              </a>
            </div>
          </div>

          <div className="bg-zinc-800/30 rounded-lg p-6 border border-zinc-700/50 text-center">
            <h3 className="text-lg font-bold text-white mb-3">Business & Partnerships</h3>
            <p className="text-zinc-400 text-sm mb-3">
              Collaboration opportunities, partnerships, or business inquiries.
            </p>
            <div className="space-y-1">
              <a 
                href="mailto:degentalk.io@gmail.com"
                className="block text-emerald-400 hover:text-emerald-300 transition-colors duration-200 text-sm"
              >
                degentalk.io@gmail.com
              </a>
              <a 
                href="mailto:admin@degentalk.info"
                className="block text-emerald-400 hover:text-emerald-300 transition-colors duration-200 text-sm"
              >
                admin@degentalk.info
              </a>
            </div>
          </div>

          <div className="bg-zinc-800/30 rounded-lg p-6 border border-zinc-700/50 text-center">
            <h3 className="text-lg font-bold text-white mb-3">Privacy & Legal</h3>
            <p className="text-zinc-400 text-sm mb-3">
              Privacy concerns, legal questions, or data requests.
            </p>
            <div className="space-y-1">
              <a 
                href="mailto:degentalk.io@gmail.com"
                className="block text-emerald-400 hover:text-emerald-300 transition-colors duration-200 text-sm"
              >
                degentalk.io@gmail.com
              </a>
              <a 
                href="mailto:admin@degentalk.info"
                className="block text-emerald-400 hover:text-emerald-300 transition-colors duration-200 text-sm"
              >
                admin@degentalk.info
              </a>
            </div>
          </div>

        </motion.div>

        {/* Response Times */}
        <motion.div
          className="bg-zinc-800/30 rounded-lg p-6 border border-zinc-700/50 mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <h2 className="text-xl font-bold text-white mb-4 flex items-center">
            <Send className="w-5 h-5 mr-2 text-emerald-400" />
            Response Times
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold text-white mb-2">Expected Response Times:</h3>
              <ul className="text-zinc-300 space-y-1">
                <li>• <strong>General inquiries:</strong> 24-48 hours</li>
                <li>• <strong>Technical support:</strong> 24-72 hours</li>
                <li>• <strong>Business matters:</strong> 3-5 business days</li>
                <li>• <strong>Legal requests:</strong> 5-10 business days</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-2">Priority Support:</h3>
              <p className="text-zinc-300 text-sm">
                Founding members and early supporters receive priority support once the platform launches. 
                Critical security issues are addressed within 24 hours.
              </p>
            </div>
          </div>
        </motion.div>

        {/* FAQ Section */}
        <motion.div
          className="bg-zinc-800/30 rounded-lg p-6 border border-zinc-700/50"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
        >
          <h2 className="text-xl font-bold text-white mb-4">Before You Contact Us</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-white mb-2">Common Questions:</h3>
              <ul className="text-zinc-300 space-y-2 text-sm">
                <li><strong>When will Degentalk™ launch?</strong> We're in active development. Waitlist members get first access.</li>
                <li><strong>How do I get DGT tokens?</strong> Early community members receive token allocations at launch.</li>
                <li><strong>Is this financial advice?</strong> No, everything on Degentalk™ is for entertainment and community purposes only.</li>
                <li><strong>Can I invest in Degentalk™?</strong> We're not currently raising funds. Focus is on building the best community platform.</li>
              </ul>
            </div>
            <div className="pt-4 border-t border-zinc-700">
              <p className="text-zinc-400 text-sm">
                <strong>Still have questions?</strong> Check our FAQ section on the main page or reach out using the contact methods above.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Footer Note */}
        <motion.div
          className="mt-12 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1 }}
        >
          <p className="text-zinc-500 text-sm italic hover:text-emerald-400 transition-colors duration-300">
            We read every message and appreciate your interest in Degentalk™. 
            Thanks for being part of our community!
          </p>
        </motion.div>

      </div>
    </SectionBackground>
  );
}