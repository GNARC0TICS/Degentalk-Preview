export const frameRarityConfig = {
	common: {
		price: 0,
		borderColor: '#9ca3af',
		glowClass: '',
		borderClass: '',
		backgroundClass: ''
	},
	rare: {
		price: 500,
		borderColor: '#3b82f6',
		glowClass: 'ring-2 ring-blue-400',
		borderClass: 'ring-2 ring-blue-400',
		backgroundClass: ''
	},
	epic: {
		price: 2000,
		borderColor: '#8b5cf6',
		glowClass: 'ring-2 ring-purple-500',
		borderClass: 'ring-2 ring-purple-500',
		backgroundClass: ''
	},
	legendary: {
		price: 10000,
		borderColor: '#facc15',
		glowClass: 'ring-2 ring-yellow-400',
		borderClass: 'ring-2 ring-yellow-400',
		backgroundClass: ''
	}
} as const;

export type FrameRarity = keyof typeof frameRarityConfig;
