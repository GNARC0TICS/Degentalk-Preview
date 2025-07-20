import { db } from '../../../db';
// import { logger } from '@server/core/logger'; // Logger not needed in seeding
import * as schema from '../../../db/schema';
import { eq, and, gte, sql, desc, isNull } from 'drizzle-orm';
import type { UserId, ThreadId, PostId } from '../../../shared/types/ids';
import { getSeedConfig } from '../config/seed.config';
import { personas } from '../config/personas.config';
import chalk from 'chalk';

export interface AdminAction {
	type: 'ban' | 'warn' | 'delete' | 'lock' | 'pin' | 'announcement' | 'grant_badge' | 'rain_event';
	target?: UserId | ThreadId | PostId;
	reason?: string;
	metadata?: Record<string, any>;
}

export class AdminFlowSimulator {
	private config = getSeedConfig();
	private adminActions: AdminAction[] = [];
	private modActions: AdminAction[] = [];

	private log(message: string, type: 'info' | 'success' | 'error' | 'warn' = 'info') {
		const prefix = {
			info: chalk.cyan('ℹ️'),
			success: chalk.green('✅'),
			error: chalk.red('❌'),
			warn: chalk.yellow('⚠️')
		}[type];
		
		console.log(`${prefix} [AdminFlow] ${message}`);
	}

	/**
	 * Simulate admin actions
	 */
	async simulateAdminActions(adminId: UserId, dayNumber: number): Promise<void> {
		const admin = await this.getAdminUser(adminId);
		if (!admin || admin.role !== 'admin') return;

		this.log(`Admin ${admin.username} performing daily duties (Day ${dayNumber})`, 'info');

		// Daily admin tasks
		if (dayNumber === 1) {
			await this.createWelcomeAnnouncement(adminId);
		}

		if (dayNumber % 7 === 0) {
			await this.createWeeklyUpdate(adminId);
		}

		// Review reports
		await this.reviewReports(adminId);

		// Pin important threads
		await this.pinImportantThreads(adminId);

		// Grant badges to achievers
		await this.grantBadges(adminId);

		// Create rain events
		if (Math.random() < 0.3) {
			await this.createRainEvent(adminId);
		}

		// Beta feature management
		await this.manageBetaFeatures(adminId);
	}

	/**
	 * Simulate moderator actions
	 */
	async simulateModeratorActions(modId: UserId, dayNumber: number): Promise<void> {
		const mod = await this.getModUser(modId);
		if (!mod || !['admin', 'moderator'].includes(mod.role)) return;

		this.log(`Moderator ${mod.username} on patrol (Day ${dayNumber})`, 'info');

		// Review spam reports
		await this.reviewSpamReports(modId);

		// Lock problematic threads
		await this.lockProblematicThreads(modId);

		// Issue warnings
		await this.issueWarnings(modId);

		// Clean up spam
		await this.cleanupSpam(modId);
	}

	/**
	 * Create welcome announcement
	 */
	private async createWelcomeAnnouncement(adminId: UserId): Promise<void> {
		const [announcementForum] = await db
			.select()
			.from(schema.forumStructure)
			.where(eq(schema.forumStructure.slug, 'announcements'))
			.limit(1);

		if (!announcementForum) return;

		const [thread] = await db.insert(schema.threads).values({
			forumId: announcementForum.id,
			authorId: adminId,
			title: '🎉 Welcome to DegenTalk Beta!',
			isPinned: true,
			isLocked: false,
			threadType: 'announcement',
			metadata: {
				official: true,
				priority: 'high'
			}
		}).returning();

		await db.insert(schema.posts).values({
			threadId: thread.id,
			authorId: adminId,
			content: `# Welcome to DegenTalk Beta! 🚀

We're thrilled to have you join our community of degens! Here's what you need to know:

## 🎮 Getting Started
- Complete your profile to earn your first XP
- Check out the tutorials section for guides
- Join the shoutbox to meet other degens

## 💰 Economy System
- Earn XP through participation
- Level up to unlock new features
- Use DGT for tips, cosmetics, and more

## 🏆 Current Events
- **Double XP Weekend** starts Friday!
- **Meme Contest** submissions open
- **Beta Tester Badge** available for early adopters

## 📜 Rules
1. Be respectful (or at least creative with your disrespect)
2. No spam or scams
3. DYOR - this is a degen zone
4. Have fun and stay degen!

## 🐛 Beta Feedback
Found a bug? Have a suggestion? Post in the feedback forum!

Let's build something amazing together! 

*- The DegenTalk Team*`,
			metadata: {
				announcement: true,
				authorRole: 'admin'
			}
		});

		this.adminActions.push({
			type: 'announcement',
			target: thread.id,
			metadata: { title: thread.title }
		});

		this.log('Created welcome announcement', 'success');
	}

