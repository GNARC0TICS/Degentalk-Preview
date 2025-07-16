# 🚀 Mission System Implementation Guide

## Phase 1: Database & Core Services

### 1.1 Database Migrations

```sql
-- migrations/001_mission_system_core.sql
-- Core mission tables
CREATE TYPE mission_category AS ENUM (
  'participation', 'social', 'trading', 'content',
  'engagement', 'achievement', 'special_event', 'vip_exclusive'
);

CREATE TYPE mission_type AS ENUM (
  'count', 'threshold', 'streak', 'timebound',
  'combo', 'unique', 'competitive'
);

CREATE TYPE period_type AS ENUM (
  'daily', 'weekly', 'monthly', 'special', 'perpetual'
);

CREATE TABLE mission_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key VARCHAR(100) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category mission_category NOT NULL,
  type mission_type NOT NULL,
  requirements JSONB NOT NULL DEFAULT '{}',
  rewards JSONB NOT NULL DEFAULT '{}',
  prerequisites JSONB DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  weight INTEGER DEFAULT 100,
  min_level INTEGER DEFAULT 1,
  max_level INTEGER,
  cooldown_hours INTEGER,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_mission_templates_active ON mission_templates(is_active);
CREATE INDEX idx_mission_templates_category ON mission_templates(category);
CREATE INDEX idx_mission_templates_level ON mission_templates(min_level, max_level);
```

### 1.2 Core Service Implementation

```typescript
// server/src/domains/missions/services/mission-core.service.ts
import { db } from '@core/db';
import { logger } from '@core/logger';
import type { UserId, MissionId } from '@shared/types/ids';
import { missionTemplates, activeMissions, missionProgress } from '@schema';
import { eq, and, gte, lte, inArray } from 'drizzle-orm';
import { Redis } from '@core/redis';

export class MissionCoreService {
  private redis: Redis;
  
  constructor() {
    this.redis = new Redis({
      keyPrefix: 'missions:'
    });
  }
  
  /**
   * Get applicable mission templates for user
   */
  async getApplicableTemplates(
    userId: UserId,
    category?: MissionCategory,
    limit?: number
  ): Promise<MissionTemplate[]> {
    const user = await this.getUserProfile(userId);
    
    const query = db
      .select()
      .from(missionTemplates)
      .where(
        and(
          eq(missionTemplates.isActive, true),
          lte(missionTemplates.minLevel, user.level),
          gte(missionTemplates.maxLevel, user.level)
        )
      );
    
    if (category) {
      query.where(eq(missionTemplates.category, category));
    }
    
    const templates = await query.limit(limit || 100);
    
    // Filter by prerequisites
    return this.filterByPrerequisites(templates, user);
  }
  
  /**
   * Create mission instance for user
   */
  async createMissionInstance(
    userId: UserId,
    templateId: string,
    periodType: PeriodType
  ): Promise<ActiveMission> {
    const [periodStart, periodEnd] = this.calculatePeriod(periodType);
    
    const [mission] = await db
      .insert(activeMissions)
      .values({
        templateId,
        userId,
        periodType,
        periodStart,
        periodEnd,
        assignedAt: new Date()
      })
      .returning();
    
    // Initialize progress tracking
    await this.initializeProgress(mission.id, templateId, userId);
    
    // Cache active mission
    await this.cacheActiveMission(userId, mission);
    
    return mission;
  }
  
  /**
   * Initialize progress tracking for mission
   */
  private async initializeProgress(
    missionId: MissionId,
    templateId: string,
    userId: UserId
  ): Promise<void> {
    const template = await this.getTemplate(templateId);
    const requirements = template.requirements as MissionRequirements;
    
    // Create progress entries for each requirement
    const progressEntries = Object.entries(requirements).map(([key, value]) => ({
      missionId,
      userId,
      requirementKey: key,
      currentValue: 0,
      targetValue: value.target || value
    }));
    
    await db.insert(missionProgress).values(progressEntries);
    
    // Initialize Redis cache
    await this.redis.hset(
      `progress:${userId}:${missionId}`,
      Object.fromEntries(
        progressEntries.map(e => [e.requirementKey, '0'])
      )
    );
  }
  
  /**
   * Calculate period boundaries
   */
  private calculatePeriod(type: PeriodType): [Date, Date] {
    const now = new Date();
    const start = new Date(now);
    const end = new Date(now);
    
    switch (type) {
      case 'daily':
        start.setUTCHours(0, 0, 0, 0);
        end.setUTCHours(23, 59, 59, 999);
        break;
        
      case 'weekly':
        const dayOfWeek = start.getUTCDay();
        const monday = new Date(start);
        monday.setUTCDate(start.getUTCDate() - dayOfWeek + 1);
        monday.setUTCHours(0, 0, 0, 0);
        start.setTime(monday.getTime());
        end.setTime(monday.getTime() + 7 * 24 * 60 * 60 * 1000 - 1);
        break;
        
      case 'monthly':
        start.setUTCDate(1);
        start.setUTCHours(0, 0, 0, 0);
        end.setUTCMonth(end.getUTCMonth() + 1);
        end.setUTCDate(0);
        end.setUTCHours(23, 59, 59, 999);
        break;
    }
    
    return [start, end];
  }
}
```

