# 🎯 DegenTalk Mission System Architecture

## Executive Summary

Comprehensive, production-ready mission system designed for maximum engagement, scalability, and configurability. Integrates seamlessly with existing XP, achievement, and DGT token systems.

## 🏗️ System Architecture

### Core Components

```
┌─────────────────────────────────────────────────────────────┐
│                      Mission System                          │
├─────────────────┬───────────────────┬──────────────────────┤
│  Mission Engine │  Progress Tracker  │   Reward Processor   │
├─────────────────┼───────────────────┼──────────────────────┤
│  Event Bus      │  Redis Cache       │   Transaction Manager│
├─────────────────┼───────────────────┼──────────────────────┤
│  Cron Scheduler │  Analytics Engine  │   Notification System│
└─────────────────┴───────────────────┴──────────────────────┘
```

### Data Flow

```
User Action → Event Bus → Progress Tracker → Cache Update
                ↓                               ↓
           Mission Check                  Database Persist
                ↓                               ↓
          Reward Process              WebSocket Broadcast
```

## 📊 Database Schema

### Core Tables

```sql
-- Mission Templates
CREATE TABLE mission_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key VARCHAR(100) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category mission_category NOT NULL,
  type mission_type NOT NULL,
  requirements JSONB NOT NULL,
  rewards JSONB NOT NULL,
  prerequisites JSONB,
  metadata JSONB DEFAULT '{}',
  weight INTEGER DEFAULT 100,
  min_level INTEGER DEFAULT 1,
  max_level INTEGER,
  cooldown_hours INTEGER,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Active Mission Instances
CREATE TABLE active_missions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID REFERENCES mission_templates(id),
  user_id UUID REFERENCES users(id),
  period_type period_type NOT NULL, -- 'daily', 'weekly', 'special'
  period_start TIMESTAMP NOT NULL,
  period_end TIMESTAMP NOT NULL,
  assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP,
  claimed_at TIMESTAMP,
  is_featured BOOLEAN DEFAULT false
);

-- Mission Progress
CREATE TABLE mission_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mission_id UUID REFERENCES active_missions(id),
  user_id UUID REFERENCES users(id),
  requirement_key VARCHAR(100) NOT NULL,
  current_value INTEGER DEFAULT 0,
  target_value INTEGER NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(mission_id, requirement_key)
);

-- Mission History
CREATE TABLE mission_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  template_id UUID REFERENCES mission_templates(id),
  completed_at TIMESTAMP NOT NULL,
  rewards_granted JSONB NOT NULL,
  time_to_complete INTEGER, -- seconds
  period_type period_type NOT NULL
);

-- Mission Streaks
CREATE TABLE mission_streaks (
  user_id UUID REFERENCES users(id),
  streak_type streak_type NOT NULL, -- 'daily', 'weekly'
  current_streak INTEGER DEFAULT 0,
  best_streak INTEGER DEFAULT 0,
  last_completed DATE,
  streak_broken_at TIMESTAMP,
  PRIMARY KEY (user_id, streak_type)
);
```

### Enums

```sql
CREATE TYPE mission_category AS ENUM (
  'participation',
  'social',
  'trading',
  'content',
  'engagement',
  'achievement',
  'special_event',
  'vip_exclusive'
);

CREATE TYPE mission_type AS ENUM (
  'count',      -- Do X times
  'threshold',  -- Reach X total
  'streak',     -- X days in a row
  'timebound',  -- Within X hours
  'combo',      -- Multiple requirements
  'unique',     -- First time only
  'competitive' -- Top X users
);

CREATE TYPE period_type AS ENUM (
  'daily',
  'weekly',
  'monthly',
  'special',
  'perpetual'
);
```

## 🎮 Mission Types & Templates

### Daily Missions (Reset: 00:00 UTC)

```typescript
interface DailyMissionPool {
  beginner: [
    {
      key: "daily_first_post",
      name: "Morning Degen",
      requirements: { posts_created: 1 },
      rewards: { xp: 50, dgt: 5 }
    },
    {
      key: "daily_reactions",
      name: "Spread the Love",
      requirements: { reactions_given: 5 },
      rewards: { xp: 30, dgt: 3 }
    }
  ],
  intermediate: [
    {
      key: "daily_quality_content",
      name: "Quality Contributor",
      requirements: { 
        posts_created: 3,
        min_post_length: 100,
        reactions_received: 10
      },
      rewards: { xp: 150, dgt: 15, clout: 5 }
    }
  ],
  advanced: [
    {
      key: "daily_market_maker",
      name: "Market Maker",
      requirements: {
        tips_sent: 5,
        tips_received: 5,
        min_tip_amount: 10
      },
      rewards: { xp: 300, dgt: 50, badge: "daily_trader" }
    }
  ]
}
```

### Weekly Challenges

