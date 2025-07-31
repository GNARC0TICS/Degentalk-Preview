/**
 * Lucia Auth Controller
 * 
 * HTTP endpoints for authentication using Lucia.
 * Replaces the previous Passport.js-based auth controller.
 */

import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { luciaAuthService } from '../services/lucia-auth.service';
import { authRepository } from '../repositories/auth.repository';
import { walletService } from '@domains/wallet';
import { walletConfig } from '@shared/config/wallet.config';
import { UserTransformer } from '@domains/users/transformers/user.transformer';
import { sendSuccess, sendError, errorResponses } from '@utils/api-responses';
import { ApiErrorCode } from '@shared/types/api.types';
import { logger } from '@core/logger';
import { isDevMode } from '@utils/environment';
import { devQuickLogin } from '../../../lib/lucia/dev-auth.js';
import { randomBytes } from 'crypto';
import { db } from '@db';
import { verificationTokens } from '@schema';
import { eq } from 'drizzle-orm';

/**
 * Handle user registration
 */
export async function register(req: Request, res: Response, next: NextFunction) {
  try {
    // Validate registration data
    const registerSchema = z.object({
      username: z.string().min(3).max(30),
      email: z.string().email(),
      password: z.string().min(6),
      confirmPassword: z.string()
    }).refine((data) => data.password === data.confirmPassword, {
      message: "Passwords don't match",
      path: ['confirmPassword']
    });

    const validatedData = registerSchema.parse(req.body);
    const { confirmPassword, ...userData } = validatedData;

    // Register user through service
    const result = await luciaAuthService.register(userData, req);

    if (!result.success || !result.user) {
      return errorResponses.badRequest(res, result.error || 'Registration failed');
    }

    const { user, session, sessionCookie } = result;

    // Initialize wallet for new user (circuit breaker - never fails registration)
    if (walletConfig.WALLET_ENABLED) {
      try {
        const walletResult = await walletService.initializeWallet(user.id);

        logger.info('AUTH', 'Wallet initialization completed for new user', {
          userId: user.id,
          success: walletResult.success,
          dgtWalletCreated: walletResult.dgtWalletCreated,
          welcomeBonusAdded: walletResult.welcomeBonusAdded
        });
      } catch (walletError) {
        logger.error('AUTH', 'Wallet initialization error (non-blocking)', {
          error: walletError,
          userId: user.id
        });
      }
    }

    // Create default preferences
    try {
      const { createDefaultPreferences } = await import('../../preferences/preferences.service');
      await createDefaultPreferences(user.id);
      logger.info('AUTH', 'Created default preferences for new user', { userId: user.id });
    } catch (error) {
      logger.error('AUTH', 'Error creating default preferences (non-blocking)', {
        error,
        userId: user.id
      });
    }

    // Set session cookie if we have one (dev mode auto-login)
    if (sessionCookie) {
      res.setHeader('Set-Cookie', sessionCookie.serialize());
    }

    // Transform user for response
    const transformedUser = UserTransformer.toAuthenticatedSelf(user);

    return sendSuccess(
      res,
      {
        user: transformedUser,
        message: result.message
      },
      result.message || 'Registration successful',
      201
    );
  } catch (err) {
    if (err instanceof z.ZodError) {
      return errorResponses.validationError(res, 'Validation error', { errors: err.errors });
    }
    next(err);
  }
}

/**
 * Handle user login
 */
