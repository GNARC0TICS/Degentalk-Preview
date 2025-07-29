import { Router } from 'express'
import type { Router as RouterType } from 'express';
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import session from 'express-session';
import { db } from '../../core/db'; // Will be refactored in a future step
import { users } from '@schema';
import { eq } from 'drizzle-orm';
import type { UserId, GroupId } from '@shared/types/ids';
import { validateRequest } from '@middleware/validate-request';
import { authValidation } from './validation/auth.validation';
import {
	comparePasswords,
	getSessionCookieSettings,
	createMockUser
} from './services/auth.service';
import {
	register,
	login,
	logout,
	getCurrentUser,
	verifyEmail,
	resendVerification
} from './controllers/auth.controller';
import {
	isAuthenticated,
	isAuthenticatedOptional,
	isAdmin,
	isModerator,
	isAdminOrModerator,
	devModeAuthHandler
} from './middleware/auth.middleware';
import { isDevMode } from '../../utils/environment';
import { logger } from '@core/logger';
import { getUser } from '@core/utils/auth.helpers';
import { sendSuccess } from '@utils/api-responses';

const router: RouterType = Router();

/**
 * Initialize Passport.js and configure authentication
 */
export function setupAuthPassport(sessionStore: any) {
	// Configure the local strategy for Passport
	passport.use(
		new LocalStrategy(async (username, password, done) => {
			try {
				const [user] = await db.select().from(users).where(eq(users.username, username));
				
				// Debug logging
				logger.info('AuthRoutes', 'Login attempt debug', { 
					username, 
					userFound: !!user,
					hasPassword: !!user?.password,
					passwordLength: user?.password?.length,
					passwordPrefix: user?.password?.substring(0, 10)
				});

				// In dev mode, we can bypass the password check
				if (
					isDevMode() &&
					process.env.DEV_BYPASS_PASSWORD === 'true' &&
					process.env.DEV_FORCE_AUTH !== 'true'
				) {

					if (!user) {
						return done(null, false, { message: 'Invalid username or password' });
					}

					// Skip password check in dev mode with bypass flag
					logger.info('AuthRoutes', 'DEV MODE: Bypassing password check!', { username });

					// Still check other user status fields
					if (user.isBanned) {
						return done(null, false, { message: 'Your account has been banned' });
					}

					if (!user.isActive) {
						return done(null, false, { message: 'Your account is inactive' });
					}

					if (user.isDeleted) {
						return done(null, false, { message: 'Your account has been deleted' });
					}

					// Ensure role is not null and groupId is undefined if null
					const userWithRole = {
						...user,
						id: user.id as UserId, // Cast to branded type
						role: user.role || 'user',
						groupId: user.groupId === null ? undefined : (user.groupId as unknown as GroupId)
					};
					return done(null, userWithRole);
				}

				// Normal authentication flow
				if (!user) {
					logger.warn('AuthRoutes', 'User not found', { username });
					return done(null, false, { message: 'Invalid username or password' });
				}
				
				const passwordMatch = await comparePasswords(password, user.password);
				logger.info('AuthRoutes', 'Password comparison result', { 
					username,
					passwordMatch,
					suppliedPasswordLength: password.length,
					storedPasswordLength: user.password?.length,
					storedPasswordPrefix: user.password?.substring(0, 10)
				});
				
				if (!passwordMatch) {
					return done(null, false, { message: 'Invalid username or password' });
				}

				if (user.isBanned) {
					return done(null, false, { message: 'Your account has been banned' });
				}

				if (!user.isActive) {
					return done(null, false, { message: 'Your account is inactive' });
				}

				if (user.isDeleted) {
					return done(null, false, { message: 'Your account has been deleted' });
				}

				// Ensure role is not null and groupId is undefined if null
				const userWithRole = {
					...user,
					id: user.id as UserId, // Cast to branded type
					role: user.role || 'user',
					groupId: user.groupId === null ? undefined : (user.groupId as unknown as GroupId)
				};
				return done(null, userWithRole);
			} catch (err) {
				return done(err);
			}
		})
	);

	// Configure user serialization (for session storage)
	passport.serializeUser((user: any, done) => {
		// Support either 'id' or 'user_id' as field name
		const userId = user.id || user.user_id;
		if (!userId) {
			return done(new Error('User has no id field'), null);
		}
		return done(null, userId);
	});

	// Configure user deserialization (retrieving user from session)
	passport.deserializeUser(async (id: string, done) => {
		logger.debug('AuthDeserialize', 'Passport deserializeUser called', { id, idType: typeof id });
		try {
			// Try to get user from storage
			try {
				logger.debug('AuthDeserialize', 'Calling db.query.users.findFirst from deserializer');
				const user = await db.query.users.findFirst({ where: eq(users.id, id as UserId) });
				if (user) {
					logger.debug('AuthDeserialize', 'Deserializer got user from db', {
						userId: user.id,
						username: user.username
					});
					// Ensure role is not null and groupId is undefined if null
					const userWithRole = {
						...user,
						id: user.id as UserId, // Cast to branded type
						role: user.role || 'user',
						groupId: user.groupId === null ? undefined : (user.groupId as unknown as GroupId)
					};
					return done(null, userWithRole);
				} else {
					logger.warn('AuthDeserialize', 'db.query.users.findFirst returned null/undefined', { userId: id });
				}
			} catch (dbErr) {
				logger.info('AuthDeserialize', 'db.query.users.findFirst threw error', {
					error: String(dbErr)
				});
				logger.warn(
					'AuthDeserialize',
					'DB query error during deserialization, falling back.',
					{
						error: String(dbErr),
						userId: id
					}
				);
				// Fall through to direct SQL approach or mock user in dev mode
			}

			// If in development mode, create a mock user
			if (isDevMode()) {
				logger.info('AuthDeserialize', 'Creating mock user in dev mode', { userId: id });
				// Check if there's a dev role stored in session
				const role = (global as any).devRole || 'user';
				const mockUser = createMockUser(id as UserId, role as any);
				logger.info('AuthDeserialize', 'Mock user created', {
					user: JSON.stringify(mockUser, null, 2)
				});
				// Ensure role is not null and groupId is undefined if null for mock user too
				const mockUserWithRole = {
					...mockUser,
					id: mockUser.id as UserId, // Cast to branded type
					role: mockUser.role || 'user',
					groupId: mockUser.groupId === null ? undefined : (mockUser.groupId as unknown as GroupId)
				};
				return done(null, mockUserWithRole);
			}

			// If we get here, no approach worked
			done(new Error(`User with id ${id} not found`));
		} catch (err) {
			done(err);
		}
	});

	// Return session settings for express-session middleware
	return {
		secret: process.env.SESSION_SECRET || 'sonnet-forum-secret',
		resave: false,
		saveUninitialized: false,
		store: sessionStore,
		cookie: getSessionCookieSettings()
	};
}

// Auth routes
router.post('/register', validateRequest(authValidation.register), register);
router.post('/login', validateRequest(authValidation.login), login);
router.post('/logout', logout);
router.get('/user', getCurrentUser);
router.get('/verify-email', validateRequest(authValidation.verifyEmail), verifyEmail);
router.post(
	'/resend-verification',
	validateRequest(authValidation.resendVerification),
	resendVerification
);

// Test endpoint for unauthenticated responses
router.get('/test-unauthenticated', (req, res) => {
	sendSuccess(res, { authenticated: false });
});

// Dev mode auth switching endpoint
router.get('/dev-mode/set-role', devModeAuthHandler);

// Export middleware for use in other routes
export { isAuthenticated, isAuthenticatedOptional, isAdmin, isModerator, isAdminOrModerator };

export default router;