## Phase 2: Progress Tracking System

### 2.1 Event Integration

```typescript
// server/src/domains/missions/services/mission-progress.service.ts
import { EventEmitter } from '@core/events';
import { MissionCoreService } from './mission-core.service';
import type { ActionEvent } from '@shared/types/events';

export class MissionProgressService {
  private core: MissionCoreService;
  private events: EventEmitter;
  
  constructor() {
    this.core = new MissionCoreService();
    this.events = EventEmitter.getInstance();
    this.registerEventHandlers();
  }
  
  /**
   * Register handlers for all trackable actions
   */
  private registerEventHandlers(): void {
    // Forum actions
    this.events.on('post:created', this.handlePostCreated.bind(this));
    this.events.on('thread:created', this.handleThreadCreated.bind(this));
    this.events.on('reaction:added', this.handleReactionAdded.bind(this));
    
    // Social actions
    this.events.on('user:followed', this.handleUserFollowed.bind(this));
    this.events.on('tip:sent', this.handleTipSent.bind(this));
    this.events.on('rain:created', this.handleRainCreated.bind(this));
    
    // Trading actions
    this.events.on('shop:purchase', this.handleShopPurchase.bind(this));
    this.events.on('dgt:transferred', this.handleDgtTransfer.bind(this));
    
    // Engagement actions
    this.events.on('shoutbox:message', this.handleShoutboxMessage.bind(this));
    this.events.on('achievement:unlocked', this.handleAchievementUnlocked.bind(this));
  }
  
  /**
   * Handle post creation event
   */
  private async handlePostCreated(event: ActionEvent): Promise<void> {
    const { userId, data } = event;
    
    await this.updateProgress(userId, {
      action: 'posts_created',
      increment: 1,
      metadata: {
        postId: data.postId,
        forumId: data.forumId,
        length: data.content.length,
        hasMedia: data.hasMedia
      }
    });
    
    // Check quality requirements
    if (data.content.length >= 100) {
      await this.updateProgress(userId, {
        action: 'quality_posts_created',
        increment: 1
      });
    }
  }
  
  /**
   * Update mission progress
   */
  async updateProgress(
    userId: UserId,
    update: ProgressUpdate
  ): Promise<CompletedMission[]> {
    // 1. Get active missions for user
    const missions = await this.getActiveMissions(userId);
    
    // 2. Filter missions that track this action
    const relevant = missions.filter(m => 
      this.missionTracksAction(m, update.action)
    );
    
    if (relevant.length === 0) return [];
    
    // 3. Update progress in Redis (fast path)
    const updates = await Promise.all(
      relevant.map(m => this.updateMissionProgress(m, update))
    );
    
    // 4. Check for completions
    const completed = updates.filter(u => u.completed);
    
    // 5. Process completions
    if (completed.length > 0) {
      await this.processCompletions(completed);
    }
    
    // 6. Persist to database (async)
    this.persistProgressUpdates(updates);
    
    return completed;
  }
  
  /**
   * Update individual mission progress
   */
  private async updateMissionProgress(
    mission: ActiveMission,
    update: ProgressUpdate
  ): Promise<ProgressResult> {
    const key = `progress:${mission.userId}:${mission.id}`;
    
    // Get current progress from Redis
    const current = await this.redis.hget(key, update.action);
    const currentValue = parseInt(current || '0');
    const newValue = currentValue + update.increment;
    
    // Update Redis
    await this.redis.hset(key, update.action, newValue.toString());
    
    // Get target value
    const template = await this.core.getTemplate(mission.templateId);
    const target = template.requirements[update.action]?.target || 0;
    
    // Check if requirement is met
    const isComplete = newValue >= target;
    
    // Check if all requirements are met
    if (isComplete) {
      const allComplete = await this.checkAllRequirements(mission);
      
      if (allComplete && !mission.completedAt) {
        await this.markMissionComplete(mission);
        return { mission, completed: true, newValue };
      }
    }
    
    return { mission, completed: false, newValue };
  }
}
```

