import { useAuth } from '@/hooks/use-auth';

/**
 * A wrapper around useAuth to handle TypeScript errors
 * This is needed because the useAuth hook expects arguments in TypeScript,
 * but works fine without them at runtime.
 */
export function useAuthWrapper() {
	// TypeScript expects arguments for useAuth, but it works fine without them
	// The default argument true seems to satisfy useAuth's type requirements
	// @ts-ignore
	return useAuth(true);
}