	/**
	 * Create weekly update
	 */
	private async createWeeklyUpdate(adminId: UserId): Promise<void> {
		const stats = await this.gatherWeeklyStats();

		const [announcementForum] = await db
			.select()
			.from(schema.forumStructure)
			.where(eq(schema.forumStructure.slug, 'announcements'))
			.limit(1);

		if (!announcementForum) return;

		const [thread] = await db.insert(schema.threads).values({
			forumId: announcementForum.id,
			authorId: adminId,
			title: `📊 Weekly Update - Week ${Math.floor(Date.now() / (7 * 24 * 60 * 60 * 1000))}`,
			isPinned: true,
			isLocked: false,
			threadType: 'announcement',
			metadata: {
				official: true,
				weeklyUpdate: true
			}
		}).returning();

		await db.insert(schema.posts).values({
			threadId: thread.id,
			authorId: adminId,
			content: `# Weekly Platform Update 📊

## 📈 Community Stats
- **Total Users**: ${stats.totalUsers}
- **New This Week**: ${stats.newUsers}
- **Active Users**: ${stats.activeUsers}
- **Total Posts**: ${stats.totalPosts}

## 🏆 Top Contributors
${stats.topContributors.map((u, i) => `${i + 1}. ${u.username} - ${u.xp} XP`).join('\n')}

## 💰 Economy Highlights
- **DGT in Circulation**: ${stats.dgtCirculation}
- **Tips This Week**: ${stats.weeklyTips}
- **Largest Rain Event**: ${stats.largestRain} DGT

## 🎯 Achievements Unlocked
- ${stats.achievementsUnlocked} achievements unlocked
- Most popular: "${stats.popularAchievement}"

## 🔥 Trending Topics
${stats.trendingTopics.map(t => `- ${t}`).join('\n')}

## 🚀 What's Coming
- New cosmetic items in the shop
- Mission system improvements
- Mobile app beta testing

Keep up the great work, degens! 🎉`,
			metadata: {
				stats,
				weekNumber: Math.floor(Date.now() / (7 * 24 * 60 * 60 * 1000))
			}
		});

		this.log('Created weekly update', 'success');
	}

	/**
	 * Review and act on reports
	 */
	private async reviewReports(adminId: UserId): Promise<void> {
		const pendingReports = await db
			.select()
			.from(schema.reports)
			.where(eq(schema.reports.status, 'pending'))
			.limit(10);

		for (const report of pendingReports) {
			// Decide action based on report
			const action = this.decideReportAction(report);

			switch (action) {
				case 'ban':
					await this.banUser(adminId, report.reportedUserId, report.reason);
					break;
				case 'warn':
					await this.warnUser(adminId, report.reportedUserId, report.reason);
					break;
				case 'delete':
					if (report.reportedContentType === 'post') {
						await this.deletePost(adminId, report.reportedContentId as PostId);
					}
					break;
				case 'dismiss':
					// No action needed
					break;
			}

			// Update report status
			await db
				.update(schema.reports)
				.set({
					status: 'resolved',
					resolvedBy: adminId,
					resolvedAt: new Date(),
					resolution: action
				})
				.where(eq(schema.reports.id, report.id));
		}

		if (pendingReports.length > 0) {
			this.log(`Reviewed ${pendingReports.length} reports`, 'success');
		}
	}

