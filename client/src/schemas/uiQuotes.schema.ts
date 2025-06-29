import { z } from 'zod';

export const quoteSchema = z.object({
	id: z.string().optional(),
	type: z.enum(['hero', 'footer']).default('hero'),
	headline: z.string(),
	subheader: z.string().optional(),
	weight: z.number().int().min(0).default(1),
	tags: z.array(z.string()).optional()
});

export const uiQuotesSchema = z.array(quoteSchema);
export type UIQuote = z.infer<typeof quoteSchema>;
export type UIQuotes = z.infer<typeof uiQuotesSchema>;
