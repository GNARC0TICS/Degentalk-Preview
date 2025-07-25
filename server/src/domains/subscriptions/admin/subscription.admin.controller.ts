import { userService } from '@core/services/user.service';
/**
 * Admin Subscription Controller
 *
 * Admin interface for managing subscriptions, cosmetic drops, and subscription analytics
 */

import type { Request, Response } from 'express';
import { subscriptionService } from '../../../subscriptions/subscription.service';
import { logger } from '@core/logger';
import { db } from '@db';
import { subscriptions, cosmeticDrops, users } from '@schema';
import { eq, sql, desc, count, sum } from 'drizzle-orm';
import { sendSuccessResponse, sendErrorResponse } from '@core/utils/transformer.helpers';

export class AdminSubscriptionController {
	/**
	 * Get subscription analytics
	 * GET /api/admin/subscriptions/analytics
	 */
	async getSubscriptionAnalytics(req: Request, res: Response): Promise<void> {
		try {
			// Get subscription statistics
			const [
				totalSubscriptions,
				vipPassCount,
				degenPassCount,
				activeSubscriptions,
				monthlyRevenue,
				cosmeticDropStats
			] = await Promise.all([
				// Total subscriptions
				db
					.select({ count: sql<number>`COUNT(*)` })
					.from(subscriptions)
					.where(eq(subscriptions.isDeleted, false)),

				// VIP Pass count
				db
					.select({ count: sql<number>`COUNT(*)` })
					.from(subscriptions)
					.where(sql`${subscriptions.type} = 'vip_pass' AND ${subscriptions.isDeleted} = false`),

				// Degen Pass count
				db
					.select({ count: sql<number>`COUNT(*)` })
					.from(subscriptions)
					.where(sql`${subscriptions.type} = 'degen_pass' AND ${subscriptions.isDeleted} = false`),

				// Active subscriptions
				db
					.select({ count: sql<number>`COUNT(*)` })
					.from(subscriptions)
					.where(
						sql`${subscriptions.status} IN ('active', 'lifetime') AND ${subscriptions.isDeleted} = false`
					),

				// Monthly revenue (current month)
				db
					.select({ revenue: sql<number>`SUM(${subscriptions.pricePaid})` })
					.from(subscriptions)
					.where(
						sql`EXTRACT(MONTH FROM ${subscriptions.createdAt}) = EXTRACT(MONTH FROM CURRENT_DATE) 
                        AND EXTRACT(YEAR FROM ${subscriptions.createdAt}) = EXTRACT(YEAR FROM CURRENT_DATE)
                        AND ${subscriptions.isDeleted} = false`
					),

				// Cosmetic drop statistics
				db
					.select({
						totalDrops: sql<number>`COUNT(*)`,
						totalValue: sql<number>`SUM(${cosmeticDrops.cosmeticValue})`
					})
					.from(cosmeticDrops)
			]);

			const analytics = {
				subscriptions: {
					total: totalSubscriptions[0]?.count || 0,
					vip_pass: vipPassCount[0]?.count || 0,
					degen_pass: degenPassCount[0]?.count || 0,
					active: activeSubscriptions[0]?.count || 0
				},
				revenue: {
					monthly: monthlyRevenue[0]?.revenue || 0,
					currency: 'DGT'
				},
				cosmetics: {
					totalDrops: cosmeticDropStats[0]?.totalDrops || 0,
					totalValue: cosmeticDropStats[0]?.totalValue || 0
				}
			};

			sendSuccessResponse(res, {
				success: true,
				data: { analytics }
			});
		} catch (error) {
			logger.error('ADMIN_SUBSCRIPTION', 'Error getting analytics:', error);
			sendErrorResponse(res, 'Failed to retrieve subscription analytics', 500);
		}
	}