	/**
	 * Pin important threads
	 */
	private async pinImportantThreads(adminId: UserId): Promise<void> {
		// Find high-quality threads to pin
		const candidates = await db
			.select({
				id: schema.threads.id,
				title: schema.threads.title,
				score: sql<number>`
					(SELECT COUNT(*) FROM ${schema.posts} WHERE thread_id = ${schema.threads.id}) * 10 +
					(SELECT COALESCE(SUM(tip_amount), 0) FROM ${schema.postTips} pt 
					 JOIN ${schema.posts} p ON pt.post_id = p.id 
					 WHERE p.thread_id = ${schema.threads.id})
				`
			})
			.from(schema.threads)
			.where(and(
				eq(schema.threads.isPinned, false),
				eq(schema.threads.isLocked, false)
			))
			.orderBy(desc(sql`score`))
			.limit(3);

		for (const thread of candidates) {
			if (thread.score > 100) {
				await db
					.update(schema.threads)
					.set({
						isPinned: true,
						metadata: sql`jsonb_set(metadata, '{pinnedBy}', '"${adminId}"'::jsonb)`
					})
					.where(eq(schema.threads.id, thread.id));

				this.adminActions.push({
					type: 'pin',
					target: thread.id,
					metadata: { score: thread.score }
				});

				this.log(`Pinned high-quality thread: ${thread.title}`, 'success');
			}
		}
	}

