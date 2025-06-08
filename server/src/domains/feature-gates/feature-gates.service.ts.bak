import { db } from '@db';
import { featureFlags, users } from '@schema'; // Corrected import
import { logger, LogLevel } from '../../core/logger';
import { eq, and } from 'drizzle-orm';

// Feature gate configuration type
export interface FeatureGate {
  id: string;
  name: string;
  description: string;
  minLevel: number;
  badgeRequired?: string;
  enabled: boolean;
}

// User feature access type
export interface UserFeatureAccess {
  featureId: string;
  hasAccess: boolean;
  reason?: string;
  unlocksAtLevel?: number;
  missingBadge?: string;
}

// Default feature gates - ideally this would be in database
// Moving to database would be a future enhancement
const DEFAULT_FEATURE_GATES: FeatureGate[] = [
  {
    id: 'shoutbox',
    name: 'Shoutbox',
    description: 'Access to the global shoutbox chat',
    minLevel: 3,
    enabled: true
  },
  {
    id: 'signature',
    name: 'Forum Signature',
    description: 'Add a custom signature to your forum posts',
    minLevel: 5,
    enabled: true
  },
  {
    id: 'custom_emoji',
    name: 'Custom Emoji',
    description: 'Use custom emoji in posts and messages',
    minLevel: 7,
    enabled: true
  },
  {
    id: 'clout_voting',
    name: 'Clout Voting',
    description: 'Vote on other users\' clout',
    minLevel: 10,
    enabled: true
  },
  {
    id: 'avatar_frames',
    name: 'Avatar Frames',
    description: 'Use decorative frames around your avatar',
    minLevel: 8,
    badgeRequired: 'Style Master',
    enabled: true
  },
  {
    id: 'username_colors',
    name: 'Username Colors',
    description: 'Use custom colors for your username',
    minLevel: 15,
    enabled: true
  },
  {
    id: 'thread_pinning',
    name: 'Thread Pinning',
    description: 'Pin threads at the top of forums',
    minLevel: 20,
    enabled: true
  },
  {
    id: 'badge_showcase',
    name: 'Badge Showcase',
    description: 'Display your favorite badges on your profile',
    minLevel: 3,
    enabled: true
  },
  {
    id: 'advanced_search',
    name: 'Advanced Search',
    description: 'Access to advanced search features',
    minLevel: 2,
    enabled: true
  }
];

/**
 * Service for managing feature gates and checking user access
 */
export class FeatureGatesService {
  /**
   * Get all feature gates
   */
  async getAllFeatureGates(): Promise<FeatureGate[]> {
    // In a real implementation, this would fetch from database
    // For now, using DEFAULT_FEATURE_GATES. If featureFlags table is to be used, this needs change.
    // const dbGates = await db.select().from(featureFlags);
    // return dbGates.map(gate => ({...})); // Map to FeatureGate interface
    return DEFAULT_FEATURE_GATES;
  }
  
  /**
   * Get a specific feature gate by ID
   */
  async getFeatureGate(featureId: string): Promise<FeatureGate | null> {
    // const gate = DEFAULT_FEATURE_GATES.find(g => g.id === featureId);
    // If using DB:
    // const [dbGate] = await db.select().from(featureFlags).where(eq(featureFlags.key, featureId)).limit(1);
    // if (!dbGate) return null;
    // return { id: dbGate.key, name: dbGate.name, description: dbGate.description || '', minLevel: (dbGate.config as any)?.minLevel || 0, enabled: dbGate.isEnabled, badgeRequired: (dbGate.config as any)?.badgeRequired };
    const gate = DEFAULT_FEATURE_GATES.find(g => g.id === featureId); // Sticking to current logic
    return gate || null;
  }
  
  /**
   * Check if a user has access to a specific feature
   */
  async checkFeatureAccess(
    userId: number, 
    featureId: string
  ): Promise<UserFeatureAccess> {
    try {
      const gate = await this.getFeatureGate(featureId);
      
      if (!gate || !gate.enabled) {
        return {
          featureId,
          hasAccess: false,
          reason: 'feature_not_available'
        };
      }
      
      const userResults = await db
        .select({ level: users.level }) 
        .from(users)
        .where(eq(users.id, userId)) 
        .limit(1);
      
      if (userResults.length === 0) {
        return {
          featureId,
          hasAccess: false,
          reason: 'user_not_found'
        };
      }
      
      const userLevel = userResults[0].level;
      const levelMet = userLevel >= gate.minLevel;
      
      if (gate.badgeRequired) {
        // Placeholder for badge check logic
        const hasBadge = false; 
        
        if (!hasBadge) {
          return {
            featureId,
            hasAccess: levelMet && hasBadge, // Access denied if badge required and not present
            reason: 'badge_required',
            unlocksAtLevel: gate.minLevel,
            missingBadge: gate.badgeRequired
          };
        }
      }
      
      return {
        featureId,
        hasAccess: levelMet,
        reason: levelMet ? undefined : 'level_too_low',
        unlocksAtLevel: gate.minLevel
      };
    } catch (error) {
      const errStr = error instanceof Error ? error.message : String(error);
      // Corrected logger call with namespace, message, and data object
      logger.error(
        'FeatureGatesService',
        'Error checking feature access for userId: ' + userId + ', featureId: ' + featureId,
        { error: errStr }
      );
      
      return {
        featureId,
        hasAccess: false,
        reason: 'error'
      };
    }
  }
  
  /**
   * Check access for multiple features for a user
   */
  async checkAllFeatureAccess(userId: number): Promise<UserFeatureAccess[]> {
    const gates = await this.getAllFeatureGates();
    
    const accessPromises = gates.map(gate => 
      this.checkFeatureAccess(userId, gate.id)
    );
    
    return Promise.all(accessPromises);
  }
}

export const featureGatesService = new FeatureGatesService();
