// Canonical Zone Registry for Degentalk
// This file defines the runtime config for all forum zones (Primary and General)

export enum ForumType {
  Primary = 'primary',
  General = 'general',
}

export enum ZoneComponent {
  Shoutbox = 'Shoutbox',
  XPTracker = 'XPTracker',
  BountyBoard = 'BountyBoard',
  // Add more as needed
}

export type ThreadRules = {
  allowUserPosts: boolean;
  requireDGT: boolean;
  allowPolls: boolean;
  unlockedStyling: boolean;
};

export type AccessControl = {
  canPost: string[]; // e.g., ['admin', 'mod', 'all']
  canReply: string[];
  canView: string[];
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
  seo: { title: string; description: string };
  displayPriority: number;
  theme?: string;
  parent_id?: string;
  slug_override?: string;
};

// Example registry (expand as needed)
export const zoneRegistry: Record<string, ZoneConfig> = {
  'mission-control': {
    id: 'zone-001',
    slug: 'mission-control',
    forum_type: ForumType.Primary,
    name: 'Mission Control',
    description: 'Official bounties, tasks, and admin challenges.',
    components: [ZoneComponent.BountyBoard, ZoneComponent.Shoutbox, ZoneComponent.XPTracker],
    threadRules: {
      allowUserPosts: false,
      requireDGT: true,
      allowPolls: false,
      unlockedStyling: false,
    },
    accessControl: {
      canPost: ['admin'],
      canReply: ['mod', 'admin'],
      canView: ['all'],
    },
    seo: {
      title: 'Mission Control - Degentalk',
      description: 'Official bounties, tasks, and admin challenges.',
    },
    displayPriority: 1,
    theme: 'mission',
  },
  'the-pit': {
    id: 'zone-002',
    slug: 'the-pit',
    forum_type: ForumType.Primary,
    name: 'The Pit',
    description: 'Anything-goes discussion chaos.',
    components: [ZoneComponent.Shoutbox],
    threadRules: {
      allowUserPosts: true,
      requireDGT: false,
      allowPolls: true,
      unlockedStyling: true,
    },
    accessControl: {
      canPost: ['all'],
      canReply: ['all'],
      canView: ['all'],
    },
    seo: {
      title: 'The Pit - Degentalk',
      description: 'Anything-goes discussion chaos.',
    },
    displayPriority: 2,
    theme: 'pit',
  },
  'airdrops-and-quests': {
    id: 'forum-101',
    slug: 'airdrops-and-quests',
    forum_type: ForumType.General,
    name: 'Airdrops & Quests',
    description: 'External quests, claim links, and referral events.',
    components: [],
    threadRules: {
      allowUserPosts: true,
      requireDGT: false,
      allowPolls: true,
      unlockedStyling: false,
    },
    accessControl: {
      canPost: ['all'],
      canReply: ['all'],
      canView: ['all'],
    },
    seo: {
      title: 'Airdrops & Quests - Degentalk',
      description: 'External quests, claim links, and referral events.',
    },
    displayPriority: 10,
    theme: 'airdrops',
  },
  // ...add more zones and forums as needed
}; 