import React, { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion'

// Import existing UI components (fixing the import paths)
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
// import { LandingHeader } from '@/components/layout/landing-header';

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
  Flame
} from 'lucide-react';

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
          <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-yellow-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">
            D
          </div>
          <span className="ml-2 text-xl font-bold text-white">Degentalk</span>
        </div>
        <a 
          href="#subscribe" 
          className="text-red-400 hover:text-red-300 transition-colors font-medium"
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
    <section className="relative overflow-hidden bg-gradient-to-br from-zinc-950 via-zinc-900 to-black min-h-screen flex items-center">
             {/* Animated gradient background */}
       <div className="absolute inset-0 bg-gradient-to-tr from-red-500/10 via-yellow-500/5 to-green-500/10 animate-pulse" />
      
      {/* Mesh pattern overlay */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMyMDIwMjAiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRoLTJ2LTRoMnY0em0wLTZoLTJ2LTRoMnY0em0wLTZoLTJ2LTRoMnY0em0wLTZoLTJWNmgydjR6bTAgMzBoLTJ2LTRoMnY0em0wLTZoLTJ2LTRoMnY0ek0zMCAzNGgtMnYtNGgydjR6bTAtNmgtMnYtNGgydjR6bTAtNmgtMnYtNGgydjR6bTAtNmgtMlY2aDJ2NHptMCAzMGgtMnYtNGgydjR6bTAtNmgtMnYtNGgydjR6TTI0IDM0aC0ydi00aDJ2NHptMC02aC0ydi00aDJ2NHptMC02aC0ydi00aDJ2NHptMC02aC0yVjZoMnY0em0wIDMwaC0ydi00aDJ2NHptMC02aC0ydi00aDJ2NHoiIC8+PC9nPjwvZz48L3N2Zz4=')] opacity-20" />
      
             {/* Floating orbs for that digital chaos vibe */}
       <div className="absolute inset-0 overflow-hidden pointer-events-none">
         <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-500/5 rounded-full blur-3xl animate-pulse" />
         <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-green-500/5 rounded-full blur-3xl animate-pulse delay-1000" />
         <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-yellow-500/5 rounded-full blur-2xl animate-bounce" style={{ animationDuration: '3s' }} />
       </div>
      
      <div className="container mx-auto px-4 py-16 md:py-24 lg:py-32 relative z-10">
        <motion.div 
          className="max-w-4xl mx-auto text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          {/* Warning badge for that edgy vibe */}
          <motion.div 
            className="inline-flex items-center gap-2 bg-red-900/20 border border-red-500/30 text-red-400 px-3 py-1 rounded-full text-sm mb-6"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <AlertTriangle className="w-4 h-4" />
            <span>Pre-Launch Access Only</span>
          </motion.div>

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
                   textShadow: '0 2px 4px rgba(0,0,0,0.5), 0 8px 32px rgba(239,68,68,0.2)'
                 }}
              >
                {degenTaglines[currentTagline]}
              </motion.h1>
            </AnimatePresence>
          </div>
          
          <motion.p 
            className="text-lg md:text-xl text-zinc-300 mb-8 max-w-2xl mx-auto leading-relaxed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
                     >
             Degentalk is launching soon with <span className="text-red-400 font-semibold">dynamic community zones</span>, 
             an <span className="text-yellow-400 font-semibold">integrated economy</span>, 
             and <span className="text-green-400 font-semibold">real-time chaos</span>. 
             Be among the first degens to experience the future of online communities.
           </motion.p>
          
          {/* CTA Buttons */}
          <motion.div 
            className="flex flex-col sm:flex-row gap-4 justify-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                             <Button 
                 size="lg" 
                 className="bg-gradient-to-r from-red-600 to-yellow-600 hover:from-red-500 hover:to-yellow-500 text-white shadow-lg shadow-red-500/25 hover:shadow-red-500/40 transition-all duration-300 text-lg px-8 py-6"
                 onClick={() => document.getElementById('subscribe')?.scrollIntoView({ behavior: 'smooth' })}
               >
                <Flame className="w-5 h-5 mr-2" />
                Get Early Access
              </Button>
            </motion.div>
            
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button 
                size="lg" 
                variant="outline"
                className="border-zinc-700 text-zinc-300 hover:text-white hover:border-zinc-600 transition-all duration-300 text-lg px-8 py-6"
                onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
              >
                <Sparkles className="w-5 h-5 mr-2" />
                See What's Coming
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
                         <p className="text-zinc-500 text-sm mb-2">🚀 Currently in stealth mode</p>
             <div className="flex items-center justify-center gap-2 text-green-400">
               <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
               <span className="text-sm font-medium">Building something legendary...</span>
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
           <div className="p-4 rounded-full bg-gradient-to-br from-red-500/20 to-yellow-500/20 text-red-400 mb-4 group-hover:scale-110 transition-transform duration-300">
             {icon}
           </div>
          <CardTitle className="text-xl font-bold">{title}</CardTitle>
        </CardHeader>
        
        <CardContent className="text-center">
          <p className="text-zinc-400 leading-relaxed">{description}</p>
        </CardContent>
        
                 {/* Subtle hover effect */}
         <div className="absolute inset-0 bg-gradient-to-t from-red-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      </Card>
    </motion.div>
  );
};

