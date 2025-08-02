/**
 * Announcement ticker quotes configuration
 * Satirical, witty, and slightly degenerate - the DegenTalk way
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
		content: "DegenTalk is live… kind of. You're looking at a prototype disguised as prophecy.",
		type: 'satire'
	},
	{
		id: 'forum-booting',
		content: 'Forum booting… XP systems syncing… mock data still flexing harder than some real ones.',
		type: 'warning'
	},
	{
		id: 'controlled-chaos',
		content: 'Current phase: Controlled chaos. Actual threads coming soon. Brace for launch.',
		type: 'info'
	},
	{
		id: 'waitlist-limbo',
		content: 'Not fully live. Not fully dead. DegenTalk is in waitlist limbo. Join or cope.',
		type: 'satire'
	},
	{
		id: 'fake-data',
		content: 'Some data is fake. The degeneracy is not. Full rollout is coming.',
		type: 'warning'
	},
	
	// Early Adopter Flexes
	{
		id: 'pre-everything',
		content: "You're early. Like pre-revenue, pre-code, pre-sanity early. Good.",
		type: 'hype'
	},
	{
		id: 'mock-clout',
		content: 'Mock data today. Real clout tomorrow.',
		type: 'info'
	},
	{
		id: 'not-operational',
		content: 'DegenTalk is not fully operational. Neither are its users.',
		type: 'satire'
	},
	{
		id: 'fake-rep',
		content: "If you're reading this, you're early enough to fake your entire rep.",
		type: 'satire'
	},
	{
		id: 'xp-disabled',
		content: 'XP faucet disabled. Leaderboards frozen. Forum culture brewing.',
		type: 'warning'
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