/**
 * Mission Templates Configuration
 * 
 * Rich, scalable mission system based on DegenTalk's unique features
 * Designed to drive engagement through meaningful actions
 */

import type { InsertMissionTemplate } from '@schema';

export interface MissionTemplateConfig extends Omit<InsertMissionTemplate, 'id' | 'createdAt' | 'updatedAt'> {
  // Additional config properties
  unlockMessage?: string;
  completionMessage?: string;
  rotationWeight?: number; // Higher = more likely to be selected
  specialConditions?: {
    timeWindow?: { start: number; end: number }; // Hour range (0-23)
    dayOfWeek?: number[]; // 0-6 (Sunday-Saturday)
    minQuality?: { length?: number; media?: boolean; reactions?: number };
    targetForums?: string[]; // Specific forum IDs
    excludeForums?: string[]; // Forums to exclude
  };
}

/**
 * Daily Mission Templates - Reset every 24 hours
 */
export const dailyMissionTemplates: MissionTemplateConfig[] = [
  // === DEGEN ACTIVITIES ===
  {
    key: 'daily_chart_addict',
    name: 'Check $PEPE chart for the 69th time today',
    description: 'You know you want to... just one more refresh',
    category: 'degen_activities',
    type: 'count',
    requirements: { chart_checks: 10 },
    rewards: { xp: 50, dgt: 5 },
    metadata: { 
      icon: '📈', 
      color: '#00ff88',
      priority: 'high',
      degenLevel: 'ape',
      memeability: 10
    },
    weight: 100,
    minLevel: 1
  },
  {
    key: 'daily_fomo_master',
    name: 'FOMO into the latest shitcoin pump',
    description: 'Buy high, sell low - this is the way',
    category: 'degen_activities',
    type: 'count',
    requirements: { fomo_purchases: 1 },
    rewards: { xp: 100, dgt: 10, badge: 'fomo_survivor' },
    metadata: { 
      icon: '🚀', 
      color: '#ff4757',
      priority: 'high',
      riskLevel: 'full_send'
    },
    weight: 90,
    minLevel: 3
  },
  {
    key: 'daily_gm_ritual',
    name: 'Post "gm" in 5 different Discord servers',
    description: 'Spread positivity (and low-key shill your bags)',
    category: 'social',
    type: 'count',
    requirements: { gm_posts: 5 },
    rewards: { xp: 30, dgt: 3 },
    metadata: { 
      icon: '🌅', 
      color: '#f39c12',
      priority: 'medium',
      timeWindow: { start: 6, end: 12 }
    },
    weight: 95,
    minLevel: 1
  },
  {
    key: 'daily_shill_master',
    name: 'Shill your bags in at least 3 threads',
    description: 'DYOR = Do Your Own Rugging',
    category: 'degen_activities',
    type: 'count',
    requirements: { shill_posts: 3, min_post_length: 50 },
    rewards: { xp: 75, dgt: 8, clout: 5 },
    metadata: { 
      icon: '💼', 
      color: '#9b59b6',
      priority: 'medium',
      degenLevel: 'whale'
    },
    weight: 85,
    minLevel: 5
  },
  {
    key: 'daily_dyor_skip',
    name: 'Actually DYOR on that token you aped into',
    description: 'Just kidding, nobody does this',
    category: 'degen_activities',
    type: 'count',
    requirements: { posts_created: 1, min_post_length: 200 },
    rewards: { xp: 40, dgt: 4, badge: 'rare_researcher' },
    metadata: { 
      icon: '🔍', 
      color: '#3498db',
      priority: 'low',
      memeability: 3
    },
    weight: 50,
    minLevel: 10
  },
  {
    key: 'daily_touch_grass',
    name: 'Touch grass (optional)',
    description: 'Go outside for 30 seconds, then back to charts',
    category: 'achievement',
    type: 'unique',
    requirements: { profile_views: 1 }, // Just viewing profiles counts as "touching grass"
    rewards: { xp: 25, dgt: 2, title: 'Grass Toucher' },
    metadata: { 
      icon: '🌱', 
      color: '#27ae60',
      priority: 'low',
      degenLevel: 'normie'
    },
    weight: 30,
    minLevel: 1
  },
  {
    key: 'daily_3am_warrior',
    name: 'Wake up at 3am to check Asian market pump',
    description: 'Sleep is for those who miss pumps',
    category: 'degen_activities',
    type: 'count',
    requirements: { posts_created: 1 },
    rewards: { xp: 50, dgt: 5, clout: 3 },
    specialConditions: {
      timeWindow: { start: 2, end: 5 } // 2 AM - 5 AM
    },
    metadata: { 
      icon: '🌙', 
      color: '#e74c3c',
      priority: 'high',
      riskLevel: 'degen'
    },
    weight: 70,
    minLevel: 5
  },
  
  // === PARTICIPATION MISSIONS ===
  {
    key: 'daily_first_login',
    name: 'Morning Degen',
    description: 'Start your day in the DegenTalk community',
    category: 'participation',
    type: 'count',
    requirements: { daily_logins: 1 },
    rewards: { xp: 25, dgt: 2 },
    metadata: { icon: '☀️', color: '#FFD700' },
    weight: 100,
    minLevel: 1
  },
  {
    key: 'daily_active_member',
    name: 'Active Participant',
    description: 'Make 3 posts or threads today',
    category: 'participation',
    type: 'count',
    requirements: { 
      posts_created: 3
    },
    rewards: { xp: 50, dgt: 5 },
    metadata: { icon: '💬', color: '#3B82F6' },
    weight: 90,
    minLevel: 1
  },
  {
    key: 'daily_night_owl',
    name: 'Night Owl',
    description: 'Post during late night hours (10 PM - 4 AM)',
    category: 'participation',
    type: 'count',
    requirements: { posts_created: 2 },
    rewards: { xp: 75, dgt: 8, clout: 2 },
    specialConditions: {
      timeWindow: { start: 22, end: 4 }
    },
    metadata: { icon: '🦉', color: '#9333EA' },
    weight: 60,
    minLevel: 5
  },

  // === SOCIAL MISSIONS ===
  {
    key: 'daily_spread_love',
    name: 'Spread the Love',
    description: 'Give 5 reactions to quality posts',
    category: 'social',
    type: 'count',
    requirements: { reactions_given: 5 },
    rewards: { xp: 30, dgt: 3 },
    metadata: { icon: '❤️', color: '#EF4444' },
    weight: 95,
    minLevel: 1
  },
  {
    key: 'daily_conversation_starter',
    name: 'Conversation Starter',
    description: 'Create a thread that gets 10+ reactions',
    category: 'social',
    type: 'threshold',
    requirements: { 
      threads_created: 1,
      reactions_received: 10 
    },
    rewards: { xp: 100, dgt: 15, clout: 5 },
    metadata: { icon: '🚀', color: '#10B981' },
    weight: 70,
    minLevel: 5
  },
  {
    key: 'daily_whisper_network',
    name: 'Whisper Network',
    description: 'Send 3 whispers to different users',
    category: 'social',
    type: 'count',
    requirements: { 
      whispers_sent: 3,
      unique_recipients: 3 
    },
    rewards: { xp: 40, dgt: 4 },
    metadata: { icon: '🤫', color: '#6366F1' },
    weight: 80,
    minLevel: 3
  },

  // === TRADING/ECONOMIC MISSIONS ===
  {
    key: 'daily_tipper',
    name: 'Generous Tipper',
    description: 'Tip 3 quality posts with DGT',
    category: 'trading',
    type: 'count',
    requirements: { 
      tips_sent: 3,
      min_tip_amount: 5 
    },
    rewards: { xp: 80, dgt: 10 },
    metadata: { icon: '💎', color: '#8B5CF6' },
    weight: 75,
    minLevel: 5
  },
  {
    key: 'daily_rain_maker',
    name: 'Rain Maker',
    description: 'Host a rain event for the community',
    category: 'trading',
    type: 'count',
    requirements: { rain_events: 1 },
    rewards: { xp: 150, clout: 10, badge: 'rain_maker_daily' },
    metadata: { icon: '🌧️', color: '#0EA5E9' },
    weight: 40,
    minLevel: 10,
    prerequisites: { dgt: 100 }
  },

  // === CONTENT MISSIONS ===
  {
    key: 'daily_quality_contributor',
    name: 'Quality Contributor',
    description: 'Create 2 posts with 100+ words each',
    category: 'content',
    type: 'combo',
    requirements: { 
      posts_created: 2,
      min_post_length: 100 
    },
    rewards: { xp: 75, dgt: 8 },
    metadata: { icon: '✍️', color: '#F59E0B' },
    weight: 85,
    minLevel: 3
  },
  {
    key: 'daily_meme_lord',
    name: 'Meme Lord',
    description: 'Share 2 posts with images or GIFs',
    category: 'content',
    type: 'count',
    requirements: { 
      posts_created: 2,
      posts_with_media: 2 
    },
    rewards: { xp: 60, dgt: 6 },
    metadata: { icon: '🎭', color: '#EC4899' },
    weight: 80,
    minLevel: 2
  },

  // === ENGAGEMENT MISSIONS ===
  {
    key: 'daily_shoutbox_champion',
    name: 'Shoutbox Champion',
    description: 'Send 10 messages in the shoutbox',
    category: 'engagement',
    type: 'count',
    requirements: { shoutbox_messages: 10 },
    rewards: { xp: 40, dgt: 4 },
    metadata: { icon: '📢', color: '#14B8A6' },
    weight: 90,
    minLevel: 1
  },
  {
    key: 'daily_forum_explorer',
    name: 'Forum Explorer',
    description: 'Post in 3 different forums',
    category: 'engagement',
    type: 'unique',
    requirements: { 
      posts_created: 3,
      unique_forums_posted: 3 
    },
    rewards: { xp: 70, dgt: 7 },
    metadata: { icon: '🗺️', color: '#0891B2' },
    weight: 75,
    minLevel: 3
  }
];

