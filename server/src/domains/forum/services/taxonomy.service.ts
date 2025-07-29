import { db } from '@degentalk/db';
import { threadPrefixes, tags } from '@schema';
import { eq, asc } from 'drizzle-orm';
import { logger } from '@core/logger';

class TaxonomyService {
	async getPrefixes(forumId?: string) {
		try {
			logger.info('TaxonomyService', `Fetching prefixes for forumId: ${forumId || 'all'}`);
			// The old logic for filtering by forumId was commented out, so I am replicating that.
			// If filtering is needed, it would be added here.
			const results = await db
				.select()
				.from(threadPrefixes)
				.where(eq(threadPrefixes.isActive, true))
				.orderBy(asc(threadPrefixes.position));

			return results;
		} catch (error) {
			logger.error('TaxonomyService', 'Error fetching prefixes', { error });
			throw new Error('Failed to fetch prefixes.');
		}
	}

	async getTags() {
		try {
			logger.info('TaxonomyService', 'Fetching all tags');
			const results = await db.select().from(tags).orderBy(asc(tags.name));
			return results;
		} catch (error) {
			logger.error('TaxonomyService', 'Error fetching tags', { error });
			throw new Error('Failed to fetch tags.');
		}
	}
}

export const taxonomyService = new TaxonomyService();
