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

export const CLOUT_EASTER_EGGS = {
	enableObliteration: true,
	obliterationThreshold: -1000,
	titleOnObliteration: 'Obliterated', // optional – assign temp title
	resetCloutToZero: true, // reset clout to 0 after applying
	obliterationMessages: [
		'Their reputation went nuclear and caused a total meltdown.',
		'Reputation so toxic it contaminated the entire forum ecosystem.',
		'Clout obliterated in a spectacular cascade failure.',
		'Reputation nuked from orbit – it was the only way to be sure.',
		'Their credibility suffered a catastrophic core breach.',
		'Clout vaporized in a chain reaction of bad takes.',
		'Reputation went supernova and collapsed into a black hole.',
		'Total reputational annihilation – nothing survived the blast.'
	]
} as const;

export const OBLITERATION_EFFECTS = {
	enableSoundEffect: false, // disable by default for UX
	enableFullScreenModal: true,
	glitchDuration: 3500, // 3.5 seconds
	enableParticleEffect: false, // can be added later
	effectColor: '#ef4444' // red theme for obliteration
} as const;

export type ObliterationMessage = (typeof CLOUT_EASTER_EGGS.obliterationMessages)[number];