	/**
	 * Get all subscriptions with pagination
	 * GET /api/admin/subscriptions
	 */
	async getAllSubscriptions(req: Request, res: Response): Promise<void> {
		try {
			const page = parseInt(req.query.page as string) || 1;
			const limit = parseInt(req.query.limit as string) || 50;
			const status = req.query.status as string;
			const type = req.query.type as string;

			const offset = (page - 1) * limit;

			// Build where conditions
			const whereConditions = [eq(subscriptions.isDeleted, false)];

			if (status) {
				whereConditions.push(eq(subscriptions.status, status));
			}

			if (type) {
				whereConditions.push(eq(subscriptions.type, type));
			}

			// Get subscriptions with user information
			const results = await db
				.select({
					subscription: subscriptions,
					user: {
						id: users.id,
						username: users.username,
						email: users.email
					}
				})
				.from(subscriptions)
				.leftJoin(users, eq(subscriptions.userId, users.id))
				.where(sql`${whereConditions.join(' AND ')}`)
				.orderBy(desc(subscriptions.createdAt))
				.limit(limit)
				.offset(offset);

			// Get total count
			const [totalCount] = await db
				.select({ count: sql<number>`COUNT(*)` })
				.from(subscriptions)
				.where(sql`${whereConditions.join(' AND ')}`);

			sendSuccessResponse(res, {
				success: true,
				data: {
					subscriptions: results,
					pagination: {
						page,
						limit,
						total: totalCount?.count || 0,
						pages: Math.ceil((totalCount?.count || 0) / limit)
					}
				}
			});
		} catch (error) {
			logger.error('ADMIN_SUBSCRIPTION', 'Error getting all subscriptions:', error);
			sendErrorResponse(res, 'Failed to retrieve subscriptions', 500);
		}
	}

	/**
	 * Process monthly cosmetic drops manually
	 * POST /api/admin/subscriptions/process-cosmetics
	 */
	async processMonthlyCosmetics(req: Request, res: Response): Promise<void> {
		try {
			const results = await subscriptionService.processMonthlyCosmetics();

			sendSuccessResponse(res, {
				success: true,
				data: {
					results,
					message: `Cosmetic drops processed: ${results.processed} successful, ${results.failed} failed`
				}
			});
		} catch (error) {
			logger.error('ADMIN_SUBSCRIPTION', 'Error processing cosmetics:', error);
			sendErrorResponse(res, 'Failed to process monthly cosmetic drops', 500);
		}
	}

	/**
	 * Get cosmetic drop history with pagination
	 * GET /api/admin/subscriptions/cosmetic-drops
	 */
	async getCosmeticDropHistory(req: Request, res: Response): Promise<void> {
		try {
			const page = parseInt(req.query.page as string) || 1;
			const limit = parseInt(req.query.limit as string) || 50;
			const month = parseInt(req.query.month as string);
			const year = parseInt(req.query.year as string);

			const offset = (page - 1) * limit;

			// Build where conditions
			const whereConditions = [];

			if (month && year) {
				whereConditions.push(eq(cosmeticDrops.dropMonth, month));
				whereConditions.push(eq(cosmeticDrops.dropYear, year));
			}

			// Get cosmetic drops with user information
			const results = await db
				.select({
					drop: cosmeticDrops,
					user: {
						id: users.id,
						username: users.username
					}
				})
				.from(cosmeticDrops)
				.leftJoin(users, eq(cosmeticDrops.userId, users.id))
				.where(whereConditions.length > 0 ? sql`${whereConditions.join(' AND ')}` : undefined)
				.orderBy(desc(cosmeticDrops.createdAt))
				.limit(limit)
				.offset(offset);

			// Get total count
			const [totalCount] = await db
				.select({ count: sql<number>`COUNT(*)` })
				.from(cosmeticDrops)
				.where(whereConditions.length > 0 ? sql`${whereConditions.join(' AND ')}` : undefined);

			sendSuccessResponse(res, {
				success: true,
				data: {
					drops: results,
					pagination: {
						page,
						limit,
						total: totalCount?.count || 0,
						pages: Math.ceil((totalCount?.count || 0) / limit)
					}
				}
			});
		} catch (error) {
			logger.error('ADMIN_SUBSCRIPTION', 'Error getting cosmetic drops:', error);
			sendErrorResponse(res, 'Failed to retrieve cosmetic drop history', 500);
		}
	}

