/**
 * Shared Leaderboard Theme Configuration
 * 
 * Centralized styling and theme configuration for all leaderboard components
 */

export const leaderboardTheme = {
  colors: {
    // Rank colors
    gold: '#FFD700',
    silver: '#C0C0C0',
    bronze: '#CD7F32',
    
    // Rank-specific colors with DegenTalk branding
    ranks: {
      1: {
        primary: '#FFD700',
        secondary: '#FFA500',
        gradient: 'from-amber-900/20 to-yellow-900/20',
        border: 'border-amber-500/50',
        text: 'text-amber-500',
        bg: 'bg-amber-500'
      },
      2: {
        primary: '#C0C0C0',
        secondary: '#A8A8A8',
        gradient: 'from-gray-900/20 to-zinc-900/20',
        border: 'border-gray-500/50',
        text: 'text-gray-400',
        bg: 'bg-gray-400'
      },
      3: {
        primary: '#CD7F32',
        secondary: '#B87333',
        gradient: 'from-amber-900/20 to-orange-900/20',
        border: 'border-amber-700/50',
        text: 'text-amber-700',
        bg: 'bg-amber-700'
      }
    },
    
    // Metric colors
    metrics: {
      xp: '#10b981', // emerald-500
      reputation: '#06b6d4', // cyan-500
      tips: '#a855f7', // purple-500
      activity: '#f59e0b' // amber-500
    }
  },
  
  // Size configurations
  sizes: {
    micro: {
      container: 'max-h-[200px]',
      padding: 'p-2',
      gap: 'gap-2',
      avatar: 'h-6 w-6',
      text: {
        username: 'text-xs',
        metric: 'text-xs',
        label: 'text-[10px]'
      },
      userLimit: 3
    },
    compact: {
      container: 'max-h-[350px]',
      padding: 'p-3',
      gap: 'gap-3',
      avatar: 'h-8 w-8',
      text: {
        username: 'text-sm',
        metric: 'text-sm',
        label: 'text-xs'
      },
      userLimit: 5
    },
    standard: {
      container: 'max-h-[600px]',
      padding: 'p-4',
      gap: 'gap-4',
      avatar: 'h-10 w-10',
      text: {
        username: 'text-base',
        metric: 'text-base',
        label: 'text-sm'
      },
      userLimit: 10
    },
    expanded: {
      container: '',
      padding: 'p-4',
      gap: 'gap-4',
      avatar: 'h-12 w-12',
      text: {
        username: 'text-base',
        metric: 'text-lg',
        label: 'text-sm'
      },
      userLimit: 20
    }
  },
  
  // Animation configurations
  animations: {
    // Item entrance animations
    itemEnter: {
      initial: { opacity: 0, x: -20 },
      animate: { opacity: 1, x: 0 },
      transition: { duration: 0.3 }
    },
    
    // Rank change animations
    rankUp: {
      initial: { y: 5 },
      animate: { y: 0 },
      transition: { type: 'spring', stiffness: 300 }
    },
    
    rankDown: {
      initial: { y: -5 },
      animate: { y: 0 },
      transition: { type: 'spring', stiffness: 300 }
    },
    
    // Hover effects
    hover: {
      scale: 1.02,
      transition: { duration: 0.2 }
    }
  },
  
  // Component class names
  classes: {
    container: 'bg-zinc-900/50 border border-zinc-800 rounded-lg overflow-hidden',
    header: 'border-b border-zinc-800',
    item: 'transition-all duration-200 rounded-md',
    itemHover: 'hover:bg-zinc-800/50',
    rank: {
      badge: 'rounded-full flex items-center justify-center font-bold',
      icon: 'h-5 w-5'
    },
    metric: 'font-mono font-semibold',
    trend: {
      up: 'text-green-500',
      down: 'text-red-500',
      stable: 'text-zinc-500'
    }
  }
};

// Helper functions
export const getRankStyle = (rank: number) => {
  if (rank <= 3 && leaderboardTheme.colors.ranks[rank as 1 | 2 | 3]) {
    return leaderboardTheme.colors.ranks[rank as 1 | 2 | 3];
  }
  return {
    primary: '#71717a', // zinc-500
    secondary: '#52525b', // zinc-600
    gradient: '',
    border: '',
    text: 'text-zinc-400',
    bg: 'bg-zinc-700'
  };
};

export const getMetricColor = (metric: 'xp' | 'reputation' | 'tips' | 'activity') => {
  return leaderboardTheme.colors.metrics[metric] || leaderboardTheme.colors.metrics.xp;
};

export const getSizeConfig = (variant: 'micro' | 'compact' | 'standard' | 'expanded') => {
  return leaderboardTheme.sizes[variant];
};