```typescript
interface WeeklyChallenge {
  key: "weekly_forum_champion",
  name: "Forum Champion",
  requirements: {
    threads_created: 5,
    posts_created: 25,
    unique_forums_posted: 3,
    reactions_received: 50
  },
  rewards: {
    xp: 1000,
    dgt: 200,
    title: "Weekly Champion",
    avatar_frame: "champion_glow"
  }
}
```

### Special Event Missions

```typescript
interface EventMission {
  key: "christmas_2024_generous",
  name: "Secret Santa",
  active_period: {
    start: "2024-12-20",
    end: "2024-12-27"
  },
  requirements: {
    rain_events: 3,
    tips_sent: 25,
    unique_recipients: 10
  },
  rewards: {
    xp: 2000,
    dgt: 500,
    exclusive_badge: "santa_2024",
    special_item: "christmas_hat"
  }
}
```

## 🔄 Progress Tracking System

### Event-Driven Architecture

```typescript
// Event Emitter Integration
interface MissionEvent {
  userId: UserId;
  action: ActionType;
  metadata: {
    amount?: number;
    targetId?: string;
    forumId?: string;
    quality?: QualityMetrics;
  };
  timestamp: Date;
}

// Progress Tracker Service
class MissionProgressTracker {
  async trackAction(event: MissionEvent): Promise<void> {
    // 1. Get user's active missions
    const activeMissions = await this.getActiveMissions(event.userId);
    
    // 2. Filter relevant missions
    const relevantMissions = this.filterByAction(activeMissions, event.action);
    
    // 3. Update progress in Redis (fast path)
    await this.updateProgressCache(relevantMissions, event);
    
    // 4. Check completions
    const completed = await this.checkCompletions(relevantMissions);
    
    // 5. Process rewards if completed
    if (completed.length > 0) {
      await this.processCompletions(completed);
    }
    
    // 6. Persist to PostgreSQL (async)
    this.persistProgress(relevantMissions);
  }
}
```

### Redis Cache Structure

```typescript
// Mission progress cache
MISSION_PROGRESS:{userId}:{missionId} = {
  requirements: {
    posts_created: { current: 2, target: 5 },
    reactions_given: { current: 10, target: 10 } // Complete!
  },
  lastUpdate: "2024-01-14T10:30:00Z",
  completed: false
}

// Daily active missions
DAILY_MISSIONS:{userId}:{date} = [missionId1, missionId2, missionId3]

// Streak tracking
STREAK:{userId}:daily = {
  current: 7,
  best: 14,
  lastCompleted: "2024-01-13"
}
```

## 🎁 Reward Processing

### Transaction-Safe Reward System

```typescript
class MissionRewardProcessor {
  async processRewards(
    userId: UserId,
    missionId: MissionId,
    rewards: MissionRewards
  ): Promise<RewardTransaction> {
    return await db.transaction(async (tx) => {
      // 1. Mark mission as claimed
      await tx.update(activeMissions)
        .set({ claimed_at: new Date() })
        .where(eq(activeMissions.id, missionId));
      
      // 2. Grant XP
      if (rewards.xp) {
        await xpService.awardXP(userId, rewards.xp, 'mission_complete', tx);
      }
      
      // 3. Grant DGT
      if (rewards.dgt) {
        await dgtService.creditDgt(userId, rewards.dgt, {
          source: 'mission_reward',
          missionId
        }, tx);
      }
      
      // 4. Grant special rewards
      if (rewards.items) {
        await inventoryService.grantItems(userId, rewards.items, tx);
      }
      
      // 5. Update achievements
      await achievementService.checkMissionAchievements(userId, tx);
      
      return { success: true, rewards };
    });
  }
}
```

## ⏰ Scheduling System

### Cron Jobs

```typescript
// Daily reset - 00:00 UTC
schedule.scheduleJob('0 0 * * *', async () => {
  await missionService.performDailyReset();
});

// Weekly reset - Monday 00:00 UTC
schedule.scheduleJob('0 0 * * 1', async () => {
  await missionService.performWeeklyReset();
});

// Hourly mission rotation check
schedule.scheduleJob('0 * * * *', async () => {
  await missionService.checkSpecialMissionRotation();
});
```

### Reset Logic

```typescript
async performDailyReset(): Promise<void> {
  // 1. Archive completed missions
  await this.archiveCompletedMissions('daily');
  
  // 2. Update streaks
  await this.updateDailyStreaks();
  
  // 3. Assign new daily missions
  const users = await this.getActiveUsers();
  
  for (const batch of chunk(users, 100)) {
    await Promise.all(
      batch.map(user => this.assignDailyMissions(user))
    );
  }
  
  // 4. Send notifications
  await this.notifyMissionReset('daily');
}
```

## 🎨 Frontend Architecture

### Mission Hub Component

