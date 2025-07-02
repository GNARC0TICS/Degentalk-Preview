/**
 * Forum content factories for realistic crypto community discussions
 */

import { BaseFactory } from '../core/factory';
import type { Thread, Post, ForumCategory } from '@schema';
import { generateId } from '@shared/utils/id';

export class ThreadFactory extends BaseFactory<Thread> {
	private static readonly CRYPTO_THREAD_TITLES = [
		'BTC just broke ${price}k resistance! 🚀',
		'REKT: Lost everything on this ${token} trade',
		'Why ${token} is going to ${target} (TA inside)',
		"${token} holders, we're so back!",
		'Daily ${token} discussion - ${date}',
		'Is ${token} dead? Serious discussion only',
		'Just aped into ${token} at ${price}',
		'${token} tokenomics are actually genius',
		'Unpopular opinion: ${token} is overvalued',
		"#{tag} Why I'm bullish on ${sector}"
	];

	private static readonly CRYPTO_TOKENS = [
		'ETH',
		'BTC',
		'SOL',
		'LINK',
		'DOGE',
		'SHIB',
		'PEPE',
		'MATIC',
		'AVAX',
		'ADA'
	];

	private static readonly PRICE_TARGETS = [
		'100k',
		'50k',
		'25k',
		'$1',
		'$10',
		'$100',
		'moon',
		'zero'
	];

	private static readonly CRYPTO_TAGS = [
		'bull-market',
		'bear-market',
		'altseason',
		'defi',
		'nft',
		'memecoins',
		'ta',
		'fundamentals'
	];

	definition(): Partial<Thread> {
		const title = this.generateCryptoTitle();

		return {
			id: generateId<'thread'>(),
			title,
			slug: this.slugify(title),
			forumId: generateId<'forum'>(),
			userId: generateId<'user'>(),
			isPinned: this.faker.datatype.boolean(0.05),
			isLocked: this.faker.datatype.boolean(0.02),
			viewCount: this.faker.number.int({ min: 0, max: 10000 }),
			postCount: this.faker.number.int({ min: 1, max: 500 }),
			lastPostAt: this.faker.date.recent({ days: 30 }),
			createdAt: this.faker.date.past({ months: 6 }),
			updatedAt: this.faker.date.recent({ days: 7 })
		};
	}

	private generateCryptoTitle(): string {
		const template = this.faker.helpers.arrayElement(ThreadFactory.CRYPTO_THREAD_TITLES);
		const token = this.faker.helpers.arrayElement(ThreadFactory.CRYPTO_TOKENS);
		const price = this.faker.number.int({ min: 1, max: 100 });
		const target = this.faker.helpers.arrayElement(ThreadFactory.PRICE_TARGETS);
		const tag = this.faker.helpers.arrayElement(ThreadFactory.CRYPTO_TAGS);
		const date = this.faker.date.recent().toLocaleDateString();

		return template
			.replace('${token}', token)
			.replace('${price}', price.toString())
			.replace('${target}', target)
			.replace('${tag}', tag)
			.replace('${date}', date)
			.replace('${sector}', this.faker.helpers.arrayElement(['DeFi', 'GameFi', 'RWA', 'AI']));
	}

	private slugify(title: string): string {
		return title
			.toLowerCase()
			.replace(/[^\w\s-]/g, '')
			.replace(/\s+/g, '-')
			.substring(0, 50);
	}

	protected getState(state: string): Partial<Thread> {
		const states: Record<string, Partial<Thread>> = {
			hot: {
				viewCount: this.faker.number.int({ min: 5000, max: 50000 }),
				postCount: this.faker.number.int({ min: 100, max: 1000 }),
				lastPostAt: this.faker.date.recent({ hours: 2 })
			},
			pinned: {
				isPinned: true,
				viewCount: this.faker.number.int({ min: 10000, max: 100000 }),
				title: '[PINNED] ' + this.generateCryptoTitle()
			},
			locked: {
				isLocked: true,
				title: '[LOCKED] ' + this.generateCryptoTitle(),
				lastPostAt: this.faker.date.past({ days: 30 })
			},
			empty: {
				postCount: 1, // Just the first post
				viewCount: this.faker.number.int({ min: 0, max: 100 }),
				lastPostAt: this.faker.date.recent({ days: 1 })
			}
		};

		return states[state] || {};
	}
}

export class PostFactory extends BaseFactory<Post> {
	private static readonly CRYPTO_POST_TEMPLATES = [
		'Just bought the dip at ${price}! Who else is accumulating?',
		'TA update: ${token} is forming a ${pattern}. Target: ${target}',
		"GM crypto degens! What's everyone buying today?",
		'This ${news} is huge for ${token}. Moon mission incoming! 🚀',
		'Unpopular opinion: ${opinion}',
		'REKT check: How much did you lose on ${token}?',
		'DCA is the way. Been buying ${token} every week for ${period}',
		'Found this gem: ${token}. ${marketcap} mcap, ${feature}',
		'Bearish on ${token}. ${reason}. Change my mind.',
		'#{tag} ${content}'
	];

	private static readonly PATTERNS = [
		'ascending triangle',
		'bull flag',
		'cup and handle',
		'double bottom',
		'inverse head and shoulders'
	];

	private static readonly NEWS_TYPES = [
		'partnership',
		'listing',
		'upgrade',
		'hack',
		'regulation',
		'adoption'
	];

