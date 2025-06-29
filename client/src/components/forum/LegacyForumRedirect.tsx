import React, { useEffect } from 'react';
import { useParams, useLocation } from 'wouter';
import { useForumStructure } from '@/contexts/ForumStructureContext';

/**
 * Handles redirects from legacy forum URLs to new hierarchical structure
 * Old: /forums/{forum-slug} or /forum/{forum-slug}
 * New: /zones/{zone-slug}/{forum-slug}
 */
const LegacyForumRedirect: React.FC = () => {
	const params = useParams<{ slug: string }>();
	const [, setLocation] = useLocation();
	const { getForum, zones } = useForumStructure();

	useEffect(() => {
		if (!params.slug || !zones) return;

		// Try to find the forum by slug
		const forum = getForum(params.slug);
		if (!forum) {
			// If forum not found, redirect to zones listing
			setLocation('/zones');
			return;
		}

		// Find which zone contains this forum
		const parentZone = zones.find((zone) => zone.forums.some((f) => f.slug === params.slug));

		if (parentZone) {
			// Redirect to new hierarchical URL
			setLocation(`/zones/${parentZone.slug}/${forum.slug}`);
		} else {
			// Check if it's a subforum
			for (const zone of zones) {
				for (const parentForum of zone.forums) {
					if (parentForum.forums?.some((sf) => sf.slug === params.slug)) {
						const subforum = parentForum.forums.find((sf) => sf.slug === params.slug);
						if (subforum) {
							setLocation(`/zones/${zone.slug}/${parentForum.slug}/${subforum.slug}`);
							return;
						}
					}
				}
			}

			// Fallback to zones listing
			setLocation('/zones');
		}
	}, [params.slug, zones, getForum, setLocation]);

	return (
		<div className="min-h-screen bg-black flex items-center justify-center">
			<div className="text-center">
				<div className="inline-flex items-center justify-center w-16 h-16 mb-4">
					<div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
				</div>
				<p className="text-zinc-400">Redirecting to new forum location...</p>
			</div>
		</div>
	);
};

export default LegacyForumRedirect;