```tsx
// Main Mission Hub
interface MissionHubProps {
  userId: UserId;
  onMissionComplete?: (mission: Mission) => void;
}

const MissionHub: React.FC<MissionHubProps> = ({ userId }) => {
  const { missions, streaks, loading } = useMissions(userId);
  
  return (
    <div className="mission-hub glassmorphic-card">
      {/* Streak Banner */}
      <StreakBanner streaks={streaks} />
      
      {/* Mission Categories */}
      <TabGroup>
        <TabList>
          <Tab>Daily Tasks</Tab>
          <Tab>Weekly Challenges</Tab>
          <Tab>Special Events</Tab>
          {user.isVIP && <Tab>VIP Exclusive</Tab>}
        </TabList>
        
        <TabPanels>
          <TabPanel>
            <DailyMissions missions={missions.daily} />
          </TabPanel>
          <TabPanel>
            <WeeklyMissions missions={missions.weekly} />
          </TabPanel>
          <TabPanel>
            <EventMissions missions={missions.events} />
          </TabPanel>
        </TabPanels>
      </TabGroup>
    </div>
  );
};
```

### Mission Card Design

```tsx
const MissionCard: React.FC<{ mission: Mission }> = ({ mission }) => {
  const progress = useProgress(mission.id);
  const { complete, claim } = useMissionActions();
  
  return (
    <motion.div
      className="mission-card"
      whileHover={{ scale: 1.02 }}
      animate={progress.isComplete ? "complete" : "active"}
    >
      {/* Progress Ring */}
      <ProgressRing
        progress={progress.percentage}
        size={80}
        strokeWidth={6}
        color={mission.category.color}
      />
      
      {/* Mission Info */}
      <div className="mission-content">
        <h3>{mission.name}</h3>
        <p>{mission.description}</p>
        
        {/* Requirements */}
        <div className="requirements">
          {mission.requirements.map(req => (
            <RequirementBadge
              key={req.key}
              requirement={req}
              progress={progress.requirements[req.key]}
            />
          ))}
        </div>
        
        {/* Rewards */}
        <RewardPreview rewards={mission.rewards} />
      </div>
      
      {/* Action Button */}
      {progress.isComplete && !progress.isClaimed && (
        <PumpButton onClick={() => claim(mission.id)}>
          Claim Rewards!
        </PumpButton>
      )}
    </motion.div>
  );
};
```

### Progress Visualization

```tsx
// Animated Progress Ring
const ProgressRing: React.FC<ProgressRingProps> = ({
  progress,
  size,
  strokeWidth,
  color
}) => {
  const circumference = 2 * Math.PI * (size / 2 - strokeWidth);
  const offset = circumference - (progress / 100) * circumference;
  
  return (
    <svg width={size} height={size}>
      {/* Background circle */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={size / 2 - strokeWidth}
        stroke="rgba(255,255,255,0.1)"
        strokeWidth={strokeWidth}
        fill="none"
      />
      
      {/* Progress circle */}
      <motion.circle
        cx={size / 2}
        cy={size / 2}
        r={size / 2 - strokeWidth}
        stroke={color}
        strokeWidth={strokeWidth}
        fill="none"
        strokeDasharray={circumference}
        initial={{ strokeDashoffset: circumference }}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      />
      
      {/* Center text */}
      <text
        x="50%"
        y="50%"
        textAnchor="middle"
        dy=".3em"
        className="progress-text"
      >
        {Math.round(progress)}%
      </text>
    </svg>
  );
};
```

## 🔧 Configuration System

### Mission Builder Admin Panel

```typescript
interface MissionBuilderConfig {
  templates: {
    beginner: MissionTemplate[];
    intermediate: MissionTemplate[];
    advanced: MissionTemplate[];
    vip: MissionTemplate[];
  };
  
  rotationRules: {
    dailyMissionCount: { min: 3, max: 5 };
    weeklyMissionCount: { min: 2, max: 3 };
    difficultyDistribution: {
      beginner: 0.4,
      intermediate: 0.4,
      advanced: 0.2
    };
  };
  
  rewards: {
    xpMultipliers: {
      daily: 1.0,
      weekly: 2.5,
      special: 5.0
    };
    dgtRates: {
      baseDaily: 10,
      baseWeekly: 50,
      bonusStreak: 2 // 2x for 7-day streak
    };
  };
}
```

### Dynamic Mission Creation

```typescript
// Admin can create missions via UI
interface MissionCreator {
  // Drag-drop requirement builder
  requirementBuilder: {
    actions: ActionType[];
    operators: ['>=', '==', '<=', 'between'];
    combinators: ['AND', 'OR'];
  };
  
  // Visual reward configurator
  rewardBuilder: {
    currencies: ['xp', 'dgt', 'clout'];
    items: InventoryItem[];
    badges: Badge[];
    titles: Title[];
  };
  
  // Scheduling options
  scheduling: {
    type: 'recurring' | 'one-time' | 'event';
    frequency?: 'daily' | 'weekly' | 'monthly';
    activeHours?: [start: number, end: number];
    timezone?: string;
  };
}
```

