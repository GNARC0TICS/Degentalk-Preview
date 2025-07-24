import { userService } from '@core/services/user.service';
import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { createHash, randomBytes } from 'crypto';
import passport from 'passport';
import { insertUserSchema } from '@schema';
import { users, verificationTokens } from '@schema';
import { logger } from '@core/logger';
import { db } from '@core/db'; // Will be refactored in a future step
import { eq } from 'drizzle-orm';
import {
	hashPassword,
	storeTempDevMetadata,
	verifyEmailToken
} from '@api/domains/auth/services/auth.service';
import { isDevMode } from '@api/utils/environment';
import { walletService } from '@api/domains/wallet';
import { walletConfig } from '@shared/wallet.config';
import { UserTransformer } from '@api/domains/users/transformers/user.transformer';
import { sendSuccessResponse, sendErrorResponse } from '@core/utils/transformer.helpers';
import { generateToken } from '../utils/jwt.utils';

type User = typeof users.$inferSelect;

/**
 * Handle user registration
 */
export async function register(req: Request, res: Response, next: NextFunction) {
	try {
		// Validate registration data
		const registerSchema = insertUserSchema
			.extend({
				confirmPassword: z.string()
			})
			.refine((data) => data.password === data.confirmPassword, {
				message: "Passwords don't match",
				path: ['confirmPassword']
			});

		const validatedData = registerSchema.parse(req.body);
		const { confirmPassword, ...userData } = validatedData as any;

		// Check if username already exists
		const [existingUser] = await db.select().from(users).where(eq(users.username, userData.username));
		if (existingUser) {
			return sendErrorResponse(res, 'Username already exists', 400);
		}

		// Store temporary dev metadata if beta tools are enabled
		const tempDevMetadata = await storeTempDevMetadata(userData.password);

		// Create the user with hashed password
		const [user] = await db.insert(users).values({
			...userData,
			password: await hashPassword(userData.password),
			tempDevMeta: tempDevMetadata,
			isActive: isDevMode() ? true : false // Automatically active in dev mode
		}).returning();

		// Initialize wallet for new user (circuit breaker - never fails registration)
		if (walletConfig.WALLET_ENABLED) {
			try {
				const walletResult = await walletService.initializeWallet(user.id);

				logger.info('AuthController', 'Wallet initialization completed for new user', {
					userId: user.id,
					success: walletResult.success,
					dgtWalletCreated: walletResult.dgtWalletCreated,
					welcomeBonusAdded: walletResult.welcomeBonusAdded,
					cryptoWalletsCreated: walletResult.walletsCreated
				});

				// Log specific outcomes for monitoring
				if (!walletResult.dgtWalletCreated) {
					logger.warn('AuthController', 'DGT wallet creation failed during registration', {
						userId: user.id
					});
				}
				if (!walletResult.welcomeBonusAdded) {
					logger.warn('AuthController', 'Welcome bonus failed during registration', {
						userId: user.id
					});
				}
			} catch (walletError) {
				// This should never happen due to circuit breaker, but log if it does
				logger.error('AuthController', 'Unexpected wallet initialization error', {
					err: walletError,
					userId: user.id
				});
				// Continue with registration - wallet issues never block user creation
			}
		}

		// Create default settings for the new user
		try {
			const { createDefaultPreferences } = await import('../../preferences/preferences.service');
			await createDefaultPreferences(user.id);
			logger.info(
				'AuthController',
				'Created default preferences for new user',
				{ userId: user.id }
			);
		} catch (settingsError) {
			logger.error('AuthController', 'Error during (attempted) default user settings creation', {
				err: settingsError,
				userId: user.id
			});
			// Continue with registration even if settings creation fails
		}

		// In dev mode, we skip verification
		if (isDevMode()) {
			return sendSuccessResponse(
				res,
				{
					message: 'Registration successful in development mode. User is automatically activated.',
					devMode: true
				},
				'',
				201
			);
		}

		// Generate verification token
		const verificationToken = randomBytes(20).toString('hex');
		// Store token in database (replace with secure token storage later)
		await db.insert(verificationTokens).values({ userId: user.id, token: verificationToken, expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) });

		// Send verification email (replace with actual email sending logic)
		logger.info('AuthController', `Verification email sent to ${userData.email}`, {
			email: userData.email,
			token: verificationToken
		});

		sendSuccessResponse(
			res,
			{
				message: 'Registration successful. Please check your email to verify your account.'
			},
			'',
			201
		);
	} catch (err) {
		if (err instanceof z.ZodError) {
			return sendErrorResponse(res, 'Validation error', 400, { errors: err.errors });
		}
		next(err);
	}
}

/**
 * Handle user login
 * Note: Input is validated by validateRequest middleware before reaching this controller
 */
