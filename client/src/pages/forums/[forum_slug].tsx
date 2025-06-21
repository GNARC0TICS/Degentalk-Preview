import React from 'react';
import { Link, useParams } from 'wouter';
import { useForumStructure } from '@/contexts/ForumStructureContext';
import type { MergedForum, MergedZone, MergedRules } from '@/contexts/ForumStructureContext';
import Breadcrumb from '@/components/common/Breadcrumb';
import { Wide } from '@/layout/primitives/Wide';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';

// Placeholder for a proper NotFoundPage component
const NotFoundPage: React.FC = () => {
	return (
		<Wide className="px-2 sm:px-4 py-6 sm:py-8 md:py-12">
			<div className="text-center">
				<h1 className="text-2xl font-bold mb-4">404 - Forum Not Found</h1>
				<p className="text-zinc-400 mb-6">
					The forum you are looking for does not exist or could not be found.
				</p>
				<Link href="/">
					<Button variant="default">Go back to Home</Button>
				</Link>
			</div>
		</Wide>
	);
};

// Importing the actual ThreadList component
import ThreadList from '@/features/forum/components/ThreadList';
// Import ForumListItem to display subforums
import { ForumListItem } from '@/features/forum/components/ForumListItem';

// Placeholder for CreateThreadButton component
const CreateThreadButton: React.FC<{ forumSlugOrId: string }> = ({ forumSlugOrId }) => {
	return (
		<Link href={`/threads/create?forumId=${forumSlugOrId}`}>
			<Button className="inline-flex items-center gap-2">
				<PlusCircle className="h-4 w-4" />
				Create New Thread
			</Button>
		</Link>
	);
};

