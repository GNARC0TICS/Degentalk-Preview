export const API_ROUTES = {
	forums: {
		structure: '/api/forums/structure',
		threadsByForum: (id: number | string) => `/api/forum/forums/${id}/threads`
	},
	threads: {
		hot: '/api/hot-threads'
	}
} as const;
