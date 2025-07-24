import type { UserId } from '@shared/types/ids';
import { apiRequest } from '@app/utils/api-request';
import type { ActiveUser } from '@app/components/users/ActiveMembersWidget';

/**
 * Fetch active users from the API
 *
 * @param limit Maximum number of users to return
 * @returns Promise with active users data
 */
export async function getActiveUsers(limit: number = 5): Promise<ActiveUser[]> {
	const MOCK_ACTIVE_USERS: ActiveUser[] = [
		{ id: 'user-1', name: 'CryptoMaster', avatar: null, lastActive: '2 min ago' },
		{ id: 'user-2', name: 'Hodler3000', avatar: null, lastActive: '5 min ago' },
		{ id: 'user-3', name: 'BlockchainWiz', avatar: null, lastActive: '12 min ago' },
		{ id: 'user-4', name: 'DeFiExplorer', avatar: null, lastActive: '18 min ago' },
		{ id: 'user-5', name: 'TokenTrader', avatar: null, lastActive: '25 min ago' }
	];

	return new Promise<ActiveUser[]>((resolve) => {
		setTimeout(() => {
			resolve(MOCK_ACTIVE_USERS.slice(0, limit));
		}, 500); // Simulate network delay
	});
}

/**
 * Get details for a specific user
 *
 * @param userId The ID of the user to fetch
 * @returns Promise with user data
 */
export async function getUserDetails(userId: UserId | string) {
	return Promise.reject(new Error('Not implemented yet'));
}

/**
 * Search users by name, username, etc.
 *
 * @param query Search query
 * @param limit Maximum number of results
 * @returns Promise with search results
 */
export async function searchUsers(query: string, limit: number = 10) {
	return Promise.reject(new Error('Not implemented yet'));
}