## 📊 Analytics & Optimization

### Mission Analytics

```typescript
interface MissionAnalytics {
  // Completion rates
  completionRate: {
    overall: number;
    byCategory: Record<MissionCategory, number>;
    byDifficulty: Record<Difficulty, number>;
  };
  
  // Engagement metrics
  engagement: {
    dailyActiveUsers: number;
    averageTimeToComplete: number;
    abandonmentRate: number;
    claimRate: number; // completed but not claimed
  };
  
  // Economic impact
  economicImpact: {
    totalXPAwarded: number;
    totalDGTAwarded: number;
    averageRewardPerUser: number;
    inflationRate: number;
  };
  
  // A/B testing
  experiments: {
    missionVariants: MissionVariant[];
    conversionRates: Record<string, number>;
    significanceScores: Record<string, number>;
  };
}
```

### Performance Optimization

```typescript
// Mission assignment algorithm
class MissionAssigner {
  async assignDailyMissions(userId: UserId): Promise<Mission[]> {
    // 1. Get user profile
    const profile = await this.getUserProfile(userId);
    
    // 2. Calculate mission pool
    const pool = this.getMissionPool(profile.level, profile.preferences);
    
    // 3. Apply smart selection
    const selected = this.smartSelect(pool, {
      recentHistory: profile.recentMissions,
      completionRate: profile.missionStats.completionRate,
      preferredCategories: profile.preferences.missionTypes,
      timeZone: profile.timezone,
      averagePlayTime: profile.stats.avgDailyMinutes
    });
    
    // 4. Create mission instances
    return this.createMissionInstances(selected, userId, 'daily');
  }
  
  private smartSelect(pool: MissionTemplate[], context: UserContext): MissionTemplate[] {
    // Scoring algorithm
    return pool
      .map(mission => ({
        mission,
        score: this.calculateMissionScore(mission, context)
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, context.targetCount)
      .map(item => item.mission);
  }
}
```

## 🚀 Deployment & Scaling

### Infrastructure Requirements

```yaml
# Redis for real-time progress
redis:
  mission_progress:
    memory: 2GB
    persistence: AOF
    replication: 2 replicas
  
# PostgreSQL for persistence  
postgresql:
  connections: 100
  shared_buffers: 2GB
  indexes:
    - mission_progress(user_id, mission_id)
    - active_missions(user_id, period_type)
    - mission_history(user_id, completed_at)

# Background workers
workers:
  mission_tracker:
    instances: 4
    memory: 512MB
  reward_processor:
    instances: 2
    memory: 1GB
  scheduler:
    instances: 1
    memory: 256MB
```

### Monitoring & Alerts

```typescript
// Key metrics to monitor
interface MissionSystemMetrics {
  // Performance
  progressUpdateLatency: Histogram;
  rewardProcessingTime: Histogram;
  resetJobDuration: Gauge;
  
  // Business
  dailyActiveUsers: Counter;
  missionsCompleted: Counter;
  rewardsDistributed: Counter;
  
  // Errors
  progressTrackingErrors: Counter;
  rewardProcessingFailures: Counter;
  resetJobFailures: Counter;
}

// Alert thresholds
const alerts = {
  highLatency: {
    condition: 'progressUpdateLatency > 500ms',
    severity: 'warning'
  },
  rewardFailure: {
    condition: 'rewardProcessingFailures > 10/min',
    severity: 'critical'
  },
  resetFailure: {
    condition: 'resetJobFailures > 0',
    severity: 'critical'
  }
};
```

## 🎯 Success Metrics

### KPIs

1. **Engagement**
   - DAU increase: Target +40%
   - Mission completion rate: >60%
   - Streak retention: >30% maintain 7-day streak

2. **Economic**
   - DGT velocity increase: +25%
   - XP distribution balance maintained
   - No inflation beyond 2% monthly

3. **Technical**
   - Progress update latency: <100ms p99
   - Zero data loss on resets
   - 99.9% uptime for mission system

### Launch Strategy

1. **Phase 1**: Beta with 10% users
   - Basic daily missions only
   - Monitor performance and engagement

2. **Phase 2**: Full rollout
   - Add weekly challenges
   - Enable streak system

3. **Phase 3**: Advanced features
   - Special events
   - VIP missions
   - Competitive missions

## 🔐 Security Considerations

- Rate limiting on progress updates
- Sanity checks on reward claims
- Audit log for all reward distributions
- Rollback capability for exploits
- Time-cheat prevention (server time only)

---

This architecture provides a robust, scalable foundation for DegenTalk's mission system that will drive engagement and create lasting user habits.