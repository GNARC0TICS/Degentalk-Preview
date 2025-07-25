export type ThreadEngagementStats = {
	replies: number;
	likes: number;
};

// Note: This function now returns an empty array since getForumRules
// has been moved to the client. If you need the actual prefix engine logic,
// use the client-side version of this function.
export function prefixEngine(forumSlug: string, stats: ThreadEngagementStats): string[] {
	return [];
}
