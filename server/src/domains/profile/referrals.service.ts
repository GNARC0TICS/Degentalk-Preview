import { eq } from 'drizzle-orm';
import type { UserId } from '@shared/types/ids';
import { db } from '@degentalk/db';
import { users } from '@schema/user/users';

/**
 * Referrals Service (Simplified)
 *
 * Service for handling user referral operations using only the users table.
 */

/**
 * Get a user's referral stats
 * @param userId The user ID
 */
export async function getUserReferrals(userId: UserId) {
	// Get all users referred by this user
	const referrals = await db.query.users.findMany({
		where: eq(users.referrerId, userId)
	});

	// Get total referral rewards earned (if you have a field for this)
	const totalRewards = referrals.reduce((sum, user) => {
		return sum + (user.referralReward || 0);
	}, 0);

	return {
		totalReferrals: referrals.length,
		totalRewards,
		referrals: referrals.map((user) => ({
			id: user.id,
			username: user.username,
			joinedAt: user.createdAt,
			reward: user.referralReward || 0
		}))
	};
}

/**
 * Get a user's referral link
 * @param userId The user ID
 */
export async function getUserReferralLink(userId: UserId) {
	// Get user data
	const user = await db.query.users.findFirst({
		where: eq(users.id, userId)
	});

	if (!user) {
		throw new Error('User not found');
	}

	// Generate referral link
	const baseUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
	const referralLink = `${baseUrl}/register?ref=${user.username}`;

	return referralLink;
}

export const referralsService = {
	getUserReferrals,
	getUserReferralLink
};
