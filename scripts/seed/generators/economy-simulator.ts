import { db } from '../../../db';
import * as schema from '../../../db/schema';
import { eq, sql } from 'drizzle-orm';
import type { UserId } from '../../../shared/types/ids';
import { personas } from '../config/personas.config';
import { getSeedConfig } from '../config/seed.config';
import chalk from 'chalk';

export class EconomySimulator {
	private config = getSeedConfig();

	private log(message: string, type: 'info' | 'success' | 'error' | 'warn' = 'info') {
		const prefix = {
			info: chalk.cyan('ℹ️'),
			success: chalk.green('✅'),
			error: chalk.red('❌'),
			warn: chalk.yellow('⚠️')
		}[type];
		
		console.log(`${prefix} [EconomySim] ${message}`);
	}

	/**
	 * Generate transactions
	 */
	async generateTransactions(
		users: Array<{ id: UserId; personaId: string }>, 
		targets: { dgtTransfers: number; tips: number; rainEvents: number; shopPurchases: number }
	): Promise<void> {
		this.log('Generating economy transactions...', 'info');
		this.log(`Users available: ${users?.length || 0}`, 'info');
		
		if (!users || users.length === 0) {
			this.log('No users available for economy simulation', 'warn');
			return;
		}

		// DGT transfers
		await this.generateDGTTransfers(users, targets.dgtTransfers);

		// Tips
		await this.generateTips(users, targets.tips);

		// Shop purchases are handled by cosmetics engine

		this.log('Economy transactions generated', 'success');
	}

	/**
	 * Generate DGT transfers
	 */
	private async generateDGTTransfers(users: Array<{ id: UserId; personaId: string }>, count: number): Promise<void> {
		if (users.length < 2) {
			this.log('Not enough users for transfers', 'warn');
			return;
		}

		let transfersCreated = 0;

		for (let i = 0; i < count; i++) {
			const sender = users[Math.floor(Math.random() * users.length)];
			const receiver = users[Math.floor(Math.random() * users.length)];

			if (sender.id === receiver.id) continue;

			const senderPersona = personas[sender.personaId];
			if (!senderPersona) continue;

			// Check sender balance
			const [senderWallet] = await db
				.select()
				.from(schema.wallets)
				.where(eq(schema.wallets.userId, sender.id))
				.limit(1);

			if (!senderWallet || senderWallet.balance < 10) continue;

			// Determine amount based on persona
			const amount = this.getTransferAmount(senderPersona);
			if (amount > senderWallet.balance) continue;

			try {
				await db.transaction(async (tx) => {
					// Deduct from sender
					await tx
						.update(schema.wallets)
						.set({
							balance: sql`${schema.wallets.balance} - ${amount}`
						})
						.where(eq(schema.wallets.userId, sender.id));

					// Add to receiver
					await tx
						.update(schema.wallets)
						.set({
							balance: sql`${schema.wallets.balance} + ${amount}`
						})
						.where(eq(schema.wallets.userId, receiver.id));

					// Record transaction
					await tx.insert(schema.transactions).values({
						fromUserId: sender.id,
						toUserId: receiver.id,
						amount,
						currency: 'DGT',
						type: 'transfer',
						status: 'completed',
						metadata: {
							reason: this.getTransferReason(),
							persona: sender.personaId
						}
					});

					// Create internal transfer record
					await tx.insert(schema.internalTransfers).values({
						fromUserId: sender.id,
						toUserId: receiver.id,
						amount,
						currency: 'DGT',
						reason: this.getTransferReason(),
						status: 'completed'
					});
				});

				transfersCreated++;

			} catch (error) {
				// Skip failed transfers
			}
		}

		this.log(`Created ${transfersCreated} DGT transfers`, 'success');
	}

	/**
	 * Generate tips
	 */
	private async generateTips(users: Array<{ id: UserId; personaId: string }>, count: number): Promise<void> {
		let tipsCreated = 0;

		// Get some posts to tip
		const posts = await db
			.select({
				id: schema.posts.id,
				authorId: schema.posts.authorId,
				threadId: schema.posts.threadId
			})
			.from(schema.posts)
			.limit(count * 2);

		for (let i = 0; i < count && i < posts.length; i++) {
			const post = posts[i];
			const tipper = users[Math.floor(Math.random() * users.length)];

			if (tipper.id === post.authorId) continue;

			const tipperPersona = personas[tipper.personaId];
			if (!tipperPersona || tipperPersona.behavior.tipGenerosity === 'stingy') continue;

			// Check tipper balance
			const [tipperWallet] = await db
				.select()
				.from(schema.wallets)
				.where(eq(schema.wallets.userId, tipper.id))
				.limit(1);

			if (!tipperWallet || tipperWallet.balance < 1) continue;

			const tipAmount = this.getTipAmount(tipperPersona);
			if (tipAmount > tipperWallet.balance) continue;

			try {
				await db.transaction(async (tx) => {
					// Create tip record
					await tx.insert(schema.postTips).values({
						postId: post.id,
						tipperId: tipper.id,
						recipientId: post.authorId,
						tipAmount,
						metadata: {
							persona: tipper.personaId
						}
					});

					// Transfer funds
					await tx
						.update(schema.wallets)
						.set({
							balance: sql`${schema.wallets.balance} - ${tipAmount}`
						})
						.where(eq(schema.wallets.userId, tipper.id));

					await tx
						.update(schema.wallets)
						.set({
							balance: sql`${schema.wallets.balance} + ${tipAmount}`
						})
						.where(eq(schema.wallets.userId, post.authorId));

					// Record transaction
					await tx.insert(schema.transactions).values({
						fromUserId: tipper.id,
						toUserId: post.authorId,
						amount: tipAmount,
						currency: 'DGT',
						type: 'tip',
						status: 'completed',
						metadata: {
							postId: post.id,
							threadId: post.threadId
						}
					});
				});

				tipsCreated++;

			} catch (error) {
				// Skip failed tips
			}
		}

		this.log(`Created ${tipsCreated} tips`, 'success');
	}

