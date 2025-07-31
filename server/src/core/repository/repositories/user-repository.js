/**
 * User Repository Implementation
 *
 * QUALITY IMPROVEMENT: Repository pattern for User data access
 * Implements IUserRepository interface with proper error handling and type safety
 */
import { db } from '@degentalk/db';
import { users } from '@schema';
import { eq, ilike, asc, sql } from 'drizzle-orm';
import { BaseRepository, RepositoryError } from '../base-repository';
import { logger } from '@core/logger';
export class UserRepository extends BaseRepository {
    table = users;
    entityName = 'User';
    /**
     * Find user by username (case-insensitive)
     */
    async findByUsername(username) {
        try {
            const [result] = await db
                .select()
                .from(users)
                .where(ilike(users.username, username))
                .limit(1);
            return result || null;
        }
        catch (error) {
            logger.error('UserRepository', 'Error in findByUsername', { username, error });
            throw new RepositoryError('Failed to find user by username', 'FIND_BY_USERNAME_ERROR', 500, {
                username,
                originalError: error
            });
        }
    }
    /**
     * Find user by email (case-insensitive)
     */
    async findByEmail(email) {
        try {
            const [result] = await db.select().from(users).where(ilike(users.email, email)).limit(1);
            return result || null;
        }
        catch (error) {
            logger.error('UserRepository', 'Error in findByEmail', { email, error });
            throw new RepositoryError('Failed to find user by email', 'FIND_BY_EMAIL_ERROR', 500, {
                email,
                originalError: error
            });
        }
    }
    /**
     * Find users by role
     */
    async findByRole(role, limit = 1000) {
        try {
            const results = await db
                .select()
                .from(users)
                .where(eq(users.role, role))
                .orderBy(asc(users.username))
                .limit(Math.min(limit, 1000)); // Cap at 1000 for performance
            return results;
        }
        catch (error) {
            logger.error('UserRepository', 'Error in findByRole', { role, error });
            throw new RepositoryError('Failed to find users by role', 'FIND_BY_ROLE_ERROR', 500, {
                role,
                originalError: error
            });
        }
    }
    /**
     * Update user's last login timestamp
     */
    async updateLastLogin(id) {
        try {
            await db
                .update(users)
                .set({
                lastLoginAt: new Date(),
                updatedAt: new Date()
            })
                .where(eq(users.id, id));
            logger.debug('UserRepository', 'Last login updated', { userId: id });
        }
        catch (error) {
            logger.error('UserRepository', 'Error in updateLastLogin', { id, error });
            throw new RepositoryError('Failed to update last login', 'UPDATE_LAST_LOGIN_ERROR', 500, {
                userId: id,
                originalError: error
            });
        }
    }
    /**
     * Increment user's XP (can be negative for decrement)
     */
    async incrementXP(id, amount) {
        try {
            const [result] = await db
                .update(users)
                .set({
                xp: sql `GREATEST(0, ${users.xp} + ${amount})`, // Ensure XP doesn't go below 0
                updatedAt: new Date()
            })
                .where(eq(users.id, id))
                .returning();
            if (!result) {
                throw new RepositoryError('User not found', 'NOT_FOUND', 404, { userId: id });
            }
            logger.info('UserRepository', 'XP incremented', {
                userId: id,
                amount,
                newXP: result.xp
            });
            return result;
        }
        catch (error) {
            if (error instanceof RepositoryError) {
                throw error;
            }
            logger.error('UserRepository', 'Error in incrementXP', { id, amount, error });
            throw new RepositoryError('Failed to increment XP', 'INCREMENT_XP_ERROR', 500, {
                userId: id,
                amount,
                originalError: error
            });
        }
    }
    /**
     * Search users by username or email
     */
    async searchUsers(query, limit = 20) {
        try {
            const searchPattern = `%${query}%`;
            const results = await db
                .select({
                id: users.id,
                username: users.username,
                email: users.email,
                avatar: users.avatar,
                role: users.role,
                xp: users.xp,
                level: users.level,
                isVerified: users.isVerified,
                createdAt: users.createdAt,
                updatedAt: users.updatedAt,
                lastLoginAt: users.lastLoginAt,
                lastActiveAt: users.lastActiveAt,
                isOnline: users.isOnline,
                bio: users.bio,
                dgtWalletBalance: users.dgtWalletBalance
            })
                .from(users)
                .where(sql `${users.username} ILIKE ${searchPattern} OR ${users.email} ILIKE ${searchPattern}`)
                .limit(Math.min(limit, 100)) // Cap at 100 results
                .orderBy(asc(users.username));
            return results;
        }
        catch (error) {
            logger.error('UserRepository', 'Error in searchUsers', { query, limit, error });
            throw new RepositoryError('Failed to search users', 'SEARCH_USERS_ERROR', 500, {
                query,
                limit,
                originalError: error
            });
        }
    }
    /**
     * Prepare data for user creation with defaults
     */
    prepareCreateData(data) {
        return {
            ...data,
            role: data.role || 'user',
            xp: data.xp || 0,
            level: data.level || 1,
            isVerified: data.isVerified || false,
            isOnline: data.isOnline || false,
            dgtWalletBalance: data.dgtWalletBalance || BigInt(0),
            createdAt: new Date(),
            updatedAt: new Date()
        };
    }
    /**
     * Validate user data before creation/update
     */
    validateUserData(data) {
        if (data.username !== undefined && (!data.username || data.username.trim().length === 0)) {
            throw new RepositoryError('Username cannot be empty', 'VALIDATION_ERROR', 400, {
                field: 'username'
            });
        }
        if (data.email !== undefined && (!data.email || !this.isValidEmail(data.email))) {
            throw new RepositoryError('Invalid email format', 'VALIDATION_ERROR', 400, {
                field: 'email'
            });
        }
        if (data.role !== undefined && !['user', 'moderator', 'admin', 'banned'].includes(data.role)) {
            throw new RepositoryError('Invalid user role', 'VALIDATION_ERROR', 400, {
                field: 'role',
                value: data.role
            });
        }
    }
    /**
     * Simple email validation
     */
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    /**
     * Override create to add validation
     */
    async create(data) {
        this.validateUserData(data);
        return super.create(data);
    }
    /**
     * Override update to add validation
     */
    async update(id, data) {
        this.validateUserData(data);
        return super.update(id, data);
    }
}
