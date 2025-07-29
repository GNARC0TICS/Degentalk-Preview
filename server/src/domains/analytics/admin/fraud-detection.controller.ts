/**
 * Fraud Detection Controller
 *
 * Handles fraud detection and suspicious activity monitoring endpoints
 */

import type { Request, Response } from 'express';
import { fraudDetectionService } from './fraud-detection.service';
import { formatAdminResponse, AdminOperationBoundary } from '../../admin/shared';
import { AdminError, AdminErrorCodes } from '../../admin/admin.errors';
import { getUser } from '@core/utils/auth.helpers';
import { z } from 'zod';

// Validation schemas
const fraudAlertsQuerySchema = z.object({
	status: z.enum(['active', 'investigating', 'resolved', 'false_positive']).optional(),
	limit: z.coerce.number().min(1).max(100).default(50),
	offset: z.coerce.number().min(0).default(0)
});

const resolveAlertSchema = z.object({
	alertId: z.string(),
	status: z.enum(['resolved', 'false_positive']),
	notes: z.string().optional()
});

const analyzeUserSchema = z.object({
	userId: z.string()
});

const updateSettingsSchema = z.object({
	transactionVelocityThreshold: z.number().min(1).max(1000).optional(),
	multipleAccountThreshold: z.number().min(1).max(10).optional(),
	xpGainThreshold: z.number().min(100).max(10000).optional(),
	referralFraudThreshold: z.number().min(1).max(20).optional(),
	enableAutoSuspension: z.boolean().optional(),
	autoSuspensionThreshold: z.number().min(50).max(100).optional()
});

const suspiciousUsersQuerySchema = z.object({
	limit: z.coerce.number().min(1).max(100).default(50),
	minRiskScore: z.coerce.number().min(0).max(100).default(30)
});

export class FraudDetectionController {
	/**
	 * GET /api/admin/fraud/alerts
	 * Get fraud detection alerts
	 */
	async getFraudAlerts(req: Request, res: Response) {
		const boundary = new AdminOperationBoundary({
			operation: 'GET_FRAUD_ALERTS',
			entityType: 'fraud_detection',
			timestamp: new Date()
		});

		return boundary.execute(async () => {
			const query = fraudAlertsQuerySchema.parse(req.query);
			const alerts = await fraudDetectionService.getFraudAlerts(query.status);

			// Apply pagination
			const paginatedAlerts = alerts.slice(query.offset, query.offset + query.limit);

			return formatAdminResponse(
				{
					alerts: paginatedAlerts,
					total: alerts.length,
					pagination: {
						limit: query.limit,
						offset: query.offset,
						hasMore: query.offset + query.limit < alerts.length
					},
					timestamp: new Date().toISOString()
				},
				'GET_FRAUD_ALERTS',
				'fraud_detection'
			);
		});
	}

	/**
	 * GET /api/admin/fraud/metrics
	 * Get fraud detection metrics
	 */
	async getFraudMetrics(req: Request, res: Response) {
		const boundary = new AdminOperationBoundary({
			operation: 'GET_FRAUD_METRICS',
			entityType: 'fraud_detection',
			timestamp: new Date()
		});

		return boundary.execute(async () => {
			const metrics = await fraudDetectionService.getFraudMetrics();

			return formatAdminResponse(
				{
					metrics,
					timestamp: new Date().toISOString()
				},
				'GET_FRAUD_METRICS',
				'fraud_detection'
			);
		});
	}

	/**
	 * POST /api/admin/fraud/analyze-user
	 * Analyze specific user for suspicious activity
	 */
	async analyzeUser(req: Request, res: Response) {
		const boundary = new AdminOperationBoundary({
			operation: 'ANALYZE_USER_FRAUD',
			entityType: 'fraud_detection',
			timestamp: new Date()
		});

		return boundary.execute(async () => {
			const { userId } = analyzeUserSchema.parse(req.body);
			const analysis = await fraudDetectionService.analyzeUser(userId);

			if (!analysis) {
				throw new AdminError('User not found or no suspicious activity detected', 404, AdminErrorCodes.NOT_FOUND);
			}

			return formatAdminResponse(
				{
					analysis,
					timestamp: new Date().toISOString()
				},
				'ANALYZE_USER_FRAUD',
				'fraud_detection'
			);
		});
	}

	/**
	 * POST /api/admin/fraud/resolve-alert
	 * Resolve a fraud alert
	 */
	async resolveAlert(req: Request, res: Response) {
		const boundary = new AdminOperationBoundary({
			operation: 'RESOLVE_FRAUD_ALERT',
			entityType: 'fraud_detection',
			timestamp: new Date()
		});

		return boundary.execute(async () => {
			const user = getUser(req);
			if (!user) {
				throw new AdminError('Authentication required', 401, AdminErrorCodes.UNAUTHORIZED);
			}

			const { alertId, status, notes } = resolveAlertSchema.parse(req.body);
			const success = await fraudDetectionService.resolveAlert(alertId, status, user.id, notes);

			if (!success) {
				throw new AdminError('Failed to resolve alert', 500, AdminErrorCodes.OPERATION_FAILED);
			}

			return formatAdminResponse(
				{
					success: true,
					alertId,
					resolvedBy: user.id,
					status,
					notes,
					timestamp: new Date().toISOString()
				},
				'RESOLVE_FRAUD_ALERT',
				'fraud_detection'
			);
		});
	}

