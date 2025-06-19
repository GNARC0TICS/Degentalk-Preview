import { z } from 'zod';

/**
 * XP system configuration including actions and title unlocks.
 */

// -------------------- XP Actions Section --------------------
export const XpActionSchema = z.object({
	/** Unique action id */
	id: z.string(),
	/** XP awarded for this action */
	xp: z.number()
});

export type XpAction = z.infer<typeof XpActionSchema>;

// -------------------- Title Unlock Section --------------------
export const TitleUnlockSchema = z.object({
	/** Unique title id */
	id: z.string(),
	/** Display title */
	title: z.string(),
	/** XP required to unlock */
	unlockXP: z.number()
});

export type TitleUnlock = z.infer<typeof TitleUnlockSchema>;

// -------------------- Main XP Config --------------------
export const xpActions: XpAction[] = [
	{ id: 'post', xp: 10 },
	{ id: 'reply', xp: 5 },
	{ id: 'tip_given', xp: 3 }
] as const;

export const titleUnlocks: TitleUnlock[] = [
	{ id: 'veteran', title: 'Veteran', unlockXP: 5000 },
	{ id: 'whale', title: 'Whale', unlockXP: 10000 }
] as const;
