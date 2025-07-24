import { db } from '../../../db';
// import { logger } from '@api/core/logger'; // Logger not needed in seeding
import * as schema from '../../../db/schema';
import { eq, and, gte, lte, sql, desc } from 'drizzle-orm';
import type { UserId, ThreadId, PostId, ForumId } from '../../../shared/types/ids';
import { getSeedConfig } from '../config/seed.config';
import { personas } from '../config/personas.config';
import chalk from 'chalk';

export interface TimeSlot {
	hour: number;
	activityMultiplier: number;
	userTypes: string[];
}

export interface ActivityPattern {
	dayOfWeek: number;
	peakHours: number[];
	baseActivity: number;
}

export class TemporalSimulator {
	private config = getSeedConfig();
	private currentSimTime: Date;
	private activityPatterns: Map<string, ActivityPattern[]> = new Map();
	private threadHeatMap: Map<string, number> = new Map();
	private userLastActivity: Map<string, Date> = new Map();

	private log(message: string, type: 'info' | 'success' | 'error' | 'warn' = 'info') {
		const prefix = {
			info: chalk.cyan('ℹ️'),
			success: chalk.green('✅'),
			error: chalk.red('❌'),
			warn: chalk.yellow('⚠️')
		}[type];
		
		console.log(`${prefix} [TemporalSim] ${message}`);
	}

	/**
	 * Initialize temporal patterns
	 */
	async initialize(startDate: Date = new Date()): Promise<void> {
		this.log('Initializing temporal simulator...', 'info');
		this.currentSimTime = new Date(startDate);
		
		// Define activity patterns for different user types
		this.defineActivityPatterns();
		
		this.log(`Initialized with start date: ${this.currentSimTime.toISOString()}`, 'success');
	}

	/**
	 * Define activity patterns
	 */
	private defineActivityPatterns(): void {
		// Weekday patterns (Mon-Fri)
		const weekdayPattern: ActivityPattern[] = [
			{ dayOfWeek: 1, peakHours: [9, 12, 14, 20, 21], baseActivity: 0.7 },
			{ dayOfWeek: 2, peakHours: [9, 12, 14, 20, 21], baseActivity: 0.7 },
			{ dayOfWeek: 3, peakHours: [9, 12, 14, 20, 21, 22], baseActivity: 0.8 }, // Hump day
			{ dayOfWeek: 4, peakHours: [9, 12, 14, 20, 21, 22], baseActivity: 0.75 },
			{ dayOfWeek: 5, peakHours: [9, 12, 14, 20, 21, 22, 23], baseActivity: 0.9 } // Friday
		];

		// Weekend patterns
		const weekendPattern: ActivityPattern[] = [
			{ dayOfWeek: 6, peakHours: [11, 14, 15, 20, 21, 22, 23], baseActivity: 1.2 }, // Saturday
			{ dayOfWeek: 0, peakHours: [11, 14, 15, 19, 20, 21], baseActivity: 1.0 } // Sunday
		];

		// Different patterns for different personas
		this.activityPatterns.set('default', [...weekdayPattern, ...weekendPattern]);
		
		// Night owls (toxic users, XP farmers)
		this.activityPatterns.set('night_owl', [
			...weekdayPattern.map(p => ({
				...p,
				peakHours: [...p.peakHours, 0, 1, 2, 3],
				baseActivity: p.baseActivity * 0.8
			})),
			...weekendPattern
		]);

		// Early birds (helpful users, mods)
		this.activityPatterns.set('early_bird', [
			...weekdayPattern.map(p => ({
				...p,
				peakHours: [6, 7, 8, ...p.peakHours],
				baseActivity: p.baseActivity * 1.1
			})),
			...weekendPattern
		]);

		// Burst users (spam bots, drama creators)
		this.activityPatterns.set('burst', [
			...Array(7).fill(null).map((_, i) => ({
				dayOfWeek: i,
				peakHours: [Math.floor(Math.random() * 24)],
				baseActivity: Math.random() * 2
			}))
		]);
	}

