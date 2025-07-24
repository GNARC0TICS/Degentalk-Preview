import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@app/utils/api-request';
import { useToast } from '@app/hooks/use-toast';
import type { Notification } from '@app/types/notifications';
import api from '@app/core/api';
import { logger } from '@app/lib/logger';

export function useNotifications() {
	const queryClient = useQueryClient();
	const { toast } = useToast();

	// Query notifications
	const notificationsQuery = useQuery({
		queryKey: ['/api/notifications/getPaginatedNotifications'],
		queryFn: async () => {
			try {
				return await api.notifications.getNotifications({ pageOffset: 0 });
			} catch (error) {
				logger.error('useNotifications', 'Error fetching notifications:', error);
				throw error;
			}
		},
		staleTime: 10 * 1000, // 10 seconds before refetching,
		refetchInterval: 5000
	});

	return {
		// Data
		notifications: notificationsQuery.data?.notifications || [],

		// Status
		isLoadingNotifications: notificationsQuery.isLoading,

		// Error states
		notificationsError: notificationsQuery.error,

		// Methods
		refreshNotifications: () =>
			queryClient.invalidateQueries({
				queryKey: ['/api/users/me/notifications']
			})
	};
}
