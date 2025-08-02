// Mock auth hook for static landing page

import { logger } from '@/lib/logger';

export const useAuth = () => {
  return {
    user: null,
    isAuthenticated: false,
    isLoading: false,
    login: () => logger.info('Auth', 'Login clicked'),
    logout: () => logger.info('Auth', 'Logout clicked'),
    register: () => logger.info('Auth', 'Register clicked'),
    logoutMutation: {
      mutate: () => logger.info('Auth', 'Logout mutation')
    }
  };
};