	/**
	 * Simulate activity for a specific time slot
	 */
	async simulateTimeSlot(users: Array<{ id: UserId; personaId: string }>, slotDate: Date): Promise<void> {
		this.currentSimTime = new Date(slotDate);
		const hour = this.currentSimTime.getHours();
		const dayOfWeek = this.currentSimTime.getDay();
		
		this.log(`Simulating ${this.currentSimTime.toLocaleString()} (Day ${dayOfWeek}, Hour ${hour})`, 'info');

		// Determine active users for this time slot
		const activeUsers = this.getActiveUsersForSlot(users, hour, dayOfWeek);

		// Simulate activities
		for (const user of activeUsers) {
			await this.simulateUserActivity(user, hour);
		}

		// Update thread heat decay
		await this.decayThreadHeat();

		// Update online status
		await this.updateOnlineUsers(activeUsers);
	}

	/**
	 * Get active users for time slot
	 */
	private getActiveUsersForSlot(
		users: Array<{ id: UserId; personaId: string }>, 
		hour: number, 
		dayOfWeek: number
	): Array<{ id: UserId; personaId: string }> {
		return users.filter(user => {
			const persona = personas[user.personaId];
			if (!persona) return false;

			// Get user's activity pattern
			const patternType = this.getUserPatternType(persona);
			const patterns = this.activityPatterns.get(patternType) || this.activityPatterns.get('default')!;
			const todayPattern = patterns.find(p => p.dayOfWeek === dayOfWeek);

			if (!todayPattern) return false;

			// Check if user is active this hour
			const isPeakHour = todayPattern.peakHours.includes(hour);
			const baseChance = todayPattern.baseActivity * (isPeakHour ? 1.5 : 0.5);

			// Adjust for persona behavior
			const behaviorMultiplier = {
				low: 0.3,
				medium: 0.7,
				high: 1.2,
				burst: isPeakHour ? 2.0 : 0.1
			}[persona.behavior.postFrequency];

			const activityChance = baseChance * behaviorMultiplier;

			// Check last activity to prevent spam
			const lastActivity = this.userLastActivity.get(user.id);
			if (lastActivity) {
				const hoursSinceLastActivity = (this.currentSimTime.getTime() - lastActivity.getTime()) / (1000 * 60 * 60);
				if (hoursSinceLastActivity < 0.5 && persona.behavior.postFrequency !== 'burst') {
					return false; // Too recent
				}
			}

			return Math.random() < activityChance;
		});
	}

	/**
	 * Simulate user activity
	 */
	private async simulateUserActivity(user: { id: UserId; personaId: string }, hour: number): Promise<void> {
		const persona = personas[user.personaId];
		if (!persona) return;

		// Update last activity
		this.userLastActivity.set(user.id, new Date(this.currentSimTime));

		// Determine activity type based on time and persona
		const activities = this.determineActivities(persona, hour);

		for (const activity of activities) {
			switch (activity) {
				case 'create_thread':
					await this.simulateThreadCreation(user.id, persona);
					break;
				case 'reply_thread':
					await this.simulateThreadReply(user.id, persona);
					break;
				case 'shoutbox':
					await this.simulateShoutboxMessage(user.id, persona);
					break;
				case 'send_dm':
					await this.simulateDirectMessage(user.id, persona);
					break;
				case 'tip':
					await this.simulateTipping(user.id, persona);
					break;
			}
		}
	}

	/**
	 * Determine activities for user
	 */
	private determineActivities(persona: Persona, hour: number): string[] {
		const activities: string[] = [];

		// Base activity probabilities
		const probs = {
			create_thread: 0.05,
			reply_thread: 0.3,
			shoutbox: 0.2,
			send_dm: 0.1,
			tip: 0.05
		};

		// Adjust based on persona
		if (persona.behavior.postFrequency === 'high') {
			probs.create_thread *= 2;
			probs.reply_thread *= 2;
		}

		if (persona.behavior.tipGenerosity === 'generous' || persona.behavior.tipGenerosity === 'whale') {
			probs.tip *= 3;
		}

		// Time-based adjustments
		if (hour >= 20 && hour <= 23) {
			probs.shoutbox *= 1.5; // More casual chat in evening
		}

		if (hour >= 9 && hour <= 17) {
			probs.create_thread *= 1.5; // More serious content during work hours
		}

		// Roll for each activity
		Object.entries(probs).forEach(([activity, prob]) => {
			if (Math.random() < prob) {
				activities.push(activity);
			}
		});

		return activities;
	}

