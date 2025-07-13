import type { Request, Response } from 'express';
import { userService } from '@core/services/user.service';
import { adminTreasuryService } from './treasury.service';
import { AdminError, AdminErrorCodes } from '../../admin.errors';
import { getUserId } from '../../admin.middleware';
import { adminController } from '../../admin.controller';
import {
	TreasuryDepositSchema,
	TreasuryWithdrawalSchema,
	TreasurySettingsUpdateSchema,
	MassAirdropSchema,
	type TreasuryDepositInput,
	type TreasuryWithdrawalInput,
	type TreasurySettingsUpdateInput,
	type MassAirdropInput
} from './treasury.validators';
import { validateRequestBody } from '../../admin.validation';
import { sendSuccessResponse, sendErrorResponse } from '@core/utils/transformer.helpers';

export class AdminTreasuryController {
	async getDgtSupplyStats(req: Request, res: Response) {
		try {
			const stats = await adminTreasuryService.getDgtSupplyStats();
			sendSuccessResponse(res, stats);
		} catch (error) {
			if (error instanceof AdminError) {
				return sendErrorResponse(res, error.message, error.httpStatus);
			}
			return sendErrorResponse(res, 'Failed to get DGT supply statistics', 400);
		}
	}

	async sendFromTreasury(req: Request, res: Response) {
		try {
			const data = validateRequestBody(req, res, TreasuryDepositSchema);
			if (!data) return;
			const adminId = userService.getUserFromRequest(req);
			const result = await adminTreasuryService.sendFromTreasury(data, adminId);

			await adminController.logAction(req, 'TREASURY_SEND', 'treasury', data.userId.toString(), {
				amount: data.amount,
				recipientUserId: data.userId,
				description: data.description
			});
			sendSuccessResponse(res, { message: 'DGT sent from treasury successfully', data: result });
		} catch (error) {
			if (error instanceof AdminError) {
				return sendErrorResponse(res, error.message, error.httpStatus);
			}
			return sendErrorResponse(res, 'Failed to send DGT from treasury', 400);
		}
	}

	async recoverToTreasury(req: Request, res: Response) {
		try {
			const data = validateRequestBody(req, res, TreasuryWithdrawalSchema);
			if (!data) return;
			const adminId = userService.getUserFromRequest(req);
			const result = await adminTreasuryService.recoverToTreasury(data, adminId);

			await adminController.logAction(req, 'TREASURY_RECOVER', 'treasury', data.userId.toString(), {
				amount: data.amount,
				sourceUserId: data.userId,
				description: data.description
			});
			sendSuccessResponse(res, { message: 'DGT recovered to treasury successfully', data: result });
		} catch (error) {
			if (error instanceof AdminError) {
				return sendErrorResponse(res, error.message, error.httpStatus);
			}
			return sendErrorResponse(res, 'Failed to recover DGT to treasury', 400);
		}
	}

	async massAirdrop(req: Request, res: Response) {
		try {
			const dataAirdrop = validateRequestBody(req, res, MassAirdropSchema);
			if (!dataAirdrop) return;
			const adminId = userService.getUserFromRequest(req);
			const result = await adminTreasuryService.massAirdrop(dataAirdrop, adminId);

			await adminController.logAction(req, 'TREASURY_MASS_AIRDROP', 'treasury', 'multiple_users', {
				amountPerUser: dataAirdrop.amountPerUser,
				userCount: dataAirdrop.userIds.length,
				reason: dataAirdrop.reason,
				missingUserIds: result.missingUserIds
			});
			sendSuccessResponse(res, { message: 'Mass airdrop process completed.', data: result });
		} catch (error) {
			if (error instanceof AdminError) {
				return sendErrorResponse(res, error.message, error.httpStatus);
			}
			return sendErrorResponse(res, 'Failed to process mass airdrop', 400);
		}
	}

	async getTreasurySettings(req: Request, res: Response) {
		try {
			const settings = await adminTreasuryService.getDgtEconomyParameters();
			if (!settings) {
				throw new AdminError('Treasury settings not found.', 404, AdminErrorCodes.NOT_FOUND);
			}
			sendSuccessResponse(res, settings);
		} catch (error) {
			if (error instanceof AdminError) {
				return sendErrorResponse(res, error.message, error.httpStatus);
			}
			return sendErrorResponse(res, 'Failed to get treasury settings', 400);
		}
	}

	async updateTreasurySettings(req: Request, res: Response) {
		try {
			const dataSettings = validateRequestBody(req, res, TreasurySettingsUpdateSchema);
			if (!dataSettings) return;
			const adminId = userService.getUserFromRequest(req);
			const result = await adminTreasuryService.updateDgtEconomyParameters(dataSettings, adminId);

			await adminController.logAction(
				req,
				'TREASURY_SETTINGS_UPDATE',
				'treasury_settings',
				'general',
				{
					updatedSettings: dataSettings
				}
			);
			sendSuccessResponse(res, { message: 'Treasury settings updated successfully', data: result });
		} catch (error) {
			if (error instanceof AdminError) {
				return sendErrorResponse(res, error.message, error.httpStatus);
			}
			return sendErrorResponse(res, 'Failed to update treasury settings', 400);
		}
	}
}

export const adminTreasuryController = new AdminTreasuryController();
