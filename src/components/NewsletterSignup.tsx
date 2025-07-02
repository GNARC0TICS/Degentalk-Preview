import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { handleNewsletterSignup, initEmailJS } from '@/lib/email';
import { LoadingSpinner } from '@/components/LoadingSpinner';

interface FormState {
  email: string;
  status: 'idle' | 'loading' | 'success' | 'error' | 'offline';
  message: string;
  retryCount?: number;
}

export function NewsletterSignup() {
  const [form, setForm] = useState<FormState>({
    email: '',
    status: 'idle',
    message: '',
    retryCount: 0
  });

  // Initialize EmailJS on component mount
  useEffect(() => {
    initEmailJS();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!form.email) {
      setForm(prev => ({
        ...prev,
        status: 'error',
        message: 'Please enter your email address'
      }));
      return;
    }

    if (!isValidEmail(form.email)) {
      setForm(prev => ({
        ...prev,
        status: 'error',
        message: 'Please enter a valid email address'
      }));
      return;
    }

    setForm(prev => ({ ...prev, status: 'loading', message: '' }));

    try {
      // Check online status
      if (!navigator.onLine) {
        setForm(prev => ({
          ...prev,
          status: 'offline',
          message: 'You appear to be offline. Please check your connection and try again.'
        }));
        return;
      }

      // Use real email service
      const result = await handleNewsletterSignup(form.email);
      
      if (result.success) {
        setForm(prev => ({
          ...prev,
          status: 'success',
          message: result.message,
          email: '',
          retryCount: 0
        }));
      } else {
        setForm(prev => ({
          ...prev,
          status: 'error',
          message: result.message
        }));
      }
    } catch (error) {
      console.error('Newsletter signup error:', error);
      const retryCount = form.retryCount || 0;
      
      if (retryCount < 2) {
        setForm(prev => ({
          ...prev,
          status: 'error',
          message: `Connection failed. Click "Join Waitlist" to retry. (Attempt ${retryCount + 1}/3)`,
          retryCount: retryCount + 1
        }));
      } else {
        setForm(prev => ({
          ...prev,
          status: 'error',
          message: 'Unable to connect after multiple attempts. Please try again later or check your connection.',
          retryCount: 0
        }));
      }
    }
  };

  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  return (
    <section 
      id="newsletter-signup" 
      className="py-20 relative overflow-hidden"
    >
      {/* Multi-layered background with subtle purple accents */}
      <div className="absolute inset-0 bg-gradient-to-b from-zinc-900 to-black" />
      <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/3 via-transparent to-violet-500/2" />
      
      {/* Subtle glow effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/3 w-72 h-72 bg-purple-500/4 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/3 w-64 h-64 bg-violet-500/3 rounded-full blur-3xl" />
      </div>
      <div className="container mx-auto px-4 max-w-4xl relative z-10">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          {/* Header */}
          <div className="mb-12 flex flex-col lg:flex-row items-center lg:items-start gap-6 lg:gap-12 text-center lg:text-left">
            {/* Icon */}
            <motion.div
              className="flex-shrink-0 inline-flex items-center justify-center"
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <img
                src="/images/ANN.PNG"
                alt="Announcements Icon"
                className="h-32 w-auto sm:h-36 md:h-40 lg:h-48"
              />
            </motion.div>

            {/* Headline & subtext */}
            <div className="max-w-2xl">
              {(() => {
                const headlines = [
                  'HODL My Place',
                  'Let Me Lurk Early',
                  'Reserve Your Username',
                  'Stake Your Claim',
                  'Save Me a Spot 🚀',
                  'Unlock Beta Access',
                  'I\'m In — Notify Me',
                  'Claim Your Front-Row Seat'
                ] as const;
                const headline = useMemo(() =>
                  headlines[Math.floor(Math.random() * headlines.length)], []);
                return (
                  <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 lg:mb-6 leading-tight">
                    {headline}
                  </h2>
                );
              })()}

              <p className="text-xl text-zinc-300 leading-relaxed">
                Be the first to experience the most satirical crypto forum on the internet.
                Join our exclusive launch list for early access and founding member benefits.
              </p>
            </div>
          </div>

          {/* Newsletter Form */}
          <motion.div
            className="max-w-lg mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            viewport={{ once: true }}
          >
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <Input
                  type="email"
                  placeholder="Your email (we promise not to sell it... yet)"
                  value={form.email}
                  onChange={(e) => setForm(prev => ({ 
                    ...prev, 
                    email: e.target.value,
                    status: 'idle',
                    message: ''
                  }))}
                  className="flex-1 w-full min-w-0"
                  disabled={form.status === 'loading'}
                />
                <Button
                  type="submit"
                  disabled={form.status === 'loading' || form.status === 'success'}
                  className="border border-zinc-800 bg-black text-white hover:bg-zinc-900 hover:border-zinc-700 transition-colors duration-200 px-8"
                >
                  {form.status === 'loading' ? (
                    <div className="flex items-center space-x-2">
                      <LoadingSpinner size="sm" className="border-white/30 border-t-white" />
                      <span>Joining...</span>
                    </div>
                  ) : form.status === 'success' ? (
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4" />
                      <span>Joined!</span>
                    </div>
                  ) : (
                    'Join Waitlist'
                  )}
                </Button>
              </div>

              {/* Status Messages */}
              {form.message && (
                <motion.div
                  className={`flex items-center space-x-2 text-sm ${
                    form.status === 'success' 
                      ? 'text-emerald-400' 
                      : 'text-red-400'
                  }`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {form.status === 'success' ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    <AlertCircle className="w-4 h-4" />
                  )}
                  <span>{form.message}</span>
                </motion.div>
              )}
            </form>

            {/* Features List */}
            <motion.div
              className="mt-8 text-left"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              viewport={{ once: true }}
            >
              <p className="text-sm text-zinc-300 mb-4 text-center">
                What you'll get for trusting us with your email:
              </p>
              <ul className="space-y-2 text-sm text-zinc-300">
                {[
                  'Exclusive beta access (AKA: first to experience the bugs)',
                  'Founding member badge (flex on late adopters)',
                  'Early DGT token allocation (probably worth something)',
                  'Behind-the-scenes chaos and existential dev updates',
                  'Direct line to complain when things inevitably break'
                ].map((benefit, index) => (
                  <motion.li
                    key={index}
                    className="flex items-start space-x-2"
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    viewport={{ once: true }}
                  >
                    <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                    <span>{benefit}</span>
                  </motion.li>
                ))}
              </ul>
            </motion.div>

            {/* Privacy Note */}
            <motion.p
              className="text-xs text-zinc-400 mt-6"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.7 }}
              viewport={{ once: true }}
            >
              We respect your privacy. No spam, just premium cope content. 
              Your data stays safer than your portfolio.
            </motion.p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}