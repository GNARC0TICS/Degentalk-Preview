/**
 * Admin XP Actions Controller
 * 
 * Handles API endpoints for managing XP action settings
 */

import { Request, Response, NextFunction } from 'express';
import { db } from '../../../../core/db';
import { xpActionSettings } from '@shared/schema';
import { eq } from 'drizzle-orm';
import { logger } from '../../../../core/logger';
import { xpService } from '../../../xp/xp.service';
import { XP_ACTION, getXpActions, loadXpActionsFromDb } from '../../../xp/xp-actions';
// import { XpActionSettingsSchema, XpActionKeySchema } from '@shared/validators/admin'; // Commented out as schemas not found/used
// import { validateRequest } from '@server/src/middleware/validate'; // Removed as not used and not exported
// import { XpActionsAdminService } from './xp-actions.service'; // Removed as file not found and service not used

/**
 * Get all XP action settings
 */
export const getAllXpActions = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Get all XP actions from database, including disabled ones
    const actions = await db
      .select()
      .from(xpActionSettings)
      .orderBy(xpActionSettings.action);
    
    res.status(200).json({
      actions,
      count: actions.length
    });
  } catch (error) {
    logger.error('Error getting XP actions:', error instanceof Error ? error.message : String(error));
    next(error);
  }
};

/**
 * Get a single XP action setting by action key
 */
export const getXpActionByKey = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { actionKey } = req.params;
    
    if (!actionKey) {
      return res.status(400).json({ message: 'Action key is required' });
    }
    
    const actions = await db
      .select()
      .from(xpActionSettings)
      .where(eq(xpActionSettings.action, actionKey))
      .limit(1);
    
    if (actions.length === 0) {
      return res.status(404).json({ message: `XP action "${actionKey}" not found` });
    }
    
    res.status(200).json(actions[0]);
  } catch (error) {
    logger.error('Error getting XP action:', error instanceof Error ? error.message : String(error));
    next(error);
  }
};

/**
 * Create a new XP action setting
 */
export const createXpAction = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { action, baseValue, description, maxPerDay, cooldownSec, enabled } = req.body;
    
    if (!action || baseValue === undefined || !description) {
      return res.status(400).json({
        message: 'Missing required fields. action, baseValue, and description are required.'
      });
    }
    
    // Check if action already exists
    const existingActions = await db
      .select()
      .from(xpActionSettings)
      .where(eq(xpActionSettings.action, action))
      .limit(1);
    
    if (existingActions.length > 0) {
      return res.status(409).json({
        message: `XP action "${action}" already exists. Use the update endpoint instead.`
      });
    }
    
    // Insert new XP action
    await db.insert(xpActionSettings).values({
      action,
      baseValue,
      description,
      maxPerDay: maxPerDay || null,
      cooldownSec: cooldownSec || null,
      enabled: enabled !== undefined ? enabled : true,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    // Force refresh the XP actions cache
    await loadXpActionsFromDb(true);
    
    res.status(201).json({
      message: `XP action "${action}" created successfully`,
      action: {
        action,
        baseValue,
        description,
        maxPerDay: maxPerDay || null,
        cooldownSec: cooldownSec || null,
        enabled: enabled !== undefined ? enabled : true
      }
    });
  } catch (error) {
    logger.error('Error creating XP action:', error instanceof Error ? error.message : String(error));
    next(error);
  }
};

/**
 * Update an existing XP action setting
 */
