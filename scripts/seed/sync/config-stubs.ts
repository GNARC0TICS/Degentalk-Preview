// Stub configs for seeding - these would normally come from the main app configs

export const forumMap = {
  zones: {
    general: {
      name: 'General',
      description: 'General discussion',
      order: 1,
      icon: '💬',
      theme: 'default',
      features: []
    },
    trading: {
      name: 'Trading',
      description: 'Trading discussion',
      order: 2,
      icon: '📈',
      theme: 'trading',
      features: ['charts']
    }
  },
  forums: {
    'general-discussion': {
      name: 'General Discussion',
      description: 'Talk about anything',
      zoneSlug: 'general',
      order: 1,
      icon: '💭',
      theme: 'default',
      features: [],
      rules: {
        xpMultiplier: 1,
        accessLevel: 'public',
        availablePrefixes: []
      }
    },
    'market-analysis': {
      name: 'Market Analysis',
      description: 'Technical and fundamental analysis',
      zoneSlug: 'trading',
      order: 1,
      icon: '📊',
      theme: 'trading',
      features: ['charts'],
      rules: {
        xpMultiplier: 1.5,
        accessLevel: 'public',
        availablePrefixes: ['TA', 'FA', 'DD']
      }
    }
  }
};

export const featureFlags = {
  newUserRegistration: true,
  forumPosting: true,
  privateMessaging: true,
  shopPurchases: true,
  xpSystem: true,
  achievements: true,
  missions: true
};

export const themes = {
  default: {
    name: 'Default',
    primaryColor: '#3B82F6',
    backgroundColor: '#1F2937'
  },
  trading: {
    name: 'Trading',
    primaryColor: '#10B981',
    backgroundColor: '#111827'
  }
};