// Features section with compelling content
const FeaturesSection = () => {
  const features = [
    {
      icon: <Users size={32} />,
      title: "Dynamic Zones",
      description: "Create and explore topic-focused communities. From crypto degen caves to meme laboratories - find your tribe and go full send.",
      comingSoon: false
    },
    {
      icon: <DollarSign size={32} />,
      title: "Integrated Economy",
      description: "Earn, spend, and flex with our platform economy. XP farming, exclusive cosmetics, and token-gated experiences for true degens.",
      comingSoon: true
    },
    {
      icon: <MessageSquare size={32} />,
      title: "Real-Time Chaos",
      description: "Live shoutboxes, instant discussions, and community-driven chaos. When the market moves, we move faster.",
      comingSoon: false
    },
    {
      icon: <TrendingUp size={32} />,
      title: "Reputation & Rewards",
      description: "Build your degen reputation through quality posts, community engagement, and by not getting rekt (too often).",
      comingSoon: true
    },
    {
      icon: <ShieldCheck size={32} />,
      title: "Verified Degeneracy",
      description: "Wallet connections, achievement systems, and verified degen status. Proof you're not just another normie.",
      comingSoon: true
    },
    {
      icon: <Zap size={32} />,
      title: "Lightning Fast",
      description: "Built for speed. No lag when the market pumps, no delays when you need to share that winning trade or epic loss.",
      comingSoon: false
    }
  ];

  return (
    <section id="features" className="py-16 md:py-24 bg-gradient-to-b from-black to-zinc-950 relative">
      {/* Background effects */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNFRjQ0NEQiIGZpbGwtb3BhY2l0eT0iMC4wMiI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iNCIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
      
      <div className="container mx-auto px-4 relative z-10">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Why Degentalk Will Be Your New Addiction
          </h2>
          <p className="text-xl text-zinc-400 max-w-3xl mx-auto leading-relaxed">
            We're building the ultimate platform for digital degenerates. Here's what's coming to absolutely destroy your productivity:
          </p>
        </motion.div>
        
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
             className="bg-gradient-to-r from-red-600 to-yellow-600 hover:from-red-500 hover:to-yellow-500 text-white shadow-lg whitespace-nowrap px-6"
           >
            {status === 'loading' ? (
              <div className="flex items-center">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                Joining...
              </div>
            ) : (
              'Get Notified'
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
        No spam, just launch updates and early access perks. 
        <br />
        <span className="text-emerald-400">Unsubscribe anytime, but why would you?</span>
      </p>
    </div>
  );
};

// CTA section with urgency
const CtaSection = () => {
  return (
    <section id="subscribe" className="py-16 md:py-24 bg-gradient-to-br from-zinc-900 via-zinc-950 to-black relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-full blur-3xl" />
      </div>
      
      <div className="container mx-auto px-4 text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="max-w-3xl mx-auto"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Don't Get Left Behind in the Old Web
          </h2>
          
          <p className="text-xl text-zinc-300 mb-8 leading-relaxed">
            While everyone else is still posting on legacy platforms, 
            <span className="text-emerald-400 font-semibold"> you could be pioneering the future</span>. 
            Join our early access list and be among the first to experience true digital degeneracy.
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
              <div className="text-2xl font-bold text-emerald-400">500+</div>
              <div className="text-xs">Early Adopters</div>
            </div>
            <div className="w-px h-8 bg-zinc-700" />
            <div className="text-center">
              <div className="text-2xl font-bold text-cyan-400">∞</div>
              <div className="text-xs">Chaos Potential</div>
            </div>
            <div className="w-px h-8 bg-zinc-700" />
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400">Soon™</div>
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
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-yellow-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                D
              </div>
              <span className="ml-2 text-xl font-bold text-white">Degentalk</span>
            </div>
          </div>
          
          <div className="text-center md:text-right">
            <p className="text-sm mb-2">
              Built by degens, for degens.
            </p>
            <p className="text-xs text-zinc-600">
              &copy; {new Date().getFullYear()} Degentalk. All rights reserved.
              <br />
              <span className="text-emerald-400">DYOR. Not financial advice. Probably a bad idea.</span>
            </p>
          </div>
        </div>
        
        {/* Easter egg */}
        <div className="text-center mt-8 pt-8 border-t border-zinc-900">
          <p className="text-xs text-zinc-600 font-mono">
            // TODO: Add more chaos
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
