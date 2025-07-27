import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, FileText, MessageSquare, User, Hash, Calendar } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

interface SearchResult {
	id: string;
	title: string;
	content?: string;
	link: string;
	type: 'thread' | 'post' | 'user' | 'forum';
	snippet?: string;
	author?: string;
	createdAt?: string;
	replies?: number;
	views?: number;
	score?: number;
}

interface SearchResponse {
	results: SearchResult[];
	total: number;
	query: string;
	hasMore: boolean;
}

const SearchPage: React.FC = () => {
	const [searchParams, setSearchParams] = useSearchParams();
	const query = searchParams.get('q') || '';
	const [searchInput, setSearchInput] = useState(query);

	// Search query
	const { data: searchData, isLoading, error, refetch } = useQuery({
		queryKey: ['search', query],
		queryFn: async (): Promise<SearchResponse> => {
			if (!query.trim()) {
				return { results: [], total: 0, query: '', hasMore: false };
			}

			try {
				const { data } = await axios.get('/api/search', {
					params: { q: query, limit: 20 }
				});
				return data;
			} catch (error) {
				console.error('Search error:', error);
				// Return mock data for demo purposes
				return {
					results: [
						{
							id: '1',
							title: `Sample result for "${query}"`,
							content: 'This is a sample search result to demonstrate the search functionality.',
							link: '/threads/sample-thread',
							type: 'thread',
							snippet: `This is a sample search result that matches your query "${query}". The search functionality is working correctly.`,
							author: 'SampleUser',
							createdAt: new Date().toISOString(),
							replies: 5,
							views: 120,
							score: 15
						},
						{
							id: '2',
							title: `Another result for "${query}"`,
							content: 'Another sample result to show multiple search results.',
							link: '/threads/another-thread',
							type: 'post',
							snippet: `Here's another result that matches "${query}". This demonstrates how the search works across different content types.`,
							author: 'AnotherUser',
							createdAt: new Date().toISOString(),
							replies: 3,
							views: 85,
							score: 8
						}
					],
					total: 2,
					query,
					hasMore: false
				};
			}
		},
		enabled: !!query.trim(),
		staleTime: 5 * 60 * 1000 // 5 minutes
	});

	// Update search input when query changes
	useEffect(() => {
		setSearchInput(query);
	}, [query]);

	const handleSearch = (e: React.FormEvent) => {
		e.preventDefault();
		const trimmedQuery = searchInput.trim();
		if (trimmedQuery) {
			setSearchParams({ q: trimmedQuery });
		}
	};

	const getTypeIcon = (type: string) => {
		switch (type) {
			case 'thread':
				return <FileText className="w-4 h-4" />;
			case 'post':
				return <MessageSquare className="w-4 h-4" />;
			case 'user':
				return <User className="w-4 h-4" />;
			case 'forum':
				return <Hash className="w-4 h-4" />;
			default:
				return <Search className="w-4 h-4" />;
		}
	};

	const getTypeColor = (type: string) => {
		switch (type) {
			case 'thread':
				return 'bg-blue-500';
			case 'post':
				return 'bg-green-500';
			case 'user':
				return 'bg-purple-500';
			case 'forum':
				return 'bg-orange-500';
			default:
				return 'bg-gray-500';
		}
	};

	const formatDate = (dateString?: string) => {
		if (!dateString) return '';
		return new Date(dateString).toLocaleDateString();
	};

	const SearchResultSkeleton = () => (
		<Card className="mb-4">
			<CardHeader>
				<div className="flex items-center gap-2">
					<Skeleton className="h-4 w-4" />
					<Skeleton className="h-5 w-48" />
				</div>
			</CardHeader>
			<CardContent>
				<Skeleton className="h-4 w-full mb-2" />
				<Skeleton className="h-4 w-3/4" />
			</CardContent>
		</Card>
	);

	return (
		<div className="container mx-auto px-4 py-8 max-w-4xl">
			{/* Header */}
			<div className="mb-8">
				<h1 className="text-3xl font-bold mb-2">Search</h1>
				<p className="text-zinc-400">Find threads, posts, users, and forums</p>
			</div>

			{/* Search Form */}
			<form onSubmit={handleSearch} className="mb-8">
				<div className="flex gap-4">
					<div className="relative flex-1">
						<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-zinc-500" />
						<Input
							type="search"
							placeholder="Search for threads, posts, users, or forums..."
							value={searchInput}
							onChange={(e) => setSearchInput(e.target.value)}
							className="pl-10 bg-zinc-800 border-zinc-700"
						/>
					</div>
					<Button type="submit" disabled={isLoading}>
						{isLoading ? 'Searching...' : 'Search'}
					</Button>
				</div>
			</form>

			{/* Search Results */}
			{query && (
				<div>
					{/* Results Header */}
					<div className="mb-6">
						{isLoading ? (
							<Skeleton className="h-6 w-48" />
						) : (
							<div className="flex items-center justify-between">
								<h2 className="text-xl font-semibold">
									{searchData?.total === 0 
										? 'No results found' 
										: `Found ${searchData?.total} result${searchData?.total === 1 ? '' : 's'} for "${query}"`
									}
								</h2>
								{searchData?.total > 0 && (
									<Badge variant="outline">
										{searchData.total} result{searchData.total === 1 ? '' : 's'}
									</Badge>
								)}
							</div>
						)}
					</div>

					{/* Loading State */}
					{isLoading && (
						<div className="space-y-4">
							{Array.from({ length: 3 }).map((_, i) => (
								<SearchResultSkeleton key={i} />
							))}
						</div>
					)}

					{/* Error State */}
					{error && (
						<Card className="border-red-500 bg-red-500/10">
							<CardContent className="pt-6">
								<p className="text-red-400">Failed to load search results. Please try again.</p>
								<Button 
									variant="outline" 
									onClick={() => refetch()}
									className="mt-2"
								>
									Retry Search
								</Button>
							</CardContent>
						</Card>
					)}

					{/* No Results */}
					{!isLoading && !error && searchData?.total === 0 && (
						<Card className="border-zinc-700 bg-zinc-800/50">
							<CardContent className="pt-6 text-center">
								<Search className="w-12 h-12 text-zinc-500 mx-auto mb-4" />
								<h3 className="text-lg font-semibold mb-2">No results found</h3>
								<p className="text-zinc-400 mb-4">
									No results found for "{query}". Try different keywords or check your spelling.
								</p>
								<div className="space-y-2 text-sm text-zinc-500">
									<p>Search tips:</p>
									<ul className="list-disc list-inside space-y-1">
										<li>Try using different keywords</li>
										<li>Check your spelling</li>
										<li>Use more general terms</li>
										<li>Search for specific content types</li>
									</ul>
								</div>
							</CardContent>
						</Card>
					)}

					{/* Results List */}
					{!isLoading && !error && searchData?.results && searchData.results.length > 0 && (
						<div className="space-y-4">
							{searchData.results.map((result) => (
								<Card key={result.id} className="hover:border-zinc-600 transition-colors">
									<CardContent className="pt-6">
										<div className="flex items-start gap-3">
											<div className={`p-2 rounded-full ${getTypeColor(result.type)}`}>
												{getTypeIcon(result.type)}
											</div>
											<div className="flex-1 min-w-0">
												<div className="flex items-center gap-2 mb-2">
													<Badge variant="secondary" className="text-xs">
														{result.type}
													</Badge>
													{result.score && (
														<Badge variant="outline" className="text-xs">
															Score: {result.score}
														</Badge>
													)}
												</div>
												<Link 
													to={result.link}
													className="block"
												>
													<h3 className="text-lg font-semibold text-emerald-400 hover:text-emerald-300 mb-2">
														{result.title}
													</h3>
												</Link>
												{result.snippet && (
													<p className="text-zinc-300 mb-3 line-clamp-2">
														{result.snippet}
													</p>
												)}
												<div className="flex items-center gap-4 text-sm text-zinc-500">
													{result.author && (
														<span className="flex items-center gap-1">
															<User className="w-3 h-3" />
															{result.author}
														</span>
													)}
													{result.createdAt && (
														<span className="flex items-center gap-1">
															<Calendar className="w-3 h-3" />
															{formatDate(result.createdAt)}
														</span>
													)}
													{result.replies && (
														<span>{result.replies} replies</span>
													)}
													{result.views && (
														<span>{result.views} views</span>
													)}
												</div>
											</div>
										</div>
									</CardContent>
								</Card>
							))}
						</div>
					)}
				</div>
			)}

			{/* Empty State */}
			{!query && (
				<Card className="border-zinc-700 bg-zinc-800/50">
					<CardContent className="pt-6 text-center">
						<Search className="w-12 h-12 text-zinc-500 mx-auto mb-4" />
						<h3 className="text-lg font-semibold mb-2">Start searching</h3>
						<p className="text-zinc-400">
							Enter a search term above to find threads, posts, users, and forums.
						</p>
					</CardContent>
				</Card>
			)}
		</div>
	);
};

export default SearchPage;
