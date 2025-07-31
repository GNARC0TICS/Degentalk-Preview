/**
 * Auth Routes
 * 
 * HTTP routes for authentication using Lucia.
 * Replaces the previous Passport.js-based routes.
 */

import { Router } from 'express';
import * as authController from './controllers/lucia-auth.controller';
import { luciaAuth } from '@middleware/lucia-auth.middleware';
import { validateRequest } from '@middleware/validate-request';
import { authValidation } from './validation/auth.validation';

const router = Router();

// Public routes (no auth required)
router.post('/register', 
  luciaAuth.rateLimit(),
  luciaAuth.csrf,
  validateRequest(authValidation.register),
  luciaAuth.logEvent('register'),
  authController.register
);

router.post('/login',
  luciaAuth.rateLimit(),
  luciaAuth.csrf,
  validateRequest(authValidation.login),
  luciaAuth.logEvent('login'),
  authController.login
);

router.post('/logout',
  luciaAuth.optional,
  luciaAuth.logEvent('logout'),
  authController.logout
);

// Email verification
router.get('/verify-email',
  validateRequest(authValidation.verifyEmail),
  authController.verifyEmail
);

router.post('/resend-verification',
  luciaAuth.rateLimit(),
  validateRequest(authValidation.resendVerification),
  authController.resendVerification
);

// Password reset
router.post('/forgot-password',
  luciaAuth.rateLimit(),
  validateRequest(authValidation.forgotPassword),
  authController.forgotPassword
);

router.post('/reset-password',
  luciaAuth.rateLimit(),
  validateRequest(authValidation.resetPassword),
  authController.resetPassword
);

// Protected routes (auth required)
router.get('/me',
  luciaAuth.require,
  authController.getCurrentUser
);

router.post('/refresh',
  luciaAuth.require,
  authController.refreshSession
);

router.post('/invalidate-all',
  luciaAuth.require,
  luciaAuth.logEvent('invalidate-all'),
  authController.invalidateAllSessions
);

router.put('/password',
  luciaAuth.require,
  validateRequest(authValidation.updatePassword),
  luciaAuth.logEvent('password-update'),
  authController.updatePassword
);

router.delete('/account',
  luciaAuth.require,
  validateRequest(authValidation.deleteAccount),
  luciaAuth.logEvent('account-delete'),
  authController.deleteAccount
);

export default router;