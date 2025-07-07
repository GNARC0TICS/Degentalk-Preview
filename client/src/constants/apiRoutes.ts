export const API_ROUTES = {
	forums: {
		structure: '/api/forums/structure',
		threadsByForum: (id: Id<'id'> | string) => `/api/forum/forums/${id}/threads`
	},
	threads: {
		hot: '/api/hot-threads'
	}
} as const;