export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const { username, password } = req.body;

    // Validate input
    if (!username || !password) {
      return errorResponses.badRequest(res, 'Username and password are required');
    }

    // Dev mode bypass
    if (isDevMode() && process.env.DEV_BYPASS_PASSWORD === 'true') {
      try {
        const { user, session, sessionCookie } = await devQuickLogin(username);
        
        // Set session cookie
        res.setHeader('Set-Cookie', sessionCookie.serialize());
        
        logger.info('AUTH', 'Dev mode login bypass', { 
          username: user.username, 
          role: user.role 
        });
        
        return sendSuccess(res, {
          user: UserTransformer.toAuthenticatedSelf(user),
          sessionId: session.id
        });
      } catch (error) {
        logger.error('AUTH', 'Dev mode login failed', { error });
        // Fall through to regular login
      }
    }

    // Attempt login through service
    const result = await luciaAuthService.login(username, password, req);

    if (!result.success || !result.user || !result.sessionCookie) {
      return errorResponses.unauthorized(res, result.error || 'Invalid credentials');
    }

    const { user, session, sessionCookie } = result;

    // Set session cookie
    res.setHeader('Set-Cookie', sessionCookie.serialize());

    // Ensure wallet is initialized (non-blocking)
    if (walletConfig.WALLET_ENABLED && user.id) {
      try {
        const dgtWallet = await walletService.getUserBalance(user.id);
        logger.debug('AUTH', 'DGT wallet verified for user login', {
          userId: user.id,
          balance: dgtWallet.dgtBalance
        });
      } catch (walletError) {
        logger.warn('AUTH', 'Non-critical wallet check failed during login', {
          error: walletError,
          userId: user.id
        });
      }
    }

    // Transform user for response
    const transformedUser = UserTransformer.toAuthenticatedSelf(user);

    return sendSuccess(res, {
      user: transformedUser,
      sessionId: session.id
    });
  } catch (error) {
    logger.error('AUTH', 'Login error', { error });
    next(error);
  }
}

/**
 * Handle user logout
 */
export async function logout(req: Request, res: Response, next: NextFunction) {
  try {
    // Get session ID from request (populated by middleware)
    const sessionId = req.sessionId;

    // Invalidate session if exists
    if (sessionId) {
      await luciaAuthService.logout(sessionId);
    }

    // Clear session cookie
    const blankCookie = luciaAuthService.createBlankSessionCookie();
    res.setHeader('Set-Cookie', blankCookie.serialize());

    return sendSuccess(res, null, 'Logged out successfully');
  } catch (error) {
    logger.error('AUTH', 'Logout error', { error });
    // Even if logout fails, clear the cookie
    const blankCookie = luciaAuthService.createBlankSessionCookie();
    res.setHeader('Set-Cookie', blankCookie.serialize());
    
    return sendSuccess(res, null, 'Logged out');
  }
}

/**
 * Get current user profile
 */
export async function getCurrentUser(req: Request, res: Response) {
  // User is populated by middleware
  const user = req.user;

  if (!user) {
    return errorResponses.unauthorized(res, 'Not authenticated');
  }

  // Transform user for response
  const transformedUser = UserTransformer.toAuthenticatedSelf(user);

  return sendSuccess(res, transformedUser);
}

/**
 * Refresh session
 * Extends the session expiry time
 */
export async function refreshSession(req: Request, res: Response) {
  const sessionId = req.sessionId;
  const user = req.user;

  if (!sessionId || !user) {
    return errorResponses.unauthorized(res, 'Not authenticated');
  }

  try {
    // Validate and potentially refresh the session
    const { session } = await luciaAuthService.validateSession(sessionId);
    
    if (!session) {
      return errorResponses.unauthorized(res, 'Invalid session');
    }

    // If session was refreshed, cookie is already set by middleware
    return sendSuccess(res, {
      user: UserTransformer.toAuthenticatedSelf(user),
      sessionId: session.id,
      expiresAt: session.expiresAt
    });
  } catch (error) {
    logger.error('AUTH', 'Session refresh error', { error });
    return errorResponses.serverError(res, 'Failed to refresh session');
  }
}

/**
 * Invalidate all sessions for current user
 * Useful for security - logs out from all devices
 */