	/**
	 * Simulate thread creation with temporal awareness
	 */
	private async simulateThreadCreation(userId: UserId, persona: Persona): Promise<void> {
		// Select appropriate forum based on time
		const forums = await db
			.select()
			.from(schema.forumStructure)
			.where(eq(schema.forumStructure.type, 'forum'));

		const forum = this.selectForumByTime(forums, this.currentSimTime.getHours());
		if (!forum) return;

		const threadType = this.getThreadTypeByTime();
		const title = this.generateTemporalTitle(persona, threadType, this.currentSimTime);

		const [thread] = await db.insert(schema.threads).values({
			forumId: forum.id,
			authorId: userId,
			title,
			threadType,
			metadata: {
				createdHour: this.currentSimTime.getHours(),
				dayOfWeek: this.currentSimTime.getDay(),
				persona: persona.personality
			}
		}).returning();

		// Initial post
		await db.insert(schema.posts).values({
			threadId: thread.id,
			authorId: userId,
			content: this.generateTemporalContent(persona, threadType, this.currentSimTime),
			metadata: {
				isOriginalPost: true
			}
		});

		// Track thread heat
		this.threadHeatMap.set(thread.id, 1.0);

		this.log(`${persona.username} created thread: ${title} at ${this.currentSimTime.toLocaleTimeString()}`, 'info');
	}

	/**
	 * Simulate thread reply with heat consideration
	 */
	private async simulateThreadReply(userId: UserId, persona: Persona): Promise<void> {
		// Find hot threads to reply to
		const hotThreads = await this.getHotThreads();
		if (hotThreads.length === 0) return;

		const thread = hotThreads[Math.floor(Math.random() * Math.min(5, hotThreads.length))];
		
		await db.insert(schema.posts).values({
			threadId: thread.id,
			authorId: userId,
			content: this.generateReplyContent(persona, thread, this.currentSimTime),
			metadata: {
				replyHour: this.currentSimTime.getHours(),
				threadHeat: this.threadHeatMap.get(thread.id) || 0
			}
		});

		// Increase thread heat
		const currentHeat = this.threadHeatMap.get(thread.id) || 0;
		this.threadHeatMap.set(thread.id, Math.min(currentHeat + 0.1, 2.0));
	}

	/**
	 * Simulate shoutbox message
	 */
	private async simulateShoutboxMessage(userId: UserId, persona: Persona): Promise<void> {
		const messageType = this.getShoutboxMessageType(persona, this.currentSimTime.getHours());
		
		await db.insert(schema.shoutboxMessages).values({
			userId,
			message: this.generateShoutboxMessage(persona, messageType, this.currentSimTime),
			messageType,
			metadata: {
				hour: this.currentSimTime.getHours(),
				mood: this.getUserMood(persona, this.currentSimTime)
			}
		});
	}

	/**
	 * Simulate direct message
	 */
	private async simulateDirectMessage(userId: UserId, persona: Persona): Promise<void> {
		if (!persona.socialGraph?.friends || persona.socialGraph.friends.length === 0) return;

		// Pick a friend to message
		const friendUsername = persona.socialGraph.friends[Math.floor(Math.random() * persona.socialGraph.friends.length)];
		const [friend] = await db
			.select()
			.from(schema.users)
			.where(eq(schema.users.username, friendUsername))
			.limit(1);

		if (!friend) return;

		// Time-appropriate message
		const content = this.generateDMContent(persona, this.currentSimTime);

		await db.insert(schema.directMessages).values({
			senderId: userId,
			recipientId: friend.id,
			content,
			metadata: {
				sentHour: this.currentSimTime.getHours(),
				conversationTopic: this.getConversationTopic(this.currentSimTime)
			}
		});
	}

