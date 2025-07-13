import { z } from 'zod';

export const userSearchValidation = z.object({
	query: z.object({
		q: z.string().min(1, 'Search query is required').max(50, 'Search query is too long')
	})
});
