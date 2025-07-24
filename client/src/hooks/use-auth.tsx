import type { ReactNode } from 'react';
import { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@app/utils/api-request';
import { getUserPermissions } from '@app/utils/roles';
import type { Role } from '@app/utils/roles';
import type { AuthUser, UserRole } from '@shared/types/auth-user.types';
import type { UserId, FrameId } from '@shared/types/ids';
import { toId } from '@shared/types/index';
import { setAuthToken, removeAuthToken } from '@app/utils/auth-token';
import { logger } from '@app/lib/logger";

// Define user type
// Re-export AuthUser as User for backward compatibility
export type User = AuthUser;

// Possible roles for mock user switching
export type MockRole = UserRole;

// Auth context type
interface AuthContextType {
	user: User | null;
	isAuthenticated: boolean;
	isLoading: boolean;
	login: (credentials: { username: string; password: string }) => void; // Use mutate directly
	logout: () => void; // Use mutate directly
	register: (userData: { username: string; email: string; password: string }) => void; // Use mutate directly
	error: string | null;
	// Add mutations directly if needed by components
	loginMutation: ReturnType<typeof useMutation>;
	registerMutation: ReturnType<typeof useMutation>;
	logoutMutation: ReturnType<typeof useMutation>;
	// Role-based permissions (computed from user.role)
	isAdmin: boolean;
	isSuperAdmin: boolean;
	isModerator: boolean;
	canAccessAdminPanel: boolean;
	isAdminOrModerator: boolean;
	// Navigation state
	shouldRedirectToAuth: boolean;
	clearAuthRedirect: () => void;
	// --- Dev Mode Specific --- (Only available in dev)
	isDevMode: boolean;
	currentMockRole: MockRole | null;
	setMockRole: (role: MockRole) => void;
}

// Default stub context - RETAIN FOR REFERENCE BUT DON'T USE DIRECTLY
// const defaultContext: AuthContextType = { ... };

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock User Definitions for Development
const mockUsers: Record<MockRole, User> = {
	user: {
		id: toId<'UserId'>('550e8400-e29b-41d4-a716-446655440001'),
		username: 'DevUser',
		email: 'dev@example.com',
		avatarUrl: null,
		role: 'user',
		walletId: 'dev-wallet-123',
		walletAddress: '0xDevWalletAddressUser',
		createdAt: new Date().toISOString(),
		level: 5,
		xp: 550,
		isVerified: true,
		bio: 'This is a mock bio for the DevUser.',
		clout: 120,
		reputation: 120,
		website: 'https://example.com',
		github: 'devuser',
		twitter: 'devuser',
		discord: 'DevUser#1234',
		pluginData: { 'forum-activity': { level: 3, xp: 340, category: 'General Discussion' } },
		isActive: true,
		signature: 'Mock signature',
		lastActiveAt: new Date().toISOString(),
		bannerUrl: '/images/profile-banner-mock.png',
		dgtBalance: 1000,
		activeFrameId: toId<'FrameId'>('550e8400-e29b-41d4-a716-446655440002'),
		avatarFrameId: toId<'FrameId'>('550e8400-e29b-41d4-a716-446655440002'),
		isBanned: false,
		isVIP: false,
		isAdmin: false,
		isModerator: false
	},
	moderator: {
		id: toId<'UserId'>('550e8400-e29b-41d4-a716-446655440003'),
		username: 'DevMod',
		email: 'devmod@example.com',
		avatarUrl: null,
		role: 'moderator',
		walletId: 'dev-wallet-456',
		walletAddress: '0xDevWalletAddressMod',
		createdAt: new Date().toISOString(),
		level: 10,
		xp: 10000,
		isVerified: true,
		bio: 'Moderator of the realms.',
		clout: 500,
		reputation: 500,
		website: null,
		github: 'devmod',
		twitter: 'devmod',
		discord: 'DevMod#5678',
		pluginData: {},
		isActive: true,
		signature: 'Mod signature',
		lastActiveAt: new Date().toISOString(),
		bannerUrl: null,
		dgtBalance: 5000,
		activeFrameId: null,
		avatarFrameId: null,
		isBanned: false,
		isVIP: false,
		isAdmin: false,
		isModerator: true
	},
	admin: {
		id: toId<'UserId'>('550e8400-e29b-41d4-a716-446655440004'),
		username: 'cryptoadmin',
		email: 'admin@degentalk.dev',
		avatarUrl: '/images/avatars/admin.png',
		role: 'admin',
		walletId: 'dev-wallet-789',
		walletAddress: '0xAdminWalletAddress',
		createdAt: new Date().toISOString(),
		level: 99,
		xp: 99999,
		isVerified: true,
		bio: '🔥 Degentalk Platform Administrator | Crypto Veteran | Building the future of degen communities',
		clout: 10000,
		reputation: 10000,
		website: 'https://degentalk.com',
		github: 'degentalk-admin',
		twitter: 'degentalk_official',
		discord: 'CryptoAdmin#0001',
		pluginData: { 'system-control': { level: 100, xp: 0, category: 'All Access' } },
		isActive: true,
		signature: 'WAGMI 🚀 | Not financial advice | Degentalk Admin',
		lastActiveAt: new Date().toISOString(),
		bannerUrl: '/images/banners/admin-banner.jpg',
		dgtBalance: 100000,
		activeFrameId: toId<'FrameId'>('550e8400-e29b-41d4-a716-446655440005'),
		avatarFrameId: toId<'FrameId'>('550e8400-e29b-41d4-a716-446655440005'),
		isBanned: false,
		isVIP: true,
		isAdmin: true,
		isModerator: false
	},
	super_admin: {
		id: toId<'UserId'>('550e8400-e29b-41d4-a716-446655440006'),
		username: 'SuperAdmin',
		email: 'superadmin@degentalk.dev',
		avatarUrl: '/images/avatars/super-admin.png',
		role: 'super_admin',
		walletId: 'dev-wallet-super',
		walletAddress: '0xSuperAdminWalletAddress',
		createdAt: new Date().toISOString(),
		level: 100,
		xp: 999999,
		isVerified: true,
		bio: '👑 Supreme Administrator | Platform Architect | Full System Access',
		clout: 99999,
		reputation: 99999,
		website: 'https://degentalk.com',
		github: 'degentalk-superadmin',
		twitter: 'degentalk_super',
		discord: 'SuperAdmin#0000',
		pluginData: { 'system-control': { level: 1000, xp: 0, category: 'Supreme Access' } },
		isActive: true,
		signature: '👑 Supreme Authority | System Architect | WAGMI 🚀',
		lastActiveAt: new Date().toISOString(),
		bannerUrl: '/images/banners/super-admin-banner.jpg',
		dgtBalance: 1000000,
		activeFrameId: toId<'FrameId'>('550e8400-e29b-41d4-a716-446655440007'),
		avatarFrameId: toId<'FrameId'>('550e8400-e29b-41d4-a716-446655440007'),
		isBanned: false,
		isVIP: true,
		isAdmin: true,
		isModerator: true
	}
};

// MAIN AUTH PROVIDER - Single source of truth for authentication state
// This provider manages all authentication logic and state for the entire application
export function AuthProvider({ children }: { children: ReactNode }) {
	// CRITICAL: Use the QueryClient from the provider context (RootProvider)
	// This ensures we're using the same instance with on401: 'returnNull' configuration
	const queryClient = useQueryClient();

	// LOCAL AUTH STATE: These manage the internal auth state
	const [userState, setUserState] = useState<User | null>(null);
	const [authError, setAuthError] = useState<string | null>(null);
	const [isInitialLoading, setIsInitialLoading] = useState(true);
	const [currentMockRoleState, setCurrentMockRoleState] = useState<MockRole>(() => {
		// Allow configuring default dev role via environment variable
		const devRole = import.meta.env.VITE_DEV_DEFAULT_ROLE as MockRole;
		return devRole && ['user', 'moderator', 'admin', 'super_admin'].includes(devRole) 
			? devRole 
			: 'user'; // Default to regular user, not super_admin
	});
	const [isLoggedOut, setIsLoggedOut] = useState(() => {
		if (import.meta.env.MODE === 'development') {
			return sessionStorage.getItem('dev_loggedOut') === '1';
		}
		return false;
	});

	// CACHE CLEARING: Remove any stale auth data on provider initialization
	// This prevents the "login button → authenticated UI" bug by ensuring
	// we start with a clean slate each time the provider mounts
	useEffect(() => {
		queryClient.removeQueries({ queryKey: ['/api/auth/user'] });
	}, [queryClient]);

	const isDevelopment =
		import.meta.env.MODE === 'development' && import.meta.env.VITE_FORCE_AUTH !== 'true';
	
	// Navigation state - components should handle navigation based on this
	const [shouldRedirectToAuth, setShouldRedirectToAuth] = useState(false);

	// USER AUTHENTICATION QUERY: This is the core auth validation
	// Uses the RootProvider's QueryClient which has on401: 'returnNull' configured
	// This means 401 responses return null instead of throwing errors
	const {
		data: fetchedUser,
		isLoading: userLoading
	} = useQuery<User | null, Error>({
		queryKey: ['/api/auth/user'], // URL-based key matches backend endpoint
		enabled: true, // Always fetch user data on mount
		retry: false, // Don't retry failed auth attempts
		refetchOnWindowFocus: false, // Don't refetch when window gains focus
		staleTime: Infinity // Cache auth data until explicitly invalidated
	});

	// Handle User State - Always use real authentication
	useEffect(() => {
		if (!userLoading) {
			// Only set user state if we actually have valid user data
			// If fetchedUser is null (401 response), clear the user state
			setUserState(fetchedUser ?? null);
			setIsInitialLoading(false);

			// Debug log to track auth state changes
			if (import.meta.env.MODE === 'development') {
				// console.log - user state update for development
			}
		}
	}, [fetchedUser, userLoading]);

	// Login Mutation (Only really used in Production)
	const loginMutation = useMutation<{ user: User; token: string; expiresAt?: string }, Error, { username: string; password: string }>({
		mutationFn: async (credentials): Promise<{ user: User; token: string; expiresAt?: string }> => {
			return await apiRequest<{ user: User; token: string; expiresAt?: string }>({
				url: '/api/auth/login',
				method: 'POST',
				data: credentials
			});
		},
		onSuccess: ({ user: loggedInUser, token, expiresAt }) => {
			// Store JWT token
			if (token) {
				setAuthToken(token);
				
				// Log token expiration for debugging
				if (expiresAt && import.meta.env.MODE === 'development') {
					logger.info('useAuth', '[Auth] Token expires at:', { data: [expiresAt] });
				}
			}
			
			setUserState(loggedInUser);
			setAuthError(null);
			setIsLoggedOut(false); // Reset logout flag on successful login
			if (import.meta.env.MODE === 'development') {
				sessionStorage.removeItem('dev_loggedOut');
			}
			queryClient.setQueryData(['/api/auth/user'], loggedInUser); // Update user query cache
		},
		onError: (error) => {
			setAuthError(error.message || 'Login failed');
			setUserState(null);
		}
	});

	// Register Mutation
	const registerMutation = useMutation<
		User,
		Error,
		{ username: string; email: string; password: string }
	>({
		mutationFn: async (userData): Promise<User> => {
			return await apiRequest<User>({
				url: '/api/auth/register',
				method: 'POST',
				data: userData
			});
		},
		onSuccess: (registeredUser) => {
			setUserState(registeredUser);
			setAuthError(null);
			setIsLoggedOut(false); // Reset logout flag on successful registration
			if (import.meta.env.MODE === 'development') {
				sessionStorage.removeItem('dev_loggedOut');
			}
			queryClient.setQueryData(['/api/auth/user'], registeredUser); // Update user query cache
		},
		onError: (error) => {
			setAuthError(error.message || 'Registration failed');
			setUserState(null);
		}
	});

	// Logout Mutation
	const logoutMutation = useMutation<void, Error, void>({
		mutationFn: async (): Promise<void> => {
			await apiRequest<void>({
				url: '/api/auth/logout',
				method: 'POST'
			});
		},
		onSuccess: () => {
			// Clear JWT token
			removeAuthToken();
			
			setUserState(null);
			setAuthError(null);
			setIsLoggedOut(true); // Set logout flag to prevent auto-restore in dev mode
			if (import.meta.env.MODE === 'development') {
				sessionStorage.setItem('dev_loggedOut', '1');
			}
			queryClient.setQueryData(['/api/auth/user'], null); // Clear user query cache
			queryClient.clear(); // Clear all query cache on logout

			// Signal that we should redirect to auth
			// Components inside Router can handle this
			setShouldRedirectToAuth(true);
		},
		onError: () => {
			// Handle logout error
			// Still clear state locally even if server logout fails
			removeAuthToken(); // Clear token even on error
			
			setUserState(null);
			setAuthError(null);
			setIsLoggedOut(true); // Set logout flag even on error
			if (import.meta.env.MODE === 'development') {
				sessionStorage.setItem('dev_loggedOut', '1');
			}
			queryClient.setQueryData(['/api/auth/user'], null);

			// Navigate even on error
			setShouldRedirectToAuth(true);
		}
	});

	// Dev Mode: Function to set the mock role
	const setMockRole = (role: MockRole) => {
		if (!isDevelopment) {
			// console.warn('setMockRole can only be used in development mode.');
			return;
		}
		setCurrentMockRoleState(role);
	};

	// Development auto-login: when in development and real user not authenticated, use mock user unless explicitly logged out
	useEffect(() => {
		if (
			isDevelopment && // only in dev
			!isInitialLoading && // wait until initial auth check completes
			!fetchedUser && // backend reported no authenticated user
			!isLoggedOut && // respect explicit logout flag
			!userState // avoid overriding an existing user state
		) {
			const mockUser = mockUsers[currentMockRoleState] ?? mockUsers.user;
			setUserState(mockUser);

			if (import.meta.env.MODE === 'development') {
				// console.log('[AUTH] Dev auto-login activated with mock role:', currentMockRoleState);
			}
		}
	}, [isDevelopment, isInitialLoading, fetchedUser, isLoggedOut, currentMockRoleState, userState]);

	// Consolidate context value
	const authContextValue = useMemo(() => {
		const isAuthenticated = !!userState;
		const userRole = (userState?.role || 'user') as Role;
		const permissions = getUserPermissions(userRole);

		// Debug log for auth context changes
		if (import.meta.env.MODE === 'development') {
			// console.log - auth context value update for development
		}

		return {
			user: userState,
			isAuthenticated,
			isLoading:
				isInitialLoading ||
				loginMutation.isPending ||
				registerMutation.isPending ||
				logoutMutation.isPending,
			login: loginMutation.mutate,
			logout: logoutMutation.mutate, // Ensure logout uses the mutation
			register: registerMutation.mutate,
			error:
				authError ||
				loginMutation.error?.message ||
				registerMutation.error?.message ||
				logoutMutation.error?.message ||
				null,
			loginMutation,
			registerMutation,
			logoutMutation,
			// Role-based permissions (computed from user.role)
			isAdmin: permissions.isAdmin,
			isSuperAdmin: permissions.isSuperAdmin,
			isModerator: permissions.isModerator,
			canAccessAdminPanel: permissions.canAccessAdminPanel,
			isAdminOrModerator: permissions.isAdminOrModerator,
			// Navigation state
			shouldRedirectToAuth,
			clearAuthRedirect: () => setShouldRedirectToAuth(false),
			// --- Dev Mode Specific --- (Disabled for wallet testing)
			isDevMode: isDevelopment,
			currentMockRole: isDevelopment ? currentMockRoleState : null,
			setMockRole: isDevelopment ? setMockRole : () => {}
		};
	}, [
		userState,
		isInitialLoading,
		authError,
		loginMutation,
		registerMutation,
		logoutMutation,
		currentMockRoleState,
		isDevelopment,
		setMockRole,
		shouldRedirectToAuth
	]);

	// Development-only check for duplicate providers
	useEffect(() => {
		if (import.meta.env.MODE === 'development') {
			const dataAttr = 'data-auth-provider';
			const providerElements = document.querySelectorAll(`[${dataAttr}="true"]`);
			if (providerElements.length > 1) {
				// console.error - multiple auth providers detected in development
				// Optionally throw an error in dev to make it more obvious
				// throw new Error("Multiple AuthProviders rendered. Check RootProvider setup.");
			}
		}
	}, []);

	return (
		<AuthContext.Provider
			value={authContextValue}
			// Add data attribute for duplicate detection in dev mode
			data-auth-provider={import.meta.env.MODE === 'development' ? 'true' : undefined}
		>
			{children}
		</AuthContext.Provider>
	);
}

/**
 * @hook useAuth
 * Provides authentication state and methods (login, logout, register).
 *
 * IMPORTANT: This hook must be used within an AuthProvider.
 * The AuthProvider should ONLY be initialized once in the application,
 * specifically in the RootProvider (src/providers/root-provider.tsx).
 *
 * DO NOT add additional AuthProvider instances in other components.
 */
export const useAuth = () => {
	const context = useContext(AuthContext);
	if (context === undefined) {
		throw new Error('useAuth must be used within an AuthProvider');
	}
	return context;
};

// Remove old provider stub
// export function AuthProvider({ children }: { children: React.ReactNode }) { ... }

// Remove TODO comment

// Define the types that were in the old use-auth.tsx
export type LoginData = {
	username: string;
	password: string;
};

export type RegisterData = {
	username: string;
	email: string;
	password: string;
	confirmPassword?: string;
};

// Export the auth context
export type { AuthContextType };