export async function invalidateAllSessions(req: Request, res: Response) {
  const user = req.user;

  if (!user) {
    return errorResponses.unauthorized(res, 'Not authenticated');
  }

  try {
    await luciaAuthService.invalidateAllUserSessions(user.id);
    
    // Clear current session cookie
    const blankCookie = luciaAuthService.createBlankSessionCookie();
    res.setHeader('Set-Cookie', blankCookie.serialize());

    return sendSuccess(res, null, 'All sessions invalidated successfully');
  } catch (error) {
    logger.error('AUTH', 'Failed to invalidate all sessions', { error, userId: user.id });
    return errorResponses.serverError(res, 'Failed to invalidate sessions');
  }
}

/**
 * Handle email verification
 */
export async function verifyEmail(req: Request, res: Response, next: NextFunction) {
  try {
    const { token } = req.query;

    if (!token || typeof token !== 'string') {
      return errorResponses.badRequest(res, 'Verification token is required');
    }

    // Find token in database
    const [verificationToken] = await db
      .select()
      .from(verificationTokens)
      .where(eq(verificationTokens.token, token))
      .limit(1);

    if (!verificationToken) {
      return errorResponses.badRequest(res, 'Invalid verification token');
    }

    // Check if token is expired
    if (new Date() > verificationToken.expiresAt) {
      return errorResponses.badRequest(res, 'Verification token has expired');
    }

    // Activate user
    await authRepository.activateUser(verificationToken.userId);

    // Delete used token
    await db
      .delete(verificationTokens)
      .where(eq(verificationTokens.token, token));

    return sendSuccess(res, null, 'Email verified successfully. You can now log in.');
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
      return errorResponses.badRequest(res, 'Email is required');
    }

    // Find user by email
    const user = await authRepository.findUserByEmail(email);
    
    if (!user) {
      // For security, don't reveal if email exists
      return sendSuccess(
        res,
        null,
        'If your email exists in our system, you will receive a verification email shortly.'
      );
    }

    // Check if already active
    if (user.isActive) {
      return errorResponses.badRequest(res, 'This account is already active');
    }

    // Generate new verification token
    const verificationToken = randomBytes(20).toString('hex');

    // Store the new token
    await db.insert(verificationTokens).values({
      userId: user.id,
      token: verificationToken,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
    });

    // TODO: Send verification email
    logger.info('AUTH', 'Verification email requested', {
      email,
      token: verificationToken
    });

    return sendSuccess(
      res,
      null,
      'If your email exists in our system, you will receive a verification email shortly.'
    );
  } catch (err) {
    next(err);
  }
}

/**
 * Update user password
 * Requires current password for security
 */
export async function updatePassword(req: Request, res: Response, next: NextFunction) {
  try {
    const user = req.user;
    if (!user) {
      return errorResponses.unauthorized(res, 'Not authenticated');
    }

    const { currentPassword, newPassword, confirmNewPassword } = req.body;

    // Validate input
    if (!currentPassword || !newPassword || !confirmNewPassword) {
      return errorResponses.badRequest(res, 'All password fields are required');
    }

    if (newPassword !== confirmNewPassword) {
      return errorResponses.badRequest(res, 'New passwords do not match');
    }

    if (newPassword.length < 6) {
      return errorResponses.badRequest(res, 'New password must be at least 6 characters');
    }

    // Verify current password
    const { verified } = await authRepository.verifyPassword(user.id, currentPassword);
    if (!verified) {
      return errorResponses.unauthorized(res, 'Current password is incorrect');
    }

    // Update password
    await authRepository.updatePassword(user.id, newPassword);

    // Invalidate all sessions for security
    await luciaAuthService.invalidateAllUserSessions(user.id);

    // Clear current session cookie
    const blankCookie = luciaAuthService.createBlankSessionCookie();
    res.setHeader('Set-Cookie', blankCookie.serialize());

    logger.info('AUTH', 'Password updated', { userId: user.id });

    return sendSuccess(
      res,
      null,
      'Password updated successfully. Please log in again with your new password.'
    );
  } catch (err) {
    next(err);
  }
}

/**
 * Forgot password - initiate password reset
 */
