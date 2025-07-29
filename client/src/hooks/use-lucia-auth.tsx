/**
 * Lucia Auth Hook for DegenTalk Client
 * 
 * This hook replaces the current use-auth.tsx with Lucia-compatible
 * session management while maintaining the same API interface.
 */

import type { ReactNode } from 'react';
import { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/utils/api-request';
import { getUserPermissions } from '@/utils/roles';
import type { Role } from '@/utils/roles';
import type { User } from '@shared/types/user.types';
import type { UserId } from '@shared/types/ids';
import { logger } from '@/lib/logger';

// Define user role type from User
export type UserRole = User['role'];

// Possible roles for mock user switching
export type MockRole = UserRole;

// Auth context type - maintains compatibility with existing interface
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: { username: string; password: string }) => void;
  logout: () => void;
  register: (userData: { username: string; email: string; password: string }) => void;
  error: string | null;
  // Mutation objects for direct access
  loginMutation: ReturnType<typeof useMutation>;
  registerMutation: ReturnType<typeof useMutation>;
  logoutMutation: ReturnType<typeof useMutation>;
  // Role-based permissions
  isAdmin: boolean;
  isSuperAdmin: boolean;
  isModerator: boolean;
  canAccessAdminPanel: boolean;
  isAdminOrModerator: boolean;
  // Navigation state
  shouldRedirectToAuth: boolean;
  clearAuthRedirect: () => void;
  // Dev mode support
  isDevMode: boolean;
  currentMockRole: MockRole | null;
  setMockRole: (role: MockRole) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock User Definitions for Development (compatible with Lucia)
const mockUsers: Record<MockRole, User> = {
  user: {
    id: 'dev-user-id' as UserId,
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
    bio: 'This is a mock bio for the DevUser',
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
    activeFrameId: null,
    avatarFrameId: null,
    isBanned: false,
    isVIP: false,
    isAdmin: false,
    isModerator: false
  },
  moderator: {
    id: 'dev-moderator-id' as UserId,
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
    id: 'dev-admin-id' as UserId,
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
    activeFrameId: null,
    avatarFrameId: null,
    isBanned: false,
    isVIP: true,
    isAdmin: true,
    isModerator: false
  },
  super_admin: {
    id: 'dev-super-admin-id' as UserId,
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
    activeFrameId: null,
    avatarFrameId: null,
    isBanned: false,
    isVIP: true,
    isAdmin: true,
    isModerator: true
  }
};

/**
 * Main Auth Provider using Lucia sessions
 */
