import { apiRequest } from '@app/utils/api-request';
import type { UserId } from '@shared/types/ids';

/**
 * Interface for user referral statistics
 */
export interface UserReferralStats {
	referralCount: number;
	referredUsers: Array<{
		userId: UserId;
		username: string;
		avatarUrl: string | null;
		joinedAt: string;
		source: {
			name: string;
			slug: string;
		} | null;
	}>;
	referredBy: {
		userId: UserId;
		username: string;
		avatarUrl: string | null;
	} | null;
	joinedVia: {
		name: string;
		slug: string;
	} | null;
}

/**
 * Interface for referral link response
 */
export interface ReferralLinkResponse {
	referralLink: string;
}

/**
 * API service for user referrals
 */
export const referralsApi = {
	/**
	 * Get referral statistics for the current user
	 */
	getUserReferrals: async (): Promise<UserReferralStats> => {
		const response = await apiRequest<{ success: boolean; data: UserReferralStats }>({
			url: '/api/profile/referrals',
			method: 'GET'
		});
		return response.data;
	},

	/**
	 * Get the referral link for the current user
	 */
	getReferralLink: async (): Promise<string> => {
		const response = await apiRequest<{ success: boolean; data: ReferralLinkResponse }>({
			url: '/api/profile/referrals/link',
			method: 'GET'
		});
		return response.data.referralLink;
	}
};
