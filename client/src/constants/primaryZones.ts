import React from 'react'; // Import React for ReactNode type

export interface PrimaryZone {
  id: string;                     // e.g., "mission-control"
  label: string;                  // e.g., "Mission Control"
  description: string;            // Appears in ZoneCard
  tagline?: string;               // Short phrase under the label
  icon: React.ReactNode | string; // Icon name or React element
  gradient: string;               // Tailwind gradient class or custom string
  displayPriority: number;        // Order on homepage
  forums: string[];               // Slugs of forums under this zone
  seo?: {
    title?: string;
    description?: string;
  };
  components?: {
    cardOverride?: React.FC<any>; // Using React.FC<any> for now
    layoutOverride?: React.FC<any>; // Using React.FC<any> for now
  };
}

export const primaryZones: Record<string, PrimaryZone> = {
  'mission-control': {
    id: 'mission-control',
    label: 'Mission Control',
    description: 'Official bounties, tasks, and admin challenges. Track your progress and contribute to the platform.',
    tagline: 'Your command center for Degentalk operations.',
    icon: '🎯', // Placeholder icon
    gradient: 'bg-gradient-to-br from-blue-500 to-purple-600', // Placeholder gradient
    displayPriority: 1,
    forums: [], // Placeholder
    seo: {
      title: 'Mission Control - Degentalk',
      description: 'Official bounties, tasks, and admin challenges.',
    },
    components: {},
  },
  'the-pit': {
    id: 'the-pit',
    label: 'The Pit',
    description: 'Anything-goes discussion chaos. Enter at your own risk, degen.',
    tagline: 'Where degens roam free.',
    icon: '🔥', // Placeholder icon
    gradient: 'bg-gradient-to-br from-red-500 to-orange-500', // Placeholder gradient
    displayPriority: 2,
    forums: [], // Placeholder
    seo: {
      title: 'The Pit - Degentalk',
      description: 'Anything-goes discussion chaos.',
    },
    components: {},
  },
  'the-vault': {
    id: 'the-vault',
    label: 'The Vault',
    description: 'Token-gated discussions, high-value alpha, and exclusive content. Access requires DGT holdings.',
    tagline: 'Unlock premium degen insights.',
    icon: '💎', // Placeholder icon
    gradient: 'bg-gradient-to-br from-yellow-400 to-yellow-600', // Placeholder gradient
    displayPriority: 3,
    forums: ['marketplace'], // As per FORUM_ROUTING_REFACTOR_PLAN.md
    seo: {
      title: 'The Vault - Degentalk',
      description: 'Token-gated flex & marketplace features.',
    },
    components: {},
  },
  'briefing-room': {
    id: 'briefing-room',
    label: 'Briefing Room',
    description: 'Platform announcements, meta-discussions, feedback, and bug reports. Stay informed.',
    tagline: 'The official DegenTalk HQ.',
    icon: '📢', // Placeholder icon
    gradient: 'bg-gradient-to-br from-green-500 to-teal-500', // Placeholder gradient
    displayPriority: 4,
    forums: [], // Placeholder
    seo: {
      title: 'Briefing Room - Degentalk',
      description: 'Platform meta, suggestions, platform input.',
    },
    components: {},
  },
};

// Example of how to get an array if needed:
// export const primaryZonesArray: PrimaryZone[] = Object.values(primaryZones);
