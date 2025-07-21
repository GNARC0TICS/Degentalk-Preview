import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Trophy, Target, Clock, Flame, Crown, Calendar, Star } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useMissions } from '../hooks/useMissions';
import { MissionCard } from './MissionCard';
import { StreakBanner } from './StreakBanner';
import { MissionStats } from './MissionStats';
import { formatDistanceToNow } from 'date-fns';

export const MissionHub: React.FC = () => {
  const { user } = useAuth();
  const { missions, streaks, stats, loading, error } = useMissions();
  const [activeTab, setActiveTab] = useState('daily');

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-pulse text-center">
          <Target className="w-12 h-12 mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading missions...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="p-6 text-center">
        <p className="text-destructive">Failed to load missions. Please try again.</p>
      </Card>
    );
  }

  const getDailyResetTime = () => {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setUTCHours(24, 0, 0, 0);
    return formatDistanceToNow(tomorrow, { addSuffix: true });
  };

  const getWeeklyResetTime = () => {
    const now = new Date();
    const daysUntilMonday = (8 - now.getUTCDay()) % 7 || 7;
    const nextMonday = new Date(now);
    nextMonday.setUTCDate(now.getUTCDate() + daysUntilMonday);
    nextMonday.setUTCHours(0, 0, 0, 0);
    return formatDistanceToNow(nextMonday, { addSuffix: true });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Target className="w-8 h-8 text-primary" />
            Mission Hub
          </h1>
          <p className="text-muted-foreground mt-1">
            Complete missions to earn XP, DGT, and exclusive rewards
          </p>
        </div>
        <MissionStats stats={stats} />
      </div>

      {/* Streak Banner */}
      <StreakBanner streaks={streaks} />

      {/* Mission Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="daily" className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Daily
            <Badge variant="secondary" className="ml-1">
              {missions.daily.filter(m => !m.isComplete).length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="weekly" className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Weekly
            <Badge variant="secondary" className="ml-1">
              {missions.weekly.filter(m => !m.isComplete).length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="special" className="flex items-center gap-2">
            <Star className="w-4 h-4" />
            Special
            {missions.special.length > 0 && (
              <Badge variant="default" className="ml-1">
                {missions.special.length}
              </Badge>
            )}
          </TabsTrigger>
          {user?.isVIP && (
            <TabsTrigger value="vip" className="flex items-center gap-2">
              <Crown className="w-4 h-4 text-yellow-500" />
              VIP
              <Badge variant="default" className="ml-1 bg-yellow-500">
                {missions.vip?.length || 0}
              </Badge>
            </TabsTrigger>
          )}
        </TabsList>

        {/* Daily Missions */}
        <TabsContent value="daily" className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Daily Missions</h2>
            <p className="text-sm text-muted-foreground">
              Resets {getDailyResetTime()}
            </p>
          </div>
          
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <AnimatePresence mode="popLayout">
              {missions.daily.map((mission) => (
                <motion.div
                  key={mission.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.2 }}
                >
                  <MissionCard mission={mission} />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {missions.daily.length === 0 && (
            <Card className="p-12 text-center">
              <Trophy className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-lg font-medium">All daily missions completed!</p>
              <p className="text-sm text-muted-foreground mt-2">
                Check back tomorrow for new missions
              </p>
            </Card>
          )}
        </TabsContent>

        {/* Weekly Missions */}
        <TabsContent value="weekly" className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Weekly Challenges</h2>
            <p className="text-sm text-muted-foreground">
              Resets {getWeeklyResetTime()}
            </p>
          </div>
          
          <div className="grid gap-4 md:grid-cols-2">
            <AnimatePresence mode="popLayout">
              {missions.weekly.map((mission) => (
                <motion.div
                  key={mission.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.2 }}
                >
                  <MissionCard mission={mission} size="large" />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {missions.weekly.length === 0 && (
            <Card className="p-12 text-center">
              <Trophy className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-lg font-medium">All weekly challenges completed!</p>
              <p className="text-sm text-muted-foreground mt-2">
                New challenges arrive every Monday
              </p>
            </Card>
          )}
        </TabsContent>

        {/* Special Missions */}
        <TabsContent value="special" className="space-y-4">
          <div className="mb-4">
            <h2 className="text-xl font-semibold">Special Events</h2>
            <p className="text-sm text-muted-foreground">
              Limited-time missions with exclusive rewards
            </p>
          </div>
          
          <div className="grid gap-4">
            <AnimatePresence mode="popLayout">
              {missions.special.map((mission) => (
                <motion.div
                  key={mission.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <MissionCard 
                    mission={mission} 
                    size="large" 
                    variant="special"
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {missions.special.length === 0 && (
            <Card className="p-12 text-center border-dashed">
              <Star className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-lg font-medium">No special events active</p>
              <p className="text-sm text-muted-foreground mt-2">
                Keep an eye out for limited-time missions!
              </p>
            </Card>
          )}
        </TabsContent>

        {/* VIP Missions */}
        {user?.isVIP && (
          <TabsContent value="vip" className="space-y-4">
            <div className="mb-4">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Crown className="w-6 h-6 text-yellow-500" />
                VIP Exclusive Missions
              </h2>
              <p className="text-sm text-muted-foreground">
                Premium missions with enhanced rewards
              </p>
            </div>
            
            <div className="grid gap-4 md:grid-cols-2">
              <AnimatePresence mode="popLayout">
                {missions.vip?.map((mission) => (
                  <motion.div
                    key={mission.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.2 }}
                  >
                    <MissionCard 
                      mission={mission} 
                      size="large"
                      variant="vip"
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </TabsContent>
        )}
      </Tabs>

      {/* Progress Overview */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Today's Progress</h3>
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Daily Missions</span>
              <span className="text-sm text-muted-foreground">
                {missions.daily.filter(m => m.isComplete).length} / {missions.daily.length}
              </span>
            </div>
            <Progress 
              value={(missions.daily.filter(m => m.isComplete).length / missions.daily.length) * 100} 
              className="h-2"
            />
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Weekly Challenges</span>
              <span className="text-sm text-muted-foreground">
                {missions.weekly.filter(m => m.isComplete).length} / {missions.weekly.length}
              </span>
            </div>
            <Progress 
              value={(missions.weekly.filter(m => m.isComplete).length / missions.weekly.length) * 100} 
              className="h-2"
            />
          </div>
        </div>
      </Card>
    </div>
  );
};