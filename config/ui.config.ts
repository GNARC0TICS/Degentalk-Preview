import { z } from 'zod';

/**
 * Hero section quote definition.
 */
export const HeroQuoteSchema = z.object({
	headline: z.string().min(1),
	subheader: z.string().optional()
});

export type HeroQuote = z.infer<typeof HeroQuoteSchema>;

/**
 * Footer section quote definition.
 */
export const FooterQuoteSchema = z.string().min(1);

export type FooterQuote = z.infer<typeof FooterQuoteSchema>;

/**
 * Main UI config schema.
 */
export const UiConfigSchema = z.object({
	/** Hero section rotating quotes */
	heroQuotes: z.array(HeroQuoteSchema).min(1),
	/** Footer section rotating quotes */
	footerQuotes: z.array(FooterQuoteSchema).min(1)
});

/**
 * Default UI config reflecting current hardcoded values.
 */
export const uiConfig = {
	heroQuotes: [
		{
			headline: 'Where the risk is real and the advice is imaginary.',
			subheader: 'Discover, Discuss, Degen.'
		},
		{
			headline: 'Post first. Cope later.',
			subheader: 'Discover, Discuss, Degen.'
		},
		{
			headline: 'Built by winners. Maintained by the wreckage.',
			subheader: 'Discover, Discuss, Degen.'
		},
		{
			headline: "The only forum where 'bad idea' is a compliment.",
			subheader: 'Discover, Discuss, Degen.'
		},
		{
			headline: 'We chart pain in real-time.',
			subheader: 'Discover, Discuss, Degen.'
		},
		{
			headline: 'Alpha, anxiety, and the occasional enlightenment.',
			subheader: 'Discover, Discuss, Degen.'
		},
		{
			headline: 'Proof-of-sanity not required.',
			subheader: 'Discover, Discuss, Degen.'
		},
		{
			headline: "A support group for people who call their losses 'lessons.'",
			subheader: 'Discover, Discuss, Degen.'
		},
		{
			headline: 'No roadmap. No mercy.',
			subheader: 'Discover, Discuss, Degen.'
		},
		{
			headline: 'Join the conversation before the voices win.',
			subheader: 'Discover, Discuss, Degen.'
		},
		{
			headline: 'We eat pump and dumps for breakfast.',
			subheader: 'Discover, Discuss, Degen.'
		},
		{
			headline: 'Dox your thoughts. Keep your wallet private.',
			subheader: 'Discover, Discuss, Degen.'
		},
		{
			headline: 'One rug away from greatness.',
			subheader: 'Discover, Discuss, Degen.'
		},
		{
			headline: "This is not financial advice. It's worse.",
			subheader: 'Discover, Discuss, Degen.'
		},
		{
			headline: 'A forum for people banned from better forums.',
			subheader: 'Discover, Discuss, Degen.'
		},
		{
			headline: 'More insight than CT. Fewer scams than Discord.',
			subheader: 'Discover, Discuss, Degen.'
		},
		{
			headline: "Your subconscious made this site. We're just hosting it.",
			subheader: 'Discover, Discuss, Degen.'
		},
		{
			headline: 'Built by gamblers pretending to be philosophers.',
			subheader: 'Discover, Discuss, Degen.'
		},
		{
			headline: 'The tab you check before blowing your last $20.',
			subheader: 'Discover, Discuss, Degen.'
		},
		{
			headline: 'Welcome to the frontlines of financial chaos.',
			subheader: 'Discover, Discuss, Degen.'
		},
		{
			headline: 'If Reddit and 4chan had a DAO baby.',
			subheader: 'Discover, Discuss, Degen.'
		},
		{
			headline: 'Lurk. Post. Ascend.',
			subheader: 'Discover, Discuss, Degen.'
		},
		{
			headline: 'Bridging the gap between genius and gambling addiction.',
			subheader: 'Discover, Discuss, Degen.'
		},
		{
			headline: "No GM's, Not another Web3 project. Keep your money.. You're gonna need it.",
			subheader: 'Discover, Discuss, Degen.'
		},
		{
			headline: 'The only forum where losing money makes you smarter.',
			subheader: 'Discover, Discuss, Degen.'
		},
		{
			headline: 'Alpha is temporary. Reputations are forever.',
			subheader: "Post wisely. Or don't."
		},
		{
			headline: 'We backtest trauma.',
			subheader: 'Discover, Discuss, Degen.'
		},
		{
			headline: 'Mentally unwell. Financially overexposed.',
			subheader: 'Join thousands of others doing just fine.'
		},
		{
			headline: "You're early. But still down bad.",
			subheader: 'Discover, Discuss, Degen.'
		},
		{
			headline: 'Where your bags get sympathy… and screenshots.',
			subheader: 'This is a safe space for unsafe bets.'
		},
		{
			headline: "A forum for people who should log off… but won't.",
			subheader: 'Discover, Discuss, Degen.'
		},
		{
			headline: 'An experimental forum for financially curious masochists.',
			subheader: "We study losses so you don't have to."
		},
		{
			headline: 'Technically legal. Morally bankrupt.',
			subheader: 'Welcome to Degentalk™.'
		},
		{
			headline: 'Lurk harder. Think worse. Win more.',
			subheader: 'Discover, Discuss, Degen.'
		},
		{
			headline: "We're not addicted. We're informed.",
			subheader: 'This is the last tab you close before bed.'
		},
		{
			headline: 'One good post away from greatness.',
			subheader: 'And three bad ones from a ban.'
		},
		{
			headline: 'Sell your SOL, buy DGT 😈',
			subheader: 'Discover, Discuss, Degen.'
		},
		// 🌤️ Copium-Laced Optimism Batch
		// For users who've taken Ls… but still dare to dream.
		{
			headline: 'Still down. But learning.',
			subheader: 'Discover, Discuss, Degen.'
		},
		{
			headline: "Might make it. Probably won't. Posting anyway.",
			subheader: 'Where hope goes to get rekt — and rebuilt.'
		},
		{
			headline: "It's not over until the last cope is posted.",
			subheader: 'Discover, Discuss, Degen.'
		},
		{
			headline: 'This time I read the whitepaper.',
			subheader: 'We believe in second chances. Sometimes.'
		},
		{
			headline: 'Recovery arcs start here.',
			subheader: 'Write your comeback post in advance.'
		},
		{
			headline: 'Not all moonshots hit. Some just orbit longer.',
			subheader: "We're still watching the chart."
		},
		{
			headline: "Everyone's early until they sell.",
			subheader: 'Discover, Discuss, Degen.'
		},
		{
			headline: 'One more post. One more bet. One more breakthrough.',
			subheader: 'We run on fumes and ambition.'
		},
		{
			headline: 'At least here, the pain is shared.',
			subheader: 'Discover, Discuss, Degen.'
		},
		{
			headline: 'Somehow, still bullish.',
			subheader: 'Not even the mods know why.'
		},
		{
			headline: 'You might not make it… but your ideas might.',
			subheader: "Post like someone's watching."
		},
		{
			headline: "If you're gonna lose, lose loudly.",
			subheader: 'Forum-powered resilience since [insert rug year here].'
		},
		{
			headline: "Hope is a utility. We just don't chart it.",
			subheader: 'Discover, Discuss, Degen.'
		},
		{
			headline: 'The Last Stop Before the Moon—or the Bottom.',
			subheader: "Every degen's playground for market chaos."
		},
		{
			headline: 'For Those Who Play to Win.',
			subheader: 'Discover, Discuss, Degen.'
		},
		{
			headline: 'No Limits. No Filters. All Degen.',
			subheader: 'Discover, Discuss, Degen.'
		},
		{
			headline: 'Talk Sharp. Bet Smart. Dream Big.',
			subheader: 'Discover, Discuss, Degen.'
		},
		{
			headline: "If There's Odds, We're In.",
			subheader: 'Profit is the only currency.'
		},
		{
			headline: 'Fortune Favors the Bold.',
			subheader: 'Go hard or go home.'
		},
		{
			headline: 'Where every thread is a support group.',
			subheader: 'Therapy, but with more leverage.'
		},
		// --- User's Satirical Greatness Batch ---
		{
			headline: "We don't chase pumps. We start them.",
			subheader: 'Shill responsibly.'
		},
		{
			headline: "If you're not losing sleep, you're not degen enough.",
			subheader: 'Rest is for the risk-averse.'
		},
		{
			headline: 'Our exit strategy is denial.',
			subheader: 'Diamond hands, paper plans.'
		},
		{
			headline: 'The only thing we diversify is our regrets.',
			subheader: 'Collect them all.'
		},
		{
			headline: 'We turn FOMO into an art form.',
			subheader: 'Masterpiece in progress.'
		},
		{
			headline: 'Here for a good time, not a long time.',
			subheader: 'YOLO, but with spreadsheets.'
		},
		{
			headline: "We don't time the market. We meme it.",
			subheader: 'Charts are just suggestions.'
		},
		{
			headline: "If you can't handle the drawdown, stay out of the forum.",
			subheader: 'Pain is temporary. Screenshots are forever.'
		},
		{
			headline: "We're not early adopters. We're early survivors.",
			subheader: 'Still here, still coping.'
		},
		{
			headline: "We don't follow trends. We chase chaos.",
			subheader: 'Order is overrated.'
		},
		{
			headline: "If you're reading this, you're already down bad.",
			subheader: 'Welcome home.'
		},
		{
			headline: 'We celebrate wins. We meme the losses.',
			subheader: 'Post your pain for reputation.'
		},
		{
			headline: 'Where every thread is a support group.',
			subheader: 'Therapy, but with more leverage.'
		}
	],
	footerQuotes: [
		"This is not financial advice. But if it works, you're welcome.",
		'Degentalk™ is powered by caffeine, cope, and completely unlicensed opinions.',
		"We are not financial advisors. We just yell louder when we're right.",
		'Not financial advice. Consult your local psychic for better accuracy.',
		'Any gains you make are pure coincidence. Any losses are definitely your fault.',
		"This isn't financial advice. It's just aggressive optimism with a side of chaos.",
		'If this feels like good advice, please reconsider everything.',
		'Everything here is entirely theoretical. Especially your profits.',
		"Don't sue us. Sue the market.",
		'Side effects of listening to Degentalk™ may include delusion, euphoria, or margin calls.',
		'DYOR. Then ignore it and ape anyway.',
		'This is not financial advice, seriously.',
		'Shoutout to the guy who lost his paycheck today.',
		'Up only... in spirit.',
		'Post your wins. Hide your losses.',
		'No charts. Just vibes.',
		"Rugged? Good. Now you're one of us.",
		'Built different. Just not financially stable.',
		"Degens don't cry—we redeposit.",
		'Who needs therapy when you have leverage?',
		'Your portfolio is our entertainment.',
		'Welcome to group therapy with bonus rounds.',
		'0xFaith, 100x Cope.',
		'Lose fast, post faster.',
		"If this site loads, you haven't been liquidated yet.",
		'Do NOT try this at home. Try it on-chain.',
		'The only thing guaranteed here is the disclaimer.',
		'Every loss is a lesson—some just cost more than others.',
		'Remember: Regret is not a refund policy.',
		"If you're looking for a sign, this isn't it.",
		'Winners take profits. Degens take screenshots.',
		"If you can't handle the heat, turn off your notifications."
	]
} as const;