/**
 * Weekly Mission Templates - Reset every 7 days
 */
export const weeklyMissionTemplates: MissionTemplateConfig[] = [
  // === ACHIEVEMENT MISSIONS ===
  {
    key: 'weekly_forum_champion',
    name: 'Forum Champion',
    description: 'Create 5 threads and 25 posts across different forums',
    category: 'achievement',
    type: 'combo',
    requirements: {
      threads_created: 5,
      posts_created: 25,
      unique_forums_posted: 3,
      reactions_received: 50
    },
    rewards: {
      xp: 500,
      dgt: 100,
      title: 'Forum Champion',
      avatar_frame: 'champion_glow'
    },
    metadata: { icon: '🏆', color: '#FFD700' },
    weight: 100,
    minLevel: 5
  },
  {
    key: 'weekly_social_butterfly',
    name: 'Social Butterfly',
    description: 'Build your network and engage with the community',
    category: 'social',
    type: 'combo',
    requirements: {
      users_followed: 10,
      whispers_sent: 20,
      reactions_given: 50,
      unique_recipients: 15
    },
    rewards: {
      xp: 400,
      dgt: 80,
      clout: 25,
      badge: 'social_butterfly'
    },
    metadata: { icon: '🦋', color: '#A78BFA' },
    weight: 90,
    minLevel: 3
  },
  {
    key: 'weekly_dgt_mogul',
    name: 'DGT Mogul',
    description: 'Master the DGT economy through trading and generosity',
    category: 'trading',
    type: 'combo',
    requirements: {
      tips_sent: 20,
      tips_received: 10,
      dgt_spent_tips: 200,
      rain_events: 2
    },
    rewards: {
      xp: 750,
      dgt: 150,
      badge: 'dgt_mogul',
      title: 'Token Master'
    },
    metadata: { icon: '💰', color: '#F59E0B' },
    weight: 70,
    minLevel: 10,
    prerequisites: { dgt: 500 }
  },
  {
    key: 'weekly_content_creator',
    name: 'Content Creator',
    description: 'Create high-quality content that resonates',
    category: 'content',
    type: 'combo',
    requirements: {
      posts_created: 20,
      posts_with_media: 10,
      reactions_received: 100,
      min_post_length: 150
    },
    rewards: {
      xp: 600,
      dgt: 120,
      badge: 'content_creator'
    },
    metadata: { icon: '🎨', color: '#06B6D4' },
    weight: 85,
    minLevel: 5
  },
  {
    key: 'weekly_engagement_streak',
    name: '7-Day Streak',
    description: 'Login and participate every day for a week',
    category: 'engagement',
    type: 'streak',
    requirements: {
      daily_logins: 7,
      posts_created: 14 // 2 per day average
    },
    rewards: {
      xp: 350,
      dgt: 70,
      clout: 15,
      badge: 'week_warrior'
    },
    metadata: { icon: '🔥', color: '#EF4444' },
    weight: 100,
    minLevel: 1
  }
];

