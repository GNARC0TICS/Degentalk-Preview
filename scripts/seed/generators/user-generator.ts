import { db } from '@db';
import * as schema from '../../../db/schema';
import type { UserId } from '@shared/types/ids';
import { personas, type Persona } from '../config/personas.config';
import { createHash } from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import chalk from 'chalk';

export class UserGenerator {
	private generatedUsernames = new Set<string>();

	private log(message: string, type: 'info' | 'success' | 'error' | 'warn' = 'info') {
		const prefix = {
			info: chalk.cyan('ℹ️'),
			success: chalk.green('✅'),
			error: chalk.red('❌'),
			warn: chalk.yellow('⚠️')
		}[type];
		
		console.log(`${prefix} [UserGen] ${message}`);
	}

	/**
	 * Generate user from persona
	 */
	async generateFromPersona(personaId: string, persona: Persona): Promise<{ id: UserId; username: string } | null> {
		try {
			// Check if user already exists
			const [existing] = await db
				.select()
				.from(schema.users)
				.where(schema.eq(schema.users.username, persona.username))
				.limit(1);

			if (existing) {
				this.log(`User ${persona.username} already exists`, 'info');
				return { id: existing.id, username: existing.username };
			}

			// Hash password
			// For seeding, use a simple hash instead of bcrypt
			const hashedPassword = createHash('sha256').update('password123').digest('hex');

			// Create user
			const [user] = await db.insert(schema.users).values({
				username: persona.username,
				email: persona.email,
				password: hashedPassword,
				role: persona.role,
				xp: persona.stats.xp,
				level: persona.stats.level,
				bio: persona.bio,
				warnings: persona.stats.warnings || 0,
				bans: persona.stats.bans || 0,
				isBot: persona.personality === 'obvious_bot',
				shadowBanned: personaId === 'shadow_banned_sam',
				metadata: {
					persona: personaId,
					personality: persona.personality,
					traits: persona.specialTraits
				}
			}).returning();

			// Create wallet
			await db.insert(schema.wallets).values({
				userId: user.id,
				balance: persona.stats.dgt,
				currency: 'DGT'
			});

			// Create preferences
			await db.insert(schema.userPreferences).values({
				userId: user.id,
				theme: persona.cosmetics.preferredTheme || 'default',
				emailNotifications: persona.role !== 'user',
				pushNotifications: false
			});

			// Set up social graph
			if (persona.socialGraph) {
				// We'll connect these after all users are created
				(global as any).socialGraphQueue = (global as any).socialGraphQueue || [];
				(global as any).socialGraphQueue.push({
					userId: user.id,
					username: user.username,
					socialGraph: persona.socialGraph
				});
			}

			this.generatedUsernames.add(user.username);
			this.log(`Generated ${persona.role} user: ${user.username}`, 'success');

			return { id: user.id, username: user.username };

		} catch (error) {
			this.log(`Failed to generate user ${persona.username}: ${(error as Error).message}`, 'error');
			return null;
		}
	}

	/**
	 * Generate random user
	 */
	async generateRandom(): Promise<{ id: UserId; username: string } | null> {
		try {
			const adjectives = ['happy', 'sad', 'angry', 'clever', 'swift', 'lazy', 'brave', 'shy', 'wild', 'calm'];
			const nouns = ['degen', 'trader', 'farmer', 'whale', 'shrimp', 'ape', 'bear', 'bull', 'hodler', 'paper'];
			
			let username = '';
			let attempts = 0;
			
			// Generate unique username
			do {
				const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
				const noun = nouns[Math.floor(Math.random() * nouns.length)];
				const num = Math.floor(Math.random() * 9999);
				username = `${adj}_${noun}_${num}`;
				attempts++;
			} while (this.generatedUsernames.has(username) && attempts < 100);

			if (attempts >= 100) {
				this.log('Failed to generate unique username', 'error');
				return null;
			}

			// For seeding, use a simple hash instead of bcrypt
			const hashedPassword = createHash('sha256').update('password123').digest('hex');

			const [user] = await db.insert(schema.users).values({
				username,
				email: `${username}@degentalk.com`,
				password: hashedPassword,
				role: 'user',
				xp: Math.floor(Math.random() * 5000),
				level: Math.floor(Math.random() * 10) + 1,
				bio: `Just another degen in the wild`,
				metadata: {
					generated: true,
					type: 'random'
				}
			}).returning();

			// Create wallet with random balance
			await db.insert(schema.wallets).values({
				userId: user.id,
				balance: Math.floor(Math.random() * 1000) + 100,
				currency: 'DGT'
			});

			// Create preferences
			await db.insert(schema.userPreferences).values({
				userId: user.id,
				theme: ['default', 'dark', 'midnight'][Math.floor(Math.random() * 3)],
				emailNotifications: Math.random() < 0.3,
				pushNotifications: false
			});

			this.generatedUsernames.add(username);
			this.log(`Generated random user: ${username}`, 'success');

			return { id: user.id, username };

		} catch (error) {
			this.log(`Failed to generate random user: ${(error as Error).message}`, 'error');
			return null;
		}
	}

	/**
	 * Process social graph connections
	 */
	async processSocialGraph(): Promise<void> {
		const queue = (global as any).socialGraphQueue || [];
		
		for (const item of queue) {
			const { userId, username, socialGraph } = item;

			// Process friends
			if (socialGraph.friends) {
				for (const friendUsername of socialGraph.friends) {
					const [friend] = await db
						.select()
						.from(schema.users)
						.where(schema.eq(schema.users.username, friendUsername))
						.limit(1);

					if (friend) {
						await db.insert(schema.friends).values({
							userId,
							friendId: friend.id,
							status: 'accepted'
						}).onConflictDoNothing();

						// Reciprocal friendship
						await db.insert(schema.friends).values({
							userId: friend.id,
							friendId: userId,
							status: 'accepted'
						}).onConflictDoNothing();
					}
				}
			}

			// Process follows
			if (socialGraph.follows) {
				for (const followUsername of socialGraph.follows) {
					const [followUser] = await db
						.select()
						.from(schema.users)
						.where(schema.eq(schema.users.username, followUsername))
						.limit(1);

					if (followUser) {
						await db.insert(schema.userFollows).values({
							followerId: userId,
							followingId: followUser.id
						}).onConflictDoNothing();
					}
				}
			}

			// Process blocks (enemies)
			if (socialGraph.enemies) {
				for (const enemyUsername of socialGraph.enemies) {
					const [enemy] = await db
						.select()
						.from(schema.users)
						.where(schema.eq(schema.users.username, enemyUsername))
						.limit(1);

					if (enemy) {
						await db.insert(schema.userRelationships).values({
							userId,
							targetUserId: enemy.id,
							type: 'blocked'
						}).onConflictDoNothing();
					}
				}
			}
		}

		if (queue.length > 0) {
			this.log(`Processed ${queue.length} social graphs`, 'success');
		}
	}
}