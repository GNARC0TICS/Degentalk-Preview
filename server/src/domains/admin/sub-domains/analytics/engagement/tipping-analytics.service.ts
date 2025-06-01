/**
 * Tipping Analytics Service
 * 
 * Provides analytics data about tipping activity for the admin dashboard
 */

import { db } from '../../../../../../db';
import { transactions, users, postTips } from '@shared/schema';
import { sql, desc, eq, count, sum, and, between, isNotNull } from 'drizzle-orm';
import { startOfDay, subDays, format } from 'date-fns';

export interface TippingAnalytics {
  // Summary statistics
  totalTips: number;
  totalTipVolume: number;
  uniqueTippers: number;
  uniqueRecipients: number;
  averageTipAmount: number;
  
  // Time-based metrics
  dailyVolume: {
    date: string;
    amount: number;
    tipCount: number;
  }[];
  
  // Top tippers
  topTippers: {
    userId: number;
    username: string;
    avatarUrl: string | null;
    totalAmount: number;
    tipCount: number;
  }[];
  
  // Top recipients
  topRecipients: {
    userId: number;
    username: string;
    avatarUrl: string | null;
    totalReceived: number;
    tipCount: number;
  }[];
  
  // Currency distribution
  currencyDistribution: {
    currency: string;
    amount: number;
    percentage: number;
  }[];

  // Context distribution (posts, shoutbox, etc.)
  contextDistribution: {
    context: string;
    tipCount: number;
    percentage: number;
  }[];
  
  // Last updated timestamp
  lastUpdated: string;
}

