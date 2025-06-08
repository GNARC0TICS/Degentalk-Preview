/**
 * Airdrop Controller
 * 
 * Handles HTTP requests related to airdrop functionality
 * 
 * // [REFAC-AIRDROP]
 */

import { Request, Response } from 'express';
import { airdropService, AirdropOptions } from './airdrop.service';
import { WalletError, ErrorCodes as WalletErrorCodes } from '../../../core/errors';
import { asyncHandler } from '../../../core/errors';
import { logger } from '../../../core/logger';

/**
 * Controller for airdrop functionality
 */
export class AirdropController {
  /**
   * Process an airdrop (admin only)
   */
  processAirdrop = asyncHandler(async (req: Request, res: Response) => {
    const adminUserId = req.user?.id;
    const isAdmin = req.user?.role === 'admin';
    
    if (!adminUserId) {
      return res.status(401).json({
        error: 'Authentication required',
        code: WalletErrorCodes.AUTHENTICATION_ERROR
      });
    }
    
    if (!isAdmin) {
      return res.status(403).json({
        error: 'Permission denied',
        code: WalletErrorCodes.PERMISSION_DENIED,
        details: 'Only administrators can initiate airdrops'
      });
    }
    
    const {
      amount,
      currency,
      title,
      description,
      target,
      activityDays,
      threshold
    } = req.body;
    
    // Validate required fields
    if (!amount || !currency) {
      return res.status(400).json({
        error: 'Missing required fields',
        code: WalletErrorCodes.INVALID_PARAMETERS,
        details: 'amount and currency are required'
      });
    }
    
    // Create airdrop options
    const airdropOptions: AirdropOptions = {
      adminUserId,
      amount: parseFloat(amount),
      currency,
      title,
      description,
      target,
      activityDays: activityDays ? parseInt(activityDays) : undefined,
      threshold: threshold ? parseInt(threshold) : undefined
    };
    
    try {
      // Process the airdrop
      const result = await airdropService.processAirdrop(airdropOptions);
      
      return res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      if (error instanceof WalletError) {
        return res.status(error.statusCode).json({
          error: error.message,
          code: error.code,
          details: error.details
        });
      }
      
      logger.error('AirdropController', `Error processing airdrop: ${error.message}`);
      return res.status(500).json({
        error: 'Failed to process airdrop',
        code: WalletErrorCodes.SYSTEM_ERROR
      });
    }
  });
  
  /**
   * Get airdrop history (admin only)
   */
  getAirdropHistory = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.id;
    const isAdmin = req.user?.role === 'admin';
    
    if (!userId) {
      return res.status(401).json({
        error: 'Authentication required',
        code: WalletErrorCodes.AUTHENTICATION_ERROR
      });
    }
    
    if (!isAdmin) {
      return res.status(403).json({
        error: 'Permission denied',
        code: WalletErrorCodes.PERMISSION_DENIED,
        details: 'Only administrators can view airdrop history'
      });
    }
    
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = parseInt(req.query.offset as string) || 0;
    
    try {
      const history = await airdropService.getAirdropHistory(limit, offset);
      
      return res.status(200).json({
        success: true,
        data: history.airdrops,
        meta: {
          total: history.total,
          limit,
          offset
        }
      });
    } catch (error) {
      logger.error('AirdropController', `Error getting airdrop history: ${error.message}`);
      return res.status(500).json({
        error: 'Failed to get airdrop history',
        code: WalletErrorCodes.SYSTEM_ERROR
      });
    }
  });
  
  /**
   * Get airdrop details (admin only)
   */
  getAirdropDetails = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.id;
    const isAdmin = req.user?.role === 'admin';
    
    if (!userId) {
      return res.status(401).json({
        error: 'Authentication required',
        code: WalletErrorCodes.AUTHENTICATION_ERROR
      });
    }
    
    if (!isAdmin) {
      return res.status(403).json({
        error: 'Permission denied',
        code: WalletErrorCodes.PERMISSION_DENIED,
        details: 'Only administrators can view airdrop details'
      });
    }
    
    const airdropId = parseInt(req.params.id);
    
    if (!airdropId) {
      return res.status(400).json({
        error: 'Invalid airdrop ID',
        code: WalletErrorCodes.INVALID_PARAMETERS
      });
    }
    
    try {
      const airdropDetails = await airdropService.getAirdropDetails(airdropId);
      
      return res.status(200).json({
        success: true,
        data: airdropDetails
      });
    } catch (error) {
      if (error instanceof WalletError) {
        return res.status(error.statusCode).json({
          error: error.message,
          code: error.code,
          details: error.details
        });
      }
      
      logger.error('AirdropController', `Error getting airdrop details: ${error.message}`);
      return res.status(500).json({
        error: 'Failed to get airdrop details',
        code: WalletErrorCodes.SYSTEM_ERROR
      });
    }
  });
}

// Export a singleton instance
export const airdropController = new AirdropController(); 