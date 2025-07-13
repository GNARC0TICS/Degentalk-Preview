/**
 * Profile Data Transformer - Security-First Implementation
 *
 * Transforms raw database profile records into role-appropriate
 * response objects with privacy controls and GDPR compliance.
 */

import type { UserId, DgtAmount } from '@shared/types/ids';
import { createHash } from 'crypto';
import { logger } from '@core/logger';

// Profile View Interfaces
export interface PublicProfile {
	id: UserId;
	username: string;
	avatarUrl?: string;
	bannerUrl?: string;
	joinedAt: string;
	level: number;
	role?: string; // Only show role if not sensitive
	publicStats?: {
		totalPosts: number;
		totalThreads: number;
		totalLikes: number;
		threadViewCount: number;
		posterRank?: number;
		likerRank?: number;
	};
	badges?: {
		activeBadge?: any;
		displayBadges?: any[];
	};
	customization?: {
		activeFrame?: any;
		activeTitle?: any;
		profileTheme?: string;
	};
}

export interface AuthenticatedProfile extends PublicProfile {
	bio?: string;
	signature?: string;
	lastActiveAt?: string;
	dgtBalance: DgtAmount;
	totalTips: number;
	tipperRank?: number;
	xpStats: {
		currentXp: number;
		nextLevelXp: number;
		xpToNext: number;
		level: number;
	};
	privacy: {
		showStats: boolean;
		showBio: boolean;
		showLastActive: boolean;
		showBalance: boolean;
	};
	inventory: any[];
	preferences?: {
		theme?: string;
		notifications?: any;
	};
}

export interface AdminProfile extends AuthenticatedProfile {
	adminMetadata: {
		email?: string;
		ipAddress?: string; // Hashed for privacy
		createdAt: string;
		updatedAt: string;
		flags: string[];
		notes: string[];
		riskScore: number;
		complianceStatus: string;
		lastModeratorAction?: string;
	};
	fullActivityLog: any[];
	socialConnections: {
		followers: number;
		following: number;
		friendRequests: number;
	};
}

export class ProfileTransformer {
	/**
	 * Transform profile data for public consumption
	 * Only shows basic profile info and public stats (if enabled)
	 */
	static toPublicProfile(dbProfile: any): PublicProfile {
		if (!dbProfile) {
			throw new Error('Invalid profile data provided to transformer');
		}

		// Check privacy settings
		const showStats = dbProfile.privacy?.showStats !== false;
		const showBio = dbProfile.privacy?.showBio !== false;

		return {
			id: dbProfile.id as UserId,
			username: dbProfile.username,
			avatarUrl: dbProfile.avatarUrl || undefined,
			bannerUrl: dbProfile.bannerUrl || undefined,
			joinedAt: dbProfile.joinedAt || dbProfile.createdAt,
			level: dbProfile.level || 1,
			role: this.shouldShowRole(dbProfile.role) ? dbProfile.role : undefined,

			// Public stats only if enabled
			publicStats: showStats
				? {
						totalPosts: dbProfile.totalPosts || 0,
						totalThreads: dbProfile.totalThreads || 0,
						totalLikes: dbProfile.totalLikes || 0,
						threadViewCount: dbProfile.threadViewCount || 0,
						posterRank: dbProfile.posterRank,
						likerRank: dbProfile.likerRank
					}
				: undefined,

			// Customization (always public)
			customization: {
				activeFrame: dbProfile.activeFrame,
				activeTitle: dbProfile.activeTitle,
				profileTheme: dbProfile.profileTheme
			},

			// Badges (always public)
			badges: {
				activeBadge: dbProfile.activeBadge,
				displayBadges: dbProfile.displayBadges || []
			}
		};
	}

	/**
	 * Transform profile data for authenticated user viewing their own profile
	 * Includes personal data and full statistics
	 */
	static toAuthenticatedProfile(dbProfile: any, requestingUser: any): AuthenticatedProfile {
		const publicData = this.toPublicProfile(dbProfile);

		return {
			...publicData,

			// Personal information
			bio: dbProfile.bio,
			signature: dbProfile.signature,
			lastActiveAt: dbProfile.lastActiveAt || dbProfile.lastSeenAt,
			dgtBalance: this.sanitizeDgtAmount(dbProfile.dgtBalance),
			totalTips: dbProfile.totalTips || 0,
			tipperRank: dbProfile.tipperRank,

			// XP and leveling stats
			xpStats: {
				currentXp: dbProfile.xp || 0,
				nextLevelXp: dbProfile.nextLevelXp || this.calculateNextLevelXp(dbProfile.level),
				xpToNext:
					(dbProfile.nextLevelXp || this.calculateNextLevelXp(dbProfile.level)) -
					(dbProfile.xp || 0),
				level: dbProfile.level || 1
			},

			// Privacy settings
			privacy: {
				showStats: dbProfile.privacy?.showStats !== false,
				showBio: dbProfile.privacy?.showBio !== false,
				showLastActive: dbProfile.privacy?.showLastActive !== false,
				showBalance: dbProfile.privacy?.showBalance !== false
			},

			// Inventory and cosmetics
			inventory: dbProfile.inventory || [],

			// User preferences
			preferences: {
				theme: dbProfile.preferences?.theme,
				notifications: dbProfile.preferences?.notifications
			}
		};
	}