export async function forgotPassword(req: Request, res: Response, next: NextFunction) {
  try {
    const { email } = req.body;

    if (!email) {
      return errorResponses.badRequest(res, 'Email is required');
    }

    // Find user by email
    const user = await authRepository.findUserByEmail(email);

    // Always return success for security
    if (!user) {
      return sendSuccess(
        res,
        null,
        'If your email exists in our system, you will receive a password reset email shortly.'
      );
    }

    // Generate reset token
    const resetToken = randomBytes(20).toString('hex');
    const hashedToken = createHash('sha256').update(resetToken).digest('hex');

    // Store token with 1 hour expiry
    await db.insert(verificationTokens).values({
      userId: user.id,
      token: hashedToken,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
      type: 'password_reset' as any // We'll need to add this field to schema
    });

    // TODO: Send reset email with token
    logger.info('AUTH', 'Password reset requested', {
      email,
      token: resetToken // In dev, log the actual token
    });

    return sendSuccess(
      res,
      null,
      'If your email exists in our system, you will receive a password reset email shortly.'
    );
  } catch (err) {
    next(err);
  }
}

/**
 * Reset password - complete password reset
 */
export async function resetPassword(req: Request, res: Response, next: NextFunction) {
  try {
    const { token, newPassword, confirmNewPassword } = req.body;

    // Validate input
    if (!token || !newPassword || !confirmNewPassword) {
      return errorResponses.badRequest(res, 'All fields are required');
    }

    if (newPassword !== confirmNewPassword) {
      return errorResponses.badRequest(res, 'Passwords do not match');
    }

    if (newPassword.length < 6) {
      return errorResponses.badRequest(res, 'Password must be at least 6 characters');
    }

    // Hash the token to match stored version
    const hashedToken = createHash('sha256').update(token).digest('hex');

    // Find token in database
    const [resetToken] = await db
      .select()
      .from(verificationTokens)
      .where(eq(verificationTokens.token, hashedToken))
      .limit(1);

    if (!resetToken) {
      return errorResponses.badRequest(res, 'Invalid or expired reset token');
    }

    // Check if token is expired
    if (new Date() > resetToken.expiresAt) {
      return errorResponses.badRequest(res, 'Reset token has expired');
    }

    // Update password
    await authRepository.updatePassword(resetToken.userId, newPassword);

    // Delete used token
    await db
      .delete(verificationTokens)
      .where(eq(verificationTokens.token, hashedToken));

    // Invalidate all sessions for security
    await luciaAuthService.invalidateAllUserSessions(resetToken.userId);

    logger.info('AUTH', 'Password reset completed', { userId: resetToken.userId });

    return sendSuccess(
      res,
      null,
      'Password reset successfully. You can now log in with your new password.'
    );
  } catch (err) {
    next(err);
  }
}

/**
 * Delete user account
 * Requires password confirmation for security
 */
export async function deleteAccount(req: Request, res: Response, next: NextFunction) {
  try {
    const user = req.user;
    if (!user) {
      return errorResponses.unauthorized(res, 'Not authenticated');
    }

    const { password, confirmDelete } = req.body;

    // Validate input
    if (!password) {
      return errorResponses.badRequest(res, 'Password is required to delete account');
    }

    if (confirmDelete !== 'DELETE') {
      return errorResponses.badRequest(res, 'Please type DELETE to confirm account deletion');
    }

    // Verify password
    const { verified } = await authRepository.verifyPassword(user.id, password);
    if (!verified) {
      return errorResponses.unauthorized(res, 'Incorrect password');
    }

    // Soft delete the user account
    await authRepository.softDeleteUser(user.id);

    // Invalidate all sessions
    await luciaAuthService.invalidateAllUserSessions(user.id);

    // Clear current session cookie
    const blankCookie = luciaAuthService.createBlankSessionCookie();
    res.setHeader('Set-Cookie', blankCookie.serialize());

    logger.info('AUTH', 'Account deleted', { userId: user.id, username: user.username });

    return sendSuccess(
      res,
      null,
      'Your account has been successfully deleted. We\'re sorry to see you go.'
    );
  } catch (err) {
    next(err);
  }
}