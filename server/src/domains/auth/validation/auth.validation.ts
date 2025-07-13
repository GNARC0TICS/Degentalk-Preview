import { z } from 'zod';

/**
 * Auth Validation Schemas
 *
 * Zod schemas for validating authentication requests
 */

// Login validation
export const loginValidation = z.object({
	body: z.object({
		username: z
			.string()
			.min(1, 'Username is required')
			.max(50, 'Username must be less than 50 characters'),
		password: z.string().min(1, 'Password is required').max(200, 'Password too long')
	})
});

// Registration validation (already exists in controller, but for consistency)
export const registerValidation = z.object({
	body: z
		.object({
			username: z
				.string()
				.min(3, 'Username must be at least 3 characters')
				.max(30, 'Username must be less than 30 characters'),
			email: z.string().email('Invalid email format'),
			password: z
				.string()
				.min(8, 'Password must be at least 8 characters')
				.max(100, 'Password too long'),
			confirmPassword: z.string()
		})
		.refine((data) => data.password === data.confirmPassword, {
			message: "Passwords don't match",
			path: ['confirmPassword']
		})
});

// Email verification validation
export const verifyEmailValidation = z.object({
	query: z.object({
		token: z.string().min(1, 'Verification token is required'),
		userId: z.string().uuid('Invalid user ID format').optional()
	})
});

// Resend verification validation
export const resendVerificationValidation = z.object({
	body: z.object({
		email: z.string().email('Invalid email format')
	})
});

// Export for route usage
export const authValidation = {
	login: loginValidation,
	register: registerValidation,
	verifyEmail: verifyEmailValidation,
	resendVerification: resendVerificationValidation
};