	/**
	 * Simulate tipping with time-based amounts
	 */
	private async simulateTipping(userId: UserId, persona: Persona): Promise<void> {
		// Find recent quality posts
		const recentPosts = await db
			.select({
				id: schema.posts.id,
				authorId: schema.posts.authorId,
				threadId: schema.posts.threadId
			})
			.from(schema.posts)
			.where(and(
				gte(schema.posts.createdAt, new Date(this.currentSimTime.getTime() - 3600000)), // Last hour
				sql`${schema.posts.authorId} != ${userId}`
			))
			.limit(10);

		if (recentPosts.length === 0) return;

		const post = recentPosts[Math.floor(Math.random() * recentPosts.length)];
		const amount = this.getTipAmount(persona, this.currentSimTime.getHours());

		await db.insert(schema.postTips).values({
			postId: post.id,
			tipperId: userId,
			recipientId: post.authorId,
			tipAmount: amount,
			metadata: {
				hour: this.currentSimTime.getHours(),
				rainMode: this.currentSimTime.getHours() === 20 && Math.random() < 0.1
			}
		});
	}

	/**
	 * Decay thread heat over time
	 */
	private async decayThreadHeat(): Promise<void> {
		const decayRate = this.config.temporal.decayRates.threadHeat;
		
		for (const [threadId, heat] of this.threadHeatMap.entries()) {
			const newHeat = heat * decayRate;
			if (newHeat < 0.1) {
				this.threadHeatMap.delete(threadId);
			} else {
				this.threadHeatMap.set(threadId, newHeat);
			}
		}
	}

	/**
	 * Update online users
	 */
	private async updateOnlineUsers(activeUsers: Array<{ id: UserId; personaId: string }>): Promise<void> {
		// Clear old entries
		await db
			.delete(schema.onlineUsers)
			.where(lte(schema.onlineUsers.lastActive, new Date(this.currentSimTime.getTime() - 300000))); // 5 min timeout

		// Update active users
		for (const user of activeUsers) {
			await db.insert(schema.onlineUsers).values({
				userId: user.id,
				lastActive: this.currentSimTime,
				metadata: {
					activity: 'active',
					client: 'web'
				}
			}).onConflictDoUpdate({
				target: schema.onlineUsers.userId,
				set: {
					lastActive: this.currentSimTime
				}
			});
		}
	}

	/**
	 * Helper: Get user pattern type
	 */
	private getUserPatternType(persona: Persona): string {
		if (persona.behavior.toxicity > 0.5 || persona.behavior.exploitsXPLoops) {
			return 'night_owl';
		}
		if (persona.behavior.helpfulness > 0.7 || persona.role === 'moderator') {
			return 'early_bird';
		}
		if (persona.behavior.postFrequency === 'burst') {
			return 'burst';
		}
		return 'default';
	}

	/**
	 * Helper: Select forum based on time
	 */
	private selectForumByTime(forums: any[], hour: number): any {
		// Different forums are active at different times
		const timeForumMap: Record<string, number[]> = {
			'general-discussion': [9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21],
			'introductions': [10, 11, 14, 15, 19, 20],
			'memes-shitposting': [20, 21, 22, 23, 0, 1, 2],
			'serious-analysis': [9, 10, 11, 14, 15, 16],
			'defi-yield': [8, 9, 10, 14, 15, 20, 21],
			'technical-support': [10, 11, 14, 15, 16, 17]
		};

		const activeForums = forums.filter(f => {
			const hours = timeForumMap[f.slug] || [9, 14, 20];
			return hours.includes(hour);
		});

		return activeForums[Math.floor(Math.random() * activeForums.length)];
	}

	/**
	 * Helper: Get thread type by time
	 */
	private getThreadTypeByTime(): string {
		const hour = this.currentSimTime.getHours();
		
		if (hour >= 9 && hour <= 17) {
			return Math.random() < 0.7 ? 'discussion' : 'question';
		}
		if (hour >= 20 && hour <= 23) {
			return Math.random() < 0.3 ? 'meme' : 'discussion';
		}
		return 'discussion';
	}

