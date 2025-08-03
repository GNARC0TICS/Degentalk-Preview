'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Mail, ArrowRight, CheckCircle } from 'lucide-react';
import { trackNewsletterSignup, trackCTAClick } from '@/lib/analytics';
import { cn } from '@/lib/utils';
import { logger } from '@/lib/logger';

// Email signup configuration

export function EmailSignup() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [waitlistCount, setWaitlistCount] = useState(134); // Default value

  // Fetch waitlist count on mount
  useEffect(() => {
    fetch('/api/visitors')
      .then(res => res.json())
      .then(data => {
        if (data.waitlistSignups) {
          setWaitlistCount(data.waitlistSignups);
        }
      })
      .catch(err => logger.error('EmailSignup', 'Failed to fetch waitlist count', err));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !email.includes('@')) {
      setErrorMessage('Please enter a valid email address');
      setStatus('error');
      return;
    }

    setStatus('loading');
    trackCTAClick('email_signup', 'email_section');

    try {
      // Track the signup intent
      trackNewsletterSignup(email, 'email_section');
      
      // Submit to our API
      const response = await fetch('/api/visitors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'incrementWaitlist', email })
      });
      
      if (!response.ok) {
        throw new Error('Failed to submit');
      }
      
      const data = await response.json();
      
      // Update the count with the server response
      if (data.newCount) {
        setWaitlistCount(data.newCount);
      }
      
      setStatus('success');
      setEmail('');
      
      // Reset after 5 seconds
      setTimeout(() => setStatus('idle'), 5000);
    } catch (error) {
      setStatus('error');
      setErrorMessage('Something went wrong. Please try again.');
    }
  };

  return (
    <section id="newsletter-signup" className="py-16 sm:py-20 md:py-24 relative scroll-mt-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-2xl relative z-10">
          
          {/* Section Header */}
          <motion.div
            className="text-center mb-8"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center justify-center gap-3 mb-4">
              <Mail className="w-8 h-8 text-emerald-400" />
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight">
                Join the Waitlist
              </h2>
            </div>
            <p className="text-base sm:text-lg text-zinc-300 max-w-lg mx-auto">
              Be the first to know when we launch. Get exclusive early access and founding member benefits.
            </p>
          </motion.div>

          {/* Email Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <form onSubmit={handleSubmit} className="relative" aria-label="Email newsletter signup">
              <div className="relative group">
                {/* Background glow effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-purple-500/20 rounded-xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity" />
                
                {/* Form container */}
                <div className="relative bg-zinc-800/80 backdrop-blur-sm rounded-xl border border-zinc-700/50 p-2">
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      disabled={status === 'loading' || status === 'success'}
                      aria-label="Email address"
                      aria-required="true"
                      aria-invalid={status === 'error'}
                      aria-describedby={status === 'error' ? 'email-error' : undefined}
                      className={cn(
                        "flex-1 px-4 py-3 bg-zinc-900/50 border border-zinc-700/50 rounded-lg",
                        "text-white placeholder-zinc-400",
                        "focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50",
                        "disabled:opacity-50 disabled:cursor-not-allowed",
                        "transition-all duration-200"
                      )}
                    />
                    <button
                      type="submit"
                      disabled={status === 'loading' || status === 'success'}
                      aria-label={status === 'loading' ? 'Joining waitlist...' : status === 'success' ? 'Successfully joined' : 'Join the waitlist'}
                      className={cn(
                        "px-6 py-3 rounded-lg font-semibold",
                        "bg-gradient-to-r from-emerald-500 to-emerald-600",
                        "text-white shadow-lg",
                        "hover:from-emerald-600 hover:to-emerald-700",
                        "focus:outline-none focus:ring-2 focus:ring-emerald-500/50",
                        "disabled:opacity-50 disabled:cursor-not-allowed",
                        "transition-all duration-200",
                        "flex items-center gap-2 whitespace-nowrap"
                      )}
                    >
                      {status === 'loading' ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                          <span>Joining...</span>
                        </>
                      ) : status === 'success' ? (
                        <>
                          <CheckCircle className="w-4 h-4" />
                          <span>You're in!</span>
                        </>
                      ) : (
                        <>
                          <span>Join Waitlist</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Status messages */}
              {status === 'error' && (
                <motion.p
                  id="email-error"
                  role="alert"
                  aria-live="polite"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-2 text-sm text-red-400 text-center"
                >
                  {errorMessage}
                </motion.p>
              )}
              
              {status === 'success' && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-2 text-sm text-emerald-400 text-center"
                >
                  Welcome to the DegenTalk waitlist! We'll notify you when we launch.
                </motion.p>
              )}
            </form>

            {/* Privacy notice */}
            <p className="mt-4 text-xs text-zinc-500 text-center">
              We respect your privacy. No spam, ever. 
              <a href="/legal/privacy" className="text-emerald-400 hover:text-emerald-300 ml-1">
                Privacy Policy
              </a>
            </p>
          </motion.div>

          {/* Stats */}
          <motion.div
            className="mt-12 text-center"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            viewport={{ once: true }}
          >
            <p className="text-zinc-400 text-sm">
              Join <span className="text-emerald-400 font-display text-lg">{waitlistCount.toLocaleString()}</span> degens already on the waitlist
            </p>
          </motion.div>
        </div>
    </section>
  );
}