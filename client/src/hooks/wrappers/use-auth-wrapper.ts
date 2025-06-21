import { useAuth } from '@/hooks/use-auth';

/**
 * A simple wrapper around useAuth for potential future customization
 * Currently just re-exports the useAuth hook as-is.
 */
export function useAuthWrapper() {
	// useAuth doesn't take any parameters - previous comment was incorrect
	return useAuth();
}