	/**
	 * Helper: Generate temporal title
	 */
	private generateTemporalTitle(persona: Persona, threadType: string, time: Date): string {
		const hour = time.getHours();
		const templates: Record<string, string[]> = {
			morning: [
				'Good morning degens! [TOPIC]',
				'Early bird gets the [TOPIC]',
				'Coffee and [TOPIC] thoughts'
			],
			afternoon: [
				'Afternoon [TOPIC] discussion',
				'Quick question about [TOPIC]',
				'[TOPIC] analysis thread'
			],
			evening: [
				'Evening vibes: [TOPIC]',
				'Late night [TOPIC] chat',
				'[TOPIC] after dark'
			],
			night: [
				'Insomnia [TOPIC] thread',
				'3am [TOPIC] thoughts',
				'Night owl [TOPIC] discussion'
			]
		};

		const timeOfDay = hour < 6 ? 'night' : hour < 12 ? 'morning' : hour < 18 ? 'afternoon' : 'evening';
		const template = templates[timeOfDay][Math.floor(Math.random() * templates[timeOfDay].length)];
		const topic = this.getRandomTopic(persona);

		return template.replace('[TOPIC]', topic);
	}

	/**
	 * Helper: Get random topic
	 */
	private getRandomTopic(persona: Persona): string {
		const topics = {
			technical: ['DeFi strategies', 'yield farming', 'smart contracts', 'gas optimization'],
			casual: ['portfolio', 'market moves', 'crypto news', 'price action'],
			memetic: ['wen moon', 'HODL stories', 'rekt tales', 'degen plays'],
			helpful: ['beginner tips', 'tool recommendations', 'project reviews', 'tutorials']
		};

		const style = persona.behavior.postStyle;
		const topicList = topics[style] || topics.casual;
		return topicList[Math.floor(Math.random() * topicList.length)];
	}

	/**
	 * Helper: Generate temporal content
	 */
	private generateTemporalContent(persona: Persona, threadType: string, time: Date): string {
		const hour = time.getHours();
		const mood = this.getUserMood(persona, time);

		const contentTemplates = {
			energetic: 'LFG! Just discovered this amazing [DETAIL]. What do you degens think?',
			tired: 'Been up all night researching [DETAIL]. Brain is fried but found some alpha...',
			focused: 'Deep dive into [DETAIL]. Here\'s what I found:\n\n1. [POINT]\n2. [POINT]\n3. [POINT]',
			casual: 'Random thought about [DETAIL]. Anyone else thinking the same?'
		};

		return contentTemplates[mood]
			.replace(/\[DETAIL\]/g, this.getRandomTopic(persona))
			.replace(/\[POINT\]/g, () => `Key insight ${Math.floor(Math.random() * 100)}`);
	}

	/**
	 * Helper: Get hot threads
	 */
	private async getHotThreads(): Promise<any[]> {
		// Get threads with high heat
		const hotThreadIds = Array.from(this.threadHeatMap.entries())
			.filter(([_, heat]) => heat > 0.5)
			.sort((a, b) => b[1] - a[1])
			.slice(0, 10)
			.map(([id]) => id);

		if (hotThreadIds.length === 0) {
			// Fallback to recent threads
			return db
				.select()
				.from(schema.threads)
				.where(eq(schema.threads.isLocked, false))
				.orderBy(desc(schema.threads.createdAt))
				.limit(10);
		}

		return db
			.select()
			.from(schema.threads)
			.where(sql`${schema.threads.id} = ANY(${hotThreadIds})`);
	}

	/**
	 * Helper: Generate reply content
	 */
	private generateReplyContent(persona: Persona, thread: any, time: Date): string {
		const replyTypes = {
			helpful: ['Great point! Here\'s my take:', 'To add to this:', 'Have you considered:'],
			provocative: ['Disagree completely.', 'This is why you\'re wrong:', 'Hot take:'],
			technical: ['Technical analysis:', 'Based on the data:', 'Code review:'],
			casual: ['Same here!', 'This ^', 'My thoughts:'],
			memetic: ['Based', 'This is the way', 'Wen?', 'NGMI']
		};

		const style = persona.behavior.postStyle;
		const prefix = replyTypes[style][Math.floor(Math.random() * replyTypes[style].length)];

		return `${prefix} ${this.getRandomTopic(persona)}`;
	}

