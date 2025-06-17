export interface ProfileData {
  id: string;
  username: string;
  avatarUrl: string | null;
  role: string;
  bio: string | null;
  signature: string | null;
  joinedAt: string;
  lastActiveAt: string;
  dgtBalance: number;
  totalPosts: number;
  totalThreads: number;
  totalLikes: number;
  totalTips: number;
  clout: number;
  level: number;
  xp: number;
  nextLevelXp: number;
  bannerUrl: string | null;
  activeFrameId: number | null;
  activeFrame: {
    id: number;
    name: string;
    imageUrl: string;
    rarity: string;
  } | null;
  activeTitleId: number | null;
  activeTitle: {
    id: number;
    name: string;
    description: string | null;
    iconUrl: string | null;
    rarity: string;
  } | null;
  activeBadgeId: number | null;
  activeBadge: {
    id: number;
    name: string;
    description: string | null;
    iconUrl: string;
    rarity: string;
  } | null;
  badges: {
    id: number;
    name: string;
    description: string | null;
    iconUrl: string;
    rarity: string;
  }[];
  titles: {
    id: number;
    name: string;
    description: string | null;
    iconUrl: string | null;
    rarity: string;
  }[];
  inventory: {
    id: number;
    userId: string;
    productId: number;
    isEquipped: boolean;
    productName: string;
    productType: string;
    imageUrl: string;
    rarity: string;
  }[];
  relationships: {
    friends: {
      id: string;
      username: string;
      avatarUrl: string | null;
    }[];
    friendRequestsSent: number;
    friendRequestsReceived: number;
  };
  stats: {
    threadViewCount: number;
    posterRank: number | null;
    tipperRank: number | null;
    likerRank: number | null;
  };
} 