export function login(req: Request, res: Response, next: NextFunction) {
	// req.body is now validated by auth.validation.login schema
	logger.info('Login attempt', { username: req.body.username });
	passport.authenticate('local', (err: Error, user: any, info: any) => {
		logger.debug('Passport authenticate callback', { hasError: !!err, hasUser: !!user, info });
		if (err) {
			logger.error('Authentication error', err);
			return next(err);
		}
		if (!user) {
			logger.warn('Authentication failed', { message: info?.message || 'No user returned' });
			return sendErrorResponse(res, info?.message || 'Authentication failed', 401);
		}

		logger.info('User authenticated', { username: user.username, userId: user.id });
		req.login(user, async (err) => {
			if (err) {
				logger.error('Login session error', err);
				return next(err);
			}

			// Ensure wallet is initialized for existing users (non-blocking)
			if (walletConfig.WALLET_ENABLED && user.id) {
				try {
					// Ensure DGT wallet exists (but don't re-initialize if already exists)
					const dgtWallet = await walletService.getUserBalance(user.id);
					logger.debug('AuthController', 'DGT wallet verified for user login', {
						userId: user.id,
						balance: dgtWallet.dgtBalance
					});

					// Ensure CCPayment wallet if needed (non-critical)
					const ccpaymentId = await walletService.ensureCcPaymentWallet(user.id);
					if (ccpaymentId) {
						logger.debug('AuthController', 'CCPayment wallet verified for user login', {
							userId: user.id,
							ccpaymentId
						});
					}
				} catch (walletError) {
					logger.warn('AuthController', 'Non-critical wallet check failed during login', {
						err: walletError,
						userId: user.id
					});
					// Continue with login - wallet issues never block authentication
				}
			}

			// Remove password from response
			const userResponse = { ...user };
			delete userResponse.password;

			// Generate JWT token for API access
			const token = generateToken(user.id);
			
			// Decode token to get expiration time
			const tokenParts = token.split('.');
			if (tokenParts.length === 3) {
				try {
					const payload = JSON.parse(Buffer.from(tokenParts[1], 'base64').toString());
					const expiresAt = payload.exp ? new Date(payload.exp * 1000).toISOString() : null;
					
					sendSuccessResponse(res, {
						user: userResponse,
						token,
						expiresAt
					});
				} catch {
					// If decoding fails, just send token without expiration
					sendSuccessResponse(res, {
						user: userResponse,
						token
					});
				}
			} else {
				sendSuccessResponse(res, {
					user: userResponse,
					token
				});
			}
		});
	})(req, res, next);
}

/**
 * Handle user logout
 */
export function logout(req: Request, res: Response, next: NextFunction) {
	req.logout((err) => {
		if (err) return next(err);
		res.sendStatus(200);
	});
}

/**
 * Get current user profile
 */
export function getCurrentUser(req: Request, res: Response) {
	if (!req.isAuthenticated()) return sendErrorResponse(res, 'Unauthorized', 401);

	// Remove password from response
	const userResponse = { ...(userService.getUserFromRequest(req) as any) };
	delete userResponse.password;

	// Add computed role properties for frontend compatibility
	userResponse.isAdmin = ['admin', 'super_admin'].includes(userResponse.role);
	userResponse.isModerator = ['moderator', 'moderator'].includes(userResponse.role);
	userResponse.isSuperAdmin = userResponse.role === 'super_admin';

	sendSuccessResponse(res, UserTransformer.toAuthenticatedSelf(userResponse));
}

/**
 * Handle email verification
 * Note: Input is validated by validateRequest middleware before reaching this controller
 */
export async function verifyEmail(req: Request, res: Response, next: NextFunction) {
	try {
		// req.query is now validated by auth.validation.verifyEmail schema
		const { token } = req.query;

		// Find and validate token
		const isValid = await verifyEmailToken(token);

		if (!isValid) {
			return sendErrorResponse(
				res,
				'Invalid or expired verification token. Please request a new one.',
				400
			);
		}

		// Activate the user account
		const userId = isValid.userId;
		await db.update(users).set({ isActive: true }).where(eq(users.id, userId));

		return sendSuccessResponse(res, {
			message: 'Email verified successfully. You can now log in to your account.'
		});
	} catch (err) {
		next(err);
	}
}

/**
 * Resend verification email
 * Note: Input is validated by validateRequest middleware before reaching this controller
 */
export async function resendVerification(req: Request, res: Response, next: NextFunction) {
	try {
		// req.body is now validated by auth.validation.resendVerification schema
		const { email } = req.body;

		// Find user by email
		const [user] = await db.select().from(users).where(eq(users.email, email));
		if (!user) {
			// For security reasons, don't reveal if email exists or not
			return sendSuccessResponse(res, {
				message:
					'If your email exists in our system, you will receive a verification email shortly.'
			});
		}

		// Check if account is already active
		if (user.isActive) {
			return sendErrorResponse(res, 'This account is already active. Please try logging in.', 400);
		}

		// Generate new verification token
		const verificationToken = randomBytes(20).toString('hex');

		// Store the new token
		await db.insert(verificationTokens).values({ userId: user.id, token: verificationToken, expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) });

		// Send verification email (replace with actual email sending logic)
		logger.info('AuthController', `Verification email re-sent to ${email}`, {
			email,
			token: verificationToken
		});

		sendSuccessResponse(res, {
			message: 'If your email exists in our system, you will receive a verification email shortly.'
		});
	} catch (err) {
		next(err);
	}
}
