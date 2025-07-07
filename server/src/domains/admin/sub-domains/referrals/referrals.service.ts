import { eq, sql } from 'drizzle-orm';
import type { UserId } from '@shared/types';
import { db } from '../../../../core/db';
import { referralSources } from '@schema/system/referralSources';
import { userReferrals } from '@schema/system/userReferrals';
import { users } from '@schema/user/users';
import { EntityId } from "@shared/types";
import { logger } from '../../../../core/logger';

/**
 * Service for managing referral sources and user referrals
 */
export class ReferralsService {
	/**
	 * Create a new referral source
	 *
	 * @param name Display name of the referral source
	 * @param slug Unique slug for the referral source
	 * @param metadata Optional metadata for the referral source
	 * @param createdBy User ID of the admin who created the source
	 * @returns The created referral source
	 */
	async createReferralSource(
		name: string,
		slug: string,
		metadata: Record<string, any> = {},
		createdBy?: number
	) {
		try {
			const [source] = await db
				.insert(referralSources)
				.values({
					name,
					slug,
					metadata,
					createdBy
				})
				.returning();

			return source;
		} catch (error) {
			if (error.message?.includes('unique constraint')) {
				if (error.message.includes('referral_sources_slug_unique')) {
					throw new Error(`Referral source with slug "${slug}" already exists`);
				} else if (error.message.includes('referral_sources_name_unique')) {
					throw new Error(`Referral source with name "${name}" already exists`);
				}
			}
			throw error;
		}
	}

	/**
	 * Record a user referral
	 *
	 * @param params Parameters for recording a user referral
	 * @returns The created user referral or null if already exists
	 */
	async recordUserReferral(params: {
		userId: UserId;
		referredByUserId?: EntityId;
		sourceSlug: string;
	}) {
		const { userId, referredByUserId, sourceSlug } = params;

		// First, find the referral source by slug
		const source = await db.query.referralSources.findFirst({
			where: eq(referralSources.slug, sourceSlug)
		});

		if (!source) {
			throw new Error(`Referral source with slug "${sourceSlug}" not found`);
		}

		try {
			// Insert with ON CONFLICT DO NOTHING
			const result = await db
				.insert(userReferrals)
				.values({
					userId,
					referredByUserId,
					referralSourceId: source.id
				})
				.onConflictDoNothing({ target: [userReferrals.userId] })
				.returning();

			return result[0] || null;
		} catch (error) {
			// Log error but don't throw, as we want to silently handle duplicates
			logger.error('Error recording user referral:', error);
			return null;
		}
	}

	/**
	 * Get all referral sources
	 */
	async getAllReferralSources() {
		return db.query.referralSources.findMany({
			orderBy: (sources) => [sources.name]
		});
	}

	/**
	 * Get referral source statistics
	 */
	async getReferralSourceStats() {
		const stats = await db.execute(sql`
      SELECT 
        rs.name AS source_name, 
        rs.slug AS source_slug,
        COUNT(ur.id) AS referral_count
      FROM 
        referral_sources rs
      LEFT JOIN 
        user_referrals ur ON rs.id = ur.referral_source_id
      GROUP BY 
        rs.id, rs.name, rs.slug
      ORDER BY 
        referral_count DESC
    `);

		return stats.rows;
	}

	/**
	 * Get user-to-user referral statistics
	 */
	async getUserReferralStats() {
		const stats = await db.execute(sql`
      SELECT 
        u.username AS user_username,
        u.id AS user_id,
        ref_user.username AS referred_by_username,
        ref_user.id AS referred_by_id,
        rs.name AS source_name,
        rs.slug AS source_slug,
        ur.created_at AS referral_date
      FROM 
        user_referrals ur
      JOIN 
        users u ON ur.user_id = u.id
      LEFT JOIN 
        users ref_user ON ur.referred_by_user_id = ref_user.id
      LEFT JOIN 
        referral_sources rs ON ur.referral_source_id = rs.id
      ORDER BY 
        ur.created_at DESC
    `);

		return stats.rows;
	}

	/**
	 * Get referral count by user
	 */
	async getReferralCountByUser() {
		const stats = await db.execute(sql`
      SELECT 
        u.username AS referrer_username,
        u.id AS referrer_id,
        COUNT(ur.id) AS referral_count
      FROM 
        users u
      JOIN 
        user_referrals ur ON u.id = ur.referred_by_user_id
      GROUP BY 
        u.id, u.username
      ORDER BY 
        referral_count DESC
      LIMIT 50
    `);

		return stats.rows;
	}
}

export const referralsService = new ReferralsService();
