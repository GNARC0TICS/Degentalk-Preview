/**
 * Admin Treasury Controller
 *
 * Handles API requests for treasury-related admin operations.
 */

import { Request, Response } from 'express';
import { adminTreasuryService } from './treasury.service';
import { AdminError, AdminErrorCodes } from '../../admin.errors';
import { getUserId } from '../../admin.middleware';
import { adminController } from '../../admin.controller';
import {
	TreasuryDepositSchema,
	TreasuryWithdrawalSchema,
	TreasurySettingsUpdateSchema,
	MassAirdropSchema,
	TreasuryDepositInput,
	TreasuryWithdrawalInput,
	TreasurySettingsUpdateInput,
	MassAirdropInput
} from './treasury.validators';

export class AdminTreasuryController {
	async getDgtSupplyStats(req: Request, res: Response) {
		try {
			const stats = await adminTreasuryService.getDgtSupplyStats();
			res.json(stats);
		} catch (error) {
			if (error instanceof AdminError) {
				return res.status(error.httpStatus).json({ error: error.message, code: error.code });
			}
			res.status(500).json({ error: 'Failed to get DGT supply statistics' });
		}
	}

	async sendFromTreasury(req: Request, res: Response) {
		try {
			const validation = TreasuryDepositSchema.safeParse(req.body);
			if (!validation.success) {
				throw new AdminError(
					'Invalid input',
					400,
					AdminErrorCodes.VALIDATION_ERROR,
					validation.error.format()
				);
			}
			const adminId = getUserId(req);
			const result = await adminTreasuryService.sendFromTreasury(validation.data, adminId);

			await adminController.logAction(
				req,
				'TREASURY_SEND',
				'treasury',
				validation.data.userId.toString(),
				{
					amount: validation.data.amount,
					recipientUserId: validation.data.userId,
					description: validation.data.description
				}
			);
			res.json({ message: 'DGT sent from treasury successfully', data: result });
		} catch (error) {
			if (error instanceof AdminError) {
				return res
					.status(error.httpStatus)
					.json({ error: error.message, code: error.code, details: error.details });
			}
			res.status(500).json({ error: 'Failed to send DGT from treasury' });
		}
	}

	async recoverToTreasury(req: Request, res: Response) {
		try {
			const validation = TreasuryWithdrawalSchema.safeParse(req.body);
			if (!validation.success) {
				throw new AdminError(
					'Invalid input',
					400,
					AdminErrorCodes.VALIDATION_ERROR,
					validation.error.format()
				);
			}
			const adminId = getUserId(req);
			const result = await adminTreasuryService.recoverToTreasury(validation.data, adminId);

			await adminController.logAction(
				req,
				'TREASURY_RECOVER',
				'treasury',
				validation.data.userId.toString(),
				{
					amount: validation.data.amount,
					sourceUserId: validation.data.userId,
					description: validation.data.description
				}
			);
			res.json({ message: 'DGT recovered to treasury successfully', data: result });
		} catch (error) {
			if (error instanceof AdminError) {
				return res
					.status(error.httpStatus)
					.json({ error: error.message, code: error.code, details: error.details });
			}
			res.status(500).json({ error: 'Failed to recover DGT to treasury' });
		}
	}

	async massAirdrop(req: Request, res: Response) {
		try {
			const validation = MassAirdropSchema.safeParse(req.body);
			if (!validation.success) {
				throw new AdminError(
					'Invalid input for mass airdrop',
					400,
					AdminErrorCodes.VALIDATION_ERROR,
					validation.error.format()
				);
			}
			const adminId = getUserId(req);
			const result = await adminTreasuryService.massAirdrop(validation.data, adminId);

			await adminController.logAction(req, 'TREASURY_MASS_AIRDROP', 'treasury', 'multiple_users', {
				amountPerUser: validation.data.amountPerUser,
				userCount: validation.data.userIds.length,
				reason: validation.data.reason,
				successfulAirdrops: result.airdropResults.filter((r) => r.status === 'success').length,
				failedAirdrops: result.airdropResults.filter((r) => r.status === 'failed').length,
				missingUserIds: result.missingUserIds
			});
			res.json({ message: 'Mass airdrop process completed.', data: result });
		} catch (error) {
			if (error instanceof AdminError) {
				return res
					.status(error.httpStatus)
					.json({ error: error.message, code: error.code, details: error.details });
			}
			res.status(500).json({ error: 'Failed to process mass airdrop' });
		}
	}

	async getTreasurySettings(req: Request, res: Response) {
		try {
			const settings = await adminTreasuryService.getTreasurySettings();
			if (!settings) {
				throw new AdminError('Treasury settings not found.', 404, AdminErrorCodes.NOT_FOUND);
			}
			res.json(settings);
		} catch (error) {
			if (error instanceof AdminError) {
				return res.status(error.httpStatus).json({ error: error.message, code: error.code });
			}
			res.status(500).json({ error: 'Failed to get treasury settings' });
		}
	}

	async updateTreasurySettings(req: Request, res: Response) {
		try {
			const validation = TreasurySettingsUpdateSchema.safeParse(req.body);
			if (!validation.success) {
				throw new AdminError(
					'Invalid settings data',
					400,
					AdminErrorCodes.VALIDATION_ERROR,
					validation.error.format()
				);
			}
			const adminId = getUserId(req);
			const result = await adminTreasuryService.updateTreasurySettings(validation.data, adminId);

			await adminController.logAction(
				req,
				'TREASURY_SETTINGS_UPDATE',
				'treasury_settings',
				'general',
				{
					updatedSettings: validation.data
				}
			);
			res.json({ message: 'Treasury settings updated successfully', data: result });
		} catch (error) {
			if (error instanceof AdminError) {
				return res
					.status(error.httpStatus)
					.json({ error: error.message, code: error.code, details: error.details });
			}
			res.status(500).json({ error: 'Failed to update treasury settings' });
		}
	}
}

export const adminTreasuryController = new AdminTreasuryController();
