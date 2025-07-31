import type { ReactNode } from 'react';
import { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/utils/api-request';
import { getUserPermissions } from '@/utils/roles';
import type { Role } from '@/utils/roles';
import type { User } from '@shared/types/user.types';
import type { UserId, FrameId, WalletId } from '@shared/types/ids';
import { toId, toWalletId } from '@shared/types/index';
import { setAuthToken, removeAuthToken } from '@/utils/auth-token';
import { logger } from '@/lib/logger';

// Define user role type from User
export type UserRole = User['role'];

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
		role: 'user',
		// Gamification
		xp: 550,
		level: 5,
		reputation: 120,
		// Wallet
		walletId: toWalletId('dev-wallet-123'),
		dgtBalance: 1000,
		totalTipped: 0,
		totalReceived: 0,
		// Status
		emailVerified: true,
		isActive: true,
		isBanned: false,
		isVerified: true,
		// Timestamps
		createdAt: new Date().toISOString(),
		lastSeen: new Date().toISOString(),
		joinedAt: new Date().toISOString(),
		// Profile
		avatarUrl: null,
		bannerUrl: '/images/profile-banner-mock.png',
		bio: 'This is a mock bio for the DevUser',
		signature: 'Mock signature',
		// Cosmetics
		activeFrameId: toId<'FrameId'>('550e8400-e29b-41d4-a716-446655440002'),
		// Social
		social: {
			website: 'https://example.com',
			github: 'devuser',
			twitter: 'devuser',
			discord: 'DevUser#1234'
		},
		// Computed flags
		isAdmin: false,
		isModerator: false,
		// Extra fields from old structure
		pluginData: { 'forum-activity': { level: 3, xp: 340, category: 'General Discussion' } }
	},
	moderator: {
		id: toId<'UserId'>('550e8400-e29b-41d4-a716-446655440003'),
		username: 'DevMod',
		email: 'devmod@example.com',
		role: 'moderator',
		// Gamification
		xp: 10000,
		level: 10,
		reputation: 500,
		// Wallet
		walletId: toWalletId('dev-wallet-456'),
		dgtBalance: 5000,
		totalTipped: 0,
		totalReceived: 0,
		// Status
		emailVerified: true,
		isActive: true,
		isBanned: false,
		isVerified: true,
		// Timestamps
		createdAt: new Date().toISOString(),
		lastSeen: new Date().toISOString(),
		joinedAt: new Date().toISOString(),
		// Profile
		avatarUrl: null,
		bannerUrl: null,
		bio: 'Moderator of the realms.',
		signature: 'Mod signature',
		// Cosmetics
		activeFrameId: null,
		// Social
		social: {
			website: null,
			github: 'devmod',
			twitter: 'devmod',
			discord: 'DevMod#5678'
		},
		// Computed flags
		isAdmin: false,
		isModerator: true,
		// Extra fields
		pluginData: {}
	},
	admin: {
		id: toId<'UserId'>('550e8400-e29b-41d4-a716-446655440004'),
		username: 'cryptoadmin',
		email: 'admin@degentalk.dev',
		role: 'admin',
		// Gamification
		xp: 99999,
		level: 99,
		reputation: 10000,
		// Wallet
		walletId: toWalletId('dev-wallet-789'),
		dgtBalance: 100000,
		totalTipped: 0,
		totalReceived: 0,
		// Status
		emailVerified: true,
		isActive: true,
		isBanned: false,
		isVerified: true,
		// Timestamps
		createdAt: new Date().toISOString(),
		lastSeen: new Date().toISOString(),
		joinedAt: new Date().toISOString(),
		// Profile
		avatarUrl: '/images/avatars/admin.png',
		bannerUrl: '/images/banners/admin-banner.jpg',
		bio: '🔥 Degentalk Platform Administrator | Crypto Veteran | Building the future of degen communities',
		signature: 'WAGMI 🚀 | Not financial advice | Degentalk Admin',
		// Cosmetics
		activeFrameId: toId<'FrameId'>('550e8400-e29b-41d4-a716-446655440005'),
		// Social
		social: {
			website: 'https://degentalk.com',
			github: 'degentalk-admin',
			twitter: 'degentalk_official',
			discord: 'CryptoAdmin#0001'
		},
		// Computed flags
		isAdmin: true,
		isModerator: false,
		// Extra fields
		pluginData: { 'system-control': { level: 100, xp: 0, category: 'All Access' } }
	},
	owner: {
		id: toId<'UserId'>('550e8400-e29b-41d4-a716-446655440006'),
		username: 'SuperAdmin',
		email: 'superadmin@degentalk.dev',
		role: 'owner',
		// Gamification
		xp: 999999,
		level: 100,
		reputation: 99999,
		// Wallet
		walletId: toWalletId('dev-wallet-super'),
		dgtBalance: 1000000,
		totalTipped: 0,
		totalReceived: 0,
		// Status
		emailVerified: true,
		isActive: true,
		isBanned: false,
		isVerified: true,
		// Timestamps
		createdAt: new Date().toISOString(),
		lastSeen: new Date().toISOString(),
		joinedAt: new Date().toISOString(),
		// Profile
		avatarUrl: '/images/avatars/super-admin.png',
		bannerUrl: '/images/banners/super-admin-banner.jpg',
		bio: '👑 Supreme Administrator | Platform Architect | Full System Access',
		signature: '👑 Supreme Authority | System Architect | WAGMI 🚀',
		// Cosmetics
		activeFrameId: toId<'FrameId'>('550e8400-e29b-41d4-a716-446655440007'),
		// Social
		social: {
			website: 'https://degentalk.com',
			github: 'degentalk-superadmin',
			twitter: 'degentalk_super',
			discord: 'SuperAdmin#0000'
		},
		// Computed flags
		isAdmin: true,
		isModerator: true,
		// Extra fields
		pluginData: { 'system-control': { level: 1000, xp: 0, category: 'Supreme Access' } }
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
		return devRole && ['user', 'moderator', 'admin', 'owner'].includes(devRole) 
			? devRole 
			: 'user'; // Default to regular user
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
		queryClient.removeQueries({ queryKey: ['/api/auth/me'] });
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
		isLoading: userLoading,
		error: userError
	} = useQuery<User | null, Error>({
		queryKey: ['/api/auth/me'], // URL-based key matches backend endpoint
		enabled: true, // Always fetch user data on mount
		retry: false, // Don't retry failed auth attempts
		refetchOnWindowFocus: false, // Don't refetch when window gains focus
		staleTime: Infinity // Cache auth data until explicitly invalidated
	});
	
	// Debug the query state
	console.log('[AUTH] Query state:', {
		userLoading,
		fetchedUser,
		userError,
		hasError: !!userError
	});

	// Handle User State - Always use real authentication
	useEffect(() => {
		console.log('[AUTH] User loading effect:', { userLoading, fetchedUser });
		
		if (!userLoading) {
			// Only set user state if we actually have valid user data
			// If fetchedUser is null (401 response), clear the user state
			setUserState(fetchedUser ?? null);
			setIsInitialLoading(false);

			// Debug log to track auth state changes
			if (import.meta.env.MODE === 'development') {
				console.log('[AUTH] User state update:', {
					fetchedUser,
					userLoading,
					isInitialLoading,
					isDevelopment
				});
			}
		}
	}, [fetchedUser, userLoading]);
	
	// Fallback to ensure initial loading completes
	useEffect(() => {
		// If userLoading stays true for too long, force it to complete
		const timeout = setTimeout(() => {
			if (isInitialLoading && userLoading) {
				console.warn('[AUTH] Force completing initial load due to timeout');
				setIsInitialLoading(false);
			}
		}, 2000); // 2 second timeout
		
		return () => clearTimeout(timeout);
	}, [isInitialLoading, userLoading]);

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
			queryClient.setQueryData(['/api/auth/me'], loggedInUser); // Update user query cache
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
			queryClient.setQueryData(['/api/auth/me'], registeredUser); // Update user query cache
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
			queryClient.setQueryData(['/api/auth/me'], null); // Clear user query cache
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
			queryClient.setQueryData(['/api/auth/me'], null);

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
		console.log('[AUTH] Dev auto-login check:', {
			isDevelopment,
			isInitialLoading,
			fetchedUser,
			isLoggedOut,
			currentMockRoleState,
			shouldActivate: isDevelopment && !isInitialLoading && !fetchedUser && !isLoggedOut
		});
		
		if (
			isDevelopment && // only in dev
			!isInitialLoading && // wait until initial auth check completes
			!fetchedUser && // backend reported no authenticated user
			!isLoggedOut // respect explicit logout flag
		) {
			const mockUser = mockUsers[currentMockRoleState] ?? mockUsers.user;
			console.log('[AUTH] Setting mock user:', mockUser);
			setUserState(mockUser);

			if (import.meta.env.MODE === 'development') {
				console.log('[AUTH] Dev auto-login activated with mock role:', currentMockRoleState);
			}
		}
	}, [isDevelopment, isInitialLoading, fetchedUser, isLoggedOut, currentMockRoleState]);

	// Consolidate context value
	const authContextValue = useMemo(() => {
		const isAuthenticated = !!userState;
		const userRole = (userState?.role || 'user') as Role;
		const permissions = getUserPermissions(userRole);

		// Debug log for auth context changes
		if (import.meta.env.MODE === 'development') {
			console.log('[AUTH] Context value:', {
				userState,
				isAuthenticated,
				isLoading: isInitialLoading ||
					loginMutation.isPending ||
					registerMutation.isPending ||
					logoutMutation.isPending
			});
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
