/**
 * Auth Data Transformer - Security-First Implementation
 *
 * Transforms authentication responses and session data into secure
 * response objects with proper token handling and privacy controls.
 */

import type { UserId } from '@shared/types/ids';
import { createHash } from 'crypto';
import { logger } from '@core/logger';

// Auth Response Interfaces
export interface PublicAuthStatus {
	isAuthenticated: boolean;
	user?: {
		id: UserId;
		username: string;
		avatarUrl?: string;
		level: number;
		role: string;
	};
	permissions?: string[];
}

export interface AuthenticatedAuthResponse {
	isAuthenticated: true;
	user: {
		id: UserId;
		username: string;
		email: string;
		avatarUrl?: string;
		level: number;
		role: string;
		joinedAt: string;
		lastSeenAt?: string;
		verified: boolean;
	};
	session: {
		sessionId: string; // Hashed session ID for client reference
		expiresAt: string;
		createdAt: string;
		lastActivity: string;
	};
	permissions: string[];
	preferences?: {
		theme?: string;
		language?: string;
		notifications?: boolean;
	};
}

export interface AdminAuthResponse extends AuthenticatedAuthResponse {
	adminContext: {
		impersonating?: UserId;
		lastAdminAction?: string;
		adminPermissions: string[];
		securityLevel: 'standard' | 'elevated' | 'super';
	};
	sessionMetadata: {
		ipAddress: string; // Hashed for privacy
		userAgent: string;
		loginCount: number;
		lastLoginAt: string;
		failedAttempts: number;
	};
}

export interface LoginResponse {
	success: boolean;
	message: string;
	user?: {
		id: UserId;
		username: string;
		avatarUrl?: string;
		role: string;
		verified: boolean;
	};
	token?: string; // JWT or session token
	requiresVerification?: boolean;
	requiresMfa?: boolean;
}

export interface RegistrationResponse {
	success: boolean;
	message: string;
	user?: {
		id: UserId;
		username: string;
		email: string; // Only shown immediately after registration
		requiresVerification: boolean;
	};
	nextSteps?: string[];
}

export interface PasswordResetResponse {
	success: boolean;
	message: string;
	// Never expose sensitive data in password reset responses
}

export class AuthTransformer {
	/**
	 * Transform auth status for public/unauthenticated users
	 */
	static toPublicAuthStatus(authData?: any): PublicAuthStatus {
		if (!authData || !authData.isAuthenticated) {
			return { isAuthenticated: false };
		}

		return {
			isAuthenticated: true,
			user: {
				id: authData.user.id as UserId,
				username: authData.user.username,
				avatarUrl: authData.user.avatarUrl,
				level: authData.user.level || 1,
				role: this.sanitizePublicRole(authData.user.role)
			},
			permissions: this.getPublicPermissions(authData.permissions || [])
		};
	}

	/**
	 * Transform full auth response for authenticated users
	 */
	static toAuthenticatedResponse(authData: any, sessionData: any): AuthenticatedAuthResponse {
		if (!authData || !authData.user) {
			throw new Error('Invalid auth data provided to transformer');
		}

		return {
			isAuthenticated: true,
			user: {
				id: authData.user.id as UserId,
				username: authData.user.username,
				email: authData.user.email,
				avatarUrl: authData.user.avatarUrl,
				level: authData.user.level || 1,
				role: authData.user.role,
				joinedAt: authData.user.createdAt,
				lastSeenAt: authData.user.lastSeenAt,
				verified: authData.user.verified || false
			},
			session: {
				sessionId: this.hashSessionId(sessionData.id),
				expiresAt: sessionData.expiresAt,
				createdAt: sessionData.createdAt,
				lastActivity: sessionData.lastActivity || new Date().toISOString()
			},
			permissions: authData.permissions || [],
			preferences: {
				theme: authData.user.preferences?.theme,
				language: authData.user.preferences?.language,
				notifications: authData.user.preferences?.notifications !== false
			}
		};
	}

	/**
	 * Transform auth response for admin users
	 */
	static toAdminResponse(authData: any, sessionData: any, adminContext?: any): AdminAuthResponse {
		const baseResponse = this.toAuthenticatedResponse(authData, sessionData);

		return {
			...baseResponse,
			adminContext: {
				impersonating: adminContext?.impersonating as UserId,
				lastAdminAction: adminContext?.lastAdminAction,
				adminPermissions: adminContext?.adminPermissions || [],
				securityLevel: this.determineSecurityLevel(authData.user.role)
			},
			sessionMetadata: {
				ipAddress: this.hashIpAddress(sessionData.ipAddress),
				userAgent: this.sanitizeUserAgent(sessionData.userAgent),
				loginCount: sessionData.loginCount || 0,
				lastLoginAt: sessionData.lastLoginAt || sessionData.createdAt,
				failedAttempts: sessionData.failedAttempts || 0
			}
		};
	}