	/**
	 * Grant badges to deserving users
	 */
	private async grantBadges(adminId: UserId): Promise<void> {
		// Find users eligible for special badges
		const candidates = await db
			.select({
				userId: schema.users.id,
				username: schema.users.username,
				xp: schema.users.xp,
				joinedAt: schema.users.createdAt
			})
			.from(schema.users)
			.where(and(
				gte(schema.users.xp, 10000),
				eq(schema.users.role, 'user')
			))
			.limit(5);

		for (const user of candidates) {
			// Beta tester badge
			if (user.joinedAt < new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)) {
				await this.grantBadge(user.userId, 'beta_tester', adminId);
			}

			// High XP badges
			if (user.xp >= 50000) {
				await this.grantBadge(user.userId, 'xp_master', adminId);
			}
		}
	}

	/**
	 * Create rain event
	 */
	private async createRainEvent(adminId: UserId): Promise<void> {
		const amount = [1000, 2500, 5000, 10000][Math.floor(Math.random() * 4)];
		const participantCount = [10, 25, 50, 100][Math.floor(Math.random() * 4)];

		const [rainEvent] = await db.insert(schema.rainEvents).values({
			createdBy: adminId,
			totalAmount: amount,
			currency: 'DGT',
			participantCount,
			amountPerUser: Math.floor(amount / participantCount),
			status: 'pending',
			scheduledFor: new Date(Date.now() + 60 * 60 * 1000), // 1 hour from now
			metadata: {
				type: 'admin_rain',
				message: 'Random rain event from the admins! 🌧️💰'
			}
		}).returning();

		// Create announcement
		await db.insert(schema.shoutboxMessages).values({
			userId: adminId,
			message: `🌧️ RAIN ALERT! ${amount} DGT will be distributed to ${participantCount} lucky degens in 1 hour!`,
			messageType: 'announcement',
			metadata: {
				rainEventId: rainEvent.id,
				highlight: true
			}
		});

		this.adminActions.push({
			type: 'rain_event',
			metadata: { amount, participants: participantCount }
		});

		this.log(`Created rain event: ${amount} DGT for ${participantCount} users`, 'success');
	}

	/**
	 * Manage beta features
	 */
	private async manageBetaFeatures(adminId: UserId): Promise<void> {
		// Randomly toggle some beta features
		const betaFeatures = ['experimental_ui', 'new_gamification', 'advanced_trading'];
		
		for (const feature of betaFeatures) {
			if (Math.random() < 0.1) {
				const enabled = Math.random() < 0.7;
				
				await db.insert(schema.featureFlags).values({
					key: feature,
					enabled,
					description: `Beta feature: ${feature}`,
					rolloutPercentage: enabled ? Math.floor(Math.random() * 50) + 50 : 0,
					metadata: {
						enabledBy: adminId,
						enabledAt: new Date(),
						beta: true
					}
				}).onConflictDoUpdate({
					target: schema.featureFlags.key,
					set: {
						enabled,
						rolloutPercentage: enabled ? Math.floor(Math.random() * 50) + 50 : 0,
						updatedAt: new Date()
					}
				});

				this.log(`${enabled ? 'Enabled' : 'Disabled'} beta feature: ${feature}`, 'info');
			}
		}
	}

	/**
	 * Moderator: Review spam reports
	 */
	private async reviewSpamReports(modId: UserId): Promise<void> {
		const spamReports = await db
			.select()
			.from(schema.reports)
			.where(and(
				eq(schema.reports.status, 'pending'),
				eq(schema.reports.reason, 'spam')
			))
			.limit(20);

		for (const report of spamReports) {
			// Check if it's actually spam
			if (report.metadata?.autoDetected || Math.random() < 0.8) {
				// Delete spam content
				if (report.reportedContentType === 'post') {
					await this.deletePost(modId, report.reportedContentId as PostId);
				}

				// Warn the user
				await this.warnUser(modId, report.reportedUserId, 'Spam content');

				await db
					.update(schema.reports)
					.set({
						status: 'resolved',
						resolvedBy: modId,
						resolvedAt: new Date(),
						resolution: 'content_removed'
					})
					.where(eq(schema.reports.id, report.id));
			}
		}

		if (spamReports.length > 0) {
			this.log(`Mod reviewed ${spamReports.length} spam reports`, 'success');
		}
	}

	/**
	 * Lock problematic threads
	 */
	private async lockProblematicThreads(modId: UserId): Promise<void> {
		// Find threads with high report counts
		const problematicThreads = await db
			.select({
				threadId: schema.posts.threadId,
				reportCount: sql<number>`COUNT(DISTINCT ${schema.reports.id})`,
				title: schema.threads.title
			})
			.from(schema.posts)
			.innerJoin(schema.threads, eq(schema.posts.threadId, schema.threads.id))
			.leftJoin(schema.reports, and(
				eq(schema.reports.reportedContentId, schema.posts.id),
				eq(schema.reports.reportedContentType, 'post')
			))
			.where(eq(schema.threads.isLocked, false))
			.groupBy(schema.posts.threadId, schema.threads.title)
			.having(sql`COUNT(DISTINCT ${schema.reports.id}) > 5`)
			.limit(5);

		for (const thread of problematicThreads) {
			await db
				.update(schema.threads)
				.set({
					isLocked: true,
					lockedAt: new Date(),
					lockedBy: modId,
					metadata: sql`jsonb_set(metadata, '{lockReason}', '"High report count"'::jsonb)`
				})
				.where(eq(schema.threads.id, thread.threadId));

			this.modActions.push({
				type: 'lock',
				target: thread.threadId,
				reason: 'High report count'
			});

			this.log(`Locked problematic thread: ${thread.title}`, 'warn');
		}
	}

	/**
	 * Issue warnings to users
	 */
	private async issueWarnings(modId: UserId): Promise<void> {
		// Find users with multiple reports
		const problemUsers = await db
			.select({
				userId: schema.reports.reportedUserId,
				reportCount: sql<number>`COUNT(*)`,
				username: schema.users.username
			})
			.from(schema.reports)
			.innerJoin(schema.users, eq(schema.reports.reportedUserId, schema.users.id))
			.where(eq(schema.reports.status, 'pending'))
			.groupBy(schema.reports.reportedUserId, schema.users.username)
			.having(sql`COUNT(*) >= 3`)
			.limit(10);

		for (const user of problemUsers) {
			await this.warnUser(modId, user.userId, 'Multiple community reports');
			this.log(`Warned user ${user.username} (${user.reportCount} reports)`, 'warn');
		}
	}

	/**
	 * Helper: Ban user
	 */
	private async banUser(adminId: UserId, userId: UserId, reason: string): Promise<void> {
		const duration = Math.random() < 0.5 ? 7 : 30; // 7 or 30 days

		await db.insert(schema.bans).values({
			userId,
			bannedBy: adminId,
			reason,
			expiresAt: new Date(Date.now() + duration * 24 * 60 * 60 * 1000),
			metadata: {
				reportBased: true,
				severity: 'high'
			}
		});

		// Update user
		await db
			.update(schema.users)
			.set({
				bans: sql`${schema.users.bans} + 1`
			})
			.where(eq(schema.users.id, userId));

		// Log action
		await db.insert(schema.moderationActions).values({
			moderatorId: adminId,
			targetUserId: userId,
			action: 'ban',
			reason,
			duration: duration * 24 * 60 * 60,
			metadata: { automated: false }
		});

		this.adminActions.push({
			type: 'ban',
			target: userId,
			reason,
			metadata: { duration }
		});
	}

	/**
	 * Helper: Warn user
	 */
	private async warnUser(modId: UserId, userId: UserId, reason: string): Promise<void> {
		await db
			.update(schema.users)
			.set({
				warnings: sql`${schema.users.warnings} + 1`
			})
			.where(eq(schema.users.id, userId));

		// Create notification
		await db.insert(schema.notifications).values({
			userId,
			type: 'warning',
			title: 'Community Warning',
			message: `You have received a warning: ${reason}. Please review the community guidelines.`,
			data: {
				issuedBy: modId,
				reason
			},
			read: false
		});

		// Log action
		await db.insert(schema.moderationActions).values({
			moderatorId: modId,
			targetUserId: userId,
			action: 'warn',
			reason,
			metadata: { automated: false }
		});
	}

	/**
	 * Helper: Delete post
	 */
	private async deletePost(modId: UserId, postId: PostId): Promise<void> {
		await db
			.update(schema.posts)
			.set({
				deletedAt: new Date(),
				deletedBy: modId,
				metadata: sql`jsonb_set(metadata, '{deletionReason}', '"Policy violation"'::jsonb)`
			})
			.where(eq(schema.posts.id, postId));
	}

	/**
	 * Helper: Grant badge
	 */
	private async grantBadge(userId: UserId, badgeType: string, grantedBy: UserId): Promise<void> {
		const [badge] = await db
			.select()
			.from(schema.badges)
			.where(eq(schema.badges.slug, badgeType))
			.limit(1);

		if (!badge) return;

		await db.insert(schema.userBadges).values({
			userId,
			badgeId: badge.id,
			awardedBy: grantedBy,
			metadata: {
				reason: 'Exceptional contribution',
				automated: false
			}
		}).onConflictDoNothing();

		// Notification
		await db.insert(schema.notifications).values({
			userId,
			type: 'badge_earned',
			title: 'New Badge Earned!',
			message: `You've been awarded the ${badge.name} badge!`,
			data: {
				badgeId: badge.id,
				badgeName: badge.name,
				grantedBy
			},
			read: false
		});

		this.log(`Granted ${badge.name} badge to user ${userId}`, 'success');
	}

	/**
	 * Helper: Decide report action
	 */
	private decideReportAction(report: any): 'ban' | 'warn' | 'delete' | 'dismiss' {
		// Severity-based decisions
		if (report.reason === 'hate_speech' || report.reason === 'threats') {
			return 'ban';
		}
		if (report.reason === 'spam' && report.metadata?.confidence > 0.8) {
			return 'delete';
		}
		if (report.reason === 'harassment') {
			return 'warn';
		}
		if (report.metadata?.autoDetected && report.metadata?.confidence < 0.5) {
			return 'dismiss';
		}
		return 'warn';
	}

	/**
	 * Helper: Gather weekly stats
	 */
	private async gatherWeeklyStats(): Promise<any> {
		const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

		const [stats] = await db
			.select({
				totalUsers: sql<number>`COUNT(DISTINCT ${schema.users.id})`,
				newUsers: sql<number>`COUNT(DISTINCT CASE WHEN ${schema.users.createdAt} > ${weekAgo} THEN ${schema.users.id} END)`,
				activeUsers: sql<number>`COUNT(DISTINCT CASE WHEN ${schema.users.lastSeenAt} > ${weekAgo} THEN ${schema.users.id} END)`,
				totalPosts: sql<number>`COUNT(${schema.posts.id})`
			})
			.from(schema.users)
			.crossJoin(schema.posts);

		const topContributors = await db
			.select({
				username: schema.users.username,
				xp: schema.users.xp
			})
			.from(schema.users)
			.orderBy(desc(schema.users.xp))
			.limit(5);

		return {
			...stats,
			topContributors,
			dgtCirculation: Math.floor(Math.random() * 1000000) + 500000,
			weeklyTips: Math.floor(Math.random() * 10000) + 5000,
			largestRain: Math.floor(Math.random() * 10000) + 1000,
			achievementsUnlocked: Math.floor(Math.random() * 500) + 100,
			popularAchievement: 'First Post',
			trendingTopics: ['DeFi strategies', 'Meme contest', 'Beta feedback', 'New features']
		};
	}

	/**
	 * Helper: Get admin user
	 */
	private async getAdminUser(userId: UserId): Promise<any> {
		const [user] = await db
			.select()
			.from(schema.users)
			.where(eq(schema.users.id, userId))
			.limit(1);
		return user;
	}

	/**
	 * Helper: Get mod user
	 */
	private async getModUser(userId: UserId): Promise<any> {
		const [user] = await db
			.select()
			.from(schema.users)
			.where(eq(schema.users.id, userId))
			.limit(1);
		return user;
	}

	/**
	 * Clean up spam content
	 */
	private async cleanupSpam(modId: UserId): Promise<void> {
		// Find obvious spam posts
		const spamPosts = await db
			.select()
			.from(schema.posts)
			.where(and(
				eq(schema.posts.isSpam, true),
				isNull(schema.posts.deletedAt)
			))
			.limit(50);

		for (const post of spamPosts) {
			await this.deletePost(modId, post.id);
		}

		if (spamPosts.length > 0) {
			this.log(`Cleaned up ${spamPosts.length} spam posts`, 'success');
		}
	}

	/**
	 * Simulate admin/mod flows for all staff
	 */
	async simulateStaffActions(days: number): Promise<void> {
		this.log('Starting staff action simulation...', 'info');

		// Get all admin/mod users
		const staff = await db
			.select({
				id: schema.users.id,
				username: schema.users.username,
				role: schema.users.role
			})
			.from(schema.users)
			.where(sql`${schema.users.role} IN ('admin', 'moderator')`);

		for (let day = 1; day <= days; day++) {
			this.log(`Simulating staff actions for day ${day}`, 'info');

			for (const member of staff) {
				if (member.role === 'admin') {
					await this.simulateAdminActions(member.id, day);
				} else {
					await this.simulateModeratorActions(member.id, day);
				}
			}
		}

		this.log(`Staff simulation complete! Admin actions: ${this.adminActions.length}, Mod actions: ${this.modActions.length}`, 'success');
	}
}