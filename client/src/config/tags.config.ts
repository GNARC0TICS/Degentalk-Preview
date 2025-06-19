import { z } from 'zod';

/**
 * Forum tag configuration with color, icon, and zone restrictions.
 */

// -------------------- Tag Definition --------------------
/**
 * Single tag definition.
 */
export const ForumTagSchema = z.object({
	/** Unique tag id */
	id: z.string(),
	/** Display label */
	label: z.string(),
	/** Hex or tailwind color */
	color: z.string(),
	/** Optional emoji/icon */
	icon: z.string().optional(),
	/** Forums this tag applies to */
	appliesTo: z.array(z.string())
});

export type ForumTag = z.infer<typeof ForumTagSchema>;

// -------------------- Main Tag Config --------------------
export const tagConfig: ForumTag[] = [
	{ id: 'alpha', label: 'Alpha', color: '#FFD700', icon: '🚀', appliesTo: ['the-pit'] },
	{ id: 'rant', label: 'Rant', color: '#F00', appliesTo: ['briefing-room'] }
] as const;
