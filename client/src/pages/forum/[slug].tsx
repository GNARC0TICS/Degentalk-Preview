import React, { useState, useEffect } from 'react';
import { useParams } from 'wouter';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loader';
import { ErrorDisplay } from '@/components/ui/error-display';
import { Home, MessageSquare } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth.tsx';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { SiteFooter } from '@/components/layout/site-footer';
import { ForumGuidelines } from '@/components/forum/forum-guidelines';
import { Link } from 'wouter';
import { ActiveMembersWidget } from '@/components/users';
import { useActiveUsers } from '@/features/users/hooks';
import { ForumEntityBase } from '@/utils/forum-routing-helper';
import { ForumCategoryWithStats } from '@shared/types'; // Import ForumCategoryWithStats type

interface Thread {
	id: number;
	title: string;
	createdAt: string;
	userId: number;
	forumId: number;
	// Removed content as it's not returned by the API for thread listings
}

export default function ForumPage() {
	const { slug } = useParams<{ slug: string }>();
	const { user } = useAuth();
	const isLoggedIn = !!user;

	const [forum, setForum] = useState<ForumCategoryWithStats | null>(null); // Use ForumCategoryWithStats type
	const [childForums, setChildForums] = useState<ForumCategoryWithStats[]>([]); // State for child forums
	const [threads, setThreads] = useState<Thread[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	// Fetch active users
	const { data: activeUsers, isLoading: activeUsersLoading } = useActiveUsers({ limit: 5 });

	useEffect(() => {
		const fetchForumData = async () => {
			setLoading(true);
			setError(null);
			setChildForums([]); // Clear previous state
			setThreads([]); // Clear previous state

			try {
				// Fetch forum/category details and its children (forums or threads)
				const response = await fetch(`/api/forum/forums/${slug}/topics`);

				if (!response.ok) {
					const errorBody = await response.json().catch(() => ({ message: response.statusText }));
					const errorMessage = errorBody.message || `HTTP error! status: ${response.status}`;

					if (response.status === 404) {
						setError('Forum not found');
						console.log(`[ForumPage] Forum not found for slug: ${slug} (404 response).`);
					} else {
						setError(`Failed to load forum data: ${errorMessage}`);
						console.error(
							`[ForumPage] Error fetching forum data for slug: ${slug}`,
							response.status,
							errorBody
						);
					}
					setForum(null);
					return;
				}

				const result = await response.json();

				console.log(`[ForumPage] Current slug from URL: ${slug}`);
				console.log(`[ForumPage] Raw response for slug ${slug}:`, result);

				if (!result || !result.forum) {
					setError(result?.message || 'Failed to load forum data: Empty or invalid response');
					setForum(null);
					console.log(
						`[ForumPage] Forum not found or invalid response for slug: ${slug}. Full result:`,
						result
					);
					return;
				}

				console.log(`[ForumPage] Forum found for slug ${slug}:`, result.forum);
				setForum(result.forum);

				// Check if the fetched entity has child forums (topics in the backend response)
				if (result.topics && Array.isArray(result.topics) && result.topics.length > 0) {
					console.log(`[ForumPage] Found ${result.topics.length} child forums for slug ${slug}.`);
					setChildForums(result.topics);
					// No need to fetch threads if displaying child forums
					setThreads([]);
				} else {
					// If no child forums, assume this is a child forum itself and fetch its threads
					console.log(`[ForumPage] No child forums found for slug ${slug}. Fetching threads...`);
					// Fetch threads for the forum using the forum's ID
					if (result.forum.id) {
						const threadsResponse = await fetch(`/api/forum/threads/${result.forum.id}`);

						if (!threadsResponse.ok) {
							const errorBody = await threadsResponse
								.json()
								.catch(() => ({ message: threadsResponse.statusText }));
							const errorMessage =
								errorBody.message || `HTTP error! status: ${threadsResponse.status}`;
							setError(`Failed to load threads: ${errorMessage}`);
							console.error(
								`[ForumPage] Error fetching threads for forum ID ${result.forum.id}:`,
								threadsResponse.status,
								errorBody
							);
							setThreads([]);
							return;
						}

						const threadsData = await threadsResponse.json();

						if (Array.isArray(threadsData)) {
							setThreads(threadsData);
							console.log(
								`[ForumPage] Threads loaded for forum ID ${result.forum.id}:`,
								threadsData.length
							);
						} else {
							console.error('Unexpected threads data format:', threadsData);
							setThreads([]);
							setError('Failed to load threads: Unexpected data format');
						}
					} else {
						console.error('Forum ID missing after fetching category:', result.forum);
						setError('Failed to get forum ID for fetching threads.');
						setThreads([]);
					}
				}
			} catch (e: any) {
				console.error(`Error fetching forum data for slug ${slug}:`, e);
				setError(e.message || 'Failed to load forum data');
				setForum(null);
				setChildForums([]);
				setThreads([]);
			} finally {
				setLoading(false);
			}
		};

		fetchForumData();
	}, [slug]);

	if (loading || activeUsersLoading) {
		return (
			<div className="flex flex-col min-h-screen">
				<div className="container max-w-7xl mx-auto px-4 py-6 flex-grow">
					<LoadingSpinner text="Loading Forum..." />
				</div>
				<SiteFooter />
			</div>
		);
	}

	if (error) {
		return (
			<div className="flex flex-col min-h-screen">
				<div className="container max-w-7xl mx-auto px-4 py-6 flex-grow">
					<ErrorDisplay title="Error loading forum" error={error} />
				</div>
				<SiteFooter />
			</div>
		);
	}

	if (!forum) {
		return (
			<div className="flex flex-col min-h-screen">
				<div className="container max-w-7xl mx-auto px-4 py-6 flex-grow">
					<ErrorDisplay title="Forum not found" error="The requested forum does not exist." />
				</div>
				<SiteFooter />
			</div>
		);
	}

	return (
		<div className="flex flex-col min-h-screen">
			<div className="container max-w-7xl mx-auto px-4 py-6 flex-grow">
				{/* Forum Details */}
				<div className="mb-8">
					<h1 className="text-3xl font-bold text-white mb-2">{forum.name}</h1>
					<p className="text-zinc-400">{forum.description}</p>
				</div>

				{/* Conditional Rendering: Show Child Forums or Threads */}
				{childForums.length > 0 ? (
					// Display Child Forums
					<div className="mb-8">
						<h2 className="text-2xl font-bold text-white mb-4">Forums</h2>
						<div className="space-y-4">
							{childForums.map((childForum) => (
								<Card
									key={childForum.id}
									className="bg-zinc-900/50 border border-zinc-800 rounded-lg overflow-hidden"
								>
									<CardHeader>
										<CardTitle>
											{/* Link to the child forum page */}
											<Link href={`/forum/${childForum.slug}`} className="text-white">
												{childForum.name}
											</Link>
										</CardTitle>
										<CardDescription className="text-zinc-400">
											{childForum.description}
										</CardDescription>
									</CardHeader>
									<CardContent>
										{/* Display stats for the child forum */}
										<div className="text-sm text-zinc-500">
											Threads: {childForum.threadCount || 0} | Posts: {childForum.postCount || 0}
										</div>
									</CardContent>
								</Card>
							))}
						</div>
					</div>
				) : (
					// Display Threads (if no child forums were found)
					<div className="mb-8">
						<h2 className="text-2xl font-bold text-white mb-4">Threads</h2>
						{threads.length > 0 ? (
							<div className="space-y-4">
								{threads.map((thread) => (
									<Card
										key={thread.id}
										className="bg-zinc-900/50 border border-zinc-800 rounded-lg overflow-hidden"
									>
										<CardHeader>
											<CardTitle>
												<Link href={`/forum/${slug}/threads/${thread.id}`} className="text-white">
													{thread.title}
												</Link>
											</CardTitle>
										</CardHeader>
										<CardContent>
											{/* Assuming thread content is available or fetchable */}
											{/* Thread content is not available in this view, consider adding a summary or first post snippet if needed */}
										</CardContent>
									</Card>
								))}
							</div>
						) : (
							<div className="text-zinc-500">No threads found in this forum.</div>
						)}
					</div>
				)}

				{/* Forum Guidelines and Active Members at the bottom */}
				<div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
					<ForumGuidelines className="h-full" />
					<ActiveMembersWidget users={activeUsers || []} className="h-full" />
				</div>
			</div>
			<SiteFooter />
		</div>
	);
}
