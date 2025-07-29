/**
 * Rain Analytics Service
 *
 * Provides analytics data about rain events for the admin dashboard
 */

import { db } from '@degentalk/db';
import type { UserId } from '@shared/types/ids';
import { rainEvents, users, transactions } from '@schema';
import { sql, desc, eq, count, sum, and, between } from 'drizzle-orm';
import { startOfDay, subDays, format } from 'date-fns';

export interface RainEventAnalytics {
	// Summary statistics
	totalRainEvents: number;
	totalRainVolume: number;
	uniqueRainers: number;
	uniqueRecipients: number;
	averageRainAmount: number;

	// Time-based metrics
	dailyVolume: {
		date: string;
		amount: number;
		eventCount: number;
	}[];

	// Top rainers
	topRainers: {
		userId: UserId;
		username: string;
		avatarUrl: string | null;
		totalAmount: number;
		eventCount: number;
	}[];

	// Currency distribution
	currencyDistribution: {
		currency: string;
		amount: number;
		percentage: number;
	}[];

	// Last updated timestamp
	lastUpdated: string;
}

class RainAnalyticsService {
	/**
	 * Get comprehensive rain analytics
	 * @param days Number of days to include in time-series data (default: 30)
	 * @param topRainersLimit Number of top rainers to include (default: 10)
	 */
	async getRainAnalytics(days = 30, topRainersLimit = 10): Promise<RainEventAnalytics> {
		const now = new Date();
		const startDate = subDays(startOfDay(now), days);

		// Get summary statistics
		const summaryResult = await db
			.select({
				totalRainEvents: count(rainEvents.id),
				totalRainVolume: sum(rainEvents.amount),
				uniqueRainers: sql<number>`COUNT(DISTINCT ${rainEvents.userId})`,
				// Estimate unique recipients from transactions table
				uniqueRecipients: sql<number>`(
        SELECT COUNT(DISTINCT t.to_user_id) 
        FROM transactions t 
        WHERE t.type = 'RAIN' AND t.from_user_id IN (
          SELECT DISTINCT user_id FROM rain_events
        )
      )`
			})
			.from(rainEvents);

		// Get daily volume for time series
		const dailyVolumeResult = await db
			.select({
				date: sql<string>`DATE_TRUNC('day', ${rainEvents.createdAt})::text`,
				amount: sum(rainEvents.amount),
				eventCount: count(rainEvents.id)
			})
			.from(rainEvents)
			.where(between(rainEvents.createdAt, startDate, now))
			.groupBy(sql`DATE_TRUNC('day', ${rainEvents.createdAt})`)
			.orderBy(sql`DATE_TRUNC('day', ${rainEvents.createdAt})`);

		// Fill in missing dates
		const dailyVolume = this.fillMissingDates(dailyVolumeResult, days);

		// Get top rainers
		const topRainers = await db
			.select({
				userId: rainEvents.userId,
				username: users.username,
				avatarUrl: users.avatarUrl,
				totalAmount: sum(rainEvents.amount),
				eventCount: count(rainEvents.id)
			})
			.from(rainEvents)
			.leftJoin(users, eq(rainEvents.userId, users.id))
			.groupBy(rainEvents.userId, users.username, users.avatarUrl)
			.orderBy(desc(sum(rainEvents.amount)))
			.limit(topRainersLimit);

		// Get currency distribution
		const currencyDistribution = await db
			.select({
				currency: rainEvents.currency,
				amount: sum(rainEvents.amount)
			})
			.from(rainEvents)
			.groupBy(rainEvents.currency);

		// Calculate total for percentages
		const totalAmount = currencyDistribution.reduce((acc, curr) => acc + Number(curr.amount), 0);

		// Add percentage to currency distribution
		const currencyDistributionWithPercentage = currencyDistribution.map((item) => ({
			currency: item.currency,
			amount: Number(item.amount),
			percentage: totalAmount > 0 ? (Number(item.amount) / totalAmount) * 100 : 0
		}));

		// Get average rain amount
		const averageRainAmount =
			summaryResult[0].totalRainVolume && summaryResult[0].totalRainEvents
				? Number(summaryResult[0].totalRainVolume) / Number(summaryResult[0].totalRainEvents)
				: 0;

		return {
			totalRainEvents: Number(summaryResult[0].totalRainEvents || 0),
			totalRainVolume: Number(summaryResult[0].totalRainVolume || 0),
			uniqueRainers: Number(summaryResult[0].uniqueRainers || 0),
			uniqueRecipients: Number(summaryResult[0].uniqueRecipients || 0),
			averageRainAmount,
			dailyVolume,
			topRainers,
			currencyDistribution: currencyDistributionWithPercentage,
			lastUpdated: new Date().toISOString()
		};
	}

	/**
	 * Fill in missing dates in the time series data
	 */
	private fillMissingDates(
		data: { date: string; amount: any; eventCount: any }[],
		days: number
	): { date: string; amount: number; eventCount: number }[] {
		const result: { date: string; amount: number; eventCount: number }[] = [];
		const dataMap = new Map(data.map((item) => [item.date.split('T')[0], item]));

		// Create an array of all dates in the range
		for (let i = days; i >= 0; i--) {
			const date = format(subDays(new Date(), i), 'yyyy-MM-dd');
			const entry = dataMap.get(date);

			result.push({
				date,
				amount: entry ? Number(entry.amount) : 0,
				eventCount: entry ? Number(entry.eventCount) : 0
			});
		}

		return result;
	}
}

export const rainAnalyticsService = new RainAnalyticsService();
