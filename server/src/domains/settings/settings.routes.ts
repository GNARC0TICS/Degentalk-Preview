// REFACTORED: Updated auth middleware imports to use canonical path
/**
 * Settings Routes
 * 
 * Defines API routes for user settings management.
 */

import express from 'express';
import { authenticate } from '../../middleware/authenticate';
import { validateBody } from '../../middleware/validate';
import { 
  profileSettingsSchema, 
  accountSettingsSchema, 
  notificationSettingsSchema,
  passwordChangeSchema
} from './settings.validators';
import { 
  getAllSettings,
  updateProfileSettings,
  updateAccountSettings,
  updateNotificationSettings,
  changePassword
} from './settings.service';
import { Request, Response, Router } from "express";
import { db } from "../../../db";
import { users, userSettings } from "@db/schema";
import { eq, and } from "drizzle-orm";
import { sql } from "drizzle-orm";
import { z } from "zod";
import { WebSocket } from 'ws';
import { isAuthenticated, isAuthenticatedOptional } from '../auth/middleware/auth.middleware';
import { logger, LogLevel, LogAction } from "../../../src/core/logger";

// Helper function to get user ID from req.user, handling both id and user_id formats
function getUserId(req: Request): number {
  return (req.user as any)?.id || (req.user as any)?.user_id || 0;
}

// Define validation schema for the shoutbox position
const updateShoutboxPositionSchema = z.object({
  position: z.string().refine(val => ['sidebar-top', 'sidebar-bottom', 'floating', 'hidden'].includes(val), {
    message: "Position must be one of: sidebar-top, sidebar-bottom, floating, hidden"
  })
});

const router = express.Router();

/**
 * GET /api/users/me/settings-all
 * Get all settings for the authenticated user
 */
router.get('/me/settings-all', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const settings = await getAllSettings(userId);
    res.json(settings);
  } catch (error) {
    logger.error("SETTINGS", 'Error getting user settings', error);
    res.status(500).json({ 
      error: 'Failed to retrieve user settings',
      message: error.message
    });
  }
});

/**
 * PUT /api/users/me/settings/profile
 * Update profile settings for the authenticated user
 */
router.put(
  '/me/settings/profile',
  authenticate,
  validateBody(profileSettingsSchema),
  async (req, res) => {
    try {
      const userId = req.user.id;
      const ipAddress = req.ip;
      const result = await updateProfileSettings(userId, req.body, ipAddress);
      res.json(result);
    } catch (error) {
      logger.error("SETTINGS", 'Error updating profile settings', error);
      res.status(500).json({ 
        error: 'Failed to update profile settings',
        message: error.message
      });
    }
  }
);

/**
 * PUT /api/users/me/settings/account
 * Update account settings for the authenticated user
 */
router.put(
  '/me/settings/account',
  authenticate,
  validateBody(accountSettingsSchema),
  async (req, res) => {
    try {
      const userId = req.user.id;
      const ipAddress = req.ip;
      const result = await updateAccountSettings(userId, req.body, ipAddress);
      res.json(result);
    } catch (error) {
      logger.error("SETTINGS", 'Error updating account settings', error);
      res.status(500).json({ 
        error: 'Failed to update account settings',
        message: error.message
      });
    }
  }
);

/**
 * PUT /api/users/me/settings/notifications
 * Update notification settings for the authenticated user
 */
router.put(
  '/me/settings/notifications',
  authenticate,
  validateBody(notificationSettingsSchema),
  async (req, res) => {
    try {
      const userId = req.user.id;
      const ipAddress = req.ip;
      const result = await updateNotificationSettings(userId, req.body, ipAddress);
      res.json(result);
    } catch (error) {
      logger.error("SETTINGS", 'Error updating notification settings', error);
      res.status(500).json({ 
        error: 'Failed to update notification settings',
        message: error.message
      });
    }
  }
);

/**
 * POST /api/users/me/security/change-password
 * Change password for the authenticated user
 */
router.post(
  '/me/security/change-password',
  authenticate,
  validateBody(passwordChangeSchema),
  async (req, res) => {
    try {
      const userId = req.user.id;
      const ipAddress = req.ip;
      const result = await changePassword(userId, req.body, ipAddress);
      res.json(result);
    } catch (error) {
      logger.error("SETTINGS", 'Error changing password', error);
      res.status(400).json({ 
        error: 'Failed to change password',
        message: error.message
      });
    }
  }
);