### 2.2 Real-time Updates via WebSocket

```typescript
// server/src/domains/missions/services/mission-websocket.service.ts
import { WebSocketService } from '@core/websocket';
import type { MissionUpdate } from '@shared/types/missions';

export class MissionWebSocketService {
  private ws: WebSocketService;
  
  constructor() {
    this.ws = WebSocketService.getInstance();
  }
  
  /**
   * Broadcast progress update to user
   */
  async broadcastProgress(
    userId: UserId,
    update: MissionProgressUpdate
  ): Promise<void> {
    await this.ws.emitToUser(userId, 'mission:progress', {
      missionId: update.missionId,
      requirement: update.requirement,
      current: update.current,
      target: update.target,
      percentage: (update.current / update.target) * 100
    });
  }
  
  /**
   * Broadcast mission completion
   */
  async broadcastCompletion(
    userId: UserId,
    mission: CompletedMission
  ): Promise<void> {
    await this.ws.emitToUser(userId, 'mission:complete', {
      missionId: mission.id,
      name: mission.name,
      rewards: mission.rewards,
      animation: this.getCompletionAnimation(mission.category)
    });
  }
  
  /**
   * Broadcast new mission assignment
   */
  async broadcastNewMission(
    userId: UserId,
    mission: ActiveMission
  ): Promise<void> {
    await this.ws.emitToUser(userId, 'mission:new', {
      mission: await this.transformMission(mission),
      notification: {
        title: 'New Mission Available!',
        message: mission.name,
        icon: mission.icon
      }
    });
  }
}
```

## Phase 3: Reward System

### 3.1 Reward Processor

```typescript
// server/src/domains/missions/services/mission-reward.service.ts
import { db } from '@core/db';
import { DgtService } from '@domains/wallet/services/dgt.service';
import { XpService } from '@domains/xp/services/xp.service';
import { InventoryService } from '@domains/shop/services/inventory.service';
import { AchievementService } from '@domains/gamification/services/achievement.service';

export class MissionRewardService {
  private dgt: DgtService;
  private xp: XpService;
  private inventory: InventoryService;
  private achievements: AchievementService;
  
  /**
   * Process mission rewards with transaction safety
   */
  async processRewards(
    userId: UserId,
    missionId: MissionId,
    rewards: MissionRewards
  ): Promise<RewardResult> {
    return await db.transaction(async (tx) => {
      const results: RewardResult = {
        xp: 0,
        dgt: 0,
        items: [],
        badges: [],
        titles: []
      };
      
      // 1. Grant XP
      if (rewards.xp) {
        const xpResult = await this.xp.awardXP(
          userId,
          rewards.xp,
          'mission_complete',
          { missionId },
          tx
        );
        results.xp = xpResult.amount;
      }
      
      // 2. Grant DGT
      if (rewards.dgt) {
        await this.dgt.creditDgt(
          userId,
          rewards.dgt,
          {
            source: 'mission_reward',
            missionId,
            reason: `Mission completed: ${missionId}`
          },
          tx
        );
        results.dgt = rewards.dgt;
      }
      
      // 3. Grant items
      if (rewards.items?.length) {
        const items = await this.inventory.grantItems(
          userId,
          rewards.items,
          'mission_reward',
          tx
        );
        results.items = items;
      }
      
      // 4. Grant badges
      if (rewards.badges?.length) {
        for (const badgeId of rewards.badges) {
          await this.achievements.grantBadge(userId, badgeId, tx);
          results.badges.push(badgeId);
        }
      }
      
      // 5. Grant titles
      if (rewards.titles?.length) {
        for (const titleId of rewards.titles) {
          await this.inventory.grantTitle(userId, titleId, tx);
          results.titles.push(titleId);
        }
      }
      
      // 6. Mark mission as claimed
      await tx
        .update(activeMissions)
        .set({ claimedAt: new Date() })
        .where(eq(activeMissions.id, missionId));
      
      // 7. Update mission history
      await this.recordMissionHistory(userId, missionId, results, tx);
      
      // 8. Check for meta-achievements
      await this.checkMissionAchievements(userId, tx);
      
      return results;
    });
  }
  
  /**
   * Calculate dynamic rewards based on performance
   */
  calculateDynamicRewards(
    baseRewards: MissionRewards,
    performance: MissionPerformance
  ): MissionRewards {
    const rewards = { ...baseRewards };
    
    // Speed bonus
    if (performance.timeToComplete < performance.averageTime * 0.5) {
      rewards.xp = Math.floor(rewards.xp * 1.5);
      rewards.dgt = Math.floor(rewards.dgt * 1.25);
    }
    
    // Streak bonus
    if (performance.currentStreak >= 7) {
      rewards.xp *= 2;
      rewards.dgt *= 2;
    } else if (performance.currentStreak >= 3) {
      rewards.xp = Math.floor(rewards.xp * 1.5);
      rewards.dgt = Math.floor(rewards.dgt * 1.5);
    }
    
    // Perfect completion bonus
    if (performance.perfectCompletion) {
      rewards.xp = Math.floor(rewards.xp * 1.25);
    }
    
    return rewards;
  }
}
```

