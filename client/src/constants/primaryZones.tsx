import React from 'react'; // Import React for ReactNode type

// Thread posting rules per zone
export interface ThreadRules {
  allowUserPosts: boolean;
  requireDGT: boolean;
  allowPolls: boolean;
  unlockedStyling: boolean;
}

// Role-based access control per zone
export interface AccessControl {
  canPost: string[];
  canReply: string[];
  canView: string[];
}

// SEO configuration per zone
export interface SEOConfig {
  title?: string;
  description?: string;
  keywords?: string[];
}

// Zone metrics/stats
export interface ZoneStats {
  threadCount?: number;
  postCount?: number;
  activeUsersCount?: number;
  totalUsers?: number;
}

// Zone features configuration
export interface ZoneFeatures {
  xpBoost?: {
    enabled: boolean;
    multiplier: number;
  };
  events?: {
    isActive: boolean;
    name?: string;
    endsAt?: Date;
  };
}

export interface PrimaryZone {
  // Core identification
  id: string;                     // e.g., "mission-control"
  slug: string;                   // URL slug, same as ID for primary zones
  label: string;                  // e.g., "Mission Control"
  description: string;            // Appears in ZoneCard
  tagline?: string;               // Short phrase under the label

  // Visual/UI configuration
  icon: React.ReactNode | string; // Icon name or React element
  gradient: string;               // Tailwind gradient class or custom string
  colorTheme?: string;            // Theme for styling (e.g., 'mission', 'pit')

  // Forum structure
  forums: string[];               // Slugs of forums under this zone
  displayPriority: number;        // Order on homepage (lower = higher priority)

  // Dynamic features (as per refactor plan)
  components: string[];           // Components to dynamically mount
  threadRules: ThreadRules;       // Thread creation/posting rules
  accessControl: AccessControl;   // Role-based access control

  // SEO and metadata
  seo: SEOConfig;

  // Stats and features
  stats?: ZoneStats;
  features?: ZoneFeatures;

  // Custom overrides
  customComponents?: {
    cardOverride?: React.FC<any>;
    layoutOverride?: React.FC<any>;
  };
}

