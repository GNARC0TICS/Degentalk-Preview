import type { Request, Response, NextFunction } from 'express';
import { airdropAdminService } from './airdrop.service';
import { logger } from '../../../../core/logger';
import { z } from 'zod';

const airdropRequestSchema = z.object({
	tokenType: z.enum(['XP', 'DGT']),
	amount: z.number().int().positive(),
	targetCriteria: z.object({
		type: z.enum(['group', 'userIds', 'role']), // Extend as needed
		value: z.union([z.number().int().positive(), z.array(z.number().int().positive())])
	}),
	note: z.string().optional()
});

export const executeAirdrop = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const adminId = req.user?.id; // Assuming adminId is available from auth middleware
		if (!adminId) {
			return res.status(401).json({ message: 'Unauthorized: Admin ID not found.' });
		}

		const validationResult = airdropRequestSchema.safeParse(req.body);
		if (!validationResult.success) {
			logger.warn('AIRDROP_CONTROLLER', 'Invalid airdrop request payload', {
				errors: validationResult.error.format()
			});
			return res
				.status(400)
				.json({ message: 'Invalid request payload.', errors: validationResult.error.format() });
		}

		const { tokenType, amount, targetCriteria, note } = validationResult.data;

		const result = await airdropAdminService.processAirdrop({
			adminId,
			tokenType,
			amount,
			targetCriteria,
			note
		});

		if (result.success) {
			res.status(200).json(result);
		} else {
			// Determine appropriate status code based on the nature of the failure
			// For now, using 400 for general processing issues that aren't outright server errors
			res
				.status(
					result.message.includes('Unsupported') || result.message.includes('positive') ? 400 : 500
				)
				.json(result);
		}
	} catch (error) {
		logger.error('AIRDROP_CONTROLLER', 'Error executing airdrop:', error);
		next(error); // Pass to global error handler
	}
};

// TODO: Add controller for fetching airdrop history if needed
// export const getAirdropHistory = async (req: Request, res: Response, next: NextFunction) => { ... };
