import { apiRequest } from '@/lib/api-request';
import type { EntryId } from '@shared/types/ids';

interface DictionarySubmission {
	term: string;
	definition: string;
	example?: string;
	tags?: string[];
}

export const dictionaryApi = {
	list: (params?: Record<string, string>) =>
		apiRequest({ url: '/api/dictionary', method: 'GET', params }),
	getBySlug: (slug: string) => apiRequest({ url: `/api/dictionary/${slug}`, method: 'GET' }),
	submit: (data: DictionarySubmission) => apiRequest({ url: '/api/dictionary', method: 'POST', data }),
	moderate: (id: EntryId, status: 'approved' | 'rejected') =>
		apiRequest({ url: `/api/dictionary/${id}`, method: 'PATCH', data: { status } }),
	upvote: (id: EntryId) => apiRequest({ url: `/api/dictionary/${id}/upvote`, method: 'POST' })
};
