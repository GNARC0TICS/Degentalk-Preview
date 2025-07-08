import { userService } from '@server/src/core/services/user.service';
import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { createHash, randomBytes } from 'crypto';
import passport from 'passport';
import { insertUserSchema } from '@schema';
import { users } from '@schema';
import { logger } from '@server/src/core/logger';
import { storage } from '@server/src/storage'; // Will be refactored in a future step
import { hashPassword, storeTempDevMetadata, verifyEmailToken } from '../services/auth.service';
import { isDevMode } from '../../../utils/environment';
import { walletService } from '../../wallet/wallet.service';
import { dgtService } from '../../wallet/dgt.service';
import { walletConfig } from '@shared/wallet.config';
import { UserTransformer } from "@server/src/domains/users/transformers/user.transformer";
import { sendSuccessResponse, sendErrorResponse } from "@server/src/core/utils/transformer.helpers";

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
		const existingUser = await storage.getUserByUsername(userData.username);
		if (existingUser) {
			return res.status(400).json({ message: 'Username already exists' });
		}

		// Store temporary dev metadata if beta tools are enabled
		const tempDevMetadata = await storeTempDevMetadata(userData.password);

		// Create the user with hashed password
		const user = await storage.createUser({
			...userData,
			password: await hashPassword(userData.password),
			tempDevMeta: tempDevMetadata,
			isActive: isDevMode() ? true : false // Automatically active in dev mode
		});

		// Initialize wallet for new user
		if (walletConfig.WALLET_ENABLED) {
			try {
				// Initialize DGT wallet
				await dgtService.initializeUserWallet(user.id);
				logger.info('AuthController', 'DGT wallet initialized for new user', { userId: user.id });

				// Initialize CCPayment wallet
				const ccpaymentId = await walletService.ensureCcPaymentWallet(user.id);
				logger.info('AuthController', 'CCPayment wallet initialized for new user', {
					userId: user.id,
					ccpaymentId
				});
			} catch (walletError) {
				logger.error('AuthController', 'Error initializing wallet for new user', {
					err: walletError,
					userId: user.id
				});
				// Continue with registration even if wallet creation fails
			}
		}

		// Create default settings for the new user
		try {
			// TODO: Implement or verify createDefaultSettings functionality
			// Import the settings service
			// const { createDefaultSettings } = await import('../../admin/sub-domains/settings/settings.service');
			// await createDefaultSettings(user.id);
			logger.info(
				'AuthController',
				'Skipping default settings creation for new user - to be implemented/verified.',
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
			return res.status(201).json({
				message: 'Registration successful in development mode. User is automatically activated.',
				devMode: true
			});
		}

		// Generate verification token
		const verificationToken = randomBytes(20).toString('hex');
		// Store token in database (replace with secure token storage later)
		await storage.storeVerificationToken(user.id, verificationToken);

		// Send verification email (replace with actual email sending logic)
		logger.info('AuthController', `Verification email sent to ${userData.email}`, {
			email: userData.email,
			token: verificationToken
		});

		res.status(201).json({
			message: 'Registration successful. Please check your email to verify your account.'
		});
	} catch (err) {
		if (err instanceof z.ZodError) {
			return res.status(400).json({
				message: 'Validation error',
				errors: err.errors
			});
		}
		next(err);
	}
}

/**
 * Handle user login
 */
export function login(req: Request, res: Response, next: NextFunction) {
	logger.info('Login attempt', { username: req.body.username });
	passport.authenticate('local', (err: Error, user: any, info: any) => {
		logger.debug('Passport authenticate callback', { hasError: !!err, hasUser: !!user, info });
		if (err) {
			logger.error('Authentication error', err);
			return next(err);
		}
		if (!user) {
			logger.warn('Authentication failed', { message: info?.message || 'No user returned' });
			return res.status(401).json({ message: info?.message || 'Authentication failed' });
		}

		logger.info('User authenticated', { username: user.username, userId: user.id });
		req.login(user, async (err) => {
			if (err) {
				logger.error('Login session error', err);
				return next(err);
			}

			// Ensure wallet is initialized for existing users
			if (walletConfig.WALLET_ENABLED && user.id) {
				try {
					// Initialize DGT wallet if needed
					await dgtService.initializeUserWallet(user.id);

					// Initialize CCPayment wallet if needed
					await walletService.ensureCcPaymentWallet(user.id);
				} catch (walletError) {
					logger.error('AuthController', 'Error ensuring wallet for user login', {
						err: walletError,
						userId: user.id
					});
					// Continue with login even if wallet check fails
				}
			}

			// Remove password from response
			const userResponse = { ...user };
			delete userResponse.password;

			res.status(200).json(userResponse);
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
	if (!req.isAuthenticated()) return res.sendStatus(401);

	// Remove password from response
	const userResponse = { ...(userService.getUserFromRequest(req) as any) };
	delete userResponse.password;

	// Add computed role properties for frontend compatibility
	userResponse.isAdmin = ['admin', 'super_admin'].includes(userResponse.role);
	userResponse.isModerator = ['moderator', 'mod'].includes(userResponse.role);
	userResponse.isSuperAdmin = userResponse.role === 'super_admin';

	sendSuccessResponse(res, UserTransformer.toAuthenticatedSelf(userResponse));
}

/**
 * Handle email verification
 */
export async function verifyEmail(req: Request, res: Response, next: NextFunction) {
	try {
		const { token } = req.query;

		if (!token || typeof token !== 'string') {
			return res.status(400).json({ message: 'Invalid verification token' });
		}

		// Find and validate token
		const isValid = await verifyEmailToken(token);

		if (!isValid) {
			return res.status(400).json({
				message: 'Invalid or expired verification token. Please request a new one.'
			});
		}

		// Activate the user account
		const userId = isValid.userId;
		await storage.updateUser(userId, { isActive: true });

		return res.status(200).json({
			message: 'Email verified successfully. You can now log in to your account.'
		});
	} catch (err) {
		next(err);
	}
}

/**
 * Resend verification email
 */
export async function resendVerification(req: Request, res: Response, next: NextFunction) {
	try {
		const { email } = req.body;

		if (!email) {
			return res.status(400).json({ message: 'Email is required' });
		}

		// Find user by email
		const user = await storage.getUserByEmail(email);
		if (!user) {
			// For security reasons, don't reveal if email exists or not
			return res.status(200).json({
				message:
					'If your email exists in our system, you will receive a verification email shortly.'
			});
		}

		// Check if account is already active
		if (user.isActive) {
			return res.status(400).json({
				message: 'This account is already active. Please try logging in.'
			});
		}

		// Generate new verification token
		const verificationToken = randomBytes(20).toString('hex');

		// Store the new token
		await storage.storeVerificationToken(user.id, verificationToken);

		// Send verification email (replace with actual email sending logic)
		logger.info('AuthController', `Verification email re-sent to ${email}`, {
			email,
			token: verificationToken
		});

		res.status(200).json({
			message: 'If your email exists in our system, you will receive a verification email shortly.'
		});
	} catch (err) {
		next(err);
	}
}
