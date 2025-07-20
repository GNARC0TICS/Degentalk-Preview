import React, { useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { useForumStructure } from '@/contexts/ForumStructureContext';

/**
 * Handles redirects from legacy URLs to new /forums/ structure
 * Legacy patterns:
 * - /zones → /forums
 * - /zones/{slug} → /forums/{slug}
 * - /zones/{zoneSlug}/{forumSlug} → /forums/{forumSlug}
 * - /zones/{zoneSlug}/{forumSlug}/{subforumSlug} → /forums/{forumSlug}/{subforumSlug}
 * - /forum/{slug} → /forums/{slug} (singular deprecated)
 */
const LegacyForumNavigate: React.FC = () => {
	const params = useParams<{
		slug?: string;
		zoneSlug?: string;
		forumSlug?: string;
		subforumSlug?: string;
	}>();
	const location = useLocation();
	const navigate = useNavigate();
	const { getForum } = useForumStructure();

	useEffect(() => {
		let targetUrl = '/forums';

		// Handle different legacy URL patterns
		if (location.pathname.startsWith('/zones/')) {
			if (params.subforumSlug && params.forumSlug) {
				// /zones/{zoneSlug}/{forumSlug}/{subforumSlug} → /forums/{forumSlug}/{subforumSlug}
				targetUrl = `/forums/${params.forumSlug}/${params.subforumSlug}`;
			} else if (params.forumSlug) {
				// /zones/{zoneSlug}/{forumSlug} → /forums/{forumSlug}
				targetUrl = `/forums/${params.forumSlug}`;
			} else if (params.slug) {
				// /zones/{slug} → /forums/{slug} (assuming slug is a forum)
				const forum = getForum(params.slug);
				if (forum) {
					targetUrl = `/forums/${params.slug}`;
				} else {
					// If not a valid forum, redirect to forums listing
					targetUrl = '/forums';
				}
			}
			// /zones → /forums (handled by default targetUrl)
		} else if (location.pathname.startsWith('/forum/')) {
			// Handle singular /forum/ pattern
			if (params.slug) {
				const forum = getForum(params.slug);
				if (forum) {
					targetUrl = `/forums/${params.slug}`;
				} else {
					targetUrl = '/forums';
				}
			} else {
				targetUrl = '/forums';
			}
		}

		// Only redirect if we're not already at the target
		if (location.pathname !== targetUrl) {
			navigate(targetUrl);
		}
	}, [location.pathname, params, getForum, navigate]);

	return (
		<div className="min-h-screen bg-black flex items-center justify-center">
			<div className="text-center">
				<div className="inline-flex items-center justify-center w-16 h-16 mb-4">
					<div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
				</div>
				<p className="text-zinc-400">Navigateing to forums...</p>
			</div>
		</div>
	);
};

export default LegacyForumNavigate;
