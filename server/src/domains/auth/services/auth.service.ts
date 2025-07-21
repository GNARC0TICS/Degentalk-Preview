import { userService } from '@server-core/services/user.service';
import type { UserId } from '@shared/types/ids';
import { scrypt, randomBytes, timingSafeEqual } from 'crypto';
import { promisify } from 'util';
import { featureFlags, users } from '@db/schema';
import { db } from '@server-core/db';
import { eq, count } from 'drizzle-orm';
import { isDevMode } from '@server-utils/environment';
import { logger } from '@server-core/logger';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcrypt';
import { createServiceReporter } from '../../../lib/report-error';

// Create service-specific error reporter
const reportError = createServiceReporter('AuthService');

type User = typeof users.$inferSelect;

// Promisify scrypt for async usage
const scryptAsync = promisify(scrypt);

/**
 * Hash a password for secure storage
 */
export async function hashPassword(password: string): Promise<string> {
	const salt = randomBytes(16).toString('hex');
	const buf = (await scryptAsync(password, salt, 64)) as Buffer;
	return `${buf.toString('hex')}.${salt}`;
}

/**
 * Compare a supplied password with a stored hashed password
 */
export async function comparePasswords(supplied: string, stored: string): Promise<boolean> {
	if (!stored) {
		logger.warn('No stored password provided');
		return false;
	}

	// Check if it's a bcrypt hash (starts with $2a$, $2b$, etc.)
	if (stored.startsWith('$2')) {
		// Use bcrypt for comparison
		return await bcrypt.compare(supplied, stored);
	}

	// Handle mock password for development (from seeding)
	if (stored === 'mocked_hash') {
		// For development users with mocked passwords, accept any password
		logger.warn('Using mocked password for development user');
		return true;
	}

	// Handle scrypt format (hash.salt)
	if (stored.includes('.')) {
		const [hashed, salt] = stored.split('.');
		if (!hashed || !salt) {
			logger.warn('Invalid scrypt password format - missing hash or salt');
			return false;
		}

		const hashedBuf = Buffer.from(hashed, 'hex');
		const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
		return timingSafeEqual(hashedBuf, suppliedBuf);
	}

	logger.warn('Unknown password format - neither bcrypt nor scrypt');
	return false;
}

/**
 * Stores temporary dev metadata (encoded password) for beta testing
 * Only works for the first ~50 users and when beta tools are enabled
 */
export async function storeTempDevMetadata(password: string): Promise<string | null> {
	try {
		// Check if we're under the user limit
		const [userCountResult] = await db
			.select({ count: count() })
			.from(users)
			.where(eq(users.isDeleted, false));

		const userCount = userCountResult?.count || 0;
		if (userCount > 50) return null;

		// Check if beta tools are enabled
		const [devToolsFeature] = await db
			.select()
			.from(featureFlags)
			.where(eq(featureFlags.key, 'dev_tools_enabled'));

		if (!devToolsFeature || !devToolsFeature.isEnabled) return null;

		// Simple encoding - not for security, just for obfuscation
		return Buffer.from(password).toString('base64');
	} catch (error) {
		// Report error but don't throw - this is a non-critical beta feature
		await reportError(error, 'storeTempDevMetadata', {
			data: { hasPassword: !!password }
		});
		return null; // Graceful fallback - feature disabled on error
	}
}

/**
 * Helper function to verify email token
 */
export async function verifyEmailToken(token: string): Promise<{ userId: UserId } | false> {
	try {
		// This is a stub implementation - replace with actual database query
		// In a real implementation, we'd:
		// 1. Query verification_tokens where token matches
		// 2. Check that expires_at > current time
		// 3. Check that used_at is null (token not used yet)

		// For demo purposes, we're returning a fake userId
		// In production, you would query the actual token from the database
		return { userId: '1' as UserId }; // Return userId if token is valid
	} catch (error) {
		// Report error but don't throw - invalid token is expected behavior
		await reportError(error, 'verifyEmailToken', {
			data: { tokenLength: token?.length }
		});
		return false; // Token verification failed - deny access
	}
}

/**
 * Creates a mock user for development mode
 * This maintains compatibility with the existing dev mode user selection mechanism
 */
export function createMockUser(
	userId: UserId,
	role: 'admin' | 'moderator' | 'user' = 'user'
): User {
	logger.info('AuthService', `Creating mock ${role} user for ID ${userId} in development mode`, {
		userId,
		role
	});

	const mockUuid = uuidv4();

	return {
		id: mockUuid,
		uuid: mockUuid,
		username: `Dev${role.charAt(0).toUpperCase() + role.slice(1)}`,
		email: `dev-${role}@degen.io`,
		password: 'mock-password-hash',
		role: role,
		groupId: role === 'admin' ? 1 : role === 'moderator' ? 2 : 3,
		isActive: true,
		isBanned: false,
		isVerified: true,
		isDeleted: false,
		isShadowbanned: false,
		subscribedToNewsletter: false,
		createdAt: new Date(),
		xp: 1000,
		level: 10,
		clout: 100,
		dgtPoints: 1000,
		dgtWalletBalance: 100,
		pointsVersion: 1,
		dailyXpGained: 0
		// Other required fields with sensible defaults
	} as User;
}

/**
 * Helper function to get session cookie settings based on environment
 */
export function getSessionCookieSettings(): {
	secure: boolean;
	maxAge: number;
	sameSite?: boolean | 'lax' | 'strict' | 'none';
} {
	if (isDevMode()) {
		return {
			secure: false,
			maxAge: 7 * 24 * 60 * 60 * 1000, // 1 week
			sameSite: 'lax'
		};
	} else {
		return {
			secure: true,
			maxAge: 7 * 24 * 60 * 60 * 1000, // 1 week
			sameSite: 'strict'
		};
	}
}

/**
 * Backward compatibility helper to get user ID from request
 * Prefer using userService.getUserFromRequest but some routes still expect getUserId
 */
export function getUserId(req: any): string | null {
	const user = userService.getUserFromRequest(req as any);
	return user?.id ?? null;
}