/**
 * Special Event Mission Templates - Time-limited campaigns
 */
export const specialMissionTemplates: MissionTemplateConfig[] = [
  {
    key: 'special_launch_celebration',
    name: 'Launch Celebration',
    description: 'Celebrate the platform launch with massive engagement',
    category: 'special_event',
    type: 'combo',
    requirements: {
      posts_created: 10,
      threads_created: 3,
      reactions_given: 25,
      tips_sent: 5,
      rain_events: 1
    },
    rewards: {
      xp: 1000,
      dgt: 250,
      badge: 'launch_pioneer',
      title: 'OG Degen',
      avatar_frame: 'launch_special'
    },
    metadata: { icon: '🎉', color: '#FFD700' },
    weight: 150,
    minLevel: 1,
    cooldownHours: 720 // 30 days
  },
  {
    key: 'special_whale_hunt',
    name: 'Whale Hunt',
    description: 'Compete to become the biggest DGT whale',
    category: 'special_event',
    type: 'competitive',
    requirements: {
      dgt_earned_tips: 1000,
      tips_received: 50,
      rain_participation: 10
    },
    rewards: {
      xp: 2000,
      dgt: 500,
      badge: 'whale_hunter',
      title: 'DGT Whale',
      items: ['whale_avatar', 'whale_banner']
    },
    metadata: { icon: '🐋', color: '#1E40AF' },
    weight: 50,
    minLevel: 15,
    prerequisites: { dgt: 1000 }
  }
];