export function LuciaAuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();

  // Local auth state
  const [userState, setUserState] = useState<User | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [currentMockRoleState, setCurrentMockRoleState] = useState<MockRole>(() => {
    const devRole = import.meta.env.VITE_DEV_DEFAULT_ROLE as MockRole;
    return devRole && ['user', 'moderator', 'admin', 'super_admin'].includes(devRole) 
      ? devRole 
      : 'user';
  });
  const [isLoggedOut, setIsLoggedOut] = useState(() => {
    if (import.meta.env.MODE === 'development') {
      return sessionStorage.getItem('dev_loggedOut') === '1';
    }
    return false;
  });

  const isDevelopment = import.meta.env.MODE === 'development' && 
                       import.meta.env.VITE_FORCE_AUTH !== 'true';
  
  const [shouldRedirectToAuth, setShouldRedirectToAuth] = useState(false);

  // User session validation query - uses Lucia session cookies automatically
  const {
    data: fetchedUser,
    isLoading: userLoading
  } = useQuery<User | null, Error>({
    queryKey: ['/api/auth/user'],
    enabled: true,
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: Infinity // Cache until explicitly invalidated
  });

  // Handle user state updates
  useEffect(() => {
    if (!userLoading) {
      setUserState(fetchedUser ?? null);
      setIsInitialLoading(false);

      if (import.meta.env.MODE === 'development') {
        logger.debug('LuciaAuth', 'User state updated', { 
          hasUser: !!fetchedUser,
          username: fetchedUser?.username 
        });
      }
    }
  }, [fetchedUser, userLoading]);

  // Login mutation - uses Lucia session creation
  const loginMutation = useMutation<{ user: User }, Error, { username: string; password: string }>({
    mutationFn: async (credentials) => {
      return await apiRequest<{ user: User }>({
        url: '/api/auth/login',
        method: 'POST',
        data: credentials
      });
    },
    onSuccess: ({ user: loggedInUser }) => {
      setUserState(loggedInUser);
      setAuthError(null);
      setIsLoggedOut(false);
      if (import.meta.env.MODE === 'development') {
        sessionStorage.removeItem('dev_loggedOut');
      }
      queryClient.setQueryData(['/api/auth/user'], loggedInUser);
    },
    onError: (error) => {
      setAuthError(error.message || 'Login failed');
      setUserState(null);
    }
  });

  // Register mutation
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
      setIsLoggedOut(false);
      if (import.meta.env.MODE === 'development') {
        sessionStorage.removeItem('dev_loggedOut');
      }
      queryClient.setQueryData(['/api/auth/user'], registeredUser);
    },
    onError: (error) => {
      setAuthError(error.message || 'Registration failed');
      setUserState(null);
    }
  });

  // Logout mutation - invalidates Lucia session
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
      setIsLoggedOut(true);
      if (import.meta.env.MODE === 'development') {
        sessionStorage.setItem('dev_loggedOut', '1');
      }
      queryClient.setQueryData(['/api/auth/user'], null);
      queryClient.clear(); // Clear all cached data
      setShouldRedirectToAuth(true);
    },
    onError: () => {
      // Clear state even on error
      setUserState(null);
      setAuthError(null);
      setIsLoggedOut(true);
      if (import.meta.env.MODE === 'development') {
        sessionStorage.setItem('dev_loggedOut', '1');
      }
      queryClient.setQueryData(['/api/auth/user'], null);
      setShouldRedirectToAuth(true);
    }
  });

  // Dev mode mock role switching
  const setMockRole = (role: MockRole) => {
    if (!isDevelopment) {
      return;
    }
    setCurrentMockRoleState(role);
  };

  // Development auto-login with mock users
  useEffect(() => {
    if (
      isDevelopment &&
      !isInitialLoading &&
      !fetchedUser &&
      !isLoggedOut &&
      !userState
    ) {
      const mockUser = mockUsers[currentMockRoleState] ?? mockUsers.user;
      setUserState(mockUser);

      if (import.meta.env.MODE === 'development') {
        logger.debug('LuciaAuth', 'Dev auto-login activated', { role: currentMockRoleState });
      }
    }
  }, [isDevelopment, isInitialLoading, fetchedUser, isLoggedOut, currentMockRoleState, userState]);

  // Consolidate context value
  const authContextValue = useMemo(() => {
    const isAuthenticated = !!userState;
    const userRole = (userState?.role || 'user') as Role;
    const permissions = getUserPermissions(userRole);

    return {
      user: userState,
      isAuthenticated,
      isLoading:
        isInitialLoading ||
        loginMutation.isPending ||
        registerMutation.isPending ||
        logoutMutation.isPending,
      login: loginMutation.mutate,
      logout: logoutMutation.mutate,
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
      // Role-based permissions
      isAdmin: permissions.isAdmin,
      isSuperAdmin: permissions.isSuperAdmin,
      isModerator: permissions.isModerator,
      canAccessAdminPanel: permissions.canAccessAdminPanel,
      isAdminOrModerator: permissions.isAdminOrModerator,
      // Navigation state
      shouldRedirectToAuth,
      clearAuthRedirect: () => setShouldRedirectToAuth(false),
      // Dev mode
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
    shouldRedirectToAuth
  ]);

  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Use Lucia Auth hook - maintains same API as original useAuth
 */
export const useLuciaAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useLuciaAuth must be used within a LuciaAuthProvider');
  }
  return context;
};

// Export types for compatibility
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

export type { AuthContextType };