import React, { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion'

// Import existing UI components (fixing the import paths)
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';


// Icons for that proper degen vibe
import { 
  Zap, 
  ShieldCheck, 
  Users, 
  TrendingUp, 
  MessageSquare,
  DollarSign,
  ArrowRight,
  Sparkles,
  AlertTriangle,
  Flame,
  LineChart,
  Infinity,
  AlarmClock
} from 'lucide-react';

import { 
  UserGroupIcon, 
  BanknotesIcon, 
  ChatBubbleLeftRightIcon, 
  TrophyIcon, 
  FingerPrintIcon, 
  BoltIcon 
} from '@heroicons/react/24/outline'; // Importing outline icons for consistency

// Degen taglines that rotate
const degenTaglines = [
  "The Next Wave of Community is Coming.",
  "Where Chaos Meets Community.",
  "Built for Degens, By Degens.",
  "Your New Digital Playground Awaits.",
  "Community. Economy. Pure Chaos.",
  "The Hub Where Risk Meets Reward.",
  "Get Ready to Touch Grass... Digitally.",
  "Warning: May Cause Extreme FOMO."
];

// Landing Header Component
const LandingNavBar = () => {
  return (
    <nav className="bg-black/95 backdrop-blur-sm text-white p-4 sticky top-0 z-50 border-b border-zinc-800">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center">
          {/* Removed colored logo, just typography */}
          <span className="text-xl font-bold tracking-tight text-white">Degentalk™</span>
        </div>
        <a 
          href="#subscribe" 
          className="text-zinc-300 hover:text-white transition-colors font-medium"
        >
          Get Early Access
        </a>
      </div>
    </nav>
  );
};

// Epic Hero Section with rotating taglines
const LandingHeroSection = () => {
  const [currentTagline, setCurrentTagline] = useState(0);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTagline((prev) => (prev + 1) % degenTaglines.length);
    }, 3000); // Faster rotation for hype
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative overflow-hidden bg-black min-h-screen flex items-center">
      {/* Subtle monochrome background */}
      <div className="absolute inset-0 bg-gradient-to-tr from-zinc-900 via-zinc-950 to-black opacity-90" />
      {/* Mesh pattern overlay (neutralized color) */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZwdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMyMDIwMjAiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRoLTJ2LTRoMnY0em0wLTZoLTJ2LTRoMnY0em0wLTZoLTJ2LTRoMnY0em0wLTZoLTJWNmgydjR6bTAgMzBoLTJ2LTRoMnY0em0wLTZoLTJ2LTRoMnY0ek0zMCAzNGgtMnYtNGgydjR6bTAtNmgtMnYtNGgydjR6bTAtNmgtMnYtNGgydjR6bTAtNmgtMlY2aDJ2NHptMCAzMGgtMnYtNGgydjR6bTAtNmgtMnYtNGgydjR6TTI0IDM0aC0ydi00aDJ2NHptMC02aC0ydi00aDJ2NHptMC02aC0ydi00aDJ2NHptMC02aC0yVjZoMnY0em0wIDMwaC0ydi00aDJ2NHptMC02aC0ydi00aDJ2NHoiIC8+PC9nPjwvZz48L3N2Zz4=')] opacity-10" />
      {/* Remove floating orbs and color pulses for a cleaner look */}
      
      <div className="container mx-auto px-4 py-16 md:py-24 lg:py-32 relative z-10">
        <motion.div 
          className="max-w-4xl mx-auto text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          {/* Moved and rephrased warning badge */}
          <motion.p 
            className="inline-flex items-center gap-2 bg-zinc-900/20 border border-zinc-700 text-zinc-400 px-3 py-1 rounded-full text-sm mb-6"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            🚨 Currently in stealth mode. Please don't tell the SEC.
          </motion.p>

          {/* Rotating taglines */}
          <div className="h-[120px] md:h-[140px] lg:h-[168px] flex items-center justify-center mb-6">
            <AnimatePresence mode="wait">
              <motion.h1
                key={currentTagline}
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -30, scale: 0.95 }}
                transition={{ duration: 0.6, ease: "easeInOut" }}
                className="text-4xl md:text-5xl lg:text-7xl font-bold text-white text-center leading-tight"
                style={{
                  textShadow: '0 2px 4px rgba(0,0,0,0.5), 0 8px 32px rgba(255,255,255,0.1)'
                }}
              >
                {degenTaglines[currentTagline]}
              </motion.h1>
            </AnimatePresence>
          </div>
          
          <motion.p 
            className="text-lg md:text-xl text-zinc-400 mb-8 max-w-2xl mx-auto leading-relaxed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
          >
             Degentalk is launching soon with dynamic community zones, an integrated economy, and real-time discussion. Be among the first to experience the future of online communities.
          </motion.p>
          
          {/* CTA Buttons - updated text and removed icons */}
          <motion.div 
            className="flex flex-col sm:flex-row gap-4 justify-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button 
                size="lg" 
                className="bg-zinc-900 border border-zinc-700 text-white hover:bg-zinc-800 hover:border-zinc-600 transition-all duration-300 text-lg px-8 py-6"
                onClick={() => document.getElementById('subscribe')?.scrollIntoView({ behavior: 'smooth' })}
              >
                🧬 Get Early Access
              </Button>
            </motion.div>
            
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button 
                size="lg" 
                variant="outline"
                className="border-zinc-700 text-zinc-300 hover:text-white hover:border-zinc-600 transition-all duration-300 text-lg px-8 py-6"
                onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
              >
                👁️ Lurk What's Coming
              </Button>
            </motion.div>
          </motion.div>

          {/* Launch countdown or status */}
          <motion.div 
            className="text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.8 }}
          >
             <p className="text-zinc-500 text-sm mb-2">📈 500+ Early Addicts</p>
             <div className="flex items-center justify-center gap-2 text-zinc-500">
               <div className="w-2 h-2 bg-zinc-500 rounded-full animate-pulse"></div>
               <span className="text-sm font-medium">Launch: Soon™</span>
             </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

