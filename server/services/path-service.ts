/**
 * Path Service
 * Provides functions for XP path system management
 */
import { db } from '@db';
import { sql } from 'drizzle-orm';

interface XpPath {
	id: string;
	name: string;
	description: string | null;
	icon: string | null;
	color: string | null;
	xp_multipliers: Record<string, number>;
	is_active: boolean;
}

interface UserPath {
	user_id: number;
	path_id: string;
	primary_path: boolean;
	path_level: number;
	path_xp: number;
}

export class PathService {
	/**
	 * Get all XP paths
	 */
	static async getXpPaths(): Promise<XpPath[]> {
		try {
			const result = await db.execute(sql`
        SELECT * FROM xp_paths
        WHERE is_active = TRUE
        ORDER BY name ASC
      `);
			return result.rows as XpPath[];
		} catch (error) {
			console.error('Error getting XP paths:', error);
			return [];
		}
	}

	/**
	 * Get a specific XP path by ID
	 */
	static async getXpPathById(id: string): Promise<XpPath | null> {
		try {
			const result = await db.execute(sql`
        SELECT * FROM xp_paths
        WHERE id = ${id}
      `);

			if (result.rows.length === 0) {
				return null;
			}

			return result.rows[0] as XpPath;
		} catch (error) {
			console.error(`Error getting XP path by ID ${id}:`, error);
			return null;
		}
	}

	/**
	 * Get user's paths
	 */
	static async getUserPaths(userId: number): Promise<Array<UserPath & { path: XpPath }>> {
		try {
			const result = await db.execute(sql`
        SELECT up.*, p.*
        FROM user_paths up
        JOIN xp_paths p ON up.path_id = p.id
        WHERE up.user_id = ${userId}
        ORDER BY up.primary_path DESC, up.path_xp DESC
      `);

			return result.rows.map((row) => ({
				user_id: row.user_id,
				path_id: row.path_id,
				primary_path: row.primary_path,
				path_level: row.path_level,
				path_xp: row.path_xp,
				path: {
					id: row.id,
					name: row.name,
					description: row.description,
					icon: row.icon,
					color: row.color,
					xp_multipliers: row.xp_multipliers,
					is_active: row.is_active
				}
			}));
		} catch (error) {
			console.error(`Error getting user paths for user ${userId}:`, error);
			return [];
		}
	}

	/**
	 * Get user's primary path
	 */
	static async getUserPrimaryPath(userId: number): Promise<(UserPath & { path: XpPath }) | null> {
		try {
			const result = await db.execute(sql`
        SELECT up.*, p.*
        FROM user_paths up
        JOIN xp_paths p ON up.path_id = p.id
        WHERE up.user_id = ${userId} AND up.primary_path = TRUE
        LIMIT 1
      `);

			if (result.rows.length === 0) {
				return null;
			}

			const row = result.rows[0];
			return {
				user_id: row.user_id,
				path_id: row.path_id,
				primary_path: row.primary_path,
				path_level: row.path_level,
				path_xp: row.path_xp,
				path: {
					id: row.id,
					name: row.name,
					description: row.description,
					icon: row.icon,
					color: row.color,
					xp_multipliers: row.xp_multipliers,
					is_active: row.is_active
				}
			};
		} catch (error) {
			console.error(`Error getting primary path for user ${userId}:`, error);
			return null;
		}
	}

	/**
	 * Set user's primary path
	 */
	static async setUserPrimaryPath(userId: number, pathId: string): Promise<boolean> {
		try {
			// Check if the path exists
			const pathExists = await db.execute(sql`
        SELECT COUNT(*) FROM xp_paths
        WHERE id = ${pathId} AND is_active = TRUE
      `);

			if (parseInt(pathExists.rows[0].count) === 0) {
				return false;
			}

			return await db.transaction(async (tx) => {
				// Reset all paths to non-primary
				await tx.execute(sql`
          UPDATE user_paths
          SET primary_path = FALSE
          WHERE user_id = ${userId}
        `);

				// Check if user has this path
				const userPathExists = await tx.execute(sql`
          SELECT COUNT(*) FROM user_paths
          WHERE user_id = ${userId} AND path_id = ${pathId}
        `);

				if (parseInt(userPathExists.rows[0].count) === 0) {
					// User doesn't have this path yet, create it
					await tx.execute(sql`
            INSERT INTO user_paths (user_id, path_id, primary_path, path_level, path_xp)
            VALUES (${userId}, ${pathId}, TRUE, 1, 0)
          `);
				} else {
					// User has this path, make it primary
					await tx.execute(sql`
            UPDATE user_paths
            SET primary_path = TRUE
            WHERE user_id = ${userId} AND path_id = ${pathId}
          `);
				}

				return true;
			});
		} catch (error) {
			console.error(`Error setting primary path for user ${userId}:`, error);
			return false;
		}
	}

