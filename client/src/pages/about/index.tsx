import React from 'react';
import { motion } from 'framer-motion';
import { 
  Target, 
  Trophy, 
  Coins, 
  Users, 
  TrendingUp, 
  Rocket,
  Sparkles,
  Zap,
  MessageSquare,
  Lock,
  CheckCircle,
  Clock
} from 'lucide-react';
import { Card, CardHeader, CardContent, CardTitle } from '@app/components/ui/card';
import { Badge } from '@app/components/ui/badge';
import { Button } from '@app/components/ui/button';
import { Progress } from '@app/components/ui/progress';
import { useCanonicalAuth } from '@app/features/auth/useCanonicalAuth';
import DailyTasksWidget from '@app/components/dashboard/DailyTasksWidget';

const AboutPage: React.FC = () => {
  const { user, isAuthenticated } = useCanonicalAuth();

  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 }
  };

  const concepts = [
    {
      icon: <Trophy className="h-6 w-6" />,
      title: 'XP & Levels',
      description: 'Earn XP for every action - posts, replies, reactions. Level up from Broke Pleb (1) to Whale God (100).',
      color: 'text-amber-500'
    },
    {
      icon: <Coins className="h-6 w-6" />,
      title: 'DGT Tokens',
      description: 'DegenTalk tokens - earn them, tip them, rain them. Worth $0.10 each, backed by pure hopium.',
      color: 'text-emerald-500'
    },
    {
      icon: <TrendingUp className="h-6 w-6" />,
      title: 'Clout Score',
      description: 'Your social capital measured in degeneracy. More clout = bigger tips, exclusive access, and respect.',
      color: 'text-purple-500'
    },
    {
      icon: <MessageSquare className="h-6 w-6" />,
      title: 'Forum Zones',
      description: 'From The Pit (chaos) to Diamond Lounge (whales only). Each zone has its own culture and rewards.',
      color: 'text-blue-500'
    },
    {
      icon: <Zap className="h-6 w-6" />,
      title: 'Thread Staking',
      description: 'Stake DGT on threads you believe in. Winners share the pot when threads go viral.',
      color: 'text-orange-500'
    },
    {
      icon: <Sparkles className="h-6 w-6" />,
      title: 'Daily Login Bonus',
      description: 'Just show up daily and get free XP. Stack those streaks for multipliers!',
      color: 'text-pink-500'
    }
  ];

  const comingSoonFeatures = [
    { title: 'Post in specific forums', xp: 100, icon: '📝' },
    { title: 'Get 10 reactions', xp: 150, icon: '🔥' },
    { title: 'Rain 100 DGT', xp: 200, icon: '💸' },
    { title: 'Win a thread stake', xp: 300, icon: '🎯' },
    { title: 'Touch grass (optional)', xp: 25, icon: '🌱' },
    { title: 'HODL without checking', xp: 500, icon: '💎' }
  ];

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Hero Section */}
      <motion.div {...fadeIn} className="text-center mb-12">
        <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-amber-400 to-orange-600 bg-clip-text text-transparent">
          Welcome to DegenTalk
        </h1>
        <p className="text-xl text-zinc-400 mb-8">
          Where crypto degeneracy meets gamified madness
        </p>
        <div className="flex justify-center gap-4 flex-wrap">
          <Badge variant="outline" className="text-lg px-4 py-2">
            🎰 100% Degen
          </Badge>
          <Badge variant="outline" className="text-lg px-4 py-2">
            💎 0% Financial Advice
          </Badge>
          <Badge variant="outline" className="text-lg px-4 py-2">
            🚀 ∞% FOMO
          </Badge>
        </div>
      </motion.div>

      {/* Daily Tasks Widget for Authenticated Users */}
      {isAuthenticated && (
        <motion.div 
          {...fadeIn} 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-12 max-w-2xl mx-auto"
        >
          <DailyTasksWidget />
        </motion.div>
      )}

      {/* Core Concepts Grid */}
      <motion.div 
        {...fadeIn}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16"
      >
        {concepts.map((concept, index) => (
          <motion.div
            key={concept.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * index }}
          >
            <Card className="h-full hover:border-zinc-700 transition-colors">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <span className={concept.color}>{concept.icon}</span>
                  {concept.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-zinc-400">{concept.description}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Coming Soon: Missions */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5 }}
        className="relative mb-16"
      >
        <Card className="overflow-hidden border-2 border-dashed border-zinc-700">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-orange-600/5" />
          <CardHeader className="relative">
            <CardTitle className="text-2xl flex items-center gap-3">
              <Rocket className="h-8 w-8 text-amber-500 animate-pulse" />
              Coming Soon: Degen Missions v1.1
            </CardTitle>
            <p className="text-zinc-400 mt-2">
              Daily quests, weekly challenges, and special events to maximize your degeneracy
            </p>
          </CardHeader>
          <CardContent className="relative">
            <div className="grid md:grid-cols-2 gap-4 mb-6 blur-[2px] select-none">
              {comingSoonFeatures.map((feature, index) => (
                <div 
                  key={index}
                  className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{feature.icon}</span>
                    <span className="text-sm">{feature.title}</span>
                  </div>
                  <Badge variant="secondary">+{feature.xp} XP</Badge>
                </div>
              ))}
            </div>
            <div className="text-center">
              <Badge variant="outline" className="text-lg px-6 py-2">
                <Lock className="h-4 w-4 mr-2" />
                Unlocking in v1.1
              </Badge>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* How to Level Up */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">How to Level Up in DegenTalk</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-amber-400">Current Ways to Earn XP:</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-emerald-500 mt-0.5" />
                  <div>
                    <p className="font-medium">Daily Login</p>
                    <p className="text-sm text-zinc-400">Get XP just for showing up daily</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-emerald-500 mt-0.5" />
                  <div>
                    <p className="font-medium">Create Threads</p>
                    <p className="text-sm text-zinc-400">Start discussions, earn XP</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-emerald-500 mt-0.5" />
                  <div>
                    <p className="font-medium">Reply to Posts</p>
                    <p className="text-sm text-zinc-400">Engage with the community</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-emerald-500 mt-0.5" />
                  <div>
                    <p className="font-medium">Get Reactions</p>
                    <p className="text-sm text-zinc-400">Quality content = more XP</p>
                  </div>
                </div>
              </div>
            </div>

            {user && (
              <div className="bg-zinc-900/50 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-semibold">Your Progress</h4>
                  <Badge variant="outline">Level {user.level || 1}</Badge>
                </div>
                <Progress value={(user.xp || 0) % 1000 / 10} className="h-3 mb-2" />
                <p className="text-sm text-zinc-400">
                  {user.xp || 0} XP • {1000 - ((user.xp || 0) % 1000)} XP to next level
                </p>
              </div>
            )}

            {!isAuthenticated && (
              <div className="text-center py-8">
                <p className="text-lg mb-4">Ready to start your degen journey?</p>
                <Button size="lg" className="gap-2">
                  <Sparkles className="h-5 w-5" />
                  Join DegenTalk
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default AboutPage;