const ForumPage: React.FC = () => {
	const params = useParams<{ slug?: string }>(); // Changed to slug
	const forum_slug = params?.slug; // Changed to params?.slug
	const { getForum, zones, isLoading, error: contextError } = useForumStructure(); // Removed unused getZone

	// Strict slug validation
	if (typeof forum_slug !== 'string' || forum_slug.trim() === '') {
		return <NotFoundPage />;
	}

	// const currentForumSlug = typeof forum_slug === 'string' ? forum_slug : undefined; // forum_slug is now directly used

	if (isLoading) {
		// isLoading from context is the primary loading state
		return (
			<Wide className="px-2 sm:px-4 py-6 sm:py-8 md:py-12">
				<div className="text-center">
					<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500 mx-auto mb-4"></div>
					<p className="text-zinc-400">Loading forum data...</p>
				</div>
			</Wide>
		);
	}

	if (contextError) {
		return (
			<Wide className="px-2 sm:px-4 py-6 sm:py-8 md:py-12">
				<div className="text-center">
					<div className="text-red-500 mb-4">
						<h2 className="text-xl font-semibold mb-2">Error</h2>
						<p>Error loading forum data: {contextError.message}</p>
					</div>
				</div>
			</Wide>
		);
	}

	const forum: MergedForum | undefined = getForum(forum_slug); // Use forum_slug directly

	if (!forum) {
		return <NotFoundPage />;
	}

	// Find parent zone for breadcrumbs
	let parentZone: MergedZone | undefined;
	if (zones && forum_slug) {
		// Use forum_slug here
		for (const zone of zones) {
			if (zone.forums.some((f) => f.slug === forum_slug)) {
				// Use forum_slug here
				parentZone = zone;
				break;
			}
		}
	}

	// Use zone's theme and forum's merged theme.
	// MergedForum.theme is already the result of merging static config (including overrides) and API data.
	const zoneTheme = parentZone?.theme;
	const displayTheme = { ...zoneTheme, ...forum.theme }; // forum.theme is MergedTheme

	const renderRules = (rules: MergedRules) => {
		return (
			<ul className="list-disc pl-5 space-y-2">
				{Object.entries(rules).map(([key, value]) => {
					if (value === undefined) return null;
					let displayValue = '';
					if (typeof value === 'boolean') {
						displayValue = value ? 'Yes' : 'No';
					} else if (Array.isArray(value)) {
						displayValue = value.join(', ');
					} else if (typeof value === 'object' && value !== null) {
						displayValue = JSON.stringify(value);
					} else {
						displayValue = String(value);
					}
					return (
						<li key={key} className="text-sm">
							<span className="font-semibold text-zinc-300">
								{key.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase())}:
							</span>{' '}
							<span className="text-zinc-400">{displayValue}</span>
						</li>
					);
				})}
			</ul>
		);
	};

	return (
		<Wide className="px-2 sm:px-4 py-6 sm:py-8 md:py-12">
			<Breadcrumb
				zone={parentZone ? { name: parentZone.name, slug: parentZone.slug } : undefined}
				forum={{ name: forum.name, slug: forum.slug }}
				className="mb-6"
			/>

			{/* Forum Header */}
			{displayTheme?.bannerImage && (
				<div className="w-full max-h-[200px] sm:max-h-[300px] overflow-hidden rounded-lg mb-6">
					<img
						src={displayTheme.bannerImage}
						alt={`${forum.name} banner`}
						className="w-full h-full object-cover"
					/>
				</div>
			)}

			<div
				className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-4 sm:p-6 mb-6"
				style={{
					borderColor: displayTheme?.color ? `${displayTheme.color}40` : undefined,
					backgroundImage: displayTheme?.color
						? `linear-gradient(135deg, ${displayTheme.color}15 0%, transparent 50%, ${displayTheme.color}08 100%)`
						: undefined
				}}
			>
				<div className="flex items-center gap-4 mb-4">
					{displayTheme?.icon &&
						(displayTheme.icon.startsWith('/') || displayTheme.icon.startsWith('http') ? (
							<img
								src={displayTheme.icon}
								alt={`${forum.name} icon`}
								className="w-12 h-12 rounded-lg object-cover"
							/>
						) : (
							<span className="text-4xl">{displayTheme.icon}</span>
						))}
					<h1 className="text-2xl sm:text-3xl font-bold">{forum.name}</h1>
				</div>
				<div className="flex flex-wrap gap-4 text-sm text-zinc-400">
					<span>
						Total Threads: <span className="text-zinc-300 font-medium">{forum.threadCount}</span>
					</span>
					<span>•</span>
					<span>
						Total Posts: <span className="text-zinc-300 font-medium">{forum.postCount}</span>
					</span>
				</div>
			</div>

			{/* Forum Rules */}
			<section className="mb-8">
				<h2 className="text-xl font-semibold mb-4 text-zinc-100">Forum Rules</h2>
				<div className="bg-zinc-800/30 border border-zinc-700 rounded-lg p-4">
					{forum.rules ? (
						renderRules(forum.rules)
					) : (
						<p className="text-zinc-400 text-sm">No specific rules defined for this forum.</p>
					)}
				</div>
			</section>

			{/* Create Thread Button */}
			<section className="mb-8">
				<CreateThreadButton forumSlugOrId={forum.slug} />
			</section>

			{/* Subforums List */}
			{forum.forums && forum.forums.length > 0 && (
				<section className="mb-8">
					<h2 className="text-xl font-semibold mb-4 text-zinc-100">Subforums</h2>
					<div className="border border-zinc-700 rounded-lg overflow-hidden bg-zinc-800/30">
						{forum.forums.map((subForum) => (
							<ForumListItem
								key={subForum.slug}
								forum={subForum}
								href={`/forums/${subForum.slug}`}
								parentZoneColor={displayTheme?.color ?? undefined}
								depthLevel={0}
							/>
						))}
					</div>
				</section>
			)}

			{/* Thread List */}
			<section>
				<h2 className="text-xl font-semibold mb-6 text-zinc-100">Threads in {forum.name}</h2>
				<ThreadList forumId={forum.id} forumSlug={forum.slug} />
			</section>
		</Wide>
	);
};

export default ForumPage;
