import type { ForumId } from '@shared/types/ids';

export const API_ROUTES = {
	forums: {
		structure: '/api/forums/structure',
		threadsByForum: (id: ForumId | string) => `/api/forum/forums/${id}/threads`
	},
	threads: {
		hot: '/api/hot-threads'
	}
} as const;
