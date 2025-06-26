import React from 'react';
import { Link, useParams } from 'wouter';
import { useForumStructure } from '@/contexts/ForumStructureContext';
import type { MergedForum, MergedZone, MergedRules } from '@/contexts/ForumStructureContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Wide } from '@/layout/primitives';
import { getForumSpacing, getForumLayout } from '@/utils/spacing-constants';
import { MessageSquare, FileText, Home, ChevronRight, Plus } from 'lucide-react';
import { ForumBreadcrumbs, createForumBreadcrumbs } from '@/components/navigation/ForumBreadcrumbs';

// Placeholder NotFound component
const NotFoundPage: React.FC = () => (
	<Wide className={getForumSpacing('container')}>
		<Card className="bg-zinc-900 border-zinc-800 text-center">
			<CardContent className={getForumSpacing('contentPadding')}>
				<h1 className="text-2xl font-bold text-white mb-4">404 - Forum Not Found</h1>
				<Link href="/">
					<Button variant="outline">Go Home</Button>
				</Link>
			</CardContent>
		</Card>
	</Wide>
);

// ThreadList + ForumListItem are heavy; keep as dynamic imports or stubs for now
import ThreadList from '@/features/forum/components/ThreadList';
import type { ThreadFiltersState } from '@/components/forum/ThreadFilters';
import { ForumListItem } from '@/features/forum/components/ForumListItem';

// Enhanced Create Thread button
const CreateThreadButton: React.FC<{ forumSlug: string }> = ({ forumSlug }) => (
	<Link href={`/threads/create?forumSlug=${forumSlug}`}>
		<Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
			<Plus className="w-4 h-4 mr-2" />
			Create Thread
		</Button>
	</Link>
);

const ForumPageInner: React.FC = () => {
	const params = useParams<{ slug?: string }>();
	const forumSlug = params?.slug;

	if (!forumSlug) return <NotFoundPage />;

	// Hooks must always run
	const { getForum, getParentZone, isLoading, error } = useForumStructure();
	const forum = getForum(forumSlug);
	const parentZone: MergedZone | undefined = getParentZone(forumSlug);

	// SEO effect – executes on every render
	React.useEffect(() => {
		if (!forum) return;
		document.title = `${forum.name} | Forums | Degentalk`;
		const desc = forum.description ?? parentZone?.description ?? 'Forum discussions on Degentalk';
		let meta = document.querySelector('meta[name="description"]');
		if (!meta) {
			meta = document.createElement('meta');
			meta.setAttribute('name', 'description');
			document.head.appendChild(meta);
		}
		meta.setAttribute('content', desc);
	}, [forum, parentZone]);

	if (isLoading)
		return (
			<Wide className={getForumSpacing('container')}>
				<div className="text-center">
					<div className="text-lg text-zinc-400">Loading forum...</div>
				</div>
			</Wide>
		);

	if (error)
		return (
			<Wide className={getForumSpacing('container')}>
				<Card className="bg-red-900/20 border-red-800">
					<CardContent className={getForumSpacing('contentPadding')}>
						<div className="text-center text-red-400">Error loading forum</div>
					</CardContent>
				</Card>
			</Wide>
		);

	if (!forum) return <NotFoundPage />;

	const displayTheme = { ...parentZone?.theme, ...forum.theme };

	return (
		<div className={getForumLayout('page')}>
			<Wide className={getForumSpacing('container')}>
				<ForumBreadcrumbs
					items={createForumBreadcrumbs.forum(
						parentZone?.name || 'Zone',
						parentZone?.slug || '',
						forum.name
					)}
				/>

				{/* Forum Header */}
				<Card
					className="bg-zinc-900/60 border-zinc-800 overflow-hidden mb-8"
					style={{
						background: displayTheme.color
							? `linear-gradient(135deg, ${displayTheme.color}20, ${displayTheme.color}10)`
							: undefined
					}}
				>
					<CardHeader className={getForumSpacing('headerPadding')}>
						<div className={getForumLayout('headerFlex')}>
							<div className="flex-1">
								<CardTitle className="text-2xl font-bold text-white mb-2">{forum.name}</CardTitle>
								{forum.description && <p className="text-zinc-300 mb-4">{forum.description}</p>}
								<div className={getForumLayout('statsFlex')}>
									<div className="flex items-center gap-2">
										<MessageSquare className="w-4 h-4 text-emerald-500" />
										<span className="text-zinc-400">
											<span className="font-semibold text-white">{forum.threadCount}</span> threads
										</span>
									</div>
									<div className="flex items-center gap-2">
										<FileText className="w-4 h-4 text-blue-500" />
										<span className="text-zinc-400">
											<span className="font-semibold text-white">{forum.postCount}</span> posts
										</span>
									</div>
								</div>
							</div>
							<CreateThreadButton forumSlug={forum.slug} />
						</div>
					</CardHeader>
				</Card>

				{/* Subforums */}
				{forum.subforums && forum.subforums.length > 0 && (
					<Card className={`bg-zinc-900 border-zinc-800 ${getForumSpacing('section')}`}>
						<CardHeader>
							<CardTitle className="text-xl text-white flex items-center gap-2">
								<MessageSquare className="w-5 h-5 text-emerald-500" />
								Subforums
							</CardTitle>
						</CardHeader>
						<CardContent className="space-y-3">
							{forum.subforums.map((sf) => (
								<div key={sf.slug} className="bg-zinc-800/50 rounded-lg overflow-hidden">
									<ForumListItem
										forum={sf}
										href={`/forums/${sf.slug}`}
										parentZoneColor={displayTheme.color ?? undefined}
									/>
								</div>
							))}
						</CardContent>
					</Card>
				)}

				{/* Threads */}
				<Card className="bg-zinc-900 border-zinc-800">
					<CardHeader>
						<div className={getForumLayout('headerFlex')}>
							<CardTitle className="text-xl text-white flex items-center gap-2">
								<FileText className="w-5 h-5 text-blue-500" />
								Threads
							</CardTitle>
							<CreateThreadButton forumSlug={forum.slug} />
						</div>
					</CardHeader>
					<CardContent>
						{forum.threadCount === 0 ? (
							<div className="text-center py-12">
								<FileText className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
								<p className="text-zinc-400 text-lg">No threads yet.</p>
								<p className="text-zinc-500 text-sm mt-2">Be the first to start a discussion!</p>
							</div>
						) : (
							<ThreadList
								forumId={forum.id}
								forumSlug={forum.slug}
								filters={{ sortBy: 'latest', tags: [] } as ThreadFiltersState}
							/>
						)}
					</CardContent>
				</Card>
			</Wide>
		</div>
	);
};

export default ForumPageInner;
