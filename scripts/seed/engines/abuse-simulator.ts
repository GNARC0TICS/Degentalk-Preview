import { db } from '../../../db';
// import { logger } from '@server/core/logger'; // Logger not needed in seeding
import * as schema from '../../../db/schema';
import { eq, and, gte, sql } from 'drizzle-orm';
import type { UserId, ThreadId, PostId } from '../../../shared/types/ids';
import { getSeedConfig } from '../config/seed.config';
import { personas } from '../config/personas.config';
import chalk from 'chalk';

export interface AbusePattern {
	type: 'spam' | 'xp_farming' | 'toxicity' | 'bot_network' | 'ban_evasion' | 'exploit';
	severity: 'low' | 'medium' | 'high';
	description: string;
}

export class AbuseSimulator {
	private config = getSeedConfig();
	private abusePatterns: Map<string, AbusePattern[]> = new Map();
	private reportedUsers: Set<string> = new Set();
	private shadowBannedUsers: Set<string> = new Set();

	private log(message: string, type: 'info' | 'success' | 'error' | 'warn' = 'info') {
		const prefix = {
			info: chalk.cyan('ℹ️'),
			success: chalk.green('✅'),
			error: chalk.red('❌'),
			warn: chalk.yellow('⚠️')
		}[type];
		
		console.log(`${prefix} [AbuseSimulator] ${message}`);
	}

	/**
	 * Initialize abuse patterns
	 */
	async initialize(): Promise<void> {
		this.log('Initializing abuse simulator...', 'info');

		// Define abuse patterns for different personas
		this.defineAbusePatterns();

		// Skip loading existing bans/flags - table doesn't have status field
		this.log('Skipping existing flags check - table schema mismatch', 'warn');

		this.log(`Initialized with ${this.abusePatterns.size} abuse patterns`, 'success');
	}

	/**
	 * Define abuse patterns for personas
	 */
	private defineAbusePatterns(): void {
		// Toxic Tyler patterns
		this.abusePatterns.set('toxic_tyler', [
			{
				type: 'toxicity',
				severity: 'high',
				description: 'Inflammatory language and personal attacks'
			},
			{
				type: 'ban_evasion',
				severity: 'medium',
				description: 'Creating alt accounts after bans'
			}
		]);

		// Spam bot patterns
		this.abusePatterns.set('spam_bot_9000', [
			{
				type: 'spam',
				severity: 'high',
				description: 'Repetitive promotional content'
			},
			{
				type: 'bot_network',
				severity: 'high',
				description: 'Part of coordinated bot network'
			}
		]);

		// XP farmer patterns
		this.abusePatterns.set('grind_lord', [
			{
				type: 'xp_farming',
				severity: 'low',
				description: 'Exploiting XP loops within limits'
			}
		]);

		// Shadow banned user patterns
		this.abusePatterns.set('shadow_banned_sam', [
			{
				type: 'spam',
				severity: 'medium',
				description: 'Previous spam violations'
			}
		]);
	}

	/**
	 * Simulate spam behavior
	 */
	async simulateSpam(userId: UserId, personaId: string, intensity: 'low' | 'medium' | 'high'): Promise<void> {
		const persona = personas[personaId];
		if (!persona) return;

		this.log(`${persona.username} starting spam campaign (${intensity} intensity)`, 'warn');

		const spamCount = {
			low: 5 + Math.floor(Math.random() * 5),
			medium: 10 + Math.floor(Math.random() * 10),
			high: 20 + Math.floor(Math.random() * 20)
		}[intensity];

		// Get random threads to spam
		const threads = await db
			.select({ id: schema.threads.id })
			.from(schema.threads)
			.limit(spamCount);

		for (let i = 0; i < spamCount; i++) {
			const thread = threads[Math.floor(Math.random() * threads.length)];
			if (!thread) continue;

			// Create spam post
			const spamContent = this.generateSpamContent(persona.personality);
			
			const [post] = await db.insert(schema.posts).values({
				threadId: thread.id,
				authorId: userId,
				content: spamContent,
				isSpam: true,
				metadata: {
					abuseType: 'spam',
					intensity,
					detectedAt: new Date()
				}
			}).returning();

			// Sometimes gets reported immediately
			if (Math.random() < 0.3) {
				await this.reportPost(post.id, userId, 'spam');
			}
		}

		// Flag user for spam
		await this.flagUser(userId, 'spam', intensity);
	}

