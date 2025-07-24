export interface MissionTemplate {
  id: string;
  key: string;
  name: string;
  description: string;
  category: MissionCategory;
  type: MissionType;
  requirements: MissionRequirements;
  rewards: MissionRewards;
  prerequisites?: MissionPrerequisites;
  metadata?: MissionMetadata;
  weight: number;
  minLevel: number;
  maxLevel?: number;
  cooldownHours?: number;
  isActive: boolean;
}

export interface Mission {
  id: string;
  template: MissionTemplate;
  userId: string;
  periodType: PeriodType;
  periodStart: string;
  periodEnd: string;
  assignedAt: string;
  completedAt?: string;
  claimedAt?: string;
  isFeatured: boolean;
  progress?: MissionProgress;
  // Helper properties derived from progress
  isComplete?: boolean;
  isClaimed?: boolean;
}

export interface ProgressMetric {
  current: number;
  target: number;
  percentage: number;
}

export interface MissionProgress {
  metrics: {
    [requirementKey: string]: ProgressMetric;
  };
  isComplete: boolean;
  isClaimed: boolean;
}

export type MissionCategory = 
  | 'participation'
  | 'social' 
  | 'trading'
  | 'content'
  | 'engagement'
  | 'achievement'
  | 'special_event'
  | 'vip_exclusive'
  | 'degen_activities'; // New category for degen-specific missions

export type MissionType =
  | 'count'      // Do X times
  | 'threshold'  // Reach X total
  | 'streak'     // X days in a row
  | 'timebound'  // Within X hours
  | 'combo'      // Multiple requirements
  | 'unique'     // First time only
  | 'competitive'; // Top X users

export type PeriodType = 
  | 'daily'
  | 'weekly'
  | 'monthly'
  | 'special'
  | 'perpetual';

export interface MissionRequirements {
  // Forum activities
  posts_created?: number;
  threads_created?: number;
  reactions_given?: number;
  reactions_received?: number;
  min_post_length?: number;
  posts_with_media?: number;
  unique_forums_posted?: number;
  
  // Social activities
  users_followed?: number;
  followers_gained?: number;
  whispers_sent?: number;
  unique_recipients?: number;
  shoutbox_messages?: number;
  
  // Economic activities
  tips_sent?: number;
  tips_received?: number;
  dgt_spent_tips?: number;
  dgt_earned_tips?: number;
  min_tip_amount?: number;
  rain_events?: number;
  rain_participation?: number;
  shop_purchases?: number;
  
  // Engagement
  daily_logins?: number;
  consecutive_logins?: number;
  profile_views?: number;
  
  // Degen-specific
  chart_checks?: number; // "Check $PEPE chart X times"
  fomo_purchases?: number; // "FOMO into X shitcoins"
  gm_posts?: number; // "Post 'gm' X times"
  shill_posts?: number; // "Shill your bags X times"
  rug_survivals?: number; // "Survive X rugs"
  diamond_hands_hours?: number; // "Hold without selling for X hours"
  
  [key: string]: any;
}

export interface MissionRewards {
  xp?: number;
  dgt?: number;
  clout?: number;
  badge?: string;
  title?: string;
  avatar_frame?: string;
  items?: string[];
  special_flair?: string;
}

export interface MissionPrerequisites {
  level?: number;
  badges?: string[];
  missions?: string[];
  xp?: number;
  dgt?: number;
  holdings?: { token: string; amount: number }[];
}

export interface MissionMetadata {
  icon?: string;
  color?: string;
  priority?: 'low' | 'medium' | 'high';
  tags?: string[];
  specialConditions?: {
    timeWindow?: { start: number; end: number };
    dayOfWeek?: number[];
    minQuality?: {
      length?: number;
      media?: boolean;
      reactions?: number;
    };
    targetForums?: string[];
    excludeForums?: string[];
  };
  // Degen-specific metadata
  degenLevel?: 'normie' | 'ape' | 'whale' | 'gigachad';
  riskLevel?: 'safu' | 'degen' | 'full_send';
  memeability?: number; // 1-10 scale
}

export interface MissionStreak {
  userId: string;
  streakType: 'daily' | 'weekly';
  currentStreak: number;
  bestStreak: number;
  lastCompleted: string | null;
  streakBrokenAt?: string;
  // Aliases used by components (backwards compatibility)
  type?: 'daily' | 'weekly'; // Alias for streakType
  current?: number; // Alias for currentStreak
  best?: number; // Alias for bestStreak
}

export interface MissionStats {
  totalCompleted: number;
  totalXpEarned: number;
  totalDgtEarned: number;
  completionRate: number;
  favoriteCategory: string;
  degenScore: number; // New: overall degen activity score
  rektCount: number; // Times user got rekt but kept going
  diamondHandsScore: number; // Holding strength
}