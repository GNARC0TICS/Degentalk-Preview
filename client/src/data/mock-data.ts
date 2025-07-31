// Mock data for static landing page

export const MOCK_FORUMS = [
  {
    id: '1',
    title: 'Crypto Casino',
    description: 'High stakes discussion and alpha sharing',
    slug: 'crypto-casino',
    postCount: 420,
    threadCount: 69,
    icon: '🎰',
    isHot: true,
    isFeatured: true,
  },
  {
    id: '2',
    title: 'Shitcoin Alley',
    description: 'Degen plays and moonshot calls',
    slug: 'shitcoin-alley',
    postCount: 1337,
    threadCount: 88,
    icon: '💩',
    isHot: true,
    isFeatured: false,
  },
  {
    id: '3',
    title: 'General Discussion',
    description: 'Everything crypto and beyond',
    slug: 'general-discussion',
    postCount: 2048,
    threadCount: 256,
    icon: '💬',
    isHot: false,
    isFeatured: true,
  },
  {
    id: '4',
    title: 'Technical Analysis',
    description: 'Charts, patterns, and hopium',
    slug: 'technical-analysis',
    postCount: 512,
    threadCount: 64,
    icon: '📊',
    isHot: false,
    isFeatured: false,
  },
];

export const MOCK_STATS = {
  totalUsers: 1337,
  totalPosts: 42069,
  totalThreads: 888,
  onlineNow: 88,
  totalDGT: 1000000,
  totalVolume: 69420,
};

export const MOCK_THREADS = [
  {
    id: '1',
    title: 'Just aped into $PEPE, am I ngmi?',
    slug: 'just-aped-into-pepe',
    authorUsername: 'DegenKing',
    createdAt: '2024-01-15T10:00:00Z',
    lastPostAt: '2024-01-15T14:30:00Z',
    postCount: 42,
    viewCount: 420,
    isPinned: true,
    prefix: 'YOLO',
  },
  {
    id: '2',
    title: 'New 100x gem found on BASE',
    slug: 'new-100x-gem-base',
    authorUsername: 'CryptoWhale',
    createdAt: '2024-01-14T20:00:00Z',
    lastPostAt: '2024-01-15T12:00:00Z',
    postCount: 88,
    viewCount: 1337,
    isLocked: false,
    prefix: 'ALPHA',
  },
];

export const MOCK_USERS = [
  { id: '1', username: 'DegenKing', level: 69, xp: 42000, title: 'Diamond Hands' },
  { id: '2', username: 'CryptoWhale', level: 88, xp: 88888, title: 'Moon Boy' },
  { id: '3', username: 'PepeLord', level: 42, xp: 13370, title: 'Shitcoin Sommelier' },
];

export const MOCK_ACHIEVEMENTS = [
  { id: '1', name: 'First Post', description: 'Made your first post', icon: '✍️' },
  { id: '2', name: 'Diamond Hands', description: 'Held through a 90% dump', icon: '💎' },
  { id: '3', name: 'Rug Survivor', description: 'Survived 10 rugs', icon: '🏃' },
];