// Feature cards with proper degen vibes
interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  comingSoon?: boolean;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description, comingSoon = false }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      whileHover={{ y: -5, scale: 1.02 }}
    >
      <Card className="bg-zinc-900/80 backdrop-blur-sm border-zinc-800 text-white h-full hover:border-zinc-700 transition-all duration-300 relative overflow-hidden group">
        {comingSoon && (
          <div className="absolute top-3 right-3 bg-yellow-500/20 text-yellow-400 text-xs px-2 py-1 rounded-full border border-yellow-500/30">
            Soon™
          </div>
        )}
        
        <CardHeader className="items-center text-center pb-4">
          <div className="p-4 rounded-full bg-zinc-800/50 text-zinc-400 mb-4 group-hover:scale-110 transition-transform duration-300">
            {icon}
          </div>
          <CardTitle className="text-xl font-bold">{title}</CardTitle>
        </CardHeader>
        
        <CardContent className="text-center">
          <p className="text-zinc-400 leading-relaxed">{description}</p>
        </CardContent>
        
        {/* Subtle hover effect */}
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-800/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      </Card>
    </motion.div>
  );
};

// Features section with compelling content
const FeaturesSection = () => {
  const features = [
    {
      icon: <UserGroupIcon className="w-8 h-8" />,
      title: "Dynamic Zones",
      description: "Like Reddit, if it had balls. Topic-focused forums for crypto cults, casino chasers, and conspiracy theorists with receipts. Pick a rabbit hole. Jump in.",
      comingSoon: false
    },
    {
      icon: <BanknotesIcon className="w-8 h-8" />,
      title: "Integrated Degen Economy",
      description: "XP, tokens, status — grind it all. Flex your flair. Unlock cosmetics. Enter token-gated hellscapes. Every click is a dopamine slot machine. Yes, there's a leaderboard. Yes, it matters.",
      comingSoon: true
    },
    {
      icon: <ChatBubbleLeftRightIcon className="w-8 h-8" />,
      title: "Real-Time Shitstorms",
      description: "Shoutboxes that hit like Discord in a bar fight. Live chat, instant posts, and no 5-second delay to regret your take. If Twitter was a terminal illness — this is it.",
      comingSoon: false
    },
    {
      icon: <TrophyIcon className="w-8 h-8" />,
      title: "Reputation & Regret",
      description: "Clout is currency. Gain XP by posting, tipping, simping, or losing publicly. Wrecked? Brag about it. Made it? We won't believe you.",
      comingSoon: true
    },
    {
      icon: <FingerPrintIcon className="w-8 h-8" />,
      title: "Verified Degeneracy",
      description: "Link your wallet. Show your sins. Earn badges, unlock cursed achievements, and climb the rep ladder. Normies stay filtered. Real ones get branded.",
      comingSoon: true
    },
    {
      icon: <BoltIcon className="w-8 h-8" />,
      title: "Lightning Fast",
      description: "Optimized for chaos. Your shitposts go live before your dopamine even registers.",
      comingSoon: false
    }
  ];

  return (
    <section id="features" className="py-16 md:py-24 bg-black relative">
      {/* Remove background effects for a cleaner, monochrome look */}
      <div className="container mx-auto px-4 relative z-10">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            ⚠️ What Even Is This?
          </h2>
          <p className="text-xl text-zinc-400 max-w-3xl mx-auto leading-relaxed mb-8">
            Degentalk is the last forum you'll ever need — or survive.
            <br/><br/>A high-speed, token-fueled, chaos-first community built for:
          </p>
          <ul className="text-lg text-zinc-400 list-disc list-inside mb-8 mx-auto max-w-prose">
            <li>Traders who hedge with hopium</li>
            <li>Posters who measure status in memes</li>
            <li>And anyone too online to ever log off</li>
          </ul>
          <blockquote className="text-zinc-500 italic text-md md:text-lg mb-8 max-w-2xl mx-auto border-l-2 border-zinc-700 pl-4 py-2">
            "Think of it as a basement with neon lights, bad ideas, and a leaderboard of lunatics."
          </blockquote>
          <p className="text-zinc-400 font-bold text-lg">You've been warned.</p>
        </motion.div>
        
        <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-12">🔥 Feature Dump (Wipe Hands Before Touching)</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <FeatureCard key={index} {...feature} />
          ))}
        </div>
      </div>
    </section>
  );
};

