import React, { useEffect } from 'react';
import { useParams, useLocation } from 'wouter';
import { useForumStructure } from '@/contexts/ForumStructureContext';
import { getForumUrl } from '@/utils/forum-urls';

/**
 * Handles redirects from legacy forum URLs to hybrid structure
 * Old: /forum/{forum-slug} (singular, deprecated)
 * New: /forums/{forum-slug} (direct access pattern)
 */
const LegacyForumRedirect: React.FC = () => {
	const params = useParams<{ slug: string }>();
	const [, setLocation] = useLocation();
	const { getForum, zones } = useForumStructure();

	useEffect(() => {
		if (!params.slug) return;

		// Try to find the forum by slug
		const forum = getForum(params.slug);
		if (!forum) {
			// If forum not found, redirect to forums listing
			setLocation('/forums');
			return;
		}

		// Redirect to direct forum URL (hybrid approach)
		setLocation(getForumUrl(forum.slug));
	}, [params.slug, getForum, setLocation]);

	return (
		<div className="min-h-screen bg-black flex items-center justify-center">
			<div className="text-center">
				<div className="inline-flex items-center justify-center w-16 h-16 mb-4">
					<div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
				</div>
				<p className="text-zinc-400">Redirecting to forum...</p>
			</div>
		</div>
	);
};

export default LegacyForumRedirect;