	private static readonly OPINIONS = [
		'most altcoins will go to zero',
		'Bitcoin is digital gold',
		'DeFi is overrated',
		'NFTs will come back',
		"we're still early"
	];

	definition(): Partial<Post> {
		return {
			id: generateId<'post'>(),
			threadId: generateId<'thread'>(),
			userId: generateId<'user'>(),
			content: this.generateCryptoContent(),
			isFirstPost: false,
			likeCount: this.faker.number.int({ min: 0, max: 100 }),
			createdAt: this.faker.date.past({ months: 3 }),
			updatedAt: this.faker.date.recent({ days: 1 })
		};
	}

	private generateCryptoContent(): string {
		const template = this.faker.helpers.arrayElement(PostFactory.CRYPTO_POST_TEMPLATES);

		return template
			.replace('${price}', `$${this.faker.number.int({ min: 100, max: 50000 })}`)
			.replace('${token}', this.faker.helpers.arrayElement(ThreadFactory.CRYPTO_TOKENS))
			.replace('${pattern}', this.faker.helpers.arrayElement(PostFactory.PATTERNS))
			.replace('${target}', `$${this.faker.number.int({ min: 1000, max: 100000 })}`)
			.replace('${news}', this.faker.helpers.arrayElement(PostFactory.NEWS_TYPES))
			.replace('${opinion}', this.faker.helpers.arrayElement(PostFactory.OPINIONS))
			.replace('${period}', this.faker.helpers.arrayElement(['6 months', '1 year', '2 years']))
			.replace('${marketcap}', `$${this.faker.number.int({ min: 1, max: 1000 })}M`)
			.replace(
				'${feature}',
				this.faker.helpers.arrayElement([
					'yield farming',
					'staking rewards',
					'low fees',
					'fast txs'
				])
			)
			.replace(
				'${reason}',
				this.faker.helpers.arrayElement([
					'tokenomics are broken',
					'team is dumping',
					'no real utility'
				])
			)
			.replace('${tag}', this.faker.helpers.arrayElement(ThreadFactory.CRYPTO_TAGS))
			.replace('${content}', this.faker.lorem.paragraph());
	}

	protected getState(state: string): Partial<Post> {
		const states: Record<string, Partial<Post>> = {
			first: {
				isFirstPost: true,
				content: this.generateLongCryptoContent()
			},
			popular: {
				likeCount: this.faker.number.int({ min: 50, max: 500 })
			},
			controversial: {
				likeCount: this.faker.number.int({ min: -20, max: 20 }),
				content: 'Unpopular opinion: ' + this.generateCryptoContent()
			},
			reply: {
				content: `@${this.faker.internet.userName()} ${this.generateCryptoContent()}`
			}
		};

		return states[state] || {};
	}

	private generateLongCryptoContent(): string {
		const intro = this.generateCryptoContent();
		const body = this.faker.lorem.paragraphs(2, '\n\n');
		const conclusion = this.faker.helpers.arrayElement([
			'DYOR and not financial advice!',
			'What do you think? Diamond hands or paper hands?',
			"LFG! Who's with me?",
			'Bullish or bearish? Drop your thoughts below.'
		]);

		return `${intro}\n\n${body}\n\n${conclusion}`;
	}
}

export class ForumCategoryFactory extends BaseFactory<ForumCategory> {
	private static readonly CRYPTO_FORUM_NAMES = [
		'General Trading',
		'DeFi Discussion',
		'NFT Marketplace',
		'Meme Coins',
		'Technical Analysis',
		'Market News',
		'Beginner Questions',
		'Whale Alerts',
		'Rugpull Warnings',
		'Yield Farming',
		'Staking Rewards',
		'Crypto Gaming'
	];

	definition(): Partial<ForumCategory> {
		const name = this.faker.helpers.arrayElement(ForumCategoryFactory.CRYPTO_FORUM_NAMES);

		return {
			id: generateId<'category'>(),
			name,
			slug: this.slugify(name),
			description: this.generateForumDescription(name),
			isActive: true,
			sortOrder: this.faker.number.int({ min: 1, max: 100 }),
			threadCount: this.faker.number.int({ min: 0, max: 10000 }),
			postCount: this.faker.number.int({ min: 0, max: 100000 }),
			createdAt: this.faker.date.past({ years: 1 }),
			updatedAt: this.faker.date.recent({ days: 30 })
		};
	}

	private slugify(name: string): string {
		return name.toLowerCase().replace(/\s+/g, '-');
	}

	private generateForumDescription(name: string): string {
		const descriptions: Record<string, string> = {
			'General Trading': 'Discuss your trades, share wins and losses, get trading advice',
			'DeFi Discussion': 'Decentralized finance protocols, yield farming, and liquidity mining',
			'NFT Marketplace': 'Buy, sell, and discuss non-fungible tokens and digital collectibles',
			'Meme Coins': 'DOGE, SHIB, PEPE and other meme-based cryptocurrencies',
			'Technical Analysis': 'Charts, patterns, indicators and market analysis',
			'Market News': 'Latest crypto news, regulations, and market updates',
			'Beginner Questions': 'New to crypto? Ask your questions here',
			'Whale Alerts': 'Large transactions and whale movement tracking'
		};

		return descriptions[name] || this.faker.lorem.sentence();
	}
}