### 3.2 Streak Management

```typescript
// server/src/domains/missions/services/mission-streak.service.ts
export class MissionStreakService {
  /**
   * Update user's mission streaks
   */
  async updateStreaks(
    userId: UserId,
    completionType: 'daily' | 'weekly'
  ): Promise<StreakUpdate> {
    const key = `streak:${userId}:${completionType}`;
    
    // Get current streak
    const current = await db
      .select()
      .from(missionStreaks)
      .where(
        and(
          eq(missionStreaks.userId, userId),
          eq(missionStreaks.streakType, completionType)
        )
      )
      .limit(1);
    
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    
    if (!current[0]) {
      // Create new streak
      const [streak] = await db
        .insert(missionStreaks)
        .values({
          userId,
          streakType: completionType,
          currentStreak: 1,
          bestStreak: 1,
          lastCompleted: today
        })
        .returning();
      
      return { streak: 1, isNew: true, bonus: 0 };
    }
    
    const streak = current[0];
    const lastCompleted = new Date(streak.lastCompleted);
    const daysSince = Math.floor(
      (today.getTime() - lastCompleted.getTime()) / (1000 * 60 * 60 * 24)
    );
    
    let newStreak = streak.currentStreak;
    let broken = false;
    
    if (daysSince === 0) {
      // Already completed today
      return { streak: streak.currentStreak, isNew: false, bonus: 0 };
    } else if (daysSince === 1) {
      // Consecutive day - increment streak
      newStreak = streak.currentStreak + 1;
    } else {
      // Streak broken
      newStreak = 1;
      broken = true;
      
      // Record streak break
      await this.recordStreakBreak(userId, streak);
    }
    
    // Update streak
    await db
      .update(missionStreaks)
      .set({
        currentStreak: newStreak,
        bestStreak: Math.max(newStreak, streak.bestStreak),
        lastCompleted: today,
        streakBrokenAt: broken ? today : null
      })
      .where(
        and(
          eq(missionStreaks.userId, userId),
          eq(missionStreaks.streakType, completionType)
        )
      );
    
    // Calculate bonus
    const bonus = this.calculateStreakBonus(newStreak);
    
    // Check for streak achievements
    await this.checkStreakAchievements(userId, newStreak, completionType);
    
    return { streak: newStreak, isNew: !broken, bonus };
  }
  
  /**
   * Calculate streak bonus multiplier
   */
  private calculateStreakBonus(streak: number): number {
    if (streak >= 30) return 3.0;
    if (streak >= 14) return 2.5;
    if (streak >= 7) return 2.0;
    if (streak >= 3) return 1.5;
    return 1.0;
  }
}
```

## Phase 4: Frontend Implementation

### 4.1 Mission Hub Component

```tsx
// client/src/components/missions/MissionHub.tsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMissions } from '@/hooks/useMissions';
import { MissionCard } from './MissionCard';
import { StreakBanner } from './StreakBanner';
import { MissionFilters } from './MissionFilters';
import { CompletionAnimation } from './CompletionAnimation';
import { DegenLoader } from '@/components/uiverse-clones/loaders';

export const MissionHub: React.FC = () => {
  const {
    missions,
    streaks,
    loading,
    filter,
    setFilter,
    claimReward,
    refreshMissions
  } = useMissions();
  
  const [showCompletion, setShowCompletion] = useState<Mission | null>(null);
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <DegenLoader size="lg" text="Loading missions..." />
      </div>
    );
  }
  
  return (
    <div className="mission-hub space-y-6">
      {/* Streak Banner */}
      <StreakBanner streaks={streaks} />
      
      {/* Filters */}
      <MissionFilters
        activeFilter={filter}
        onFilterChange={setFilter}
        missionCounts={{
          all: missions.length,
          daily: missions.filter(m => m.periodType === 'daily').length,
          weekly: missions.filter(m => m.periodType === 'weekly').length,
          special: missions.filter(m => m.periodType === 'special').length
        }}
      />
      
      {/* Mission Grid */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        layout
      >
        <AnimatePresence mode="popLayout">
          {missions
            .filter(m => filter === 'all' || m.periodType === filter)
            .map(mission => (
              <MissionCard
                key={mission.id}
                mission={mission}
                onClaim={async () => {
                  const result = await claimReward(mission.id);
                  if (result.success) {
                    setShowCompletion(mission);
                  }
                }}
                onComplete={() => setShowCompletion(mission)}
              />
            ))}
        </AnimatePresence>
      </motion.div>
      
      {/* Completion Animation Overlay */}
      <AnimatePresence>
        {showCompletion && (
          <CompletionAnimation
            mission={showCompletion}
            onClose={() => setShowCompletion(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};
```