export const primaryZones: Record<string, PrimaryZone> = {
  'mission-control': {
    id: 'mission-control',
    slug: 'mission-control',
    label: 'Mission Control',
    description: 'Official bounties, tasks, and admin challenges. Track your progress and contribute to the platform.',
    tagline: 'Your command center for Degentalk™ operations.',
    icon: '🎯',
    gradient: 'bg-gradient-to-br from-blue-500 to-purple-600',
    colorTheme: 'mission',
    displayPriority: 1,
    forums: [],
    components: ['BountyBoard', 'Shoutbox', 'XPTracker'],
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
      title: 'Mission Control - Degentalk™',
      description: 'Official bounties, tasks, and admin challenges.',
      keywords: ['bounties', 'tasks', 'missions', 'admin', 'degen'],
    },
    stats: {
      threadCount: 0,
      postCount: 0,
      activeUsersCount: 0,
    },
    features: {
      xpBoost: {
        enabled: true,
        multiplier: 2,
      },
    },
  },
  'the-pit': {
    id: 'the-pit',
    slug: 'the-pit',
    label: 'The Pit',
    description: 'Anything-goes discussion chaos. Enter at your own risk, degen.',
    tagline: 'Where degens roam free.',
    icon: '🔥',
    gradient: 'bg-gradient-to-br from-red-500 to-orange-500',
    colorTheme: 'pit',
    displayPriority: 2,
    forums: [],
    components: ['Shoutbox'],
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
      title: 'The Pit - Degentalk™',
      description: 'Anything-goes discussion chaos.',
      keywords: ['discussion', 'chaos', 'free', 'degen', 'community'],
    },
    stats: {
      threadCount: 0,
      postCount: 0,
      activeUsersCount: 0,
    },
    features: {
      xpBoost: {
        enabled: false,
        multiplier: 1,
      },
    },
  },
  'the-vault': {
    id: 'the-vault',
    slug: 'the-vault',
    label: 'The Vault',
    description: 'Token-gated discussions, high-value alpha, and exclusive content. Access requires DGT holdings.',
    tagline: 'Unlock premium degen insights.',
    icon: '💎',
    gradient: 'bg-gradient-to-br from-yellow-400 to-yellow-600',
    colorTheme: 'vault',
    displayPriority: 3,
    forums: ['marketplace'],
    components: ['TokenGate', 'Marketplace', 'PremiumContent'],
    threadRules: {
      allowUserPosts: true,
      requireDGT: true,
      allowPolls: true,
      unlockedStyling: true,
    },
    accessControl: {
      canPost: ['token_holder', 'mod', 'admin'],
      canReply: ['token_holder', 'mod', 'admin'],
      canView: ['token_holder', 'mod', 'admin'],
    },
    seo: {
      title: 'The Vault - Degentalk™',
      description: 'Token-gated flex & marketplace features.',
      keywords: ['token-gated', 'premium', 'alpha', 'vault', 'exclusive'],
    },
    stats: {
      threadCount: 0,
      postCount: 0,
      activeUsersCount: 0,
    },
    features: {
      xpBoost: {
        enabled: true,
        multiplier: 3,
      },
    },
  },
  'briefing-room': {
    id: 'briefing-room',
    slug: 'briefing-room',
    label: 'Briefing Room',
    description: 'Platform announcements, meta-discussions, feedback, and bug reports. Stay informed.',
    tagline: 'The official Degentalk™™ HQ.',
    icon: '📢',
    gradient: 'bg-gradient-to-br from-green-500 to-teal-500',
    colorTheme: 'briefing',
    displayPriority: 4,
    forums: [],
    components: ['Announcements', 'Feedback', 'BugReports'],
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
      title: 'Briefing Room - Degentalk™',
      description: 'Platform meta, suggestions, platform input.',
      keywords: ['announcements', 'meta', 'feedback', 'platform', 'official'],
    },
    stats: {
      threadCount: 0,
      postCount: 0,
      activeUsersCount: 0,
    },
    features: {
      xpBoost: {
        enabled: false,
        multiplier: 1,
      },
    },
  },
};

// Export as array for components that need it
export const primaryZonesArray: PrimaryZone[] = Object.values(primaryZones);

// Helper function to get primary zone IDs in display order
export function getPrimaryZoneIds(): string[] {
  return primaryZonesArray
    .sort((a, b) => a.displayPriority - b.displayPriority)
    .map(zone => zone.id);
}

// Get zone by ID
export function getPrimaryZone(id: string): PrimaryZone | undefined {
  return primaryZones[id];
}

// Check if a slug is a reserved primary zone slug
export function isPrimaryZoneSlug(slug: string): boolean {
  return slug in primaryZones;
}

// Reserved routes as per the refactor plan
export const reservedRoutes = [
  'mission-control',
  'the-pit',
  'the-vault',
  'briefing-room',
  'forums',
  'forum',
  'threads',
  'profile',
  'wallet',
  'admin',
  'auth',
  'leaderboard',
  'shop',
  'preferences',
  'mod',
  'missions',
  'zones',
  'tags',
  'whispers'
];

// Placeholder Components for Dynamic Mounting
const BountyBoard = () => <div>Bounty Board Component</div>;
const Shoutbox = () => <div>Shoutbox Component</div>;
const XPTracker = () => <div>XP Tracker Component</div>;
const TokenGate = () => <div>Token Gate Component</div>;
const Marketplace = () => <div>Marketplace Component</div>;
const PremiumContent = () => <div>Premium Content Component</div>;
const Announcements = () => <div>Announcements Component</div>;
const Feedback = () => <div>Feedback Component</div>;
const BugReports = () => <div>Bug Reports Component</div>;

// Component mapping for dynamic mounting
export const componentMap: Record<string, React.ComponentType<any>> = {
  // Will be populated with actual components as they're implemented
  'BountyBoard': BountyBoard,
  'Shoutbox': Shoutbox,
  'XPTracker': XPTracker,
  'TokenGate': TokenGate,
  'Marketplace': Marketplace,
  'PremiumContent': PremiumContent,
  'Announcements': Announcements,
  'Feedback': Feedback,
  'BugReports': BugReports,
}; 