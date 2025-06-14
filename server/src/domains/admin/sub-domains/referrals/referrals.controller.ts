import type { Request, Response } from 'express';
import { referralsService } from './referrals.service';

/**
 * Controller for managing referral sources and user referrals in the admin panel
 */
export class ReferralsController {
  /**
   * Create a new referral source
   */
  async createReferralSource(req: Request, res: Response) {
    try {
      const { name, slug, metadata } = req.body;
      const createdBy = req.user?.id;

      const source = await referralsService.createReferralSource(
        name, 
        slug, 
        metadata || {}, 
        createdBy
      );

      return res.status(201).json({
        success: true,
        data: source
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message || 'Failed to create referral source'
      });
    }
  }

  /**
   * Get all referral sources
   */
  async getAllReferralSources(req: Request, res: Response) {
    try {
      const sources = await referralsService.getAllReferralSources();

      return res.json({
        success: true,
        data: sources
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch referral sources'
      });
    }
  }

  /**
   * Get referral source statistics
   */
  async getReferralSourceStats(req: Request, res: Response) {
    try {
      const stats = await referralsService.getReferralSourceStats();

      return res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch referral source statistics'
      });
    }
  }

  /**
   * Get user-to-user referral statistics
   */
  async getUserReferralStats(req: Request, res: Response) {
    try {
      const stats = await referralsService.getUserReferralStats();

      return res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch user referral statistics'
      });
    }
  }

  /**
   * Get referral count by user
   */
  async getReferralCountByUser(req: Request, res: Response) {
    try {
      const stats = await referralsService.getReferralCountByUser();

      return res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch referral count by user'
      });
    }
  }
}

export const referralsController = new ReferralsController(); 