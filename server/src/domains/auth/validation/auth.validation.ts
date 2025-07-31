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

// Forgot password validation
export const forgotPasswordValidation = z.object({
	body: z.object({
		email: z.string().email('Invalid email format')
	})
});

// Reset password validation
export const resetPasswordValidation = z.object({
	body: z.object({
		token: z.string().min(1, 'Reset token is required'),
		newPassword: z
			.string()
			.min(8, 'Password must be at least 8 characters')
			.max(100, 'Password too long'),
		confirmNewPassword: z.string()
	}).refine((data) => data.newPassword === data.confirmNewPassword, {
		message: "Passwords don't match",
		path: ['confirmNewPassword']
	})
});

// Update password validation
export const updatePasswordValidation = z.object({
	body: z.object({
		currentPassword: z.string().min(1, 'Current password is required'),
		newPassword: z
			.string()
			.min(8, 'Password must be at least 8 characters')
			.max(100, 'Password too long'),
		confirmNewPassword: z.string()
	}).refine((data) => data.newPassword === data.confirmNewPassword, {
		message: "Passwords don't match",
		path: ['confirmNewPassword']
	})
});

// Delete account validation
export const deleteAccountValidation = z.object({
	body: z.object({
		password: z.string().min(1, 'Password is required'),
		confirmDelete: z.literal('DELETE', {
			errorMap: () => ({ message: 'Please type DELETE to confirm' })
		})
	})
});

// Export for route usage
export const authValidation = {
	login: loginValidation,
	register: registerValidation,
	verifyEmail: verifyEmailValidation,
	resendVerification: resendVerificationValidation,
	forgotPassword: forgotPasswordValidation,
	resetPassword: resetPasswordValidation,
	updatePassword: updatePasswordValidation,
	deleteAccount: deleteAccountValidation
};
