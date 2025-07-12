/**
 * Subscription Permissions Service
 *
 * Handles permission checking for VIP Pass and Degen Pass subscribers,
 * integrating with the existing permission system
 */

import { subscriptionService } from './subscription.service';
import { logger } from '../../core/logger';

export interface SubscriptionPermissions {
	// VIP Pass Benefits
	hasVipAccess: boolean;
	hasVipBadge: boolean;
	hasPrioritySupport: boolean;
	hasAdvancedForumFeatures: boolean;
	hasVipOnlyContent: boolean;

	// Degen Pass Benefits
	hasDegenAccess: boolean;
	hasDegenBadge: boolean;
	hasMonthlyCosmeticDrops: boolean;
	hasExclusiveContent: boolean;
	hasEnhancedProfile: boolean;

	// General
	hasAnySubscription: boolean;
	hasPremiumFeatures: boolean;
}

/**
 * Subscription Permissions Service Class
 */
export class SubscriptionPermissionsService {
	/**
	 * Get all subscription permissions for a user
	 */
	async getUserSubscriptionPermissions(userId: string): Promise<SubscriptionPermissions> {
		try {
			const [vipSubscription, degenSubscription] = await Promise.all([
				subscriptionService.getUserActiveSubscription(userId, 'vip_pass'),
				subscriptionService.getUserActiveSubscription(userId, 'degen_pass')
			]);

			const hasVipAccess = vipSubscription !== null;
			const hasDegenAccess = degenSubscription !== null;
			const hasAnySubscription = hasVipAccess || hasDegenAccess;

			return {
				// VIP Pass Benefits
				hasVipAccess,
				hasVipBadge: hasVipAccess,
				hasPrioritySupport: hasVipAccess,
				hasAdvancedForumFeatures: hasVipAccess,
				hasVipOnlyContent: hasVipAccess,

				// Degen Pass Benefits
				hasDegenAccess,
				hasDegenBadge: hasDegenAccess,
				hasMonthlyCosmeticDrops: hasDegenAccess,
				hasExclusiveContent: hasDegenAccess,
				hasEnhancedProfile: hasDegenAccess,

				// General
				hasAnySubscription,
				hasPremiumFeatures: hasAnySubscription
			};
		} catch (error) {
			logger.error('SUBSCRIPTION_PERMISSIONS', 'Error getting user permissions:', error);

			// Return default permissions on error
			return {
				hasVipAccess: false,
				hasVipBadge: false,
				hasPrioritySupport: false,
				hasAdvancedForumFeatures: false,
				hasVipOnlyContent: false,
				hasDegenAccess: false,
				hasDegenBadge: false,
				hasMonthlyCosmeticDrops: false,
				hasExclusiveContent: false,
				hasEnhancedProfile: false,
				hasAnySubscription: false,
				hasPremiumFeatures: false
			};
		}
	}

	/**
	 * Check if user has VIP access
	 */
	async hasVipAccess(userId: string): Promise<boolean> {
		try {
			const subscription = await subscriptionService.getUserActiveSubscription(userId, 'vip_pass');
			return subscription !== null && subscription.status === 'lifetime';
		} catch (error) {
			logger.error('SUBSCRIPTION_PERMISSIONS', 'Error checking VIP access:', error);
			return false;
		}
	}

	/**
	 * Check if user has Degen Pass access
	 */
	async hasDegenAccess(userId: string): Promise<boolean> {
		try {
			const subscription = await subscriptionService.getUserActiveSubscription(
				userId,
				'degen_pass'
			);
			return subscription !== null && subscription.status === 'active';
		} catch (error) {
			logger.error('SUBSCRIPTION_PERMISSIONS', 'Error checking Degen access:', error);
			return false;
		}
	}

	/**
	 * Check if user has any premium subscription
	 */
	async hasPremiumAccess(userId: string): Promise<boolean> {
		try {
			const [hasVip, hasDegen] = await Promise.all([
				this.hasVipAccess(userId),
				this.hasDegenAccess(userId)
			]);
			return hasVip || hasDegen;
		} catch (error) {
			logger.error('SUBSCRIPTION_PERMISSIONS', 'Error checking premium access:', error);
			return false;
		}
	}

	/**
	 * Check if user can access VIP-only forum sections
	 */
	async canAccessVipForums(userId: string): Promise<boolean> {
		return await this.hasVipAccess(userId);
	}

	/**
	 * Check if user can access subscriber-only content
	 */
	async canAccessSubscriberContent(userId: string): Promise<boolean> {
		return await this.hasPremiumAccess(userId);
	}