class TippingAnalyticsService {
  /**
   * Get comprehensive tipping analytics
   * @param days Number of days to include in time-series data (default: 30)
   * @param topLimit Number of top users to include (default: 10)
   */
  async getTippingAnalytics(days = 30, topLimit = 10): Promise<TippingAnalytics> {
    const now = new Date();
    const startDate = subDays(startOfDay(now), days);
    
    // Get summary statistics
    const summaryResult = await db.select({
      totalTips: count(transactions.id),
      totalTipVolume: sum(transactions.amount),
      uniqueTippers: sql<number>`COUNT(DISTINCT ${transactions.fromUserId})`,
      uniqueRecipients: sql<number>`COUNT(DISTINCT ${transactions.toUserId})`
    })
    .from(transactions)
    .where(
      and(
        eq(transactions.type, 'TIP'),
        isNotNull(transactions.fromUserId),
        isNotNull(transactions.toUserId),
        between(transactions.createdAt, startDate, now)
      )
    );
    
    // Get daily volume for time series
    const dailyVolumeResult = await db.select({
      date: sql<string>`DATE_TRUNC('day', ${transactions.createdAt})::text`,
      amount: sum(transactions.amount),
      tipCount: count(transactions.id)
    })
    .from(transactions)
    .where(
      and(
        eq(transactions.type, 'TIP'),
        between(transactions.createdAt, startDate, now)
      )
    )
    .groupBy(sql`DATE_TRUNC('day', ${transactions.createdAt})`)
    .orderBy(sql`DATE_TRUNC('day', ${transactions.createdAt})`);
    
    // Fill in missing dates
    const dailyVolume = this.fillMissingDates(dailyVolumeResult, days);
    
    // Get top tippers
    const topTippers = await db.select({
      userId: transactions.fromUserId,
      username: users.username,
      avatarUrl: users.avatarUrl,
      totalAmount: sum(transactions.amount),
      tipCount: count(transactions.id)
    })
    .from(transactions)
    .leftJoin(users, eq(transactions.fromUserId, users.id))
    .where(
      and(
        eq(transactions.type, 'TIP'),
        isNotNull(transactions.fromUserId),
        between(transactions.createdAt, startDate, now)
      )
    )
    .groupBy(transactions.fromUserId, users.username, users.avatarUrl)
    .orderBy(desc(sum(transactions.amount)))
    .limit(topLimit);
    
    // Get top recipients
    const topRecipients = await db.select({
      userId: transactions.toUserId,
      username: users.username,
      avatarUrl: users.avatarUrl,
      totalReceived: sum(transactions.amount),
      tipCount: count(transactions.id)
    })
    .from(transactions)
    .leftJoin(users, eq(transactions.toUserId, users.id))
    .where(
      and(
        eq(transactions.type, 'TIP'),
        isNotNull(transactions.toUserId),
        between(transactions.createdAt, startDate, now)
      )
    )
    .groupBy(transactions.toUserId, users.username, users.avatarUrl)
    .orderBy(desc(sum(transactions.amount)))
    .limit(topLimit);
    
    // Get currency distribution
    const currencyResult = await db.select({
      currency: sql<string>`COALESCE(${transactions.metadata}->>'currency', 'DGT')`,
      amount: sum(transactions.amount)
    })
    .from(transactions)
    .where(
      and(
        eq(transactions.type, 'TIP'),
        between(transactions.createdAt, startDate, now)
      )
    )
    .groupBy(sql`COALESCE(${transactions.metadata}->>'currency', 'DGT')`);
    
    // Calculate total for percentages
    const totalAmount = currencyResult.reduce((acc, curr) => acc + Number(curr.amount), 0);
    
    // Add percentage to currency distribution
    const currencyDistribution = currencyResult.map(item => ({
      currency: item.currency,
      amount: Number(item.amount),
      percentage: totalAmount > 0 ? Number(item.amount) / totalAmount * 100 : 0
    }));
    
    // Get context distribution (post tips, shoutbox tips, etc.)
    const contextResult = await db.select({
      context: sql<string>`COALESCE(${transactions.metadata}->>'source', 'unknown')`,
      tipCount: count(transactions.id)
    })
    .from(transactions)
    .where(
      and(
        eq(transactions.type, 'TIP'),
        between(transactions.createdAt, startDate, now)
      )
    )
    .groupBy(sql`COALESCE(${transactions.metadata}->>'source', 'unknown')`);
    
    // Calculate total for percentages
    const totalTips = contextResult.reduce((acc, curr) => acc + Number(curr.tipCount), 0);
    
    // Add percentage to context distribution
    const contextDistribution = contextResult.map(item => ({
      context: this.formatContextName(item.context),
      tipCount: Number(item.tipCount),
      percentage: totalTips > 0 ? Number(item.tipCount) / totalTips * 100 : 0
    }));
    
    // Get average tip amount
    const averageTipAmount = summaryResult[0].totalTipVolume && summaryResult[0].totalTips 
      ? Number(summaryResult[0].totalTipVolume) / Number(summaryResult[0].totalTips)
      : 0;
    
    return {
      totalTips: Number(summaryResult[0].totalTips || 0),
      totalTipVolume: Number(summaryResult[0].totalTipVolume || 0),
      uniqueTippers: Number(summaryResult[0].uniqueTippers || 0),
      uniqueRecipients: Number(summaryResult[0].uniqueRecipients || 0),
      averageTipAmount,
      dailyVolume,
      topTippers,
      topRecipients,
      currencyDistribution,
      contextDistribution,
      lastUpdated: new Date().toISOString()
    };
  }
  
  /**
   * Fill in missing dates in the time series data
   */
  private fillMissingDates(data: { date: string; amount: any; tipCount: any }[], days: number): { date: string; amount: number; tipCount: number }[] {
    const result: { date: string; amount: number; tipCount: number }[] = [];
    const dataMap = new Map(data.map(item => [item.date.split('T')[0], item]));
    
    // Create an array of all dates in the range
    for (let i = days; i >= 0; i--) {
      const date = format(subDays(new Date(), i), 'yyyy-MM-dd');
      const entry = dataMap.get(date);
      
      result.push({
        date,
        amount: entry ? Number(entry.amount) : 0,
        tipCount: entry ? Number(entry.tipCount) : 0
      });
    }
    
    return result;
  }
  
  /**
   * Format context names for better readability
   */
  private formatContextName(context: string): string {
    switch (context.toLowerCase()) {
      case 'post':
        return 'Forum Posts';
      case 'shoutbox':
        return 'Shoutbox';
      case 'forum':
        return 'Forum Posts';
      case 'profile':
        return 'User Profiles';
      case 'thread':
        return 'Forum Threads';
      case 'comment':
        return 'Comments';
      default:
        // Capitalize first letter of each word
        return context.split('_')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
    }
  }
}

export const tippingAnalyticsService = new TippingAnalyticsService(); 