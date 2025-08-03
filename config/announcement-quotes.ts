/**
 * Announcement ticker quotes configuration
 * Satirical, witty, and slightly degenerate - the Degentalk way
 */

export interface AnnouncementQuote {
	id: string;
	content: string;
	type?: 'warning' | 'info' | 'hype' | 'satire';
}

// Early waitlist/beta phase quotes only
export const announcementQuotes: AnnouncementQuote[] = [
	// Launch Phase / Beta Warnings
	{
		id: 'proto-prophecy',
		content: "Degentalk is live… kind of. You're looking at a prototype disguised as prophecy.",
		type: 'satire'
	},
	{
		id: 'forum-booting',
		content: 'Forum booting… XP systems syncing… Degen protocols activating…',
		type: 'warning'
	},
	{
		id: 'controlled-chaos',
		content: 'Current phase: Controlled chaos. Actual threads coming soon. Brace for launch.',
		type: 'info'
	},
	{
		id: 'waitlist-limbo',
		content: 'Not fully live. Not fully dead. Degentalk is in waitlist limbo. Join or cope.',
		type: 'satire'
	},
	{
		id: 'full-send',
		content: 'Full send mode: ENGAGED. Risk management: OPTIONAL. This is Degentalk.',
		type: 'warning'
	},
	
	// Early Adopter Flexes
	{
		id: 'pre-everything',
		content: "You're early. Like pre-revenue, pre-code, pre-sanity early. Good.",
		type: 'hype'
	},
	{
		id: 'real-clout',
		content: 'Building real clout, one shitpost at a time. This is the way.',
		type: 'info'
	},
	{
		id: 'not-operational',
		content: 'Degentalk is not fully operational. Neither are its users.',
		type: 'satire'
	},
	{
		id: 'earn-rep',
		content: "If you're reading this, you're early enough to become a founding degen.",
		type: 'satire'
	},
	{
		id: 'xp-disabled',
		content: 'XP faucet disabled. Leaderboards frozen. Forum culture brewing.',
		type: 'warning'
	},
	
	// Launch imminent quotes
	{
		id: 'launch-countdown',
		content: 'Launch sequence initiated. Degen levels approaching critical mass.',
		type: 'hype'
	},
	{
		id: 'wallets-loading',
		content: '$DGT wallets loading... Your bags will never be the same.',
		type: 'info'
	},
	{
		id: 'forum-revolution',
		content: 'The forum revolution will not be moderated.',
		type: 'satire'
	},
	{
		id: 'server-warming',
		content: 'Servers warming up. Shitposters limbering up. Magic about to happen.',
		type: 'hype'
	},
	{
		id: 'not-financial',
		content: 'Not financial advice. Not spiritual advice. Just pure degeneracy.',
		type: 'satire'
	},
	{
		id: 'early-adopter',
		content: 'Early adopter detected. Achievement unlocked: Pre-Launch Degen.',
		type: 'hype'
	},
	{
		id: 'launch-ready',
		content: 'Systems online. Chaos generators primed. Launch window approaching.',
		type: 'info'
	},
	{
		id: 'beta-warning',
		content: 'Beta mode: Where bugs become features and features become legends.',
		type: 'warning'
	},
	{
		id: 'community-first',
		content: 'Built by the community, for the community, probably against better judgment.',
		type: 'satire'
	},
	{
		id: 'gamification',
		content: 'Gamification loading... Your forum addiction starts here.',
		type: 'hype'
	},
	
	// Additional launch quotes
	{
		id: 'moon-mission',
		content: 'Forget the moon. We\'re digging straight through to the earth\'s core.',
		type: 'hype'
	},
	{
		id: 'risk-warning',
		content: 'Warning: Contains actual discussion. Toxic positivity sold separately.',
		type: 'warning'
	},
	{
		id: 'forum-energy',
		content: 'No motivational quotes. No diamond hands. Just raw, unfiltered chaos.',
		type: 'satire'
	},
	{
		id: 'no-gm-zone',
		content: 'This is a "gm"-free zone. We gamble 24/7. Sleep is for the weak.',
		type: 'satire'
	},
	{
		id: 'anti-influencer',
		content: 'Your favorite influencer probably got liquidated. Twice. Today.',
		type: 'satire'
	},
	{
		id: 'no-emoji',
		content: 'Rocket emojis don\'t pump bags. Stop trying.',
		type: 'warning'
	},
	{
		id: 'reality-check',
		content: 'We\'re not all gonna make it. But the memes will be legendary.',
		type: 'satire'
	},
	{
		id: 'toxic-truth',
		content: 'Diamond hands? More like bag holder\'s anonymous.',
		type: 'satire'
	},
	
	// Web3/Discord/Startup roasts
	{
		id: 'discord-shade',
		content: 'Another Discord server? That\'s cute. We built an actual platform.',
		type: 'satire'
	},
	{
		id: 'web3-reality',
		content: 'It\'s not Web3, it\'s just a database with extra steps and higher gas fees.',
		type: 'satire'
	},
	{
		id: 'startup-burn',
		content: '"We\'re the Uber of crypto forums" - Every startup that died in 2022.',
		type: 'satire'
	},
	{
		id: 'vc-roast',
		content: 'Raised at a $2B valuation. Currently worth less than a JPEG.',
		type: 'satire'
	},
	{
		id: 'discord-migration',
		content: 'Tired of 47 Discord tabs? Welcome to civilization.',
		type: 'info'
	},
	{
		id: 'dao-joke',
		content: 'DAO? More like "Developers Abandoning Operations".',
		type: 'satire'
	},
	{
		id: 'whitepaper-truth',
		content: 'Your whitepaper is just a PDF with extra hopium.',
		type: 'satire'
	},
	{
		id: 'pivot-culture',
		content: 'Pivoting to AI? How original. So is everyone else.',
		type: 'satire'
	},
	{
		id: 'web3-social',
		content: 'Web3 social? That\'s just forums with worse UX and gas fees.',
		type: 'satire'
	},
	{
		id: 'raising-hell',
		content: 'They\'re raising Series B. We\'re raising hell.',
		type: 'hype'
	},
	{
		id: 'centralize-chaos',
		content: 'They\'re decentralizing everything. We\'re centralizing the chaos.',
		type: 'satire'
	},
	{
		id: 'ruining-present',
		content: 'Everyone else is \'building the future.\' We\'re ruining the present.',
		type: 'satire'
	},
	{
		id: 'ai-trendy',
		content: 'Another project adding \'AI\' to their name. We\'ll stick with being a forum.',
		type: 'satire'
	},
	
	// High-stakes energy quotes
	{
		id: 'dopamine-engine',
		content: 'This isn\'t just a forum. This is a decentralized dopamine engine powered by risk, status, and strategy.',
		type: 'hype'
	},
	{
		id: 'every-move',
		content: 'Every bet, every move, every play—right here.',
		type: 'hype'
	},
	{
		id: 'no-safe-plays',
		content: 'For those who don\'t play it safe—crypto, sports, casino, and beyond.',
		type: 'hype'
	}
];

// Helper function to get random quotes
export function getRandomQuotes(count: number = 10): AnnouncementQuote[] {
	const shuffled = [...announcementQuotes].sort(() => 0.5 - Math.random());
	return shuffled.slice(0, count);
}

// Helper function to get quotes by type
export function getQuotesByType(type: AnnouncementQuote['type']): AnnouncementQuote[] {
	return announcementQuotes.filter(quote => quote.type === type);
}