	/**
	 * Helper: Get shoutbox message type
	 */
	private getShoutboxMessageType(persona: Persona, hour: number): string {
		if (persona.role === 'admin' && Math.random() < 0.1) return 'announcement';
		if (hour === 20 && Math.random() < 0.05) return 'rain_alert';
		return 'message';
	}

	/**
	 * Helper: Generate shoutbox message
	 */
	private generateShoutboxMessage(persona: Persona, type: string, time: Date): string {
		if (type === 'announcement') {
			return '📢 Server maintenance at 3am UTC. Expect 10 mins downtime.';
		}
		if (type === 'rain_alert') {
			return '🌧️ RAIN incoming in 5 minutes! Get ready degens!';
		}

		const messages = {
			helpful: ['Anyone need help with anything?', 'Pro tip: Check the FAQ section!'],
			provocative: ['Price predictions are for noobs', 'Imagine not being leveraged rn'],
			casual: ['gm degens', 'How\'s everyone doing?', 'What\'s the vibe today?'],
			memetic: ['wen lambo', 'probably nothing', 'few understand']
		};

		const style = persona.behavior.postStyle;
		const msgList = messages[style] || messages.casual;
		return msgList[Math.floor(Math.random() * msgList.length)];
	}

	/**
	 * Helper: Get user mood
	 */
	private getUserMood(persona: Persona, time: Date): 'energetic' | 'tired' | 'focused' | 'casual' {
		const hour = time.getHours();
		
		if (hour >= 6 && hour <= 10) return 'energetic';
		if (hour >= 0 && hour <= 5) return 'tired';
		if (hour >= 10 && hour <= 17) return 'focused';
		return 'casual';
	}

	/**
	 * Helper: Generate DM content
	 */
	private generateDMContent(persona: Persona, time: Date): string {
		const hour = time.getHours();
		const topics = this.getConversationTopic(time);

		const templates = {
			morning: `Morning! Quick question about ${topics}...`,
			afternoon: `Hey, saw your post about ${topics}. Thoughts?`,
			evening: `Yo, you around? Wanted to discuss ${topics}`,
			night: `Can't sleep. Thinking about ${topics}. You up?`
		};

		const timeOfDay = hour < 6 ? 'night' : hour < 12 ? 'morning' : hour < 18 ? 'afternoon' : 'evening';
		return templates[timeOfDay];
	}

	/**
	 * Helper: Get conversation topic
	 */
	private getConversationTopic(time: Date): string {
		const topics = ['the latest proposal', 'yield strategies', 'that new project', 'market conditions', 'the drama earlier'];
		return topics[Math.floor(Math.random() * topics.length)];
	}

	/**
	 * Helper: Get tip amount
	 */
	private getTipAmount(persona: Persona, hour: number): number {
		const baseAmounts = {
			stingy: [1, 5],
			normal: [5, 50],
			generous: [50, 200],
			whale: [100, 1000]
		};

		const [min, max] = baseAmounts[persona.behavior.tipGenerosity];
		let amount = Math.floor(Math.random() * (max - min) + min);

		// Happy hour multiplier
		if (hour === 20) {
			amount *= 2;
		}

		return amount;
	}

	/**
	 * Run full temporal simulation
	 */
	async runSimulation(users: Array<{ id: UserId; personaId: string }>, days: number): Promise<void> {
		this.log(`Starting ${days}-day temporal simulation for ${users.length} users`, 'info');

		const startDate = new Date();
		startDate.setHours(0, 0, 0, 0);

		for (let day = 0; day < days; day++) {
			this.log(`=== Day ${day + 1}/${days} ===`, 'info');

			for (let hour = 0; hour < 24; hour++) {
				const slotDate = new Date(startDate);
				slotDate.setDate(startDate.getDate() + day);
				slotDate.setHours(hour);

				await this.simulateTimeSlot(users, slotDate);

				// Small delay to prevent overwhelming
				await new Promise(resolve => setTimeout(resolve, 10));
			}

			// Daily summary
			const activeToday = this.userLastActivity.size;
			const hotThreads = this.threadHeatMap.size;
			this.log(`Day ${day + 1} complete: ${activeToday} active users, ${hotThreads} hot threads`, 'success');
		}

		this.log('Temporal simulation complete!', 'success');
	}
}