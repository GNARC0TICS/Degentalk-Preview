import { db } from '@db';
import { users } from '@schema';
import { ilike, asc } from 'drizzle-orm';
import { logger } from '@core/logger';

class UserSearchService {
	async searchUsers(query: string) {
		try {
			logger.info('UserSearchService', `Searching for users with query: ${query}`);
			const results = await db
				.select({
					id: users.id,
					username: users.username,
					avatar: users.avatarUrl
				})
				.from(users)
				.where(ilike(users.username, `%${query}%`))
				.limit(10)
				.orderBy(asc(users.username));

			return results;
		} catch (error) {
			logger.error('UserSearchService', 'Error searching for users', { error });
			throw new Error('Failed to search for users.');
		}
	}
}

export const userSearchService = new UserSearchService();