	/**
	 * Transform login response
	 */
	static toLoginResponse(
		success: boolean,
		message: string,
		userData?: any,
		token?: string,
		flags?: { requiresVerification?: boolean; requiresMfa?: boolean }
	): LoginResponse {
		const response: LoginResponse = {
			success,
			message
		};

		if (success && userData) {
			response.user = {
				id: userData.id as UserId,
				username: userData.username,
				avatarUrl: userData.avatarUrl,
				role: this.sanitizePublicRole(userData.role),
				verified: userData.verified || false
			};

			if (token) {
				response.token = token;
			}
		}

		if (flags?.requiresVerification) {
			response.requiresVerification = true;
		}

		if (flags?.requiresMfa) {
			response.requiresMfa = true;
		}

		return response;
	}

	/**
	 * Transform registration response
	 */
	static toRegistrationResponse(
		success: boolean,
		message: string,
		userData?: any
	): RegistrationResponse {
		const response: RegistrationResponse = {
			success,
			message
		};

		if (success && userData) {
			response.user = {
				id: userData.id as UserId,
				username: userData.username,
				email: userData.email, // Only shown immediately after registration
				requiresVerification: !userData.verified
			};

			response.nextSteps = [];
			if (!userData.verified) {
				response.nextSteps.push('Check your email for verification link');
			}
			response.nextSteps.push('Complete your profile setup');
		}

		return response;
	}

	/**
	 * Transform password reset response (always minimal for security)
	 */
	static toPasswordResetResponse(success: boolean, message: string): PasswordResetResponse {
		return {
			success,
			message
			// Never expose any additional data in password reset responses
		};
	}

	/**
	 * Transform logout response
	 */
	static toLogoutResponse(success: boolean, message: string) {
		return {
			success,
			message,
			// Clear any client-side data hints
			clearSession: true,
			clearTokens: true
		};
	}

	// Private helper methods
	private static sanitizePublicRole(role: string): string {
		// Only show non-sensitive roles publicly
		const publicRoles = ['member', 'verified', 'supporter', 'vip'];
		return publicRoles.includes(role?.toLowerCase() || '') ? role : 'member';
	}

	private static getPublicPermissions(permissions: string[]): string[] {
		// Only include non-sensitive permissions in public view
		const publicPermissions = [
			'post.create',
			'post.read',
			'thread.create',
			'thread.read',
			'profile.read',
			'wallet.read'
		];

		return permissions.filter((p) => publicPermissions.includes(p));
	}

	private static hashSessionId(sessionId: string): string {
		if (!sessionId) return '';
		return createHash('sha256').update(sessionId).digest('hex').substring(0, 16);
	}

	private static hashIpAddress(ipAddress: string): string {
		if (!ipAddress) return '';
		return createHash('sha256').update(ipAddress).digest('hex').substring(0, 8);
	}

	private static sanitizeUserAgent(userAgent: string): string {
		if (!userAgent) return '';
		// Remove potentially identifying information while keeping useful browser info
		return userAgent
			.replace(/\([^)]*\)/g, '')
			.trim()
			.substring(0, 100);
	}

	private static determineSecurityLevel(role: string): 'standard' | 'elevated' | 'super' {
		const superRoles = ['super_admin', 'owner'];
		const elevatedRoles = ['admin', 'moderator'];

		if (superRoles.includes(role?.toLowerCase() || '')) return 'super';
		if (elevatedRoles.includes(role?.toLowerCase() || '')) return 'elevated';
		return 'standard';
	}

	/**
	 * Transform auth error responses (security-conscious)
	 */
	static toAuthError(error: string, details?: any) {
		// Never expose sensitive error details that could aid attackers
		const safeErrors: Record<string, string> = {
			user_not_found: 'Invalid credentials',
			password_incorrect: 'Invalid credentials',
			account_locked: 'Account temporarily locked',
			email_not_verified: 'Please verify your email address',
			mfa_required: 'Multi-factor authentication required',
			session_expired: 'Session has expired',
			insufficient_permissions: 'Access denied'
		};

		return {
			success: false,
			message: safeErrors[error] || 'Authentication failed',
			code: error
			// Never expose: stack traces, internal errors, database details, etc.
		};
	}

	/**
	 * Transform session validation response
	 */
	static toSessionValidation(isValid: boolean, sessionData?: any, user?: any) {
		if (!isValid) {
			return {
				valid: false,
				message: 'Session invalid or expired'
			};
		}

		return {
			valid: true,
			session: {
				id: this.hashSessionId(sessionData?.id),
				expiresAt: sessionData?.expiresAt,
				lastActivity: sessionData?.lastActivity
			},
			user: user
				? {
						id: user.id as UserId,
						username: user.username,
						role: user.role
					}
				: undefined
		};
	}
}
