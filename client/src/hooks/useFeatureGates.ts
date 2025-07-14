import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/utils/api-request';
import { useAuth } from '@/hooks/use-auth';

/**
 * Feature gate configuration type
 */
export interface FeatureGate {
	id: string;
	name: string;
	description: string;
	minLevel: number;
	badgeRequired?: string;
	enabled: boolean;
}

/**
 * User feature access type
 */
export interface UserFeatureAccess {
	featureId: string;
	hasAccess: boolean;
	reason?: string;
	unlocksAtLevel?: number;
	missingBadge?: string;
}

/**
 * Hook to check if a user has access to a gated feature
 */
export function useFeatureGates() {
	const { user, isLoading: userLoading } = useAuth();

	// Fetch all feature gates configuration
	const {
		data: featureGates,
		isLoading: gatesLoading,
		isError,
		error
	} = useQuery<FeatureGate[]>({
		queryKey: ['featureGates'],
		queryFn: async () => {
			return apiRequest({ url: '/api/features/gates', method: 'GET' });
		},
		staleTime: 5 * 60 * 1000 // Cache for 5 minutes
	});

	// Fetch user-specific feature access
	const { data: userAccess, isLoading: accessLoading } = useQuery<UserFeatureAccess[]>({
		queryKey: ['featureAccess', user?.id],
		queryFn: async () => {
			return apiRequest({ url: `/api/features/access/${user?.id}`, method: 'GET' });
		},
		enabled: !!user?.id,
		staleTime: 60 * 1000 // Cache for 1 minute
	});

	// Check if a user has access to a specific feature
	const checkAccess = (
		featureId: string
	): {
		hasAccess: boolean;
		isLoading: boolean;
		reason?: string;
		unlocksAtLevel?: number;
		missingBadge?: string;
	} => {
		const isLoading = userLoading || gatesLoading || accessLoading;

		// If data is still loading, return a loading state
		if (isLoading) {
			return { hasAccess: false, isLoading: true };
		}

		// If no user is logged in, deny access
		if (!user) {
			return {
				hasAccess: false,
				isLoading: false,
				reason: 'login_required'
			};
		}

		// If user access data is available, use it
		if (Array.isArray(userAccess)) {
			const access = userAccess.find((a: UserFeatureAccess) => a.featureId === featureId);
			if (access) {
				return {
					hasAccess: access.hasAccess,
					isLoading: false,
					reason: access.hasAccess ? undefined : 'requirements_not_met',
					unlocksAtLevel: access.unlocksAtLevel,
					missingBadge: access.missingBadge
				};
			}
		}

		// Fallback to manual check based on feature gate config
		const gate = Array.isArray(featureGates)
			? featureGates.find((g: FeatureGate) => g.id === featureId)
			: undefined;

		// If gate doesn't exist or is disabled, grant access by default
		if (!gate || !gate.enabled) {
			return { hasAccess: true, isLoading: false };
		}

		// Check level requirement
		const levelMet = (user.level || 0) >= gate.minLevel;

		// If there's a badge requirement, we can't check it here
		// The backend endpoint should handle that, so we'll assume it's not met
		if (gate.badgeRequired) {
			return {
				hasAccess: false,
				isLoading: false,
				reason: 'badge_required',
				unlocksAtLevel: gate.minLevel,
				missingBadge: gate.badgeRequired
			};
		}

		return {
			hasAccess: levelMet,
			isLoading: false,
			reason: levelMet ? undefined : 'level_too_low',
			unlocksAtLevel: gate.minLevel
		};
	};

	return {
		featureGates,
		userAccess,
		isLoading: userLoading || gatesLoading || accessLoading,
		isError,
		error,
		checkAccess
	};
}

/**
 * Hook to check if a user has access to a specific feature
 */
export function useFeatureAccess(featureId: string) {
	const { checkAccess, isError, error } = useFeatureGates();

	const access = checkAccess(featureId);

	return {
		...access,
		isError,
		error
	};
}
