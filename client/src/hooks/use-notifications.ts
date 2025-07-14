import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@utils/api-request';
import { useToast } from '@/hooks/use-toast';
import type { Notification } from '@/types/notifications';
import api from '@/core/api';

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
				console.error('Error fetching notifications:', error);
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