// Enhanced email subscription with proper validation
const EmailSubscriptionForm = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    
    if (!email || !email.includes('@')) {
      setStatus('error');
      setMessage('Please enter a valid email address');
      return;
    }

    setStatus('loading');
    
    try {
      // TODO: Replace with actual API endpoint
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      
      setStatus('success');
      setMessage("You're in! Check your email for confirmation.");
      setEmail('');
      
      // Reset status after 3 seconds
      setTimeout(() => {
        setStatus('idle');
        setMessage('');
      }, 3000);
      
    } catch (error) {
      setStatus('error');
      setMessage('Something went wrong. Please try again.');
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <Input
            type="email"
            value={email}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
            placeholder="Enter your email for early access"
            required
            disabled={status === 'loading'}
            className="flex-grow bg-zinc-800/80 border-zinc-700 text-white placeholder-zinc-500 focus:ring-red-500 focus:border-red-500 transition-all duration-300"
          />
          <Button 
            type="submit" 
            disabled={status === 'loading'}
            className="bg-zinc-900 border border-zinc-700 text-white hover:bg-zinc-800 hover:border-zinc-600 shadow-lg whitespace-nowrap px-6"
          >
            {status === 'loading' ? (
              <div className="flex items-center">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                Joining...
              </div>
            ) : (
              '👉 Notify Me on Launch'
            )}
          </Button>
        </div>
        
        {/* Status messages */}
        {message && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`text-center text-sm ${
               status === 'success' ? 'text-green-400' : 'text-red-400'
             }`}
          >
            {message}
          </motion.div>
        )}
      </form>
      
      <p className="text-xs text-zinc-500 mt-4 text-center">
        No spam. No mercy. Unsubscribe if you're weak.
      </p>
    </div>
  );
};

// CTA section with urgency
const CtaSection = () => {
  return (
    <section id="subscribe" className="py-16 md:py-24 bg-zinc-950 relative overflow-hidden">
      {/* Removed colored background effects */}
      <div className="container mx-auto px-4 text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="max-w-3xl mx-auto"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            🧼 Stop Using Clean Internet
          </h2>
          
          <p className="text-xl text-zinc-300 mb-8 leading-relaxed">
            Legacy platforms are for boomers and bots.
            <br/>Degentalk is for freaks, fiends, and financial masochists.
            <br/>Get in before the OGs rug it all.
          </p>
          
          <EmailSubscriptionForm />
          
          {/* Social proof */}
          <motion.div 
            className="mt-12 flex items-center justify-center gap-8 text-zinc-500"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
          >
            <div className="text-center">
              <div className="text-2xl font-bold text-zinc-300"><LineChart className="inline-block mr-2" />500+</div>
              <div className="text-xs">Early Addicts</div>
            </div>
            <div className="w-px h-8 bg-zinc-700" />
            <div className="text-center">
              <div className="text-2xl font-bold text-zinc-300"><Infinity className="inline-block mr-2" /></div>
              <div className="text-xs">Chaos Potential</div>
            </div>
            <div className="w-px h-8 bg-zinc-700" />
            <div className="text-center">
              <div className="text-2xl font-bold text-zinc-300"><AlarmClock className="inline-block mr-2" /></div>
              <div className="text-xs">Launch Date</div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

// Footer with proper degen attitude
const LandingFooter = () => {
  return (
    <footer className="bg-black text-zinc-400 py-12 border-t border-zinc-800">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center mb-4 md:mb-0">
            <span className="ml-2 text-xl font-bold text-white">Degentalk™</span>
          </div>
          
          <div className="text-center md:text-right">
            <p className="text-sm mb-2">
              Built by degenerates. Powered by delusion.
            </p>
            <p className="text-xs text-zinc-600">
              &copy; {new Date().getFullYear()} Degentalk. Not financial advice. Don't show this to your lawyer.
            </p>
          </div>
        </div>
        
        {/* Easter egg */}
        <div className="text-center mt-8 pt-8 border-t border-zinc-900">
          <p className="text-xs text-zinc-600 font-mono">
            // TODO: Deploy the cult
          </p>
        </div>
      </div>
    </footer>
  );
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col font-sans">
      <LandingNavBar />
      <LandingHeroSection />
      <FeaturesSection />
      <CtaSection />
      <LandingFooter />
    </div>
  );
}
