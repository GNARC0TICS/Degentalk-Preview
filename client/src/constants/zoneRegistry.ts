// Canonical Zone Registry for Degentalk
// This file defines the runtime config for all forum zones (Primary and General)

import { forumRulesConfig } from '@/config/forumRules.config.ts'; // [CONFIG-REFAC] forum rules config import

export enum ForumType {
  Primary = 'primary',
  General = 'general',
}

export enum ZoneComponent {
  Shoutbox = 'Shoutbox',
  XPTracker = 'XPTracker',
  BountyBoard = 'BountyBoard',
  Leaderboards = 'Leaderboards', // Added for Mission Control
  LiveListings = 'LiveListings', // Added for DegenShop
  // Add more as needed
}

export type ThreadRules = {
  allowUserPosts: boolean;
  requireDGT?: boolean; // Made optional as not all zones define it
  allowPolls: boolean;
  unlockedStyling?: boolean; // Made optional
  readOnly?: boolean; // Added for The Archive
};

export type AccessControl = {
  canPost: string[]; // e.g., ['admin', 'mod', 'all', 'vip']
  canReply: string[];
  canView: string[];
};

export type SEOConfig = {
  title: string;
  description: string;
  category?: string; // Added for General Zones metadata
};

export type ZoneConfig = {
  id: string;
  slug: string;
  forum_type: ForumType;
  name: string;
  description?: string;
  components: ZoneComponent[];
  threadRules: ThreadRules;
  accessControl: AccessControl;
  seo: SEOConfig;
  displayPriority: number;
  theme?: string;
  parent_id?: string;
  slug_override?: string;
  unrestrictedThreadPerMonth?: boolean; // For The Pit's special mechanic
  postingLimits?: any; // Optional for beginner zones (General)
  // Additional fields for specific zone logic can be added here
};

// Degentalk Zone Registry
export const zoneRegistry = forumRulesConfig.forums; // [CONFIG-REFAC] moved from hardcoded object to config

// [CONFIG-REFAC] All usages of zoneRegistry should now reference forumRulesConfig.forums 