/**
 * VIP Exclusive Mission Templates - For premium members
 */
export const vipMissionTemplates: MissionTemplateConfig[] = [
  {
    key: 'vip_daily_bonus',
    name: 'VIP Daily Bonus',
    description: 'Exclusive daily rewards for VIP members',
    category: 'vip_exclusive',
    type: 'count',
    requirements: { daily_logins: 1 },
    rewards: { xp: 100, dgt: 25, clout: 5 },
    metadata: { icon: '👑', color: '#FFD700' },
    weight: 100,
    minLevel: 1,
    prerequisites: { badges: ['vip_member'] }
  },
  {
    key: 'vip_weekly_showcase',
    name: 'VIP Showcase',
    description: 'Featured content creation for VIP members',
    category: 'vip_exclusive',
    type: 'combo',
    requirements: {
      threads_created: 3,
      posts_created: 15,
      reactions_received: 75
    },
    rewards: {
      xp: 800,
      dgt: 200,
      badge: 'vip_creator',
      items: ['vip_frame_weekly']
    },
    metadata: { icon: '⭐', color: '#FBBF24' },
    weight: 100,
    minLevel: 5,
    prerequisites: { badges: ['vip_member'] }
  }
];

/**
 * Mission rotation configuration
 */
export const missionRotationConfig = {
  daily: {
    minMissions: 3,
    maxMissions: 5,
    distribution: {
      participation: 0.3,
      social: 0.25,
      trading: 0.15,
      content: 0.2,
      engagement: 0.1
    }
  },
  weekly: {
    minMissions: 2,
    maxMissions: 3,
    distribution: {
      achievement: 0.4,
      social: 0.2,
      trading: 0.2,
      content: 0.2
    }
  },
  levelScaling: {
    1: { dailyCount: 3, weeklyCount: 2 },
    5: { dailyCount: 4, weeklyCount: 2 },
    10: { dailyCount: 5, weeklyCount: 3 },
    20: { dailyCount: 5, weeklyCount: 3 },
    50: { dailyCount: 6, weeklyCount: 4 }
  }
};

/**
 * Mission completion messages
 */
export const missionMessages = {
  completion: {
    participation: ['Great job staying active! 🎯', 'You\'re on fire! 🔥'],
    social: ['Making friends and influencing degens! 🤝', 'Social butterfly achievement unlocked! 🦋'],
    trading: ['DGT master in the making! 💎', 'Show them how it\'s done! 💰'],
    content: ['Quality content creator! ✨', 'Your posts are legendary! 📝'],
    engagement: ['Community champion! 🏆', 'Engagement machine! ⚡'],
    achievement: ['Legendary status achieved! 👑', 'You\'re unstoppable! 🚀'],
    special_event: ['Special achievement unlocked! 🎉', 'Rare accomplishment! 💫'],
    vip_exclusive: ['VIP excellence! ⭐', 'Premium performance! 👑']
  },
  streak: {
    3: 'You\'re on a 3-day streak! Keep it up! 🔥',
    7: 'One week straight! Impressive dedication! 💪',
    14: 'Two weeks! You\'re a true degen! 🏆',
    30: 'One month streak! Absolutely legendary! 👑'
  }
};