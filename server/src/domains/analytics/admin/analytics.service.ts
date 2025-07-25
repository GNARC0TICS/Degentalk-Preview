/**
 * Admin Analytics Service
 *
 * Handles business logic for generating platform analytics.
 */

import { NotFoundError, ValidationError } from '@core/errors';
import type { AnalyticsPeriodInput, AnalyticsQueryInput } from './analytics.validators';
import { subDays, formatISO } from 'date-fns';
import { logger } from '@core/logger';
import { analyticsRepository, type DateRange } from '../repositories/analytics.repository';

// Helper to get date range based on period or explicit dates
function getDateRange(params: AnalyticsPeriodInput): DateRange {
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
		const dateRange = { startDateSQL, endDateSQL };
		try {
			const totalUsers = await analyticsRepository.getTotalUsersCount();
			const newUsers = await analyticsRepository.getNewUsersCount(dateRange);
			const activeUsers = await analyticsRepository.getActiveUsersCount(dateRange);
			const totalThreads = await analyticsRepository.getTotalThreadsCount();
			const newThreads = await analyticsRepository.getNewThreadsCount(dateRange);
			const totalPosts = await analyticsRepository.getTotalPostsCount();
			const newPosts = await analyticsRepository.getNewPostsCount(dateRange);
			const totalReactions = await analyticsRepository.getTotalReactionsCount();
			const totalTipAmount = await analyticsRepository.getTotalTipAmount();
			const shoutboxMessageCount = await analyticsRepository.getShoutboxMessageCount();

			return {
				users: {
					total: totalUsers,
					newInPeriod: newUsers,
					activeInPeriod: activeUsers
				},
				content: {
					totalThreads: totalThreads,
					newThreadsInPeriod: newThreads,
					totalPosts: totalPosts,
					newPostsInPeriod: newPosts
				},
				engagement: {
					totalReactions: totalReactions,
					totalTipAmountDGT: totalTipAmount / 1000000, // Assuming DGT has 6 decimals
					shoutboxMessageCount: shoutboxMessageCount
				},
				period: {
					startDate: startDateSQL,
					endDate: endDateSQL,
					periodUsed: params.period || 'custom'
				}
			};
		} catch (error: any) {
			logger.error('Error fetching overview stats:', error);
			throw new ValidationError('Failed to fetch overview statistics', {
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

		const dateRange = { startDateSQL, endDateSQL };
		try {
			return await analyticsRepository.getUserGrowthData(dateRange, dateFormat);
		} catch (error: any) {
			logger.error('Error fetching user growth data:', error);
			throw new ValidationError('Failed to fetch user growth data', {
				originalError: error.message
			});
		}
	}

	async getMostActiveThreads(params: AnalyticsQueryInput) {
		const { limit } = params;
		const { startDateSQL, endDateSQL } = getDateRange(params);
		const dateRange = { startDateSQL, endDateSQL };
		try {
			return await analyticsRepository.getMostActiveThreads(dateRange, limit || 10);
		} catch (error: any) {
			logger.error('Error fetching most active threads:', error);
			throw new ValidationError('Failed to fetch most active threads', {
				originalError: error.message
			});
		}
	}
}

export const adminAnalyticsService = new AdminAnalyticsService();