// Get user settings
router.get('/', isAuthenticated, async (req: Request, res: Response) => {
  try {
    // Use either id or user_id depending on what's available
    const userId = getUserId(req);
    
    if (!userId) {
      logger.error("SETTINGS", 'No user ID found in authenticated request', { user: req.user });
      return res.status(500).json({ message: "Failed to identify user" });
    }
    
    // Check if user settings exist
    const userSettingsData = await db
      .select()
      .from(userSettings)
      .where(eq(userSettings.userId, userId))
      .limit(1);
    
    if (!userSettingsData || userSettingsData.length === 0) {
      // Create default settings if none exist
      const defaultSettings = {
        userId,
        theme: 'auto',
        shoutboxPosition: 'sidebar-top',
        sidebarState: {},
        notificationPrefs: {},
        profileVisibility: 'public',
        language: 'en'
      };
      
      try {
        await db.insert(userSettings).values(defaultSettings);
        return res.status(200).json(defaultSettings);
      } catch (insertError) {
        logger.error("SETTINGS", 'Error creating default user settings', insertError);
        
        // For development mode, return mock settings
        if (process.env.NODE_ENV === "development") {
          logger.info("SETTINGS", `🔧 Returning mock settings for user ${userId} (dev mode only)`);
          return res.status(200).json(defaultSettings);
        }
        
        return res.status(500).json({ message: "Failed to create user settings" });
      }
    }
    
    return res.status(200).json(userSettingsData[0]);
  } catch (error) {
    logger.error("SETTINGS", 'Error fetching user settings', error);
    
    // For development mode, return mock settings
    if (process.env.NODE_ENV === "development") {
      const userId = getUserId(req);
      logger.info("SETTINGS", `🔧 Returning mock settings for user ${userId} (dev mode only)`);
      const mockSettings = {
        userId,
        theme: 'auto',
        shoutboxPosition: 'sidebar-top',
        sidebarState: {},
        notificationPrefs: {},
        profileVisibility: 'public',
        language: 'en'
      };
      return res.status(200).json(mockSettings);
    }
    
    return res.status(500).json({ message: "Internal server error" });
  }
});

// Update shoutbox position
router.put('/shoutbox-position', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    const validation = updateShoutboxPositionSchema.safeParse(req.body);
    
    if (!validation.success) {
      return res.status(400).json({ 
        message: "Invalid position format", 
        errors: validation.error.errors 
      });
    }
    
    const { position } = validation.data;
    
    // Check if user settings exist
    const userSettingsData = await db
      .select()
      .from(userSettings)
      .where(eq(userSettings.userId, userId))
      .limit(1);
    
    if (!userSettingsData || userSettingsData.length === 0) {
      // Create settings record if it doesn't exist
      await db.insert(userSettings).values({
        userId,
        shoutboxPosition: position
      });
    } else {
      // Update existing settings
      await db
        .update(userSettings)
        .set({ shoutboxPosition: position })
        .where(eq(userSettings.userId, userId));
    }
    
    // Log the change in user_settings_history table
    await db.execute(sql`
      INSERT INTO user_settings_history 
      (user_id, changed_field, old_value, new_value, ip_address, user_agent)
      VALUES 
      (${userId}, 'shoutbox_position', ${userSettingsData?.[0]?.shoutboxPosition || 'sidebar-top'}, ${position}, ${req.ip || 'unknown'}, ${req.headers['user-agent'] || 'unknown'})
    `);
    
    // Broadcast the position change via WebSocket if the WebSocket server is available
    try {
      const wss = (req.app as any).wss;
      if (wss && wss.clients) {
        const username = (req.user as any).username;
        
        // Create broadcast message with position update
        const broadcastMessage = JSON.stringify({
          type: 'shoutbox_position_update',
          userId,
          username,
          position,
          timestamp: new Date().toISOString()
        });
        
        // Broadcast to all connected clients
        wss.clients.forEach((client: any) => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(broadcastMessage);
          }
        });
        logger.info("SETTINGS", `Broadcast shoutbox position update for user ${username}`);
      }
    } catch (broadcastError) {
      logger.error("SETTINGS", 'Error broadcasting position change', broadcastError);
      // Continue with the response even if broadcast fails
    }
    
    return res.status(200).json({ 
      message: "Shoutbox position updated successfully",
      position
    });
  } catch (error) {
    logger.error("SETTINGS", 'Error updating shoutbox position', error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

export default router; 