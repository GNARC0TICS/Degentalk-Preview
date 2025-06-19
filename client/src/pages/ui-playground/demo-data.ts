// Demo data for UI Playground

export const usernameTiers = [
	{ tier: 'cope', color: 'text-zinc-500', label: 'Cope', xpRange: '0-100' },
	{ tier: 'pleb', color: 'text-gray-400', label: 'Pleb', xpRange: '101-500' },
	{ tier: 'degen', color: 'text-green-400', label: 'Degen', xpRange: '501-2,500' },
	{ tier: 'whale', color: 'text-blue-400', label: 'Whale', xpRange: '2,501-10,000' },
	{ tier: 'chad', color: 'text-purple-400', label: 'Chad', xpRange: '10,001-50,000' },
	{ tier: 'legend', color: 'text-yellow-400', label: 'Legend', xpRange: '50,001-100,000' },
	{
		tier: 'exit-liquidity',
		color: 'text-red-400 animate-pulse',
		label: 'Exit Liquidity',
		xpRange: '100,000+'
	}
];

export const userTitles = [
	{ title: 'Paper Hands', rarity: 'common' },
	{ title: 'Diamond Hands', rarity: 'uncommon' },
	{ title: 'Rug Pull Survivor', rarity: 'rare' },
	{ title: 'Moonshot Captain', rarity: 'epic' },
	{ title: 'DeFi Overlord', rarity: 'legendary' },
	{ title: "Satoshi's Heir", rarity: 'mythic' }
];

export const avatarFrameRarities = [
	{ rarity: 'common', borderClass: 'ring-2 ring-zinc-600', glowClass: '' },
	{ rarity: 'uncommon', borderClass: 'ring-2 ring-green-500', glowClass: '' },
	{
		rarity: 'rare',
		borderClass: 'ring-2 ring-blue-500',
		glowClass: 'shadow-[0_0_10px_rgba(59,130,246,0.5)]'
	},
	{
		rarity: 'epic',
		borderClass: 'ring-2 ring-purple-500',
		glowClass: 'shadow-[0_0_15px_rgba(168,85,247,0.5)]'
	},
	{
		rarity: 'legendary',
		borderClass: 'ring-2 ring-yellow-400',
		glowClass: 'shadow-[0_0_20px_rgba(250,204,21,0.6)]'
	},
	{
		rarity: 'mythic',
		borderClass: 'ring-2 ring-transparent',
		glowClass: 'shadow-[0_0_25px_rgba(255,0,128,0.7)] animate-gradient-shift',
		backgroundClass: 'bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500'
	}
];

export const cryptoIcons = [
	{ name: 'rocket', emoji: '🚀', label: 'To the Moon' },
	{ name: 'diamond', emoji: '💎', label: 'Diamond Hands' },
	{ name: 'paper', emoji: '🧻', label: 'Paper Hands' },
	{ name: 'bull', emoji: '🐂', label: 'Bull Market' },
	{ name: 'bear', emoji: '🐻', label: 'Bear Market' },
	{ name: 'whale', emoji: '🐋', label: 'Whale Alert' },
	{ name: 'shrimp', emoji: '🦐', label: 'Shrimp' },
	{ name: 'fire', emoji: '🔥', label: 'Hot' },
	{ name: 'ice', emoji: '🧊', label: 'Cold Storage' },
	{ name: 'money', emoji: '💰', label: 'Bags' },
	{ name: 'chart', emoji: '📈', label: 'Pump' },
	{ name: 'crash', emoji: '📉', label: 'Dump' },
	{ name: 'rug', emoji: '🎭', label: 'Rug Pull' },
	{ name: 'lambo', emoji: '🏎️', label: 'Lambo' },
	{ name: 'ramen', emoji: '🍜', label: 'Ramen' }
];

export const sampleAnnouncements = [
	{
		id: 1,
		title: 'New XP Multiplier Event!',
		description: 'Double XP on all forum posts this weekend. Time to farm those gains!',
		type: 'event',
		timestamp: new Date()
	},
	{
		id: 2,
		title: 'Maintenance Notice',
		description: 'Trading disabled for 30 minutes while we add more hopium to the reserves.',
		type: 'warning',
		timestamp: new Date()
	},
	{
		id: 3,
		title: 'Whale Alert!',
		description: 'ChadGPT just dropped 1000 DGT in the community rain pool.',
		type: 'success',
		timestamp: new Date()
	}
];

export const navSections = [
	{ id: 'buttons', label: 'Buttons', icon: '🎯' },
	{ id: 'cards', label: 'Cards', icon: '🃏' },
	{ id: 'colors', label: 'Colors', icon: '🎨' },
	{ id: 'usernames', label: 'Username Tiers', icon: '👤' },
	{ id: 'avatars', label: 'Avatar Frames', icon: '🖼️' },
	{ id: 'badges', label: 'Badges & Icons', icon: '🏆' },
	{ id: 'animations', label: 'Animations', icon: '✨' }
];