	/**
	 * Check if user has enhanced posting privileges
	 */
	async hasEnhancedPostingPrivileges(userId: string): Promise<boolean> {
		// VIP users get enhanced posting features
		return await this.hasVipAccess(userId);
	}

	/**
	 * Check if user gets priority in support queues
	 */
	async hasPrioritySupport(userId: string): Promise<boolean> {
		// Both VIP and Degen Pass get priority support, but VIP gets higher priority
		return await this.hasPremiumAccess(userId);
	}

	/**
	 * Get user's subscription tier for display
	 */
	async getUserSubscriptionTier(userId: string): Promise<{
		tier: 'none' | 'degen' | 'vip' | 'vip_degen';
		displayName: string;
		badgeClass: string;
	}> {
		try {
			const [hasVip, hasDegen] = await Promise.all([
				this.hasVipAccess(userId),
				this.hasDegenAccess(userId)
			]);

			if (hasVip && hasDegen) {
				return {
					tier: 'vip_degen',
					displayName: 'VIP + Degen',
					badgeClass: 'subscription-badge subscription-badge-vip-degen'
				};
			} else if (hasVip) {
				return {
					tier: 'vip',
					displayName: 'VIP',
					badgeClass: 'subscription-badge subscription-badge-vip'
				};
			} else if (hasDegen) {
				return {
					tier: 'degen',
					displayName: 'Degen',
					badgeClass: 'subscription-badge subscription-badge-degen'
				};
			} else {
				return {
					tier: 'none',
					displayName: '',
					badgeClass: ''
				};
			}
		} catch (error) {
			logger.error('SUBSCRIPTION_PERMISSIONS', 'Error getting subscription tier:', error);
			return {
				tier: 'none',
				displayName: '',
				badgeClass: ''
			};
		}
	}

	/**
	 * Check if user can use specific subscription benefit
	 */
	async canUseBenefit(userId: string, benefitKey: string): Promise<boolean> {
		try {
			// Map benefit keys to subscription requirements
			const benefitRequirements: Record<string, 'vip' | 'degen' | 'any'> = {
				// VIP-only benefits
				lifetime_vip: 'vip',
				vip_badge: 'vip',
				priority_support: 'vip',
				advanced_forum_features: 'vip',
				vip_only_content: 'vip',

				// Degen Pass-only benefits
				monthly_cosmetic_drop: 'degen',
				degen_badge: 'degen',

				// Available to any premium subscriber
				exclusive_content: 'any',
				enhanced_profile: 'any',
				premium_features: 'any'
			};

			const requirement = benefitRequirements[benefitKey];
			if (!requirement) {
				return false;
			}

			switch (requirement) {
				case 'vip':
					return await this.hasVipAccess(userId);
				case 'degen':
					return await this.hasDegenAccess(userId);
				case 'any':
					return await this.hasPremiumAccess(userId);
				default:
					return false;
			}
		} catch (error) {
			logger.error('SUBSCRIPTION_PERMISSIONS', 'Error checking benefit usage:', error);
			return false;
		}
	}

	/**
	 * Get user's XP multiplier bonus from subscriptions
	 */
	async getSubscriptionXpMultiplier(userId: string): Promise<number> {
		try {
			const [hasVip, hasDegen] = await Promise.all([
				this.hasVipAccess(userId),
				this.hasDegenAccess(userId)
			]);

			let multiplier = 1.0;

			// VIP Pass: 1.2x XP multiplier
			if (hasVip) {
				multiplier *= 1.2;
			}

			// Degen Pass: 1.1x XP multiplier
			if (hasDegen) {
				multiplier *= 1.1;
			}

			return multiplier;
		} catch (error) {
			logger.error('SUBSCRIPTION_PERMISSIONS', 'Error getting XP multiplier:', error);
			return 1.0;
		}
	}

	/**
	 * Check if user has access to specific forum category based on subscription
	 */
	async canAccessForumCategory(userId: string, categoryRequirement: string): Promise<boolean> {
		try {
			switch (categoryRequirement) {
				case 'vip_only':
					return await this.hasVipAccess(userId);
				case 'subscriber_only':
					return await this.hasPremiumAccess(userId);
				case 'degen_only':
					return await this.hasDegenAccess(userId);
				case 'public':
				default:
					return true;
			}
		} catch (error) {
			logger.error('SUBSCRIPTION_PERMISSIONS', 'Error checking forum access:', error);
			return false;
		}
	}
}

// Export singleton instance
export const subscriptionPermissionsService = new SubscriptionPermissionsService();