	/**
	 * Simulate XP farming
	 */
	async simulateXPFarming(userId: UserId, personaId: string, strategy: 'loop' | 'burst' | 'distributed'): Promise<void> {
		const persona = personas[personaId];
		if (!persona) return;

		this.log(`${persona.username} attempting XP farming (${strategy} strategy)`, 'warn');

		switch (strategy) {
			case 'loop':
				await this.farmXPLoop(userId);
				break;
			case 'burst':
				await this.farmXPBurst(userId);
				break;
			case 'distributed':
				await this.farmXPDistributed(userId);
				break;
		}

		// Sometimes gets caught
		if (Math.random() < 0.4) {
			await this.flagUser(userId, 'xp_exploit', 'medium');
		}
	}

	/**
	 * XP farming strategies
	 */
	private async farmXPLoop(userId: UserId): Promise<void> {
		// Create-delete-create pattern
		for (let i = 0; i < 10; i++) {
			const [post] = await db.insert(schema.posts).values({
				threadId: '00000000-0000-0000-0000-000000000001' as ThreadId, // Assuming test thread
				authorId: userId,
				content: 'Test post for XP',
				metadata: { xpFarming: true }
			}).returning();

			// Immediately delete
			await db
				.update(schema.posts)
				.set({ deletedAt: new Date() })
				.where(eq(schema.posts.id, post.id));
		}
	}

	private async farmXPBurst(userId: UserId): Promise<void> {
		// Rapid fire actions
		const actions = ['view_thread', 'like_post', 'create_post', 'edit_profile'];
		
		for (let i = 0; i < 50; i++) {
			const action = actions[Math.floor(Math.random() * actions.length)];
			
			await db.insert(schema.xpLogs).values({
				userId,
				action,
				xpAwarded: 0, // System should reject these
				metadata: {
					farmingAttempt: true,
					burstIndex: i
				}
			});
		}
	}

	private async farmXPDistributed(userId: UserId): Promise<void> {
		// Create multiple accounts to farm
		const farmAccounts: UserId[] = [];
		
		for (let i = 0; i < 5; i++) {
			const [farmUser] = await db.insert(schema.users).values({
				username: `farm_bot_${Date.now()}_${i}`,
				email: `farm${i}@bot.com`,
				password: 'bot',
				xp: 0,
				level: 1,
				isBot: true
			}).returning();
			
			farmAccounts.push(farmUser.id);
		}

		// Cross-like between accounts
		for (const fromId of farmAccounts) {
			for (const toId of farmAccounts) {
				if (fromId === toId) continue;
				
				// Create mutual interactions
				await db.insert(schema.friends).values({
					userId: fromId,
					friendId: toId,
					status: 'accepted'
				}).onConflictDoNothing();
			}
		}
	}

	/**
	 * Simulate toxic behavior
	 */
	async simulateToxicity(userId: UserId, personaId: string, severity: 'mild' | 'moderate' | 'severe'): Promise<void> {
		const persona = personas[personaId];
		if (!persona) return;

		this.log(`${persona.username} being toxic (${severity})`, 'warn');

		// Get active threads
		const threads = await db
			.select({ id: schema.threads.id })
			.from(schema.threads)
			.where(eq(schema.threads.isLocked, false))
			.limit(10);

		const toxicPhrases = {
			mild: ['ur wrong', 'thats dumb', 'nobody asked', 'cringe'],
			moderate: ['you absolute moron', 'kys', 'rope', 'get rekt noob'],
			severe: ['[REDACTED]', '[EXTREME PROFANITY]', '[HATE SPEECH]', '[THREATS]']
		};

		for (const thread of threads) {
			if (Math.random() < 0.5) continue;

			const phrases = toxicPhrases[severity];
			const content = phrases[Math.floor(Math.random() * phrases.length)];

			const [post] = await db.insert(schema.posts).values({
				threadId: thread.id,
				authorId: userId,
				content,
				metadata: {
					toxicityLevel: severity,
					flaggedWords: true
				}
			}).returning();

			// High severity gets instant reports
			if (severity === 'severe' || Math.random() < 0.6) {
				await this.reportPost(post.id, userId, 'harassment');
			}
		}

		// Create user conflicts
		if (persona.socialGraph?.enemies) {
			for (const enemyUsername of persona.socialGraph.enemies) {
				const [enemy] = await db
					.select()
					.from(schema.users)
					.where(eq(schema.users.username, enemyUsername))
					.limit(1);

				if (enemy) {
					await db.insert(schema.userRelationships).values({
						userId,
						targetUserId: enemy.id,
						type: 'blocked',
						metadata: { reason: 'toxic_interaction' }
					}).onConflictDoNothing();
				}
			}
		}
	}

