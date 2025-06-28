export const rarityColorMap = {
	common: 'bg-slate-600 text-slate-200',
	uncommon: 'bg-green-800 text-green-200',
	rare: 'bg-blue-800 text-blue-200',
	epic: 'bg-purple-800 text-purple-200',
	legendary: 'bg-amber-800 text-amber-200',
	mythic: 'bg-red-800 text-red-100'
} as const;

export const rarityBorderMap = {
	common: 'border-2 border-slate-700',
	uncommon: 'border-2 border-green-700',
	rare: 'border-2 border-blue-700',
	epic: 'border-2 border-purple-700',
	legendary: 'border-3 border-amber-600 shadow-lg shadow-amber-900/20',
	mythic: 'border-3 border-red-600 shadow-lg shadow-red-900/20'
} as const;

export type Rarity = keyof typeof rarityColorMap;
