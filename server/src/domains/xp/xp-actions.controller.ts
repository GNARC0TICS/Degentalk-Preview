import { db } from '../../../../core/db';
import { xpActionSettings } from '@db/schema';
import { eq } from 'drizzle-orm';
import { logger } from '../../core/logger';
import { XP_ACTION, getXpActions, loadXpActionsFromDb } from '../xp-actions';

/**
 * Get all XP action settings 
 */
export async function getAllXpActionSettings() {
  try {
    return await db.select().from(xpActionSettings);
  } catch (error) {
    logger.error('Error getting XP action settings:', error);
    throw error;
  }
} 