### 4.2 Mission Card with Progress

```tsx
// client/src/components/missions/MissionCard.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { ProgressRing } from './ProgressRing';
import { RewardPreview } from './RewardPreview';
import { PumpButton } from '@/components/uiverse-clones/buttons';
import { Clock, Trophy, Zap } from 'lucide-react';
import { cn } from '@/utils/utils';

interface MissionCardProps {
  mission: Mission;
  onClaim: () => Promise<void>;
  onComplete: () => void;
}

export const MissionCard: React.FC<MissionCardProps> = ({
  mission,
  onClaim,
  onComplete
}) => {
  const [claiming, setClaiming] = useState(false);
  const progress = mission.progress;
  const isComplete = progress.percentage >= 100;
  const isClaimed = mission.claimedAt !== null;
  
  const categoryColors = {
    participation: 'from-blue-500 to-blue-600',
    social: 'from-purple-500 to-purple-600',
    trading: 'from-green-500 to-green-600',
    content: 'from-amber-500 to-amber-600',
    engagement: 'from-pink-500 to-pink-600',
    special_event: 'from-red-500 to-red-600',
    vip_exclusive: 'from-yellow-500 to-yellow-600'
  };
  
  const handleClaim = async () => {
    setClaiming(true);
    await onClaim();
    setClaiming(false);
  };
  
  useEffect(() => {
    if (isComplete && !mission.completedAt) {
      onComplete();
    }
  }, [isComplete]);
  
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ y: -4 }}
      className={cn(
        "mission-card relative overflow-hidden rounded-xl border",
        "bg-zinc-900/50 backdrop-blur-sm",
        isComplete && !isClaimed && "border-emerald-500/50 shadow-emerald-500/20 shadow-lg",
        !isComplete && "border-zinc-800",
        isClaimed && "opacity-60"
      )}
    >
      {/* Category Banner */}
      <div className={cn(
        "h-2 bg-gradient-to-r",
        categoryColors[mission.category]
      )} />
      
      {/* Content */}
      <div className="p-6 space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-white">
              {mission.name}
            </h3>
            <p className="text-sm text-zinc-400 mt-1">
              {mission.description}
            </p>
          </div>
          
          {/* Progress Ring */}
          <ProgressRing
            progress={progress.percentage}
            size={60}
            strokeWidth={4}
            className="flex-shrink-0"
          />
        </div>
        
        {/* Requirements */}
        <div className="space-y-2">
          {Object.entries(mission.requirements).map(([key, req]) => (
            <div
              key={key}
              className="flex items-center justify-between text-sm"
            >
              <span className="text-zinc-400">
                {req.label}
              </span>
              <span className={cn(
                "font-medium",
                progress.requirements[key].current >= req.target
                  ? "text-emerald-400"
                  : "text-zinc-300"
              )}>
                {progress.requirements[key].current} / {req.target}
              </span>
            </div>
          ))}
        </div>
        
        {/* Time Remaining */}
        {mission.periodType !== 'perpetual' && (
          <div className="flex items-center gap-2 text-xs text-zinc-500">
            <Clock className="w-3 h-3" />
            <span>{getTimeRemaining(mission.periodEnd)}</span>
          </div>
        )}
        
        {/* Rewards */}
        <RewardPreview rewards={mission.rewards} compact />
        
        {/* Action Button */}
        {isComplete && !isClaimed && (
          <PumpButton
            variant="pump"
            size="sm"
            className="w-full"
            onClick={handleClaim}
            disabled={claiming}
          >
            {claiming ? 'Claiming...' : 'Claim Rewards!'}
          </PumpButton>
        )}
        
        {isClaimed && (
          <div className="text-center text-sm text-zinc-500">
            <Trophy className="w-4 h-4 inline mr-1" />
            Completed
          </div>
        )}
      </div>
      
      {/* Completion Glow Effect */}
      {isComplete && !isClaimed && (
        <motion.div
          className="absolute inset-0 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-emerald-500/10 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-500 to-transparent" />
        </motion.div>
      )}
    </motion.div>
  );
};
```