export const updateXpAction = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { actionKey } = req.params;
    const { baseValue, description, maxPerDay, cooldownSec, enabled } = req.body;
    
    if (!actionKey) {
      return res.status(400).json({ message: 'Action key is required' });
    }
    
    // Check if action exists
    const existingActions = await db
      .select()
      .from(xpActionSettings)
      .where(eq(xpActionSettings.action, actionKey))
      .limit(1);
    
    if (existingActions.length === 0) {
      return res.status(404).json({ message: `XP action "${actionKey}" not found` });
    }
    
    // Prepare update data
    const updateData: any = {
      updatedAt: new Date()
    };
    
    if (baseValue !== undefined) updateData.baseValue = baseValue;
    if (description !== undefined) updateData.description = description;
    if (maxPerDay !== undefined) updateData.maxPerDay = maxPerDay;
    if (cooldownSec !== undefined) updateData.cooldownSec = cooldownSec;
    if (enabled !== undefined) updateData.enabled = enabled;
    
    // Update the XP action
    await db
      .update(xpActionSettings)
      .set(updateData)
      .where(eq(xpActionSettings.action, actionKey));
    
    // Force refresh the XP actions cache
    await loadXpActionsFromDb(true);
    
    res.status(200).json({
      message: `XP action "${actionKey}" updated successfully`,
      action: {
        ...existingActions[0],
        ...updateData
      }
    });
  } catch (error) {
    logger.error('Error updating XP action:', error instanceof Error ? error.message : String(error));
    next(error);
  }
};

/**
 * Toggle an XP action enabled/disabled
 */
export const toggleXpAction = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { actionKey } = req.params;
    
    if (!actionKey) {
      return res.status(400).json({ message: 'Action key is required' });
    }
    
    // Check if action exists and get current enabled state
    const existingActions = await db
      .select()
      .from(xpActionSettings)
      .where(eq(xpActionSettings.action, actionKey))
      .limit(1);
    
    if (existingActions.length === 0) {
      return res.status(404).json({ message: `XP action "${actionKey}" not found` });
    }
    
    const currentEnabled = existingActions[0].enabled;
    
    // Toggle the enabled state
    await db
      .update(xpActionSettings)
      .set({
        enabled: !currentEnabled,
        updatedAt: new Date()
      })
      .where(eq(xpActionSettings.action, actionKey));
    
    // Force refresh the XP actions cache
    await loadXpActionsFromDb(true);
    
    res.status(200).json({
      message: `XP action "${actionKey}" ${!currentEnabled ? 'enabled' : 'disabled'} successfully`,
      action: {
        ...existingActions[0],
        enabled: !currentEnabled
      }
    });
  } catch (error) {
    logger.error('Error toggling XP action:', error instanceof Error ? error.message : String(error));
    next(error);
  }
};

/**
 * Reset an XP action to its default values
 */
export const resetXpAction = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { actionKey } = req.params;
    
    if (!actionKey) {
      return res.status(400).json({ message: 'Action key is required' });
    }
    
    // Check if this is a default action (in the XP_ACTION enum)
    const isDefaultAction = Object.values(XP_ACTION).includes(actionKey as XP_ACTION);
    
    if (!isDefaultAction) {
      return res.status(400).json({ 
        message: `Cannot reset custom action "${actionKey}". Only default actions can be reset.` 
      });
    }
    
    // Get all XP actions from code and extract the default for this key
    const defaultActionsObj = await getXpActions();
    const defaultAction = defaultActionsObj[actionKey];
    
    if (!defaultAction) {
      return res.status(404).json({ message: `Default configuration for "${actionKey}" not found` });
    }
    
    // Update the action with default values
    await db
      .update(xpActionSettings)
      .set({
        baseValue: defaultAction.baseValue,
        description: defaultAction.description,
        maxPerDay: defaultAction.maxPerDay || null,
        cooldownSec: defaultAction.cooldownSeconds || null,
        enabled: true,
        updatedAt: new Date()
      })
      .where(eq(xpActionSettings.action, actionKey));
    
    // Force refresh the XP actions cache
    await loadXpActionsFromDb(true);
    
    res.status(200).json({
      message: `XP action "${actionKey}" reset to default values successfully`,
      action: {
        action: actionKey,
        baseValue: defaultAction.baseValue,
        description: defaultAction.description,
        maxPerDay: defaultAction.maxPerDay || null,
        cooldownSec: defaultAction.cooldownSeconds || null,
        enabled: true
      }
    });
  } catch (error) {
    logger.error('Error resetting XP action:', error instanceof Error ? error.message : String(error));
    next(error);
  }
};
