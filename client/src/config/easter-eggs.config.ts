/**
 * Easter Egg Configuration
 * Fun system configurations for special admin interactions
 */

export const XP_EASTER_EGGS = {
	enableBankruptcy: true,
	bankruptcyThreshold: -1000,
	titleOnBankruptcy: 'Bankrupt', // optional – assign temp title
	bankruptXPReset: true, // reset XP to 0 after applying
	liquidationMessages: [
		'They leveraged their Clout on a 1000x shitpost and lost everything.',
		'Went all-in on a rug pull and got absolutely rekt.',
		'Tried to short the forum meta and got liquidated.',
		"FOMO'd into a scam thread and lost their bag.",
		'Put their XP in a yield farm that turned out to be a honeypot.',
		'Bought the top of every hype thread.',
		'Diamond hands turned to paper hands real quick.',
		'Got caught in a leverage cascade liquidation.'
	]
} as const;

export const BANKRUPTCY_EFFECTS = {
	enableSoundEffect: false, // disable by default for UX
	enableFullScreenModal: true,
	glitchDuration: 3000, // 3 seconds
	enableParticleEffect: false // can be added later
} as const;

export type BankruptcyMessage = (typeof XP_EASTER_EGGS.liquidationMessages)[number];