	/**
	 * Cancel a subscription (admin override)
	 * POST /api/admin/subscriptions/:id/cancel
	 */
	async cancelSubscription(req: Request, res: Response): Promise<void> {
		try {
			const { id } = req.params;
			const { reason } = req.body;
			const adminUserId = userService.getUserFromRequest(req)?.id;

			const subscriptionId = id;
			if (isNaN(subscriptionId)) {
				sendErrorResponse(res, 'Valid subscription ID required', 400);
				return;
			}

			// Get subscription details
			const subscription = await db
				.select()
				.from(subscriptions)
				.where(eq(subscriptions.id, subscriptionId))
				.limit(1);

			if (subscription.length === 0) {
				sendErrorResponse(res, 'Subscription not found', 404);
				return;
			}

			// Cancel the subscription (admin override - can cancel VIP Pass)
			await db
				.update(subscriptions)
				.set({
					status: 'cancelled',
					autoRenew: false,
					notes: `Admin cancellation by ${adminUserId}: ${reason || 'No reason provided'}`,
					updatedAt: new Date()
				})
				.where(eq(subscriptions.id, subscriptionId));

			logger.info(
				'ADMIN_SUBSCRIPTION',
				`Subscription ${subscriptionId} cancelled by admin ${adminUserId}: ${reason}`
			);

			sendSuccessResponse(res, {
				success: true,
				data: {
					message: 'Subscription cancelled successfully'
				}
			});
		} catch (error) {
			logger.error('ADMIN_SUBSCRIPTION', 'Error cancelling subscription:', error);
			sendErrorResponse(res, 'Failed to cancel subscription', 500);
		}
	}

	/**
	 * Grant subscription to user (admin action)
	 * POST /api/admin/subscriptions/grant
	 */
	async grantSubscription(req: Request, res: Response): Promise<void> {
		try {
			const { userId, type, reason } = req.body;
			const adminUserId = userService.getUserFromRequest(req)?.id;

			if (!userId || !type || !['vip_pass', 'degen_pass'].includes(type)) {
				sendErrorResponse(res, 'Valid userId and subscription type required', 400);
				return;
			}

			// Check if user already has this subscription type
			const existingSubscription = await subscriptionService.getUserActiveSubscription(
				userId,
				type
			);
			if (existingSubscription) {
				sendErrorResponse(res, `User already has an active ${type.replace('_', ' ')} subscription`);
				return;
			}

			// Grant the subscription
			const endDate = type === 'vip_pass' ? null : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
			const nextBillingDate = type === 'vip_pass' ? null : endDate;
			const status = type === 'vip_pass' ? 'lifetime' : 'active';

			const [subscription] = await db
				.insert(subscriptions)
				.values({
					userId,
					type,
					status,
					pricePaid: 0, // Admin granted - no payment
					currency: 'DGT',
					startDate: new Date(),
					endDate,
					nextBillingDate,
					autoRenew: type === 'degen_pass',
					benefits: subscriptionService['getDefaultBenefits'](type),
					metadata: {
						grantedBy: adminUserId,
						grantReason: reason || 'Admin grant',
						source: 'admin_grant'
					},
					notes: `Admin grant by ${adminUserId}: ${reason || 'No reason provided'}`
				})
				.returning();

			logger.info(
				'ADMIN_SUBSCRIPTION',
				`${type} granted to user ${userId} by admin ${adminUserId}: ${reason}`
			);

			sendSuccessResponse(res, {
				success: true,
				data: {
					subscription,
					message: `${type.replace('_', ' ')} granted successfully`
				}
			});
		} catch (error) {
			logger.error('ADMIN_SUBSCRIPTION', 'Error granting subscription:', error);
			sendErrorResponse(res, 'Failed to grant subscription', 500);
		}
	}
}

export const adminSubscriptionController = new AdminSubscriptionController();
