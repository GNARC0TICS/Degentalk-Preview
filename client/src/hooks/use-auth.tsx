import * as React from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

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
		bio: '🔥 DegenTalk Platform Administrator | Crypto Veteran | Building the future of degen communities',
		clout: 10000,
		reputation: 10000,
		website: 'https://degentalk.com',
		github: 'degentalk-admin',
		twitter: 'degentalk_official',
		discord: 'CryptoAdmin#0001',
		pluginData: { 'system-control': { level: 100, xp: 0, category: 'All Access' } },
		isActive: true,
		signature: 'WAGMI 🚀 | Not financial advice | DegenTalk Admin',
		lastActiveAt: new Date().toISOString(),
		bannerUrl: '/images/banners/admin-banner.jpg',
		dgtBalance: 100000,
		activeFrameId: 2,
		avatarFrameId: 2,
		isBanned: false
	}
};

// Real AuthProvider Implementation
export function AuthProvider({ children }: { children: React.ReactNode }) {
	const queryClient = useQueryClient();
	const [userState, setUserState] = useState<User | null>(null);
	const [authError, setAuthError] = useState<string | null>(null);
	const [isInitialLoading, setIsInitialLoading] = useState(true);
	const [currentMockRoleState, setCurrentMockRoleState] = useState<MockRole>('admin'); // Default to admin for development

	const isDevelopment = import.meta.env.MODE === 'development';

	// Fetch user data on initial load (only in production)
	const {
		data: fetchedUser,
		isLoading: userLoading,
		error: userError
	} = useQuery<User | null, Error>({
		queryKey: ['user'],
		queryFn: async () => {
			// Skip fetch entirely in dev mode
			if (isDevelopment) return null;
			try {
				const response = await apiRequest<User>({
					url: '/user',
					method: 'GET'
				});
				return response;
			} catch (error: any) {
				if (error.status === 401) {
					return null; // Not logged in, return null
				}
				throw error; // Re-throw other errors
			}
		},
		enabled: !isDevelopment, // Only run this query in production
		retry: false,
		refetchOnWindowFocus: false,
		staleTime: Infinity
	});

	// Handle User State based on Mode (Dev vs Prod)
	useEffect(() => {
		if (isDevelopment) {
			// Dev Mode: Use the currently selected mock user
			console.log(`[DEV MODE] Setting mock user role: ${currentMockRoleState}`);
			setUserState(mockUsers[currentMockRoleState]);
			setIsInitialLoading(false);
		} else {
			// Production Mode: Use fetched user data
			if (!userLoading) {
				setUserState(fetchedUser ?? null);
				setIsInitialLoading(false);
			}
		}
		// Update userState whenever the selected mock role changes in dev mode
	}, [isDevelopment, currentMockRoleState, fetchedUser, userLoading, userError]);

	// Login Mutation (Only really used in Production)
	const loginMutation = useMutation<User, Error, { username: string; password: string }>({
		mutationFn: async (credentials) => {
			return await apiRequest<User>({
				url: '/login',
				method: 'POST',
				data: credentials
			});
		},
		onSuccess: (loggedInUser) => {
			setUserState(loggedInUser);
			setAuthError(null);
			queryClient.setQueryData(['user'], loggedInUser); // Update user query cache
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
				url: '/register',
				method: 'POST',
				data: userData
			});
		},
		onSuccess: (registeredUser) => {
			setUserState(registeredUser);
			setAuthError(null);
			queryClient.setQueryData(['user'], registeredUser); // Update user query cache
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
				url: '/logout',
				method: 'POST'
			});
		},
		onSuccess: () => {
			setUserState(null);
			setAuthError(null);
			queryClient.setQueryData(['user'], null); // Clear user query cache
			queryClient.clear(); // Optional: clear all query cache on logout
		},
		onError: (error) => {
			// Handle logout error, maybe just log it?
			console.error('Logout failed:', error.message);
			// Still clear state locally even if server logout fails?
			setUserState(null);
			setAuthError(null);
			queryClient.setQueryData(['user'], null);
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
	const authContextValue = useMemo(
		() => ({
			user: userState,
			isAuthenticated: !!userState,
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
			// --- Dev Mode Specific ---
			isDevMode: isDevelopment,
			currentMockRole: isDevelopment ? currentMockRoleState : null,
			setMockRole: isDevelopment ? setMockRole : () => {}
		}),
		[
			userState,
			isInitialLoading,
			authError,
			loginMutation,
			registerMutation,
			logoutMutation,
			queryClient,
			isDevelopment,
			currentMockRoleState
		]
	);

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