	/**
	 * POST /api/admin/fraud/scan
	 * Run fraud detection scan
	 */
	async runFraudScan(req: Request, res: Response) {
		const boundary = new AdminOperationBoundary({
			operation: 'RUN_FRAUD_SCAN',
			entityType: 'fraud_detection',
			timestamp: new Date()
		});

		return boundary.execute(async () => {
			const user = getUser(req);
			if (!user) {
				throw new AdminError('Authentication required', 401, AdminErrorCodes.UNAUTHORIZED);
			}

			const scanResults = await fraudDetectionService.runFraudDetectionScan();

			return formatAdminResponse(
				{
					scanResults,
					initiatedBy: user.id,
					timestamp: new Date().toISOString()
				},
				'RUN_FRAUD_SCAN',
				'fraud_detection'
			);
		});
	}

	/**
	 * GET /api/admin/fraud/settings
	 * Get fraud detection settings
	 */
	async getSettings(req: Request, res: Response) {
		const boundary = new AdminOperationBoundary({
			operation: 'GET_FRAUD_SETTINGS',
			entityType: 'fraud_detection',
			timestamp: new Date()
		});

		return boundary.execute(async () => {
			const settings = await fraudDetectionService.getSettings();

			return formatAdminResponse(
				{
					settings,
					timestamp: new Date().toISOString()
				},
				'GET_FRAUD_SETTINGS',
				'fraud_detection'
			);
		});
	}

	/**
	 * PUT /api/admin/fraud/settings
	 * Update fraud detection settings
	 */
	async updateSettings(req: Request, res: Response) {
		const boundary = new AdminOperationBoundary({
			operation: 'UPDATE_FRAUD_SETTINGS',
			entityType: 'fraud_detection',
			timestamp: new Date()
		});

		return boundary.execute(async () => {
			const user = getUser(req);
			if (!user) {
				throw new AdminError('Authentication required', 401, AdminErrorCodes.UNAUTHORIZED);
			}

			const settingsUpdate = updateSettingsSchema.parse(req.body);
			const updatedSettings = await fraudDetectionService.updateSettings(settingsUpdate);

			return formatAdminResponse(
				{
					settings: updatedSettings,
					updatedBy: user.id,
					timestamp: new Date().toISOString()
				},
				'UPDATE_FRAUD_SETTINGS',
				'fraud_detection'
			);
		});
	}

	/**
	 * GET /api/admin/fraud/suspicious-users
	 * Get suspicious users report
	 */
	async getSuspiciousUsers(req: Request, res: Response) {
		const boundary = new AdminOperationBoundary({
			operation: 'GET_SUSPICIOUS_USERS',
			entityType: 'fraud_detection',
			timestamp: new Date()
		});

		return boundary.execute(async () => {
			const query = suspiciousUsersQuerySchema.parse(req.query);
			const suspiciousUsers = await fraudDetectionService.getSuspiciousUsersReport(query.limit);

			// Filter by minimum risk score
			const filteredUsers = suspiciousUsers.filter(user => user.riskScore >= query.minRiskScore);

			return formatAdminResponse(
				{
					users: filteredUsers,
					total: filteredUsers.length,
					filters: {
						limit: query.limit,
						minRiskScore: query.minRiskScore
					},
					timestamp: new Date().toISOString()
				},
				'GET_SUSPICIOUS_USERS',
				'fraud_detection'
			);
		});
	}

	/**
	 * GET /api/admin/fraud/dashboard
	 * Get fraud detection dashboard overview
	 */
	async getDashboard(req: Request, res: Response) {
		const boundary = new AdminOperationBoundary({
			operation: 'GET_FRAUD_DASHBOARD',
			entityType: 'fraud_detection',
			timestamp: new Date()
		});

		return boundary.execute(async () => {
			const [metrics, alerts, suspiciousUsers] = await Promise.all([
				fraudDetectionService.getFraudMetrics(),
				fraudDetectionService.getFraudAlerts('active'),
				fraudDetectionService.getSuspiciousUsersReport(10)
			]);

			const dashboard = {
				overview: {
					activeAlerts: metrics.activeAlerts,
					resolvedAlerts: metrics.resolvedAlerts,
					falsePositives: metrics.falsePositives,
					averageResolutionTime: metrics.averageResolutionTime
				},
				riskDistribution: metrics.riskDistribution,
				topFraudTypes: metrics.topFraudTypes,
				recentAlerts: alerts.slice(0, 5),
				highestRiskUsers: suspiciousUsers.slice(0, 5),
				systemHealth: {
					scanningEnabled: true,
					autoSuspensionEnabled: true,
					lastScanTime: new Date().toISOString()
				}
			};

			return formatAdminResponse(
				{
					dashboard,
					timestamp: new Date().toISOString()
				},
				'GET_FRAUD_DASHBOARD',
				'fraud_detection'
			);
		});
	}
}

// Export controller instance
export const fraudDetectionController = new FraudDetectionController();