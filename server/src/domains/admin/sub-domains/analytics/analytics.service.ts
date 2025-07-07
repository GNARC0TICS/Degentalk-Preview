/**
 * Admin Analytics Service
 *
 * Handles business logic for generating platform analytics.
 */

import { db } from '@db';
import { users, threads, posts, postReactions, transactions, shoutboxMessages } from '@schema';
import { sql, eq, desc, and, count, sum, gte, lte, between } from 'drizzle-orm';
import { AdminError, AdminErrorCodes } from '../../admin.errors';
import type { AnalyticsPeriodInput, AnalyticsQueryInput } from './analytics.validators';
import { subDays, formatISO } from 'date-fns';
import { logger } from '../../../../core/logger';

// Helper to get date range based on period or explicit dates
function getDateRange(params: AnalyticsPeriodInput): { startDateSQL: string; endDateSQL: string } {
	let startDate: Date;
	let endDate: Date = new Date(); // Today

	if (params.startDate && params.endDate) {
		startDate = new Date(params.startDate);
		endDate = new Date(params.endDate);
	} else {
		const period = params.period || '30d';
		switch (period) {
			case 'today':
				startDate = new Date();
				startDate.setHours(0, 0, 0, 0);
				break;
			case '7d':
				startDate = subDays(endDate, 7);
				break;
			case '90d':
				startDate = subDays(endDate, 90);
				break;
			case 'all':
				startDate = new Date(0); // Epoch time for all data
				break;
			case '30d':
			default:
				startDate = subDays(endDate, 30);
				break;
		}
	}
	return {
		startDateSQL: formatISO(startDate),
		endDateSQL: formatISO(endDate)
	};
}

export class AdminAnalyticsService {
	async getOverviewStats(params: AnalyticsPeriodInput) {
		const { startDateSQL, endDateSQL } = getDateRange(params);
		try {
			const [totalUsers] = await db.select({ value: count(users.id) }).from(users);
			const [newUsers] = await db
				.select({ value: count(users.id) })
				.from(users)
				.where(between(users.createdAt, startDateSQL, endDateSQL));

			const [activeUsers] = await db
				.select({ value: count(users.id) })
				.from(users)
				.where(between(users.lastSeenAt, startDateSQL, endDateSQL));

			const [totalThreads] = await db.select({ value: count(threads.id) }).from(threads);
			const [newThreads] = await db
				.select({ value: count(threads.id) })
				.from(threads)
				.where(between(threads.createdAt, startDateSQL, endDateSQL));

			const [totalPosts] = await db.select({ value: count(posts.id) }).from(posts);
			const [newPosts] = await db
				.select({ value: count(posts.id) })
				.from(posts)
				.where(between(posts.createdAt, startDateSQL, endDateSQL));

			const [totalReactions] = await db
				.select({ value: count(postReactions.userId) })
				.from(postReactions);

			const [totalTipAmount] = await db
				.select({ value: sum(transactions.amount) })
				.from(transactions)
				.where(eq(transactions.type, 'TIP'));

			const [shoutboxMessageCount] = await db
				.select({ value: count(shoutboxMessages.id) })
				.from(shoutboxMessages);

			return {
				users: {
					total: Number(totalUsers?.value) || 0,
					newInPeriod: Number(newUsers?.value) || 0,
					activeInPeriod: Number(activeUsers?.value) || 0
				},
				content: {
					totalThreads: Number(totalThreads?.value) || 0,
					newThreadsInPeriod: Number(newThreads?.value) || 0,
					totalPosts: Number(totalPosts?.value) || 0,
					newPostsInPeriod: Number(newPosts?.value) || 0
				},
				engagement: {
					totalReactions: Number(totalReactions?.value) || 0,
					totalTipAmountDGT: totalTipAmount?.value ? Number(totalTipAmount.value) / 1000000 : 0, // Assuming DGT has 6 decimals
					shoutboxMessageCount: Number(shoutboxMessageCount?.value) || 0
				},
				period: {
					startDate: startDateSQL,
					endDate: endDateSQL,
					periodUsed: params.period || 'custom'
				}
			};
		} catch (error: any) {
			logger.error('Error fetching overview stats:', error);
			throw new AdminError('Failed to fetch overview statistics', 500, AdminErrorCodes.DB_ERROR, {
				originalError: error.message
			});
		}
	}

	async getUserGrowthChart(params: AnalyticsQueryInput) {
		const { startDateSQL, endDateSQL } = getDateRange(params);
		const { granularity } = params;
		let dateFormat: string;
		switch (granularity) {
			case 'daily':
				dateFormat = '%Y-%m-%d';
				break;
			case 'weekly':
				dateFormat = '%Y-%W';
				break; // Year-WeekNumber
			case 'monthly':
				dateFormat = '%Y-%m';
				break;
			default:
				dateFormat = '%Y-%m-%d';
		}

		try {
			const growthData = await db
				.select({
					period: sql<string>`strftime(${dateFormat}, ${users.createdAt})`,
					count: count(users.id)
				})
				.from(users)
				.where(between(users.createdAt, startDateSQL, endDateSQL))
				.groupBy(sql`period`)
				.orderBy(sql`period ASC`);

			return growthData.map((d) => ({ period: d.period, userCount: Number(d.count) }));
		} catch (error: any) {
			logger.error('Error fetching user growth data:', error);
			throw new AdminError('Failed to fetch user growth data', 500, AdminErrorCodes.DB_ERROR, {
				originalError: error.message
			});
		}
	}

	async getMostActiveThreads(params: AnalyticsQueryInput) {
		const { limit } = params;
		const { startDateSQL, endDateSQL } = getDateRange(params);
		try {
			const activeThreads = await db
				.select({
					threadId: threads.id,
					title: threads.title,
					slug: threads.slug,
					postCount: threads.postCount, // Assuming postCount is updated regularly
					lastPostAt: threads.lastPostAt,
					viewCount: threads.viewCount
				})
				.from(threads)
				.where(between(threads.updatedAt, startDateSQL, endDateSQL)) // Use updatedAt or lastPostAt for recent activity
				.orderBy(desc(threads.postCount), desc(threads.updatedAt)) // Order by post count then recent activity
				.limit(limit || 10);

			return activeThreads;
		} catch (error: any) {
			logger.error('Error fetching most active threads:', error);
			throw new AdminError('Failed to fetch most active threads', 500, AdminErrorCodes.DB_ERROR, {
				originalError: error.message
			});
		}
	}
}

export const adminAnalyticsService = new AdminAnalyticsService();
