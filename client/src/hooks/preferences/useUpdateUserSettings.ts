import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/utils/api-request';
import { useToast } from '@/hooks/use-toast';
import type { PreferenceSection } from '@/types/preferences.types';
import { logger } from "@/lib/logger";

/**
 * Hook to update user preferences
 *
 * @param section - The preferences section to update (profile, account, notifications)
 * @returns Mutation for updating the specified preferences section
 */
export function useUpdateUserSettings(section: PreferenceSection) {
	const queryClient = useQueryClient();
	const { toast } = useToast();

	return useMutation({
		mutationFn: async (data: Record<string, any>) => {
			return apiRequest<{ success: boolean; data: any }>({
				url: `/api/users/me/preferences/${section}`,
				method: 'PUT',
				data
			});
		},
		onSuccess: () => {
			// Invalidate the user preferences query to refetch the updated data
			queryClient.invalidateQueries({
				queryKey: ['user-preferences']
			});

			// Show success toast
			toast({
				title: 'Preferences updated',
				description: 'Your preferences have been saved successfully.',
				variant: 'default'
			});
		},
		onError: (error: any) => {
			logger.error('UseUpdateUserSettings', `Failed to update ${section} preferences:`, error);
			// Show error toast
			toast({
				title: `Failed to update ${section} preferences`,
				description: error.message || 'An unexpected error occurred.',
				variant: 'destructive'
			});
		}
	});
}

/**
 * Hook to update password
 *
 * @returns Mutation for updating user password
 */
export function useUpdatePassword() {
	const { toast } = useToast();

	return useMutation({
		mutationFn: async (data: { oldPassword: string; newPassword: string }) => {
			return apiRequest<{ success: boolean; message: string }>({
				url: '/api/users/me/security/change-password',
				method: 'POST',
				data
			});
		},
		onSuccess: () => {
			// Show success toast
			toast({
				title: 'Password updated',
				description: 'Your password has been changed successfully.',
				variant: 'default'
			});
		},
		onError: (error: any) => {
			logger.error('UseUpdateUserSettings', 'Failed to update password:', error);
			// Show error toast
			toast({
				title: 'Failed to update password',
				description: error.message || 'An unexpected error occurred.',
				variant: 'destructive'
			});
		}
	});
}
