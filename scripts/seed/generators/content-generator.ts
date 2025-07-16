import { db } from '../../../db';
import * as schema from '../../../db/schema';
import { eq, sql, and } from 'drizzle-orm';
import type { UserId, ThreadId, PostId, ForumId } from '../../../shared/types/ids';
import { personas } from '../config/personas.config';
import { getSeedConfig } from '../config/seed.config';
import chalk from 'chalk';

export class ContentGenerator {
	private config = getSeedConfig();
	private generatedThreads: ThreadId[] = [];
	private generatedPosts: PostId[] = [];

	private log(message: string, type: 'info' | 'success' | 'error' | 'warn' = 'info') {
		const prefix = {
			info: chalk.cyan('ℹ️'),
			success: chalk.green('✅'),
			error: chalk.red('❌'),
			warn: chalk.yellow('⚠️')
		}[type];
		
		console.log(`${prefix} [ContentGen] ${message}`);
	}

	/**
	 * Generate threads
	 */
	async generateThreads(users: Array<{ id: UserId; personaId: string }>, targetCount: number): Promise<void> {
		this.log(`Generating ${targetCount} threads...`, 'info');

		// Get all forums
		const forums = await db
			.select()
			.from(schema.forumStructure)
			.where(eq(schema.forumStructure.type, 'forum'));

		let threadsCreated = 0;

		for (const forum of forums) {
			const threadsPerForum = Math.floor(
				Math.random() * (this.config.content.threads.perForum.max - this.config.content.threads.perForum.min) +
				this.config.content.threads.perForum.min
			);

			for (let i = 0; i < threadsPerForum && threadsCreated < targetCount; i++) {
				const author = users[Math.floor(Math.random() * users.length)];
				const thread = await this.createThread(forum.id, author);
				
				if (thread) {
					this.generatedThreads.push(thread.id);
					threadsCreated++;
				}
			}
		}

		this.log(`Generated ${threadsCreated} threads`, 'success');
	}

	/**
	 * Generate posts
	 */
	async generatePosts(users: Array<{ id: UserId; personaId: string }>, targetCount: number): Promise<void> {
		this.log(`Generating ${targetCount} posts...`, 'info');

		if (this.generatedThreads.length === 0) {
			// Get existing threads
			const threads = await db
				.select({ id: schema.threads.id })
				.from(schema.threads)
				.limit(100);
			this.generatedThreads = threads.map(t => t.id);
		}

		let postsCreated = 0;

		for (const threadId of this.generatedThreads) {
			const postsPerThread = Math.floor(
				Math.random() * (this.config.content.posts.perThread.max - this.config.content.posts.perThread.min) +
				this.config.content.posts.perThread.min
			);

			for (let i = 0; i < postsPerThread && postsCreated < targetCount; i++) {
				const author = users[Math.floor(Math.random() * users.length)];
				const post = await this.createPost(threadId, author);
				
				if (post) {
					this.generatedPosts.push(post.id);
					postsCreated++;
				}
			}
		}

		this.log(`Generated ${postsCreated} posts`, 'success');
	}

	/**
	 * Generate reactions
	 */
	async generateReactions(users: Array<{ id: UserId; personaId: string }>): Promise<void> {
		this.log('Generating reactions...', 'info');

		const reactionTypes = ['👍', '❤️', '😂', '🔥', '🚀', '💎', '🤔', '😮'];
		let reactionsCreated = 0;

		for (const postId of this.generatedPosts) {
			if (Math.random() > this.config.content.posts.features.hasReactions) continue;

			const reactionCount = Math.floor(Math.random() * 5) + 1;

			for (let i = 0; i < reactionCount; i++) {
				const reactor = users[Math.floor(Math.random() * users.length)];
				const reactionType = reactionTypes[Math.floor(Math.random() * reactionTypes.length)];

				try {
					await db.insert(schema.postReactions).values({
						postId,
						userId: reactor.id,
						reaction: reactionType
					});
					reactionsCreated++;
				} catch (error) {
					// Ignore duplicate reactions
				}
			}
		}

		this.log(`Generated ${reactionsCreated} reactions`, 'success');
	}

	/**
	 * Create a thread
	 */
	private async createThread(forumId: ForumId, author: { id: UserId; personaId: string }): Promise<{ id: ThreadId } | null> {
		try {
			const persona = personas[author.personaId];
			const threadType = this.getRandomThreadType();
			const title = this.generateThreadTitle(persona, threadType);

			// Determine special states
			const isPinned = Math.random() < this.config.content.threads.specialStates.pinned;
			const isLocked = Math.random() < this.config.content.threads.specialStates.locked;
			const isSolved = threadType === 'question' && Math.random() < this.config.content.threads.specialStates.solved;

			const [thread] = await db.insert(schema.threads).values({
				forumId,
				authorId: author.id,
				title,
				threadType,
				isPinned,
				isLocked,
				isSolved,
				metadata: {
					generatedBy: 'seeder',
					persona: author.personaId
				}
			}).returning();

			// Create initial post
			await db.insert(schema.posts).values({
				threadId: thread.id,
				authorId: author.id,
				content: this.generatePostContent(persona, threadType, true),
				metadata: {
					isOriginalPost: true
				}
			});

			return thread;

		} catch (error) {
			this.log(`Failed to create thread: ${(error as Error).message}`, 'error');
			return null;
		}
	}