	/**
	 * Award path XP to a user
	 */
	static async awardPathXp(
		userId: number,
		pathId: string,
		xpAmount: number
	): Promise<{
		success: boolean;
		xpAwarded: number;
		newTotal: number;
		levelUp: boolean;
		newLevel?: number;
	}> {
		try {
			// Check if the path exists
			const pathExists = await db.execute(sql`
        SELECT COUNT(*) FROM xp_paths
        WHERE id = ${pathId} AND is_active = TRUE
      `);

			if (parseInt(pathExists.rows[0].count) === 0) {
				return { success: false, xpAwarded: 0, newTotal: 0, levelUp: false };
			}

			return await db.transaction(async (tx) => {
				// Check if user has this path
				const userPathResult = await tx.execute(sql`
          SELECT * FROM user_paths
          WHERE user_id = ${userId} AND path_id = ${pathId}
        `);

				let userPath: UserPath;

				if (userPathResult.rows.length === 0) {
					// User doesn't have this path yet, create it
					const newPathResult = await tx.execute(sql`
            INSERT INTO user_paths (user_id, path_id, primary_path, path_level, path_xp)
            VALUES (${userId}, ${pathId}, FALSE, 1, 0)
            RETURNING *
          `);
					userPath = newPathResult.rows[0] as UserPath;
				} else {
					userPath = userPathResult.rows[0] as UserPath;
				}

				// Record current level
				const oldLevel = userPath.path_level;

				// Update path XP
				const newXp = userPath.path_xp + xpAmount;

				// Calculate new level based on XP
				// Simple formula: level = 1 + floor(xp / 1000)
				const newLevel = 1 + Math.floor(newXp / 1000);

				await tx.execute(sql`
          UPDATE user_paths
          SET 
            path_xp = ${newXp},
            path_level = ${newLevel},
            updated_at = NOW()
          WHERE user_id = ${userId} AND path_id = ${pathId}
        `);

				const levelUp = newLevel > oldLevel;

				return {
					success: true,
					xpAwarded: xpAmount,
					newTotal: newXp,
					levelUp,
					newLevel: levelUp ? newLevel : undefined
				};
			});
		} catch (error) {
			console.error(`Error awarding path XP for user ${userId}:`, error);
			return { success: false, xpAwarded: 0, newTotal: 0, levelUp: false };
		}
	}

	/**
	 * Get path leaderboard
	 */
	static async getPathLeaderboard(
		pathId: string,
		limit: number = 10,
		offset: number = 0
	): Promise<
		Array<{
			user_id: number;
			username: string;
			path_xp: number;
			path_level: number;
			path_rank: number;
		}>
	> {
		try {
			const result = await db.execute(sql`
        SELECT user_id, username, path_xp, path_level, path_rank
        FROM path_leaderboard
        WHERE path_id = ${pathId}
        ORDER BY path_rank ASC
        LIMIT ${limit} OFFSET ${offset}
      `);

			return result.rows;
		} catch (error) {
			console.error(`Error getting path leaderboard for path ${pathId}:`, error);
			return [];
		}
	}

	/**
	 * Get user's path rank
	 */
	static async getUserPathRank(userId: number, pathId: string): Promise<number | null> {
		try {
			const result = await db.execute(sql`
        SELECT path_rank
        FROM path_leaderboard
        WHERE user_id = ${userId} AND path_id = ${pathId}
      `);

			if (result.rows.length === 0) {
				return null;
			}

			return result.rows[0].path_rank;
		} catch (error) {
			console.error(`Error getting path rank for user ${userId} and path ${pathId}:`, error);
			return null;
		}
	}
}
