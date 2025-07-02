import { apiRequest } from '@/lib/queryClient';
import type { EntryId } from '@db/types';

export const dictionaryApi = {
	list: (params?: Record<string, any>) =>
		apiRequest({ url: '/api/dictionary', method: 'GET', params }),
	getBySlug: (slug: string) => apiRequest({ url: `/api/dictionary/${slug}`, method: 'GET' }),
	submit: (data: any) => apiRequest({ url: '/api/dictionary', method: 'POST', data }),
	moderate: (id: EntryId, status: 'approved' | 'rejected') =>
		apiRequest({ url: `/api/dictionary/${id}`, method: 'PATCH', data: { status } }),
	upvote: (id: EntryId) => apiRequest({ url: `/api/dictionary/${id}/upvote`, method: 'POST' })
};
