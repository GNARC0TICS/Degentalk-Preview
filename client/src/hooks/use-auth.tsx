import * as React from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useLocation } from 'wouter';

const { createContext, useContext, useState, useEffect, useMemo } = React;

// Define user type
export interface User {
	id: number;
	username: string;
	email: string;
	avatarUrl: string | null;
	role: 'user' | 'mod' | 'admin' | null;
	walletId?: string;
	walletAddress?: string;
	createdAt: string;
	level: number;
	xp: number;
	isVerified: boolean;
	bio?: string | null;
	clout?: number;
	reputation?: number;
	website?: string | null;
	github?: string | null;
	twitter?: string | null;
	discord?: string | null;
	pluginData?: Record<string, any> | null;
	isActive?: boolean;
	signature?: string | null;
	lastActiveAt?: string | null;
	bannerUrl?: string | null;
	dgtBalance?: number;
	activeFrameId?: number | null;
	avatarFrameId?: number | null;
	isBanned: boolean;
}

// Possible roles for mock user switching
type MockRole = 'user' | 'mod' | 'admin';

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
		id: 999,
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
		activeFrameId: 1,
		avatarFrameId: 1,
		isBanned: false
	},
	mod: {
		id: 998,
		username: 'DevMod',
		email: 'devmod@example.com',
		avatarUrl: null,
		role: 'mod',
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
		isBanned: false
	},
	admin: {
		id: 997,
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
		activeFrameId: 2,
		avatarFrameId: 2,
		isBanned: false
	}
};

// MAIN AUTH PROVIDER - Single source of truth for authentication state
// This provider manages all authentication logic and state for the entire application
export function AuthProvider({ children }: { children: React.ReactNode }) {
	// CRITICAL: Use the QueryClient from the provider context (RootProvider)
	// This ensures we're using the same instance with on401: 'returnNull' configuration
	const queryClient = useQueryClient();

	// LOCAL AUTH STATE: These manage the internal auth state
	const [userState, setUserState] = useState<User | null>(null);
	const [authError, setAuthError] = useState<string | null>(null);
	const [isInitialLoading, setIsInitialLoading] = useState(true);
	const [currentMockRoleState, setCurrentMockRoleState] = useState<MockRole>('admin'); // Default to admin for development
	const [isLoggedOut, setIsLoggedOut] = useState(() => {
		if (import.meta.env.MODE === 'development') {
			return sessionStorage.getItem('dev_loggedOut') === '1';
		}
		return false;
	});

	// CACHE CLEARING: Remove any stale auth data on provider initialization
	// This prevents the "login button → authenticated UI" bug by ensuring
	// we start with a clean slate each time the provider mounts
	React.useEffect(() => {
		queryClient.removeQueries({ queryKey: ['/api/auth/user'] });
	}, []);

	const isDevelopment =
		import.meta.env.MODE === 'development' && import.meta.env.VITE_FORCE_AUTH !== 'true';
	const [, navigate] = useLocation();

	// USER AUTHENTICATION QUERY: This is the core auth validation
	// Uses the RootProvider's QueryClient which has on401: 'returnNull' configured
	// This means 401 responses return null instead of throwing errors
	const {
		data: fetchedUser,
		isLoading: userLoading,
		error: userError
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
				console.log('[AUTH] User state update:', {
					userLoading,
					fetchedUser: fetchedUser ? 'user object' : 'null',
					willSetAuthenticated: !!fetchedUser
				});
			}
		}
	}, [fetchedUser, userLoading]);

	// Login Mutation (Only really used in Production)
	const loginMutation = useMutation<User, Error, { username: string; password: string }>({
		mutationFn: async (credentials) => {
			return await apiRequest<User>({
				url: '/api/auth/login',
				method: 'POST',
				data: credentials
			});
		},
		onSuccess: (loggedInUser) => {
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
		mutationFn: async (userData) => {
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
		mutationFn: async () => {
			await apiRequest<void>({
				url: '/api/auth/logout',
				method: 'POST'
			});
		},
		onSuccess: () => {
			setUserState(null);
			setAuthError(null);
			setIsLoggedOut(true); // Set logout flag to prevent auto-restore in dev mode
			if (import.meta.env.MODE === 'development') {
				sessionStorage.setItem('dev_loggedOut', '1');
			}
			queryClient.setQueryData(['/api/auth/user'], null); // Clear user query cache
			queryClient.clear(); // Clear all query cache on logout

			// Client-side navigation keeps React tree mounted (no auto-login reset)
			navigate('/auth');
		},
		onError: (error) => {
			// Handle logout error, maybe just log it?
			console.error('Logout failed:', error.message);
			// Still clear state locally even if server logout fails?
			setUserState(null);
			setAuthError(null);
			setIsLoggedOut(true); // Set logout flag even on error
			if (import.meta.env.MODE === 'development') {
				sessionStorage.setItem('dev_loggedOut', '1');
			}
			queryClient.setQueryData(['/api/auth/user'], null);

			// Navigate even on error
			navigate('/auth');
		}
	});

	// Dev Mode: Function to set the mock role
	const setMockRole = (role: MockRole) => {
		if (!isDevelopment) {
			console.warn('setMockRole can only be used in development mode.');
			return;
		}
		setCurrentMockRoleState(role);
	};

	// Consolidate context value
	const authContextValue = useMemo(() => {
		const isAuthenticated = !!userState;

		// Debug log for auth context changes
		if (import.meta.env.MODE === 'development') {
			console.log('[AUTH] Context value update:', {
				userState: userState ? `${userState.username} (ID: ${userState.id})` : 'null',
				isAuthenticated,
				isInitialLoading,
				userLoading,
				userRole: userState?.role,
				userLevel: userState?.level
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
			// --- Dev Mode Specific --- (Disabled for wallet testing)
			isDevMode: false,
			currentMockRole: null,
			setMockRole: () => {}
		};
	}, [
		userState,
		isInitialLoading,
		authError,
		loginMutation,
		registerMutation,
		logoutMutation,
		userLoading
	]);

	// Development-only check for duplicate providers
	React.useEffect(() => {
		if (import.meta.env.MODE === 'development') {
			const dataAttr = 'data-auth-provider';
			const providerElements = document.querySelectorAll(`[${dataAttr}="true"]`);
			if (providerElements.length > 1) {
				console.error(
					'Multiple AuthProviders detected! This will cause context conflicts. ' +
						'Ensure you are only using the AuthProvider from the RootProvider.'
				);
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
export type { User, AuthContextType };