	/**
	 * Transform profile data for admin view
	 * Includes all data plus administrative metadata
	 */
	static toAdminProfile(dbProfile: any, requestingAdmin: any): AdminProfile {
		const authenticatedData = this.toAuthenticatedProfile(dbProfile, requestingAdmin);

		return {
			...authenticatedData,

			// Admin-only metadata
			adminMetadata: {
				email: dbProfile.email,
				ipAddress: this.hashIpAddress(dbProfile.lastIpAddress),
				createdAt: dbProfile.createdAt,
				updatedAt: dbProfile.updatedAt,
				flags: dbProfile.flags || [],
				notes: dbProfile.adminNotes || [],
				riskScore: this.calculateRiskScore(dbProfile),
				complianceStatus: this.getComplianceStatus(dbProfile),
				lastModeratorAction: dbProfile.lastModeratorAction
			},

			// Full activity log
			fullActivityLog: dbProfile.activityLog || [],

			// Social connections
			socialConnections: {
				followers: dbProfile.followerCount || 0,
				following: dbProfile.followingCount || 0,
				friendRequests: dbProfile.pendingFriendRequests || 0
			}
		};
	}

	/**
	 * Transform profile stats for dashboard/summary views
	 */
	static toProfileStats(dbProfile: any, requestingUser: any, isAdmin: boolean = false) {
		const baseStats = {
			userId: dbProfile.id as UserId,
			username: dbProfile.username,
			level: dbProfile.level || 1,
			totalPosts: dbProfile.totalPosts || 0,
			totalThreads: dbProfile.totalThreads || 0,
			totalLikes: dbProfile.totalLikes || 0,
			totalTips: dbProfile.totalTips || 0
		};

		if (isAdmin) {
			return {
				...baseStats,
				dgtBalance: this.sanitizeDgtAmount(dbProfile.dgtBalance),
				joinedAt: dbProfile.createdAt,
				lastActive: dbProfile.lastSeenAt,
				adminFlags: dbProfile.flags || []
			};
		}

		// Check if requesting user can see full stats
		const canSeeFullStats =
			requestingUser?.id === dbProfile.id || dbProfile.privacy?.showStats !== false;

		return canSeeFullStats
			? baseStats
			: {
					userId: dbProfile.id as UserId,
					username: dbProfile.username,
					level: dbProfile.level || 1
				};
	}

	// Private helper methods
	private static sanitizeDgtAmount(amount: any): DgtAmount {
		const num = Number(amount);
		return Math.max(0, isNaN(num) ? 0 : num) as DgtAmount;
	}

	private static shouldShowRole(role: string): boolean {
		// Hide sensitive admin roles from public view
		const publicRoles = ['member', 'verified', 'supporter', 'vip'];
		return publicRoles.includes(role?.toLowerCase() || '');
	}

	private static calculateNextLevelXp(level: number): number {
		return (level + 1) * 1000; // Simple linear progression
	}

	private static calculateRiskScore(dbProfile: any): number {
		// TODO: Implement risk scoring algorithm
		// Consider factors like: account age, activity patterns, reports, etc.
		return 0;
	}

	private static getComplianceStatus(dbProfile: any): string {
		// TODO: Implement compliance checking
		// Check GDPR, privacy settings, data retention, etc.
		return 'compliant';
	}

	private static hashIpAddress(ipAddress: string): string {
		if (!ipAddress) return '';
		return createHash('sha256').update(ipAddress).digest('hex').substring(0, 8);
	}

	/**
	 * Transform multiple profiles for list views
	 */
	static toProfileList(
		dbProfiles: any[],
		requestingUser: any,
		isAdmin: boolean = false
	): (PublicProfile | AuthenticatedProfile | AdminProfile)[] {
		return dbProfiles.map((profile) => {
			if (isAdmin) {
				return this.toAdminProfile(profile, requestingUser);
			} else if (requestingUser?.id === profile.id) {
				return this.toAuthenticatedProfile(profile, requestingUser);
			} else {
				return this.toPublicProfile(profile);
			}
		});
	}

	/**
	 * Transform profile for specific context (leaderboards, search results, etc.)
	 */
	static toContextualProfile(
		dbProfile: any,
		context: 'leaderboard' | 'search' | 'mention' | 'directory',
		requestingUser?: any
	) {
		const baseData = this.toPublicProfile(dbProfile);

		switch (context) {
			case 'leaderboard':
				return {
					...baseData,
					rank: dbProfile.rank,
					score: dbProfile.score,
					change: dbProfile.rankChange
				};

			case 'search':
				return {
					...baseData,
					relevanceScore: dbProfile.relevanceScore,
					matchedFields: dbProfile.matchedFields
				};

			case 'mention':
				return {
					id: baseData.id,
					username: baseData.username,
					avatarUrl: baseData.avatarUrl,
					level: baseData.level,
					role: baseData.role
				};

			case 'directory':
				return {
					...baseData,
					isOnline: dbProfile.isOnline,
					lastActiveRelative: dbProfile.lastActiveRelative
				};

			default:
				return baseData;
		}
	}
}
