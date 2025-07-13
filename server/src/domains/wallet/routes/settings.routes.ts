/**
 * Wallet Settings Routes
 *
 * Admin endpoints for managing wallet configuration with real-time updates
 */

import { Router, type Request, type Response } from 'express';
import { settingsService } from '@core/services/settings.service';
import { logger } from '@core/logger';
import { isAuthenticated } from '@server/domains/auth/middleware/auth.middleware';
import { getAuthenticatedUser } from '@server/utils/request-user';
import { hasPermission } from '@lib/auth/permissions';
import { WalletError, ErrorCodes } from '@core/errors';
import { validateRequest } from '@server/middleware/validate-request';
import { z } from 'zod';

const router = Router();

// Validation schemas
const walletSettingsUpdateSchema = z.object({
	body: z
		.object({
			autoConvertDeposits: z.boolean().optional(),
			manualConversionAllowed: z.boolean().optional(),
			conversionRateBuffer: z.number().min(0).max(0.1).optional(),
			depositsEnabled: z.boolean().optional(),
			withdrawalsEnabled: z.boolean().optional(),
			internalTransfersEnabled: z.boolean().optional()
		})
		.strict()
});

// GET /api/wallet/settings - Get current wallet settings
router.get('/', isAuthenticated, async (req: Request, res: Response) => {
	try {
		const user = getAuthenticatedUser(req);

		// Check read permissions
		if (!hasPermission(user.role, 'economy', 'read')) {
			throw new WalletError(
				'Insufficient permissions to view wallet settings',
				ErrorCodes.FORBIDDEN,
				403
			);
		}

		const settings = await settingsService.getWalletSettings();

		res.json({
			success: true,
			data: settings
		});
	} catch (error) {
		logger.error('Error getting wallet settings', { error });
		res.status(error instanceof WalletError ? error.statusCode : 500).json({
			success: false,
			message: error instanceof Error ? error.message : 'Failed to get wallet settings'
		});
	}
});

// PATCH /api/wallet/settings - Update wallet settings
router.patch(
	'/',
	isAuthenticated,
	validateRequest(walletSettingsUpdateSchema),
	async (req: Request, res: Response) => {
		try {
			const user = getAuthenticatedUser(req);

			// Check write permissions
			if (!hasPermission(user.role, 'economy', 'write')) {
				throw new WalletError(
					'Insufficient permissions to modify wallet settings',
					ErrorCodes.FORBIDDEN,
					403
				);
			}

			const updates = req.body;
			logger.info('Updating wallet settings', { userId: user.id, updates });

			const newSettings = await settingsService.updateWalletSettings(updates);

			// Log admin action
			logger.info('Wallet settings updated by admin', {
				adminId: user.id,
				adminUsername: user.username,
				changes: updates,
				newSettings
			});

			res.json({
				success: true,
				data: newSettings,
				message: 'Wallet settings updated successfully'
			});
		} catch (error) {
			logger.error('Error updating wallet settings', { error });
			res.status(error instanceof WalletError ? error.statusCode : 500).json({
				success: false,
				message: error instanceof Error ? error.message : 'Failed to update wallet settings'
			});
		}
	}
);

// GET /api/wallet/settings/events - Server-sent events for real-time updates
router.get('/events', isAuthenticated, (req: Request, res: Response) => {
	try {
		const user = getAuthenticatedUser(req);

		// Check read permissions
		if (!hasPermission(user.role, 'economy', 'read')) {
			return res.status(403).json({
				success: false,
				message: 'Insufficient permissions to subscribe to wallet settings events'
			});
		}

		// Set SSE headers
		res.writeHead(200, {
			'Content-Type': 'text/event-stream',
			'Cache-Control': 'no-cache',
			Connection: 'keep-alive',
			'Access-Control-Allow-Origin': '*',
			'Access-Control-Allow-Headers': 'Cache-Control'
		});

		// Send initial connection event
		res.write('event: connected\n');
		res.write('data: {"message": "Connected to wallet settings events"}\n\n');

		// Listen for settings updates
		const handleSettingsUpdate = (newSettings: any) => {
			res.write('event: walletSettingsUpdated\n');
			res.write(`data: ${JSON.stringify(newSettings)}\n\n`);
		};

		settingsService.on('walletSettingsUpdated', handleSettingsUpdate);

		// Keep alive ping every 30 seconds
		const keepAlive = setInterval(() => {
			res.write('event: ping\n');
			res.write('data: {"timestamp": "' + new Date().toISOString() + '"}\n\n');
		}, 30000);

		// Cleanup on client disconnect
		req.on('close', () => {
			clearInterval(keepAlive);
			settingsService.removeListener('walletSettingsUpdated', handleSettingsUpdate);
			logger.info('Client disconnected from wallet settings events', { userId: user.id });
		});

		logger.info('Client connected to wallet settings events', { userId: user.id });
	} catch (error) {
		logger.error('Error setting up wallet settings events', { error });
		res.status(500).json({
			success: false,
			message: 'Failed to setup settings events'
		});
	}
});

export default router;
