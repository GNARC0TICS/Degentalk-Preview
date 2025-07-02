import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Mail, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { handleNewsletterSignup, initEmailJS } from '@/lib/email';
import { LoadingSpinner } from '@/components/LoadingSpinner';

interface FormState {
  email: string;
  status: 'idle' | 'loading' | 'success' | 'error';
  message: string;
}

export function NewsletterSignup() {
  const [form, setForm] = useState<FormState>({
    email: '',
    status: 'idle',
    message: ''
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
      // Use real email service
      const result = await handleNewsletterSignup(form.email);
      
      if (result.success) {
        setForm(prev => ({
          ...prev,
          status: 'success',
          message: result.message,
          email: ''
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
      setForm(prev => ({
        ...prev,
        status: 'error',
        message: 'Something went wrong. Please try again later.'
      }));
    }
  };

  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  return (
    <section 
      id="newsletter-signup" 
      className="py-20 bg-gradient-to-b from-zinc-900 to-black"
    >
      <div className="container mx-auto px-4 max-w-4xl">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          {/* Header */}
          <div className="mb-12">
            <motion.div
              className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-full mb-6"
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <Mail className="w-8 h-8 text-white" />
            </motion.div>
            
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Join the{' '}
              <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                Degen Waitlist
              </span>
            </h2>
            
            <p className="text-xl text-zinc-300 max-w-2xl mx-auto leading-relaxed">
              Be the first to experience the most satirical crypto forum on the internet. 
              Get exclusive early access when we launch.
            </p>
          </div>

          {/* Newsletter Form */}
          <motion.div
            className="max-w-md mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            viewport={{ once: true }}
          >
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <Input
                  type="email"
                  placeholder="Enter your email address"
                  value={form.email}
                  onChange={(e) => setForm(prev => ({ 
                    ...prev, 
                    email: e.target.value,
                    status: 'idle',
                    message: ''
                  }))}
                  className="flex-1"
                  disabled={form.status === 'loading'}
                />
                <Button
                  type="submit"
                  disabled={form.status === 'loading' || form.status === 'success'}
                  className="bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white shadow-lg hover:shadow-emerald-500/25 transition-all duration-300 px-8"
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
              <p className="text-sm text-zinc-400 mb-4 text-center">
                What you'll get as an early member:
              </p>
              <ul className="space-y-2 text-sm text-zinc-300">
                {[
                  'Exclusive beta access before public launch',
                  'Founding member badge and special privileges',
                  'Early DGT token allocation',
                  'Behind-the-scenes development updates',
                  'Direct line to the development team'
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
              className="text-xs text-zinc-500 mt-6"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.7 }}
              viewport={{ once: true }}
            >
              We respect your privacy. No spam, no sharing your data. 
              Just launch updates and degen-worthy content.
            </motion.p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}