### 4.3 Real-time Progress Updates

```tsx
// client/src/hooks/useMissions.ts
import { useEffect, useState } from 'react';
import { useWebSocket } from '@/hooks/useWebSocket';
import { missionApi } from '@/api/missions';
import { useToast } from '@/hooks/useToast';

export const useMissions = () => {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [streaks, setStreaks] = useState<MissionStreaks | null>(null);
  const [loading, setLoading] = useState(true);
  const { socket } = useWebSocket();
  const { toast } = useToast();
  
  // Load initial missions
  useEffect(() => {
    loadMissions();
  }, []);
  
  // Subscribe to real-time updates
  useEffect(() => {
    if (!socket) return;
    
    // Progress updates
    socket.on('mission:progress', (update: MissionProgressUpdate) => {
      setMissions(prev => prev.map(m => {
        if (m.id !== update.missionId) return m;
        
        return {
          ...m,
          progress: {
            ...m.progress,
            requirements: {
              ...m.progress.requirements,
              [update.requirement]: {
                current: update.current,
                target: update.target
              }
            },
            percentage: update.percentage
          }
        };
      }));
    });
    
    // Mission completion
    socket.on('mission:complete', (data: MissionCompletion) => {
      toast({
        title: 'Mission Complete!',
        description: `You completed ${data.name}`,
        variant: 'success',
        icon: '🎉'
      });
      
      // Update mission state
      setMissions(prev => prev.map(m => 
        m.id === data.missionId
          ? { ...m, completedAt: new Date() }
          : m
      ));
    });
    
    // New mission assigned
    socket.on('mission:new', (data: NewMissionEvent) => {
      setMissions(prev => [...prev, data.mission]);
      
      toast({
        title: data.notification.title,
        description: data.notification.message,
        icon: data.notification.icon
      });
    });
    
    return () => {
      socket.off('mission:progress');
      socket.off('mission:complete');
      socket.off('mission:new');
    };
  }, [socket]);
  
  const loadMissions = async () => {
    try {
      setLoading(true);
      const [missionsData, streaksData] = await Promise.all([
        missionApi.getActiveMissions(),
        missionApi.getStreaks()
      ]);
      
      setMissions(missionsData);
      setStreaks(streaksData);
    } catch (error) {
      toast({
        title: 'Failed to load missions',
        variant: 'error'
      });
    } finally {
      setLoading(false);
    }
  };
  
  const claimReward = async (missionId: string) => {
    try {
      const result = await missionApi.claimReward(missionId);
      
      if (result.success) {
        // Update local state
        setMissions(prev => prev.map(m =>
          m.id === missionId
            ? { ...m, claimedAt: new Date() }
            : m
        ));
        
        // Show reward notification
        toast({
          title: 'Rewards Claimed!',
          description: formatRewards(result.rewards),
          variant: 'success',
          duration: 5000
        });
      }
      
      return result;
    } catch (error) {
      toast({
        title: 'Failed to claim reward',
        variant: 'error'
      });
      throw error;
    }
  };
  
  return {
    missions,
    streaks,
    loading,
    claimReward,
    refreshMissions: loadMissions
  };
};
```

## Phase 5: Admin Configuration

### 5.1 Mission Builder UI

