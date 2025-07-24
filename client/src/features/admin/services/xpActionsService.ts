import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@app/utils/queryClient';
import { useToast } from '@app/hooks/use-toast';

export interface XpAction {
	action: string;
	baseValue: number;
	description: string;
	maxPerDay?: number;
	cooldownSec?: number;
	enabled: boolean;
}

export function useXpActions() {
	return useQuery<{ actions: XpAction[] }>({
		queryKey: ['/api/admin/xp/actions'],
		queryFn: () => apiRequest({ url: '/api/admin/xp/actions', method: 'GET' })
	});
}

export function useCreateXpAction() {
	const { toast } = useToast();
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (data: Partial<XpAction>) =>
			apiRequest({ url: '/api/admin/xp/actions', method: 'POST', data }),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['/api/admin/xp/actions'] });
			toast({ title: 'Success', description: 'XP action created successfully.' });
		},
		onError: (error: any) => {
			toast({
				title: 'Error',
				description: error.message || 'Failed to create XP action.',
				variant: 'destructive'
			});
		}
	});
}

/**
 * Hook to update an XP action's configuration
 * @returns Mutation function that accepts { key: string, data: Partial<XpAction> }
 * @example
 * const updateXpAction = useUpdateXpAction();
 * updateXpAction.mutate({ key: 'post_create', data: { baseValue: 50 } });
 */
export function useUpdateXpAction() {
	const { toast } = useToast();
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ key, data }: { key: string; data: Partial<XpAction> }) =>
			apiRequest({ url: `/api/admin/xp/actions/${key}`, method: 'PUT', data }),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['/api/admin/xp/actions'] });
			toast({ title: 'Success', description: 'XP action updated successfully.' });
		},
		onError: (error: any) => {
			toast({
				title: 'Error',
				description: error.message || 'Failed to update XP action.',
				variant: 'destructive'
			});
		}
	});
}

export function useDeleteXpAction() {
	const { toast } = useToast();
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (key: string) =>
			apiRequest({ url: `/api/admin/xp/actions/${key}`, method: 'DELETE' }),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['/api/admin/xp/actions'] });
			toast({ title: 'Success', description: 'XP action deleted successfully.' });
		},
		onError: (error: any) => {
			toast({
				title: 'Error',
				description: error.message || 'Failed to delete XP action.',
				variant: 'destructive'
			});
		}
	});
}
