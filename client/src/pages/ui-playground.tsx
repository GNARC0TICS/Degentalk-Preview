import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import '../styles/zone-themes.css'; // Import zone themes for zone cards
import { motion } from 'framer-motion';
import { 
  Wallet, 
  Trophy, 
  TrendingUp, 
  Users, 
  MessageSquare, 
  Zap,
  Flame,
  Shield,
  Lock,
  DollarSign,
  Coins,
  Rocket,
  Target,
  Sparkles,
  Crown,
  Gem,
  Star
} from 'lucide-react';

// Import demo data
import { 
  usernameTiers, 
  userTitles, 
  avatarFrameRarities, 
  cryptoIcons, 
  navSections 
} from './ui-playground/demo-data';

export default function UIPlayground() {
  const [activeSection, setActiveSection] = useState('buttons');
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  return (
    <div className={cn('min-h-screen transition-colors', isDarkMode ? 'bg-black text-white' : 'bg-white text-black')} data-theme={isDarkMode ? 'dark' : 'light'}>
      {/* Header */}
      <header className="sticky top-0 z-50 bg-zinc-900/95 backdrop-blur-md border-b border-zinc-800">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              DegenTalk UI Playground
            </h1>
            <p className="text-zinc-400 mt-1">Full design language showcase</p>
          </div>
          <Button
            variant="outline"
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="gap-2"
          >
            {isDarkMode ? '🌙 Dark' : '☀️ Light'}
          </Button>
        </div>
      </header>

      <div className="flex">
        {/* Sticky Side Navigation */}
        <nav className="sticky top-20 h-[calc(100vh-5rem)] w-64 bg-zinc-900/50 border-r border-zinc-800 p-4 overflow-y-auto">
          <div className="space-y-2">
            {navSections.map((section) => (
              <button
                key={section.id}
                onClick={() => {
                  setActiveSection(section.id);
                  document.getElementById(section.id)?.scrollIntoView({ behavior: 'smooth' });
                }}
                className={cn(
                  'w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition-all',
                  activeSection === section.id
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'hover:bg-zinc-800 text-zinc-400 hover:text-white'
                )}
              >
                <span className="text-xl">{section.icon}</span>
                <span className="font-medium">{section.label}</span>
              </button>
            ))}
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-1 p-8 space-y-16 max-w-6xl">
          {/* Buttons Section */}
          <section id="buttons" className="space-y-8">
            <div>
              <h2 className="text-3xl font-bold mb-2">Buttons</h2>
              <p className="text-zinc-400">All button variants with interactive states</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Primary Buttons */}
              <Card className="bg-zinc-900/60 border-zinc-800">
                <CardHeader>
                  <CardTitle className="text-lg">Primary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button variant="default">Default Button</Button>
                  <Button variant="default" size="lg">Large Button</Button>
                  <Button variant="default" size="sm">Small Button</Button>
                  <Button variant="default" disabled>Disabled</Button>
                  <Button variant="default" isLoading>Loading...</Button>
                </CardContent>
              </Card>

              {/* Gradient Buttons */}
              <Card className="bg-zinc-900/60 border-zinc-800">
                <CardHeader>
                  <CardTitle className="text-lg">Gradient</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button variant="gradient">Gradient Button</Button>
                  <Button variant="gradient" leftIcon={<Rocket className="h-4 w-4" />}>
                    To the Moon
                  </Button>
                  <Button variant="gradient-outline">Gradient Outline</Button>
                  <Button variant="gradient" animation="pulse">Pulsing</Button>
                </CardContent>
              </Card>

              {/* Destructive Buttons */}
              <Card className="bg-zinc-900/60 border-zinc-800">
                <CardHeader>
                  <CardTitle className="text-lg">Danger</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button variant="destructive">Delete</Button>
                  <Button variant="destructive" leftIcon={<Lock className="h-4 w-4" />}>
                    Lock Account
                  </Button>
                  <Button variant="destructive" size="sm">Remove</Button>
                </CardContent>
              </Card>

              {/* Ghost Buttons */}
              <Card className="bg-zinc-900/60 border-zinc-800">
                <CardHeader>
                  <CardTitle className="text-lg">Ghost</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button variant="ghost">Ghost Button</Button>
                  <Button variant="ghost" leftIcon={<MessageSquare className="h-4 w-4" />}>
                    Reply
                  </Button>
                  <Button variant="ghost" size="icon">
                    <Trophy className="h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>

              {/* Neon/Glow Buttons */}
              <Card className="bg-zinc-900/60 border-zinc-800">
                <CardHeader>
                  <CardTitle className="text-lg">Neon Glow</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button variant="glow">Glow Button</Button>
                  <Button variant="glow" animation="glow">Animated Glow</Button>
                  <Button variant="glow" leftIcon={<Zap className="h-4 w-4" />}>
                    Power Up
                  </Button>
                </CardContent>
              </Card>

              {/* Wallet/XP Buttons */}
              <Card className="bg-zinc-900/60 border-zinc-800">
                <CardHeader>
                  <CardTitle className="text-lg">Special</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button variant="wallet" leftIcon={<Wallet className="h-4 w-4" />}>
                    Connect Wallet
                  </Button>
                  <Button variant="xp" leftIcon={<Trophy className="h-4 w-4" />}>
                    Claim XP
                  </Button>
                  <Button variant="outline" rightIcon={<DollarSign className="h-4 w-4" />}>
                    Buy DGT
                  </Button>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Cards Section */}
          <section id="cards" className="space-y-8">
            <div>
              <h2 className="text-3xl font-bold mb-2">Cards</h2>
              <p className="text-zinc-400">Card variants with hover and focus states</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Stat Card */}
              <Card className="bg-zinc-900/60 border-zinc-800 hover:border-emerald-500/50 transition-all hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(16,185,129,0.3)]">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-emerald-500" />
                    Stat Card
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-emerald-400">+42.69%</div>
                  <p className="text-zinc-400 text-sm mt-1">Portfolio gains this week</p>
                </CardContent>
              </Card>

              {/* Zone Card (Forum Style) */}
              <Card className="zone-card zone-theme-pit bg-gradient-to-br from-zinc-900 to-red-950/20 border-red-500/30 hover:border-red-500 transition-all hover:scale-[1.02]">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <span className="text-2xl">🔥</span>
                    The Pit
                  </CardTitle>
                  <CardDescription>Raw, unfiltered degen discussion</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-400">1,337 threads</span>
                    <span className="text-emerald-400">2x XP</span>
                  </div>
                </CardContent>
              </Card>

              {/* Profile Card */}
              <Card className="bg-zinc-900/60 border-zinc-800 overflow-hidden">
                <div className="h-20 bg-gradient-to-r from-purple-500 to-pink-500" />
                <CardContent className="relative pt-0">
                  <div className="absolute -top-10 left-4">
                    <div className="w-20 h-20 rounded-full bg-black border-4 border-purple-500 shadow-[0_0_20px_rgba(168,85,247,0.5)]" />
                  </div>
                  <div className="pt-12">
                    <h3 className="font-bold text-purple-400">ChadGPT</h3>
                    <p className="text-sm text-zinc-400">DeFi Overlord</p>
                    <div className="flex gap-2 mt-2">
                      <Badge variant="outline" className="text-yellow-400 border-yellow-400/30">
                        Legend
                      </Badge>
                      <Badge variant="outline" className="text-emerald-400 border-emerald-400/30">
                        69,420 XP
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Announcement Card */}
              <Card className="bg-gradient-to-br from-emerald-900/20 to-cyan-900/20 border-emerald-500/30">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg">Event Active!</CardTitle>
                    <Badge className="bg-emerald-500 text-black animate-pulse">LIVE</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">Double XP Weekend - Farm those gains!</p>
                  <p className="text-xs text-zinc-400 mt-2">Ends in 48 hours</p>
                </CardContent>
              </Card>

              {/* Glass Card */}
              <Card className="bg-white/5 backdrop-blur-md border-white/10 hover:bg-white/10 transition-all">
                <CardHeader>
                  <CardTitle className="text-lg">Glassmorphism</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-zinc-300">Frosted glass effect with backdrop blur</p>
                </CardContent>
              </Card>

              {/* Loading Skeleton Card */}
              <Card className="bg-zinc-900/60 border-zinc-800">
                <CardHeader>
                  <CardTitle className="text-lg">Loading State</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Skeleton className="h-4 w-full bg-zinc-800" />
                  <Skeleton className="h-4 w-3/4 bg-zinc-800" />
                  <Skeleton className="h-8 w-1/2 bg-zinc-800" />
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Colors Section */}
          <section id="colors" className="space-y-8">
            <div>
              <h2 className="text-3xl font-bold mb-2">Brand Colors</h2>
              <p className="text-zinc-400">Core color palette from tailwind.config.js</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {/* Primary Colors */}
              <div className="space-y-2">
                <h3 className="font-semibold mb-3">Primary</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded bg-emerald-500" />
                    <div>
                      <p className="font-medium">Emerald</p>
                      <p className="text-xs text-zinc-400">#10B981</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded bg-cyan-500" />
                    <div>
                      <p className="font-medium">Cyan</p>
                      <p className="text-xs text-zinc-400">#06B6D4</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Status Colors */}
              <div className="space-y-2">
                <h3 className="font-semibold mb-3">Status</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded bg-green-500" />
                    <div>
                      <p className="font-medium">Success</p>
                      <p className="text-xs text-zinc-400">#22C55E</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded bg-amber-500" />
                    <div>
                      <p className="font-medium">Warning</p>
                      <p className="text-xs text-zinc-400">#F59E0B</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded bg-red-500" />
                    <div>
                      <p className="font-medium">Error</p>
                      <p className="text-xs text-zinc-400">#EF4444</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* XP Colors */}
              <div className="space-y-2">
                <h3 className="font-semibold mb-3">XP/Rewards</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded bg-purple-500" />
                    <div>
                      <p className="font-medium">XP Purple</p>
                      <p className="text-xs text-zinc-400">#8B5CF6</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded bg-yellow-400" />
                    <div>
                      <p className="font-medium">Gold</p>
                      <p className="text-xs text-zinc-400">#FACC15</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Grays */}
              <div className="space-y-2">
                <h3 className="font-semibold mb-3">Neutrals</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded bg-zinc-950 border border-zinc-800" />
                    <div>
                      <p className="font-medium">Black</p>
                      <p className="text-xs text-zinc-400">#0B0B0B</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded bg-zinc-900 border border-zinc-800" />
                    <div>
                      <p className="font-medium">Zinc 900</p>
                      <p className="text-xs text-zinc-400">#121212</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded bg-zinc-800" />
                    <div>
                      <p className="font-medium">Zinc 800</p>
                      <p className="text-xs text-zinc-400">#1E1E1E</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Username Tiers Section */}
          <section id="usernames" className="space-y-8">
            <div>
              <h2 className="text-3xl font-bold mb-2">Username Color Tiers</h2>
              <p className="text-zinc-400">XP-based username colors from Cope to Exit Liquidity</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {usernameTiers.map((tier) => (
                <Card key={tier.tier} className="bg-zinc-900/60 border-zinc-800">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className={cn('text-2xl font-bold', tier.color)}>{tier.label}</h3>
                        <p className="text-sm text-zinc-400 mt-1">XP Range: {tier.xpRange}</p>
                      </div>
                      <div className={cn('text-4xl', tier.color)}>
                        {tier.tier === 'exit-liquidity' ? '💸' : '👤'}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* Avatar Frames Section */}
          <section id="avatars" className="space-y-8">
            <div>
              <h2 className="text-3xl font-bold mb-2">Avatar Frames</h2>
              <p className="text-zinc-400">Rarity-based avatar frames with glow effects</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
              {avatarFrameRarities.map((frame) => (
                <div key={frame.rarity} className="text-center space-y-3">
                  <div className="relative inline-block">
                    <div 
                      className={cn(
                        'w-20 h-20 rounded-full bg-zinc-800 flex items-center justify-center',
                        frame.borderClass,
                        frame.glowClass,
                        frame.backgroundClass && 'p-[2px]'
                      )}
                    >
                      {frame.backgroundClass && (
                        <div className="w-full h-full rounded-full bg-black flex items-center justify-center">
                          <Users className="h-8 w-8 text-white" />
                        </div>
                      )}
                      {!frame.backgroundClass && <Users className="h-8 w-8 text-white" />}
                    </div>
                  </div>
                  <p className="text-sm font-medium capitalize">{frame.rarity}</p>
                </div>
              ))}
            </div>

            {/* User Titles */}
            <div className="mt-12">
              <h3 className="text-xl font-bold mb-4">User Titles</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {userTitles.map((title) => {
                  const frame = avatarFrameRarities.find(f => f.rarity === title.rarity);
                  return (
                    <Badge 
                      key={title.title}
                      variant="outline" 
                      className={cn(
                        'py-2 px-4 text-sm',
                        frame?.borderClass?.replace('ring-2', 'border'),
                        frame?.glowClass
                      )}
                    >
                      {title.title}
                    </Badge>
                  );
                })}
              </div>
            </div>
          </section>

          {/* Badges & Icons Section */}
          <section id="badges" className="space-y-8">
            <div>
              <h2 className="text-3xl font-bold mb-2">Badges & Icons</h2>
              <p className="text-zinc-400">Crypto culture icons and achievement badges</p>
            </div>

            <Card className="bg-zinc-900/60 border-zinc-800">
              <CardHeader>
                <CardTitle>Crypto Icons Gallery</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-8 gap-4">
                  {cryptoIcons.map((icon) => (
                    <div key={icon.name} className="text-center group cursor-pointer">
                      <div className="text-4xl mb-2 group-hover:scale-125 transition-transform">
                        {icon.emoji}
                      </div>
                      <p className="text-xs text-zinc-400 group-hover:text-white transition-colors">
                        {icon.label}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Achievement Badges */}
            <Card className="bg-zinc-900/60 border-zinc-800">
              <CardHeader>
                <CardTitle>Achievement Badges</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-3">
                  <Badge className="gap-2 bg-gradient-to-r from-yellow-500 to-amber-500 text-black">
                    <Trophy className="h-3 w-3" />
                    First Trade
                  </Badge>
                  <Badge className="gap-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                    <Shield className="h-3 w-3" />
                    Diamond Hands
                  </Badge>
                  <Badge className="gap-2 bg-gradient-to-r from-emerald-500 to-cyan-500 text-black">
                    <Coins className="h-3 w-3" />
                    Whale Status
                  </Badge>
                  <Badge className="gap-2 bg-gradient-to-r from-red-500 to-orange-500 text-white">
                    <Flame className="h-3 w-3" />
                    Hot Streak
                  </Badge>
                  <Badge className="gap-2 bg-zinc-800 text-zinc-400">
                    <Target className="h-3 w-3" />
                    Sharpshooter
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Animations Section */}
          <section id="animations" className="space-y-8">
            <div>
              <h2 className="text-3xl font-bold mb-2">Animations</h2>
              <p className="text-zinc-400">Micro-animations and effects</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Gradient Shift */}
              <Card className="bg-zinc-900/60 border-zinc-800">
                <CardHeader>
                  <CardTitle className="text-lg">Gradient Shift</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-24 rounded-lg bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 animate-gradient-shift bg-[length:200%_100%]" />
                </CardContent>
              </Card>

              {/* Pulse Glow */}
              <Card className="bg-zinc-900/60 border-zinc-800">
                <CardHeader>
                  <CardTitle className="text-lg">Pulse Glow</CardTitle>
                </CardHeader>
                <CardContent>
                  <Button variant="glow" animation="glow" className="w-full">
                    Pulsing Glow Effect
                  </Button>
                </CardContent>
              </Card>

              {/* Glitch Effect */}
              <Card className="bg-zinc-900/60 border-zinc-800">
                <CardHeader>
                  <CardTitle className="text-lg">Glitch</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-emerald-400 hover:animate-glitch cursor-pointer">
                    HOVER FOR GLITCH
                  </div>
                </CardContent>
              </Card>

              {/* Float Animation */}
              <Card className="bg-zinc-900/60 border-zinc-800">
                <CardHeader>
                  <CardTitle className="text-lg">Float</CardTitle>
                </CardHeader>
                <CardContent className="flex justify-center">
                  <div className="text-6xl animate-float">🚀</div>
                </CardContent>
              </Card>

              {/* Number Change */}
              <Card className="bg-zinc-900/60 border-zinc-800">
                <CardHeader>
                  <CardTitle className="text-lg">Number Change</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-emerald-400 animate-number-change">
                    +$4,269.00
                  </div>
                </CardContent>
              </Card>

              {/* Combined Effects */}
              <Card className="bg-zinc-900/60 border-zinc-800">
                <CardHeader>
                  <CardTitle className="text-lg">Combined</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-lg blur-xl opacity-50 animate-pulse" />
                    <Button variant="gradient" className="relative w-full">
                      Multiple Effects
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Advanced Effects Section */}
          <section id="advanced" className="space-y-8">
            <div>
              <h2 className="text-3xl font-bold mb-2">Advanced Effects</h2>
              <p className="text-zinc-400">Sophisticated layering and shadow techniques</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Layered Shadow Gradient Card */}
              <motion.div
                whileHover={{ y: -5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Card className="relative bg-zinc-900/60 border-zinc-800 overflow-hidden">
                  <div 
                    className="absolute inset-0 opacity-30"
                    style={{
                      background: 'radial-gradient(circle at 20% 20%, #8b5cf6 0%, transparent 50%), radial-gradient(circle at 80% 80%, #06b6d4 0%, transparent 50%), radial-gradient(circle at 40% 80%, #10b981 0%, transparent 50%)'
                    }}
                  />
                  <CardHeader className="relative z-10">
                    <CardTitle className="text-lg">Shadow Gradient Layers</CardTitle>
                  </CardHeader>
                  <CardContent className="relative z-10">
                    <div className="relative">
                      <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-gradient-shift"></div>
                      <div className="relative px-7 py-4 bg-black rounded-lg leading-none flex items-center divide-x divide-gray-600">
                        <span className="flex items-center space-x-5">
                          <Sparkles className="h-6 w-6 text-pink-400" />
                          <span className="pr-6 text-gray-100">Advanced Glow</span>
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* 3D Perspective Card */}
              <motion.div
                className="relative"
                style={{ perspective: 1000 }}
                whileHover={{ scale: 1.05 }}
              >
                <motion.div
                  className="relative"
                  whileHover={{ rotateY: 15, rotateX: -15 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Card className="bg-gradient-to-br from-purple-900/40 to-pink-900/40 border-purple-500/30 backdrop-blur-md">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Gem className="h-5 w-5 text-purple-400" />
                        3D Perspective
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-purple-200">Hover for 3D tilt effect with spring physics</p>
                    </CardContent>
                  </Card>
                </motion.div>
              </motion.div>

              {/* Holographic Card */}
              <Card 
                className="relative bg-black border-zinc-800 overflow-hidden cursor-pointer"
                onMouseEnter={() => setHoveredCard('holo')}
                onMouseLeave={() => setHoveredCard(null)}
              >
                <div 
                  className="absolute inset-0 opacity-0 transition-opacity duration-300"
                  style={{
                    background: 'linear-gradient(105deg, transparent 40%, rgba(255, 219, 112, 0.7) 50%, transparent 60%)',
                    filter: 'brightness(1.2) contrast(1.3)',
                    opacity: hoveredCard === 'holo' ? 1 : 0,
                    transform: hoveredCard === 'holo' ? 'translateX(100%)' : 'translateX(-100%)',
                    transition: 'transform 0.6s ease-in-out, opacity 0.3s ease-in-out'
                  }}
                />
                <CardHeader className="relative z-10">
                  <CardTitle className="text-lg">Holographic Effect</CardTitle>
                </CardHeader>
                <CardContent className="relative z-10">
                  <div className="text-sm text-zinc-300">Hover for holographic shine sweep</div>
                </CardContent>
              </Card>

              {/* Neumorphic Dark Card */}
              <Card 
                className="bg-zinc-900 border-0"
                style={{
                  boxShadow: 'inset 5px 5px 10px #0a0a0a, inset -5px -5px 10px #1a1a1a, 5px 5px 10px #0a0a0a, -5px -5px 10px #1a1a1a'
                }}
              >
                <CardHeader>
                  <CardTitle className="text-lg">Dark Neumorphism</CardTitle>
                </CardHeader>
                <CardContent>
                  <Button 
                    className="w-full bg-zinc-900 border-0 text-zinc-300"
                    style={{
                      boxShadow: '5px 5px 10px #0a0a0a, -5px -5px 10px #1a1a1a'
                    }}
                  >
                    Soft UI Button
                  </Button>
                </CardContent>
              </Card>

              {/* Liquid Morph Card */}
              <motion.div
                animate={{
                  borderRadius: ["20% 40% 40% 20%", "40% 20% 20% 40%", "20% 40% 40% 20%"],
                }}
                transition={{
                  duration: 8,
                  ease: "easeInOut",
                  repeat: Infinity,
                }}
                className="relative"
              >
                <Card className="bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border-cyan-500/30 backdrop-blur-xl overflow-hidden">
                  <div 
                    className="absolute inset-0"
                    style={{
                      background: 'radial-gradient(circle at 30% 30%, rgba(6, 182, 212, 0.3) 0%, transparent 70%)',
                      filter: 'blur(40px)',
                    }}
                  />
                  <CardHeader className="relative z-10">
                    <CardTitle className="text-lg">Liquid Morphing</CardTitle>
                  </CardHeader>
                  <CardContent className="relative z-10">
                    <p className="text-sm text-cyan-200">Organic shape animation</p>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Glowing Orb Card */}
              <Card className="relative bg-black border-zinc-800 overflow-hidden">
                <motion.div
                  className="absolute top-1/2 left-1/2 w-32 h-32 -translate-x-1/2 -translate-y-1/2"
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.3, 0.6, 0.3],
                  }}
                  transition={{
                    duration: 4,
                    ease: "easeInOut",
                    repeat: Infinity,
                  }}
                >
                  <div 
                    className="w-full h-full rounded-full"
                    style={{
                      background: 'radial-gradient(circle, rgba(139, 92, 246, 0.8) 0%, rgba(139, 92, 246, 0.4) 40%, transparent 70%)',
                      filter: 'blur(20px)',
                    }}
                  />
                </motion.div>
                <CardHeader className="relative z-10">
                  <CardTitle className="text-lg">Glowing Orb</CardTitle>
                </CardHeader>
                <CardContent className="relative z-10">
                  <p className="text-sm text-zinc-300">Animated radial glow effect</p>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Premium Components Section */}
          <section id="premium" className="space-y-8">
            <div>
              <h2 className="text-3xl font-bold mb-2">Premium Components</h2>
              <p className="text-zinc-400">High-end UI patterns with complex interactions</p>
            </div>

            <div className="space-y-8">
              {/* Stacked Cards with Parallax */}
              <Card className="bg-zinc-900/60 border-zinc-800 p-8">
                <h3 className="text-xl font-bold mb-6">Stacked Card Parallax</h3>
                <div className="relative h-64 flex items-center justify-center">
                  <motion.div
                    className="absolute w-48 h-32 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl shadow-2xl"
                    whileHover={{ x: -30, y: -20, rotate: -5 }}
                    transition={{ type: "spring", stiffness: 200 }}
                  />
                  <motion.div
                    className="absolute w-48 h-32 bg-gradient-to-br from-cyan-600 to-blue-600 rounded-xl shadow-2xl"
                    whileHover={{ x: 0, y: -10, scale: 1.05 }}
                    transition={{ type: "spring", stiffness: 200 }}
                  />
                  <motion.div
                    className="relative w-48 h-32 bg-gradient-to-br from-emerald-600 to-green-600 rounded-xl shadow-2xl flex items-center justify-center"
                    whileHover={{ x: 30, y: 0, rotate: 5 }}
                    transition={{ type: "spring", stiffness: 200 }}
                  >
                    <span className="text-white font-bold">Hover Me</span>
                  </motion.div>
                </div>
              </Card>

              {/* Magnetic Button */}
              <Card className="bg-zinc-900/60 border-zinc-800 p-8">
                <h3 className="text-xl font-bold mb-6">Magnetic Hover Button</h3>
                <div className="flex justify-center">
                  <motion.button
                    className="relative px-8 py-4 bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-bold rounded-full overflow-hidden"
                    whileHover="hover"
                    whileTap={{ scale: 0.95 }}
                  >
                    <motion.span
                      className="relative z-10"
                      variants={{
                        hover: { scale: 1.1 }
                      }}
                    >
                      Magnetic Hover
                    </motion.span>
                    <motion.div
                      className="absolute inset-0 bg-white"
                      initial={{ scale: 0, opacity: 0 }}
                      variants={{
                        hover: { scale: 2, opacity: 0.1 }
                      }}
                      transition={{ duration: 0.4 }}
                    />
                  </motion.button>
                </div>
              </Card>

              {/* Spotlight Card Grid */}
              <Card className="bg-zinc-900/60 border-zinc-800 p-8">
                <h3 className="text-xl font-bold mb-6">Spotlight Effect Grid</h3>
                <div className="grid grid-cols-3 gap-4">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <motion.div
                      key={i}
                      className="relative h-24 bg-zinc-800 rounded-lg overflow-hidden cursor-pointer"
                      whileHover="hover"
                    >
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 opacity-0"
                        variants={{
                          hover: { opacity: 0.2 }
                        }}
                      />
                      <motion.div
                        className="absolute inset-0"
                        style={{
                          background: 'radial-gradient(circle at var(--mouse-x) var(--mouse-y), rgba(255,255,255,0.1) 0%, transparent 40%)',
                        }}
                        variants={{
                          hover: { opacity: 1 }
                        }}
                        initial={{ opacity: 0 }}
                      />
                      <div className="relative z-10 h-full flex items-center justify-center">
                        <Star className="h-6 w-6 text-zinc-400" />
                      </div>
                    </motion.div>
                  ))}
                </div>
              </Card>

              {/* Morphing Gradient Blob */}
              <Card className="bg-zinc-900/60 border-zinc-800 p-8 overflow-hidden">
                <h3 className="text-xl font-bold mb-6">Morphing Gradient Blob</h3>
                <div className="relative h-64 flex items-center justify-center">
                  <motion.div
                    className="absolute w-64 h-64"
                    animate={{
                      rotate: 360,
                    }}
                    transition={{
                      duration: 20,
                      ease: "linear",
                      repeat: Infinity,
                    }}
                  >
                    <motion.div
                      className="w-full h-full"
                      style={{
                        background: 'linear-gradient(45deg, #f093fb 0%, #f5576c 25%, #4facfe 50%, #00f2fe 75%, #f093fb 100%)',
                        borderRadius: '60% 40% 30% 70% / 60% 30% 70% 40%',
                        filter: 'blur(40px)',
                        opacity: 0.7,
                      }}
                      animate={{
                        borderRadius: [
                          '60% 40% 30% 70% / 60% 30% 70% 40%',
                          '30% 60% 70% 40% / 50% 60% 30% 60%',
                          '60% 40% 30% 70% / 60% 30% 70% 40%',
                        ],
                        scale: [1, 1.1, 1],
                      }}
                      transition={{
                        duration: 8,
                        ease: "easeInOut",
                        repeat: Infinity,
                      }}
                    />
                  </motion.div>
                  <div className="relative z-10 text-center">
                    <Crown className="h-12 w-12 text-yellow-400 mx-auto mb-2" />
                    <p className="text-white font-bold">Premium Effect</p>
                  </div>
                </div>
              </Card>

              {/* Layered Text Effect */}
              <Card className="bg-zinc-900/60 border-zinc-800 p-8">
                <h3 className="text-xl font-bold mb-6">Layered Text Shadow</h3>
                <div className="text-center">
                  <h1 
                    className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400"
                    style={{
                      textShadow: `
                        0 1px 0 #ccc,
                        0 2px 0 #c9c9c9,
                        0 3px 0 #bbb,
                        0 4px 0 #b9b9b9,
                        0 5px 0 #aaa,
                        0 6px 1px rgba(0,0,0,.1),
                        0 0 5px rgba(0,0,0,.1),
                        0 1px 3px rgba(0,0,0,.3),
                        0 3px 5px rgba(0,0,0,.2),
                        0 5px 10px rgba(0,0,0,.25),
                        0 10px 10px rgba(0,0,0,.2),
                        0 20px 20px rgba(0,0,0,.15),
                        0 0 40px rgba(168, 85, 247, 0.4)
                      `
                    }}
                  >
                    DEGEN
                  </h1>
                </div>
              </Card>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