	/**
	 * Simulate bot network
	 */
	async simulateBotNetwork(size: number, coordinated: boolean): Promise<void> {
		if (size === 0) return;

		this.log(`Creating bot network of ${size} bots (coordinated: ${coordinated})`, 'warn');

		const botIds: UserId[] = [];

		// Create bot accounts
		for (let i = 0; i < size; i++) {
			const [bot] = await db.insert(schema.users).values({
				username: `bot_${Date.now()}_${i}`,
				email: `bot${i}@network.com`,
				password: 'bot',
				xp: 0,
				level: 1,
				isBot: true,
				metadata: {
					botNetwork: true,
					networkId: `network_${Date.now()}`
				}
			}).returning();

			botIds.push(bot.id);
		}

		if (coordinated) {
			// Coordinated attack
			await this.coordinatedBotAttack(botIds);
		} else {
			// Random bot behavior
			for (const botId of botIds) {
				await this.simulateSpam(botId, 'spam_bot_9000', 'low');
			}
		}
	}

	/**
	 * Coordinated bot attack
	 */
	private async coordinatedBotAttack(botIds: UserId[]): Promise<void> {
		// Target a specific thread or user
		const [targetThread] = await db
			.select()
			.from(schema.threads)
			.where(eq(schema.threads.isPinned, true))
			.limit(1);

		if (!targetThread) return;

		// Mass upvote/downvote
		for (const botId of botIds) {
			await db.insert(schema.posts).values({
				threadId: targetThread.id,
				authorId: botId,
				content: '+1 great post!', // Generic positive
				metadata: { botPost: true }
			});

			// All like the same posts
			const [targetPost] = await db
				.select()
				.from(schema.posts)
				.where(eq(schema.posts.threadId, targetThread.id))
				.limit(1);

			if (targetPost) {
				await db.insert(schema.postLikes).values({
					postId: targetPost.id,
					userId: botId
				}).onConflictDoNothing();
			}
		}

		this.log(`Bot network attacked thread ${targetThread.id}`, 'error');
	}

	/**
	 * Simulate ban evasion
	 */
	async simulateBanEvasion(originalUserId: UserId, personaId: string): Promise<UserId | null> {
		const persona = personas[personaId];
		if (!persona) return null;

		this.log(`${persona.username} attempting ban evasion`, 'warn');

		// Create new account with similar pattern
		const [evader] = await db.insert(schema.users).values({
			username: `${persona.username}_v2`,
			email: `${persona.username}2@evade.com`,
			password: 'evader',
			xp: 0,
			level: 1,
			metadata: {
				banEvasion: true,
				originalAccount: originalUserId,
				detectionMarkers: {
					similarUsername: true,
					sameIP: true, // Would be detected by IP
					behaviorPattern: persona.personality
				}
			}
		}).returning();

		// Sometimes immediately detected
		if (Math.random() < 0.7) {
			await db.insert(schema.bans).values({
				userId: evader.id,
				bannedBy: null,
				reason: 'Ban evasion detected',
				expiresAt: null, // Permanent
				metadata: {
					originalBannedAccount: originalUserId,
					autoDetected: true
				}
			});

			this.log(`Ban evader ${evader.username} caught and banned`, 'success');
		}

		return evader.id;
	}

	/**
	 * Generate spam content
	 */
	private generateSpamContent(personality: string): string {
		const spamTemplates = {
			obvious_bot: '🤖 CLICK HERE >>> bit.ly/scam123 <<< FREE MONEY 💰💰💰',
			edge_lord: 'first lol get rekt noobs',
			anxious_newbie: 'please help how do i [SAME QUESTION 20 TIMES]',
			default: 'Check out this amazing opportunity! [SPAM LINK]'
		};

		return spamTemplates[personality] || spamTemplates.default;
	}