	/**
	 * Create a post
	 */
	private async createPost(threadId: ThreadId, author: { id: UserId; personaId: string }): Promise<{ id: PostId } | null> {
		try {
			const persona = personas[author.personaId];
			const content = this.generatePostContent(persona, 'reply', false);

			// Determine features
			const hasImage = Math.random() < this.config.content.posts.features.hasImages;
			const hasMentions = Math.random() < this.config.content.posts.features.hasMentions;
			const isEdited = Math.random() < this.config.content.posts.features.isEdited;

			// Edge cases
			const isUnicodeChaos = Math.random() < this.config.content.posts.edgeCases.unicodeChaos;
			const isMaxLength = Math.random() < this.config.content.posts.edgeCases.maxLength;
			const isDeepNesting = Math.random() < this.config.content.posts.edgeCases.deepNesting;

			let finalContent = content;

			if (isUnicodeChaos) {
				finalContent = this.addUnicodeChaos(content);
			}
			if (isMaxLength) {
				finalContent = content.repeat(100).substring(0, 10000);
			}
			if (hasMentions) {
				finalContent = await this.addMentions(content);
			}

			const metadata: any = {
				generatedBy: 'seeder',
				persona: author.personaId
			};

			if (hasImage) {
				metadata.images = [`https://picsum.photos/800/600?random=${Math.random()}`];
			}

			const [post] = await db.insert(schema.posts).values({
				threadId,
				authorId: author.id,
				content: finalContent,
				isEdited,
				metadata
			}).returning();

			// Add mentions if needed
			if (hasMentions) {
				await this.processMentions(post.id, finalContent);
			}

			return post;

		} catch (error) {
			this.log(`Failed to create post: ${(error as Error).message}`, 'error');
			return null;
		}
	}

	/**
	 * Get random thread type
	 */
	private getRandomThreadType(): string {
		const random = Math.random();
		const types = this.config.content.threads.types;

		if (random < types.normal) return 'discussion';
		if (random < types.normal + types.jackpot) return 'jackpot';
		if (random < types.normal + types.jackpot + types.surge) return 'surge';
		if (random < types.normal + types.jackpot + types.surge + types.announcement) return 'announcement';
		return 'guide';
	}

	/**
	 * Generate thread title
	 */
	private generateThreadTitle(persona: any, threadType: string): string {
		const templates = {
			discussion: [
				'Thoughts on [TOPIC]?',
				'[TOPIC] discussion thread',
				'Let\'s talk about [TOPIC]',
				'Unpopular opinion: [TOPIC]'
			],
			question: [
				'How to [ACTION]?',
				'Best way to [ACTION]?',
				'Anyone know about [TOPIC]?',
				'Need help with [TOPIC]'
			],
			announcement: [
				'[ANNOUNCEMENT] [TOPIC]',
				'Important: [TOPIC]',
				'Update on [TOPIC]',
				'News: [TOPIC]'
			],
			guide: [
				'Guide: How to [ACTION]',
				'Tutorial: [TOPIC] for beginners',
				'[TOPIC] masterclass',
				'Everything about [TOPIC]'
			],
			jackpot: [
				'🎰 JACKPOT THREAD: [TOPIC]',
				'💰 High stakes [TOPIC] discussion',
				'🔥 [TOPIC] moon mission'
			],
			surge: [
				'⚡ SURGE: [TOPIC] pumping!',
				'📈 [TOPIC] to the moon!',
				'🚀 [TOPIC] surge thread'
			]
		};

		const typeTemplates = templates[threadType] || templates.discussion;
		const template = typeTemplates[Math.floor(Math.random() * typeTemplates.length)];

		const topics = [
			'DeFi strategies', 'yield farming', 'NFT flipping', 'market analysis',
			'portfolio management', 'risk assessment', 'technical analysis',
			'fundamental analysis', 'meme coins', 'blue chips', 'staking rewards'
		];

		const actions = [
			'maximize yields', 'minimize risk', 'find alpha', 'spot trends',
			'time the market', 'DCA properly', 'use leverage', 'farm airdrops'
		];

		const topic = topics[Math.floor(Math.random() * topics.length)];
		const action = actions[Math.floor(Math.random() * actions.length)];

		return template
			.replace(/\[TOPIC\]/g, topic)
			.replace(/\[ACTION\]/g, action)
			.replace(/\[ANNOUNCEMENT\]/g, '📢');
	}

