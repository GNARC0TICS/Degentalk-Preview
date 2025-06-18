import type { Request, Response, NextFunction } from 'express';
import { db } from '@db';
import { cloutAchievements, userCloutLog, users } from '@schema';
import { eq, desc } from 'drizzle-orm';
import { logger } from '../../../../core/logger';
import { CloutService } from '../../../economy/services/cloutService';

// Instantiate once – can be swapped with dependency injection later
const cloutService = new CloutService();

/** ---------------------------- ACHIEVEMENTS CRUD --------------------------- */
export const getAllAchievements = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const achievements = await db.select().from(cloutAchievements).orderBy(cloutAchievements.id);
    res.json({ achievements, count: achievements.length });
  } catch (err) {
    logger.error('CloutAdmin', 'Error fetching achievements', err);
    next(err);
  }
};

export const getAchievementById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    const rows = await db.select().from(cloutAchievements).where(eq(cloutAchievements.id, id)).limit(1);
    if (!rows.length) return res.status(404).json({ message: 'Achievement not found' });
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
};

export const createAchievement = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      achievementKey,
      name,
      description,
      cloutReward,
      criteriaType,
      criteriaValue,
      enabled = true,
      iconUrl
    } = req.body;

    if (!achievementKey || !name) {
      return res.status(400).json({ message: 'achievementKey and name are required' });
    }

    await db.insert(cloutAchievements).values({
      achievementKey,
      name,
      description,
      cloutReward: cloutReward ?? 0,
      criteriaType,
      criteriaValue,
      enabled,
      iconUrl,
      createdAt: new Date()
    });

    res.status(201).json({ message: 'Achievement created' });
  } catch (err) {
    next(err);
  }
};

export const updateAchievement = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    const updateData = { ...req.body, updatedAt: new Date() } as any;
    delete updateData.id;

    // Check existence
    const exists = await db
      .select({ id: cloutAchievements.id })
      .from(cloutAchievements)
      .where(eq(cloutAchievements.id, id))
      .limit(1);
    if (!exists.length) return res.status(404).json({ message: 'Achievement not found' });

    await db.update(cloutAchievements).set(updateData).where(eq(cloutAchievements.id, id));
    res.json({ message: 'Achievement updated' });
  } catch (err) {
    next(err);
  }
};

export const deleteAchievement = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    await db.delete(cloutAchievements).where(eq(cloutAchievements.id, id));
    res.json({ message: 'Achievement deleted' });
  } catch (err) {
    next(err);
  }
};

export const toggleAchievement = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    const rows = await db.select({ enabled: cloutAchievements.enabled }).from(cloutAchievements).where(eq(cloutAchievements.id, id)).limit(1);
    if (!rows.length) return res.status(404).json({ message: 'Achievement not found' });
    const enabled = !rows[0].enabled;
    await db.update(cloutAchievements).set({ enabled }).where(eq(cloutAchievements.id, id));
    res.json({ message: `Achievement ${enabled ? 'enabled' : 'disabled'}` });
  } catch (err) {
    next(err);
  }
};

/** ---------------------------- CLOUT GRANTS --------------------------- */
export const grantClout = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId, amount, reason } = req.body as { userId: string; amount: number; reason: string };
    if (!userId || !amount || !reason) return res.status(400).json({ message: 'userId, amount, reason required' });

    // Validate user exists
    const userExists = await db.select({ id: users.id }).from(users).where(eq(users.id, userId)).limit(1);
    if (!userExists.length) return res.status(404).json({ message: 'User not found' });

    await cloutService.grantClout(userId, amount, reason);

    res.status(200).json({ message: `Granted ${amount} clout to user ${userId}` });
  } catch (err) {
    next(err);
  }
};

export const getCloutLogs = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId, limit = 50 } = req.query as { userId?: string; limit?: string };

    const baseQuery = db.select().from(userCloutLog);
    const filtered = userId ? baseQuery.where(eq(userCloutLog.userId, userId)) : baseQuery;
    const logs = await filtered
      .orderBy(desc(userCloutLog.createdAt))
      .limit(Number(limit));
    res.json({ logs, count: logs.length });
  } catch (err) {
    next(err);
  }
}; 