```tsx
// client/src/features/admin/missions/MissionBuilder.tsx
import React, { useState } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { RequirementBuilder } from './RequirementBuilder';
import { RewardConfigurator } from './RewardConfigurator';
import { MissionPreview } from './MissionPreview';
import { useAdminMissions } from '@/hooks/useAdminMissions';

export const MissionBuilder: React.FC = () => {
  const [template, setTemplate] = useState<MissionTemplate>({
    key: '',
    name: '',
    description: '',
    category: 'participation',
    type: 'count',
    requirements: {},
    rewards: {},
    weight: 100,
    minLevel: 1
  });
  
  const { createTemplate, testTemplate } = useAdminMissions();
  
  return (
    <DndProvider backend={HTML5Backend}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Builder */}
        <div className="space-y-6">
          {/* Basic Info */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold mb-4">Mission Details</h3>
            
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Mission Name"
                value={template.name}
                onChange={e => setTemplate({ ...template, name: e.target.value })}
                className="input w-full"
              />
              
              <textarea
                placeholder="Description"
                value={template.description}
                onChange={e => setTemplate({ ...template, description: e.target.value })}
                className="textarea w-full"
                rows={3}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <select
                  value={template.category}
                  onChange={e => setTemplate({ ...template, category: e.target.value as MissionCategory })}
                  className="select"
                >
                  <option value="participation">Participation</option>
                  <option value="social">Social</option>
                  <option value="trading">Trading</option>
                  <option value="content">Content</option>
                  <option value="special_event">Special Event</option>
                </select>
                
                <select
                  value={template.type}
                  onChange={e => setTemplate({ ...template, type: e.target.value as MissionType })}
                  className="select"
                >
                  <option value="count">Count</option>
                  <option value="threshold">Threshold</option>
                  <option value="streak">Streak</option>
                  <option value="combo">Combo</option>
                </select>
              </div>
            </div>
          </div>
          
          {/* Requirements */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold mb-4">Requirements</h3>
            <RequirementBuilder
              requirements={template.requirements}
              onChange={reqs => setTemplate({ ...template, requirements: reqs })}
            />
          </div>
          
          {/* Rewards */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold mb-4">Rewards</h3>
            <RewardConfigurator
              rewards={template.rewards}
              onChange={rewards => setTemplate({ ...template, rewards })}
            />
          </div>
        </div>
        
        {/* Preview */}
        <div className="space-y-6">
          <div className="card p-6">
            <h3 className="text-lg font-semibold mb-4">Preview</h3>
            <MissionPreview template={template} />
          </div>
          
          {/* Actions */}
          <div className="flex gap-4">
            <button
              onClick={() => testTemplate(template)}
              className="btn btn-secondary flex-1"
            >
              Test Mission
            </button>
            
            <button
              onClick={() => createTemplate(template)}
              className="btn btn-primary flex-1"
              disabled={!template.name || Object.keys(template.requirements).length === 0}
            >
              Create Template
            </button>
          </div>
        </div>
      </div>
    </DndProvider>
  );
};
```

### 5.2 Mission Analytics Dashboard

```tsx
// client/src/features/admin/missions/MissionAnalytics.tsx
import React from 'react';
import { LineChart, BarChart, PieChart } from '@/components/charts';
import { useMissionAnalytics } from '@/hooks/useMissionAnalytics';
import { StatsCard } from '@/components/admin/StatsCard';

export const MissionAnalytics: React.FC = () => {
  const { data, loading } = useMissionAnalytics();
  
  if (loading) return <div>Loading analytics...</div>;
  
  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatsCard
          title="Completion Rate"
          value={`${data.completionRate.overall}%`}
          change={data.completionRate.change}
          icon="trophy"
        />
        
        <StatsCard
          title="Active Users"
          value={data.engagement.dailyActiveUsers}
          change={data.engagement.dauChange}
          icon="users"
        />
        
        <StatsCard
          title="Avg. Time to Complete"
          value={formatDuration(data.engagement.averageTimeToComplete)}
          icon="clock"
        />
        
        <StatsCard
          title="Total Rewards"
          value={`${data.economicImpact.totalDGTAwarded} DGT`}
          subtitle={`${data.economicImpact.totalXPAwarded} XP`}
          icon="coins"
        />
      </div>
      
      {/* Completion Trends */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold mb-4">Completion Trends</h3>
        <LineChart
          data={data.trends.daily}
          lines={[
            { key: 'completed', name: 'Completed', color: '#10b981' },
            { key: 'abandoned', name: 'Abandoned', color: '#ef4444' }
          ]}
          height={300}
        />
      </div>
      
      {/* Category Performance */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card p-6">
          <h3 className="text-lg font-semibold mb-4">By Category</h3>
          <PieChart
            data={Object.entries(data.completionRate.byCategory).map(([cat, rate]) => ({
              name: cat,
              value: rate
            }))}
            height={300}
          />
        </div>
        
        <div className="card p-6">
          <h3 className="text-lg font-semibold mb-4">By Difficulty</h3>
          <BarChart
            data={Object.entries(data.completionRate.byDifficulty).map(([diff, rate]) => ({
              name: diff,
              value: rate
            }))}
            height={300}
          />
        </div>
      </div>
      
      {/* A/B Test Results */}
      {data.experiments.length > 0 && (
        <div className="card p-6">
          <h3 className="text-lg font-semibold mb-4">Active Experiments</h3>
          <div className="space-y-4">
            {data.experiments.map(exp => (
              <ExperimentResult key={exp.id} experiment={exp} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
```