	/**
	 * Generate post content
	 */
	private generatePostContent(persona: any, context: string, isOriginal: boolean): string {
		if (!persona) {
			// Random content for non-persona users
			const contents = [
				'Interesting point!',
				'I agree with this.',
				'Not sure about that...',
				'Can someone explain?',
				'Thanks for sharing!',
				'This is the way.',
				'WAGMI',
				'LFG!'
			];
			return contents[Math.floor(Math.random() * contents.length)];
		}

		const style = persona.behavior?.postStyle || 'casual';
		const templates = {
			helpful: [
				'Here\'s what I found helpful: [DETAIL]',
				'You might want to try [SUGGESTION]',
				'In my experience, [INSIGHT]',
				'Pro tip: [TIP]'
			],
			provocative: [
				'This is completely wrong because [REASON]',
				'Unpopular opinion: [OPINION]',
				'You\'re all missing the point. [POINT]',
				'[CONTRARIAN_VIEW], fight me.'
			],
			technical: [
				'Technical analysis shows [ANALYSIS]',
				'Based on the data: [DATA]',
				'If we look at the metrics: [METRICS]',
				'Code review: [TECHNICAL_DETAIL]'
			],
			casual: [
				'Just my 2 cents: [THOUGHT]',
				'Random thought: [IDEA]',
				'Anyone else think [OBSERVATION]?',
				'[CASUAL_COMMENT] lol'
			],
			memetic: [
				'[MEME_PHRASE]',
				'Sir, this is a [LOCATION]',
				'[CRYPTO_SLANG] [EMOJI]',
				'Wen [THING]?'
			]
		};

		const styleTemplates = templates[style] || templates.casual;
		let template = styleTemplates[Math.floor(Math.random() * styleTemplates.length)];

		// Fill in placeholders
		const replacements = {
			DETAIL: 'checking the documentation thoroughly',
			SUGGESTION: 'using a different approach',
			INSIGHT: 'consistency is key',
			TIP: 'always DYOR',
			REASON: 'it ignores market dynamics',
			OPINION: 'bear markets are for building',
			POINT: 'Tech doesn\'t matter without adoption',
			CONTRARIAN_VIEW: 'Bitcoin is overvalued',
			ANALYSIS: 'bullish divergence on the 4H',
			DATA: '70% success rate historically',
			METRICS: 'TVL up 40% MoM',
			TECHNICAL_DETAIL: 'O(n²) complexity is concerning',
			THOUGHT: 'timing matters more than selection',
			IDEA: 'what if we\'re all wrong?',
			OBSERVATION: 'the market is irrational?',
			CASUAL_COMMENT: 'just aping in',
			MEME_PHRASE: 'gm gm',
			LOCATION: 'Wendy\'s',
			CRYPTO_SLANG: 'HFSP',
			EMOJI: '🚀',
			THING: 'moon'
		};

		Object.entries(replacements).forEach(([key, value]) => {
			template = template.replace(`[${key}]`, value);
		});

		if (isOriginal) {
			template = `${template}\n\nLet me elaborate...\n\n${template}\n\nWhat are your thoughts?`;
		}

		return template;
	}

	/**
	 * Add unicode chaos
	 */
	private addUnicodeChaos(content: string): string {
		const chaosChars = ['🌀', '؜', '‏', '‎', '​', '҉', '۝', '༼', '༽', '┻━┻', '╯°□°╯'];
		let chaosContent = content;

		for (let i = 0; i < 5; i++) {
			const pos = Math.floor(Math.random() * chaosContent.length);
			const char = chaosChars[Math.floor(Math.random() * chaosChars.length)];
			chaosContent = chaosContent.slice(0, pos) + char + chaosContent.slice(pos);
		}

		return chaosContent;
	}

	/**
	 * Add mentions
	 */
	private async addMentions(content: string): Promise<string> {
		const users = await db
			.select({ username: schema.users.username })
			.from(schema.users)
			.limit(20);

		if (users.length === 0) return content;

		const mentionCount = Math.floor(Math.random() * 3) + 1;
		let mentionedContent = content;

		for (let i = 0; i < mentionCount; i++) {
			const user = users[Math.floor(Math.random() * users.length)];
			mentionedContent = `@${user.username} ${mentionedContent}`;
		}

		return mentionedContent;
	}

	/**
	 * Process mentions
	 */
	private async processMentions(postId: PostId, content: string): Promise<void> {
		const mentionRegex = /@(\w+)/g;
		const matches = content.matchAll(mentionRegex);

		for (const match of matches) {
			const username = match[1];
			const [user] = await db
				.select()
				.from(schema.users)
				.where(eq(schema.users.username, username))
				.limit(1);

			if (user) {
				await db.insert(schema.mentions).values({
					postId,
					mentionedUserId: user.id,
					mentionedByUserId: null // Will be set from post author
				}).onConflictDoNothing();
			}
		}
	}
}