	/**
	 * Generate rain events
	 */
	async generateRainEvents(users: Array<{ id: UserId; personaId: string }>, count: number): Promise<void> {
		this.log(`Generating ${count} rain events...`, 'info');

		const whales = users.filter(u => {
			const persona = personas[u.personaId];
			return persona && (persona.stats.dgt > 10000 || persona.behavior.rainFrequency);
		});

		if (whales.length === 0) {
			this.log('No whales found for rain events', 'warn');
			return;
		}

		let eventsCreated = 0;

		for (let i = 0; i < count; i++) {
			const creator = whales[Math.floor(Math.random() * whales.length)];
			const creatorPersona = personas[creator.personaId];

			if (!creatorPersona) continue;

			// Check balance
			const [wallet] = await db
				.select()
				.from(schema.wallets)
				.where(eq(schema.wallets.userId, creator.id))
				.limit(1);

			if (!wallet || wallet.balance < 100) continue;

			const rainConfig = this.config.economy.patterns.rainSettings;
			const amount = rainConfig.amounts[Math.floor(Math.random() * rainConfig.amounts.length)];
			const participants = rainConfig.participants[Math.floor(Math.random() * rainConfig.participants.length)];

			if (amount > wallet.balance) continue;

			try {
				// Create rain event
				const [rainEvent] = await db.insert(schema.rainEvents).values({
					createdBy: creator.id,
					totalAmount: amount,
					currency: 'DGT',
					participantCount: participants,
					amountPerUser: Math.floor(amount / participants),
					status: 'completed',
					completedAt: new Date(),
					metadata: {
						message: this.getRainMessage(creatorPersona),
						type: 'user_initiated'
					}
				}).returning();

				// Deduct from creator
				await db
					.update(schema.wallets)
					.set({
						balance: sql`${schema.wallets.balance} - ${amount}`
					})
					.where(eq(schema.wallets.userId, creator.id));

				// Select random participants (excluding creator)
				const eligibleUsers = users.filter(u => u.id !== creator.id);
				const selectedParticipants = this.selectRandomParticipants(eligibleUsers, participants);

				// Distribute to participants
				const amountPerUser = Math.floor(amount / selectedParticipants.length);

				for (const participant of selectedParticipants) {
					await db
						.update(schema.wallets)
						.set({
							balance: sql`${schema.wallets.balance} + ${amountPerUser}`
						})
						.where(eq(schema.wallets.userId, participant.id));

					// Record participation
					await db.insert(schema.airdropRecords).values({
						userId: participant.id,
						airdropType: 'rain',
						amount: amountPerUser,
						currency: 'DGT',
						claimedAt: new Date(),
						metadata: {
							rainEventId: rainEvent.id,
							createdBy: creator.id
						}
					});
				}

				eventsCreated++;

			} catch (error) {
				this.log(`Failed to create rain event: ${(error as Error).message}`, 'error');
			}
		}

		this.log(`Created ${eventsCreated} rain events`, 'success');
	}

	/**
	 * Get transfer amount based on persona
	 */
	private getTransferAmount(persona: any): number {
		const ranges = {
			stingy: [1, 10],
			normal: [10, 100],
			generous: [100, 500],
			whale: [500, 5000]
		};

		const [min, max] = ranges[persona.behavior.tipGenerosity] || ranges.normal;
		return Math.floor(Math.random() * (max - min) + min);
	}

	/**
	 * Get tip amount based on persona
	 */
	private getTipAmount(persona: any): number {
		const ranges = this.config.economy.patterns.tipAmounts;
		const random = Math.random();

		if (persona.behavior.tipGenerosity === 'whale') {
			if (random < 0.3) return Math.floor(Math.random() * (ranges.whale.range[1] - ranges.whale.range[0]) + ranges.whale.range[0]);
		}

		if (random < ranges.small.chance) {
			return Math.floor(Math.random() * (ranges.small.range[1] - ranges.small.range[0]) + ranges.small.range[0]);
		} else if (random < ranges.small.chance + ranges.medium.chance) {
			return Math.floor(Math.random() * (ranges.medium.range[1] - ranges.medium.range[0]) + ranges.medium.range[0]);
		} else {
			return Math.floor(Math.random() * (ranges.whale.range[1] - ranges.whale.range[0]) + ranges.whale.range[0]);
		}
	}

	/**
	 * Get transfer reason
	 */
	private getTransferReason(): string {
		const reasons = [
			'Thanks for the help!',
			'Payment for services',
			'Lost a bet',
			'Spreading the wealth',
			'Repaying a debt',
			'Just because',
			'WAGMI',
			'For the memes'
		];
		return reasons[Math.floor(Math.random() * reasons.length)];
	}

	/**
	 * Get rain message
	 */
	private getRainMessage(persona: any): string {
		const messages = {
			benevolent_dictator: 'Blessings from the overlord! 👑',
			chaotic_rich: 'MAKE IT RAIN! 💸💸💸',
			default: 'Rain time! Get your bags ready! 🌧️'
		};
		return messages[persona.personality] || messages.default;
	}

	/**
	 * Select random participants
	 */
	private selectRandomParticipants(users: Array<{ id: UserId; personaId: string }>, count: number): Array<{ id: UserId; personaId: string }> {
		const shuffled = [...users].sort(() => Math.random() - 0.5);
		return shuffled.slice(0, Math.min(count, users.length));
	}
}