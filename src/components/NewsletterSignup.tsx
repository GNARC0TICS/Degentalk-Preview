import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { handleNewsletterSignup, initEmailJS } from '@/lib/email';
import { trackNewsletterSignup, trackWaitlistConversion, trackCTAClick } from '@/lib/analytics';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { SectionBackground } from '@/components/ViewportBackground';

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
        // Track successful signup
        trackNewsletterSignup(form.email, 'landing_page');
        trackWaitlistConversion();
        
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
    <SectionBackground variant="solid" intensity={0.15} className="py-16 sm:py-20 md:py-24">
      <section 
        id="newsletter-signup" 
        className="relative scroll-mt-16"
      >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl relative z-10">
        <div className="text-center">
          {/* Header */}
          <div className="mb-8 sm:mb-10 lg:mb-12 flex flex-col lg:flex-row items-center lg:items-start gap-6 lg:gap-12 text-center lg:text-left">
            {/* Icon */}
            <div className="flex-shrink-0 inline-flex items-center justify-center">
              <div className="relative">
                <img
                  src="/images/replpace.png"
                  alt="Degentalk Community Icon - Join the waitlist for early access"
                  className="h-32 w-auto sm:h-36 md:h-40 lg:h-48 relative z-10 drop-shadow-2xl"
                  width="192"
                  height="192"
                  loading="lazy"
                  decoding="async"
                  style={{
                    filter: 'drop-shadow(0 20px 25px rgba(0, 0, 0, 0.4)) drop-shadow(0 8px 10px rgba(0, 0, 0, 0.2)) drop-shadow(0 0 15px rgba(16, 185, 129, 0.15))'
                  }}
                />
                <div 
                  className="absolute inset-0 bg-black/20 rounded-lg blur-xl transform translate-y-4 scale-95 -z-10"
                  style={{
                    background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.3) 0%, transparent 70%)'
                  }}
                />
              </div>
            </div>

            {/* Headline & subtext */}
            <div className="max-w-2xl">
              {(() => {
                const headlines = [
                  'Here Early?',
                  'Secure Your Spot',
                  'Unlock Beta Access',
                ] as const;
                const headline = useMemo(() =>
                  headlines[Math.floor(Math.random() * headlines.length)], []);
                return (
                  <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-white mb-4 lg:mb-6 leading-tight tracking-tight">
                    {headline}
                  </h2>
                );
              })()}

              <p className="text-base sm:text-lg md:text-xl text-zinc-300 leading-relaxed font-medium">
                Be the first to experience the joy of 2006 forums again. <span className="italic">(With some additional XP farming and a sprinkle of chaos...) </span>
                 Join our exclusive launch list for early access and founding member benefits.
              </p>
            </div>
          </div>

          {/* Newsletter Form */}
          <div className="max-w-lg mx-auto">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex flex-col gap-3">
                <div className="relative">
                  <Input
                    type="email"
                    placeholder="Email goes here, we promise we won't sell it... yet."
                    value={form.email}
                    onChange={(e) => setForm(prev => ({ 
                      ...prev, 
                      email: e.target.value,
                      status: 'idle',
                      message: ''
                    }))}
                    className="flex-1 w-full min-w-0 italic placeholder:italic placeholder:text-zinc-400 focus:border-emerald-500/50 focus:ring-emerald-500/20 transition-colors bg-zinc-800/50 border-zinc-600 relative z-10"
                    disabled={form.status === 'loading'}
                  />
                  <div className="absolute inset-0 rounded-md opacity-75 bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent bg-[length:200%_100%] animate-shimmer pointer-events-none" 
                       style={{
                         background: 'linear-gradient(90deg, transparent, rgba(16,185,129,0.15), transparent)',
                         backgroundSize: '200% 100%',
                         animation: 'shimmer 3s ease-in-out infinite'
                       }} />
                  <style>{`
                    @keyframes shimmer {
                      0% { background-position: -200% 0; }
                      100% { background-position: 200% 0; }
                    }
                  `}</style>
                </div>
                <Button
                  type="submit"
                  disabled={form.status === 'loading' || form.status === 'success'}
                  className="border border-zinc-800 bg-black text-white hover:bg-zinc-900 hover:border-emerald-500/30 transition-all duration-200 px-6 sm:px-8 py-3 font-semibold shadow-md hover:shadow-emerald-500/10 w-full"
                  onClick={() => trackCTAClick('newsletter_signup', 'signup_form')}
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
                    'Fine, I\'ll Join.'
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

            {/* Enhanced Benefits List */}
            <div className="mt-8">
              <p className="text-sm text-zinc-200 mb-6 text-center font-medium">
                What you'll get for trusting us with your email:
              </p>
              <ul className="space-y-3 max-w-md mx-auto">
                {[
                  'Early Access (AKA: first to experience the bugs)',
                  'Founding member badge (flex on late adopters)',
                  'Early $DGT token allocation (probably worth something)',
                  'Behind-the-scenes chaos and existential dev updates',
                  'Direct line to complain when things inevitably break'
                ].map((benefit, index) => (
                  <motion.li
                    key={index}
                    className="flex items-start space-x-3 text-center justify-center"
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    viewport={{ once: true }}
                  >
                    <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-zinc-200">{benefit}</span>
                  </motion.li>
                ))}
              </ul>
            </div>

            {/* Enhanced Privacy Note */}
            <motion.div 
              className="mt-8 p-4 bg-zinc-800/20 rounded-lg border border-zinc-700/30"
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              viewport={{ once: true }}
            >
              <p className="text-sm text-zinc-300 text-center leading-relaxed">
                <span className="font-medium text-zinc-200">Privacy Promise:</span> No spam, just premium content.<br/>
                <span className="italic text-zinc-400">Your data stays safer than your portfolio.</span>
              </p>
            </motion.div>
          </div>
        </div>
        </div>
      </section>
    </SectionBackground>
  );
}