## Phase 6: Performance & Monitoring

### 6.1 Caching Strategy

```typescript
// server/src/domains/missions/services/mission-cache.service.ts
export class MissionCacheService {
  private redis: Redis;
  private cache: NodeCache;
  
  constructor() {
    this.redis = new Redis({ keyPrefix: 'missions:' });
    this.cache = new NodeCache({ stdTTL: 300 }); // 5 min local cache
  }
  
  /**
   * Multi-layer caching for mission data
   */
  async getCachedMissions(userId: UserId): Promise<Mission[] | null> {
    const key = `active:${userId}`;
    
    // L1: Local memory cache
    const local = this.cache.get<Mission[]>(key);
    if (local) return local;
    
    // L2: Redis cache
    const cached = await this.redis.get(key);
    if (cached) {
      const missions = JSON.parse(cached);
      this.cache.set(key, missions);
      return missions;
    }
    
    return null;
  }
  
  /**
   * Warm cache on user login
   */
  async warmUserCache(userId: UserId): Promise<void> {
    const missions = await this.loadUserMissions(userId);
    const key = `active:${userId}`;
    
    // Cache in Redis
    await this.redis.setex(key, 3600, JSON.stringify(missions));
    
    // Cache locally
    this.cache.set(key, missions);
    
    // Pre-cache progress
    await this.cacheProgress(userId, missions);
  }
  
  /**
   * Invalidate on mission update
   */
  async invalidateUserCache(userId: UserId): Promise<void> {
    const patterns = [
      `active:${userId}`,
      `progress:${userId}:*`,
      `streaks:${userId}`
    ];
    
    for (const pattern of patterns) {
      await this.redis.del(pattern);
      this.cache.del(pattern);
    }
  }
}
```

### 6.2 Monitoring Setup

```typescript
// server/src/domains/missions/monitoring/mission-metrics.ts
import { Counter, Histogram, Gauge } from 'prom-client';

export const missionMetrics = {
  // Progress tracking
  progressUpdates: new Counter({
    name: 'mission_progress_updates_total',
    help: 'Total mission progress updates',
    labelNames: ['action', 'mission_type']
  }),
  
  progressLatency: new Histogram({
    name: 'mission_progress_latency_ms',
    help: 'Mission progress update latency',
    buckets: [10, 25, 50, 100, 250, 500, 1000]
  }),
  
  // Completions
  missionsCompleted: new Counter({
    name: 'missions_completed_total',
    help: 'Total missions completed',
    labelNames: ['category', 'type', 'period']
  }),
  
  // Rewards
  rewardsDistributed: new Counter({
    name: 'mission_rewards_distributed_total',
    help: 'Total rewards distributed',
    labelNames: ['reward_type']
  }),
  
  // System health
  activeMissions: new Gauge({
    name: 'active_missions_count',
    help: 'Current number of active missions'
  }),
  
  resetJobDuration: new Histogram({
    name: 'mission_reset_duration_ms',
    help: 'Mission reset job duration',
    labelNames: ['period_type']
  }),
  
  // Errors
  errors: new Counter({
    name: 'mission_system_errors_total',
    help: 'Mission system errors',
    labelNames: ['error_type', 'severity']
  })
};

// Grafana Dashboard JSON
export const dashboardConfig = {
  title: "Mission System Dashboard",
  panels: [
    {
      title: "Mission Completions",
      targets: [
        {
          expr: 'rate(missions_completed_total[5m])',
          legendFormat: '{{category}}'
        }
      ]
    },
    {
      title: "Progress Update Latency",
      targets: [
        {
          expr: 'histogram_quantile(0.95, mission_progress_latency_ms)',
          legendFormat: 'p95'
        }
      ]
    },
    {
      title: "Economic Impact",
      targets: [
        {
          expr: 'sum(rate(mission_rewards_distributed_total{reward_type="dgt"}[1h])) * 0.1',
          legendFormat: 'DGT Value (USD/hour)'
        }
      ]
    }
  ]
};
```

## Summary

This comprehensive mission system provides:

1. **Scalable Architecture** - Redis caching, event-driven updates, efficient queries
2. **Flexible Configuration** - Admin UI, template system, A/B testing support
3. **Rich Features** - Streaks, dynamic rewards, prerequisites, special events
4. **Engaging UI** - Real-time updates, animations, progress visualization
5. **Production Ready** - Monitoring, error handling, transaction safety

The system will drive daily engagement through habit-forming missions while maintaining economic balance through configurable rewards and analytics-driven optimization.