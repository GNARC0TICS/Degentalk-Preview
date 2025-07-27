import type { UserInventoryWithProduct } from '@/types/inventory';
import { logger } from '@/lib/logger';

export const SYSTEM_ROLE_COLORS: Record<string, string> = {
  admin: '#ef4444', // red-500
  moderator: '#3b82f6', // blue-500
  'super-admin': '#a855f7', // purple-500
  developer: '#10b981', // emerald-500
  user: '#6b7280', // gray-500
};

// Define the return type inline to match what components expect
export interface AppliedCosmetics {
  usernameColor?: string;
  userTitle?: string;
  avatarFrameUrl?: string;
  badge?: string;
  emojiMap: Record<string, string>;
  unlockedFeatures: string[];
}

export function applyPluginRewards(inventory: UserInventoryWithProduct[] = [], userRole?: string): AppliedCosmetics {
  const appliedCosmetics: AppliedCosmetics = {
    emojiMap: {},
    unlockedFeatures: []
  };

  // System role colors take precedence
  if (userRole && SYSTEM_ROLE_COLORS[userRole]) {
    appliedCosmetics.usernameColor = SYSTEM_ROLE_COLORS[userRole];
  }

  if (!Array.isArray(inventory) || inventory.length === 0) {
    return appliedCosmetics;
  }

  // Process equipped items
  const equippedItems = inventory.filter(item => item.equipped && item.product?.pluginReward);
  
  equippedItems.forEach((item) => {
    let pluginReward = item.product.pluginReward!;
    
    // Handle JSON string rewards (legacy data)
    if (typeof pluginReward === 'string') {
      try {
        pluginReward = JSON.parse(pluginReward);
      } catch (error) {
        logger.error('ApplyPluginRewards', 'Failed to parse pluginReward:', error);
        return;
      }
    }
    
    const { type, value } = pluginReward;
    
    switch (type) {
      case 'username_color':
        // Only apply if no system role color
        if (!userRole || !SYSTEM_ROLE_COLORS[userRole]) {
          appliedCosmetics.usernameColor = String(value);
        }
        break;
        
      case 'user_title':
        appliedCosmetics.userTitle = String(value);
        break;
        
      case 'avatar_frame':
        // Handle both URLs and frame identifiers
        const frameValue = String(value);
        appliedCosmetics.avatarFrameUrl = frameValue.startsWith('http') 
          ? frameValue 
          : `/api/images/frames/${frameValue || 'default'}.png`;
        break;
        
      case 'badge':
        appliedCosmetics.badge = String(value);
        break;
        
      case 'emoji_pack':
      case 'emojiPack':
        if (typeof value === 'object' && value !== null) {
          Object.assign(appliedCosmetics.emojiMap, value);
        }
        break;
        
      case 'feature_unlock':
      case 'featureUnlock':
        const feature = String(value);
        if (!appliedCosmetics.unlockedFeatures.includes(feature)) {
          appliedCosmetics.unlockedFeatures.push(feature);
        }
        break;
    }
  });

  return appliedCosmetics;
}

// Helper functions
export function hasSystemRole(role?: string): boolean {
  return !!role && !!SYSTEM_ROLE_COLORS[role];
}

export function getSystemRoleColor(role?: string): string | undefined {
  return role ? SYSTEM_ROLE_COLORS[role] : undefined;
}