	/**
	 * Report a post
	 */
	private async reportPost(postId: PostId, reportedUserId: UserId, reason: string): Promise<void> {
		// Random user reports it
		const [reporter] = await db
			.select()
			.from(schema.users)
			.where(and(
				eq(schema.users.role, 'user'),
				sql`${schema.users.id} != ${reportedUserId}`
			))
			.limit(1);

		if (!reporter) return;

		await db.insert(schema.reports).values({
			reporterId: reporter.id,
			reportedUserId,
			reportedContentId: postId,
			reportedContentType: 'post',
			reason,
			status: 'pending',
			metadata: {
				autoDetected: Math.random() < 0.5,
				confidence: Math.random()
			}
		});

		this.reportedUsers.add(reportedUserId);
	}

	/**
	 * Flag user for abuse
	 */
	private async flagUser(userId: UserId, flagType: string, severity: string): Promise<void> {
		await db.insert(schema.userAbuseFlags).values({
			userId,
			flagType,
			severity,
			description: `Automated detection: ${flagType}`,
			evidence: {
				timestamp: new Date(),
				pattern: flagType,
				automated: true
			},
			flaggedBy: null,
			status: 'pending'
		});

		// Apply consequences based on severity
		if (severity === 'high') {
			// Immediate ban
			await db.insert(schema.bans).values({
				userId,
				bannedBy: null,
				reason: `Automated ban: ${flagType}`,
				expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
				metadata: { automated: true }
			});

			this.log(`User ${userId} banned for ${flagType}`, 'success');
		} else if (severity === 'medium') {
			// Warning
			await db
				.update(schema.users)
				.set({
					warnings: sql`${schema.users.warnings} + 1`
				})
				.where(eq(schema.users.id, userId));
		}
	}

	/**
	 * Apply shadow ban
	 */
	async applyShadowBan(userId: UserId): Promise<void> {
		await db
			.update(schema.users)
			.set({
				shadowBanned: true,
				shadowBannedAt: new Date()
			})
			.where(eq(schema.users.id, userId));

		this.shadowBannedUsers.add(userId);
		this.log(`User ${userId} shadow banned`, 'warn');
	}

	/**
	 * Simulate abuse patterns for configured users
	 */
	async simulateAbuse(): Promise<void> {
		if (!this.config.abuse.enabled) {
			this.log('Abuse simulation disabled', 'info');
			return;
		}

		this.log('Starting abuse simulation...', 'warn');

		// Get abuse personas
		const abusePersonas = Object.entries(personas).filter(([_, p]) => 
			p.behavior.toxicity > 0.5 || 
			p.behavior.exploitsXPLoops ||
			p.behavior.reportMagnet
		);

		for (const [personaId, persona] of abusePersonas) {
			// Get user for this persona
			const [user] = await db
				.select()
				.from(schema.users)
				.where(eq(schema.users.username, persona.username))
				.limit(1);

			if (!user) continue;

			// Apply persona-specific abuse patterns
			const patterns = this.abusePatterns.get(personaId) || [];
			
			for (const pattern of patterns) {
				switch (pattern.type) {
					case 'spam':
						await this.simulateSpam(user.id, personaId, pattern.severity as any);
						break;
					case 'xp_farming':
						await this.simulateXPFarming(user.id, personaId, 'loop');
						break;
					case 'toxicity':
						await this.simulateToxicity(user.id, personaId, pattern.severity as any);
						break;
					case 'ban_evasion':
						if (user.bans > 0) {
							await this.simulateBanEvasion(user.id, personaId);
						}
						break;
				}
			}
		}

		// Bot network simulation
		if (this.config.abuse.patterns.botNetwork.size > 0) {
			await this.simulateBotNetwork(
				this.config.abuse.patterns.botNetwork.size,
				this.config.abuse.patterns.botNetwork.coordinated
			);
		}

		this.log('Abuse simulation complete', 'success');
		this.log(`Reported users: ${this.reportedUsers.size}`, 'info');
		this.log(`Shadow banned users: ${this.shadowBannedUsers.size}`, 'info');
	}
}