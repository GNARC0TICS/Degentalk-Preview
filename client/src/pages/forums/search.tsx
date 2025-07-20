import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { SiteFooter } from '@/components/footer';
import {
	Breadcrumb,
	BreadcrumbList,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbPage,
	BreadcrumbSeparator
} from '@/components/ui/breadcrumb'; // Corrected import path
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import { Wide } from '@/layout/primitives';

// Placeholder for search results type
type SearchResult = {
	id: string;
	title: string;
	link: string;
	type: 'thread' | 'post' | 'user';
	snippet?: string;
};

const ForumSearchPage = () => {
	const [location, setLocation] = useLocation();
	const queryParams = new URLSearchParams(location.split('?')[1] || '');
	const searchQuery = queryParams.get('q') || '';

	const [currentSearch, setCurrentSearch] = React.useState(searchQuery);
	const [results, setResults] = React.useState<SearchResult[]>([]);
	const [isLoading, setIsLoading] = React.useState(false);

	const handleSearchSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!currentSearch.trim()) return;

		// Update URL
		navigate(`/forums/search?q=${encodeURIComponent(currentSearch.trim())}`);
		setIsLoading(true);
		// TODO: Implement actual API call to fetch search results
		// For now, simulate API call
		await new Promise((resolve) => setTimeout(resolve, 1000));
		setResults([
			// Example results
			{
				id: '1',
				title: `Result for "${currentSearch}" 1`,
				link: '#',
				type: 'thread',
				snippet: 'This is a sample thread snippet...'
			},
			{
				id: '2',
				title: `Another result for "${currentSearch}"`,
				link: '#',
				type: 'post',
				snippet: 'This is a sample post snippet...'
			}
		]);
		setIsLoading(false);
	};

	const breadcrumbItems = [
		{ label: 'Home', href: '/' },
		{ label: 'Forums', href: '/forums' },
		{ label: 'Search', href: `/forums/search?q=${searchQuery}` }
	];
	if (searchQuery) {
		breadcrumbItems.push({
			label: `Results for "${searchQuery}"`,
			href: `/forums/search?q=${searchQuery}`
		});
	}

	return (
		<div className="flex flex-col min-h-screen bg-black text-white">
			<main className="flex-grow">
				<Wide className="px-4 py-8">
					<Breadcrumb className="mb-6">
						<BreadcrumbList>
							{breadcrumbItems.map((item, index) => (
								<React.Fragment key={item.href || index}>
									<BreadcrumbItem>
										{index === breadcrumbItems.length - 1 && !searchQuery ? ( // Last item if no search query yet
											<BreadcrumbPage>{item.label}</BreadcrumbPage>
										) : index === breadcrumbItems.length - 1 && searchQuery ? ( // Last item if there is a search query
											<BreadcrumbPage>{item.label}</BreadcrumbPage>
										) : (
											<BreadcrumbLink asChild>
												<Link to={item.href}>{item.label}</Link>
											</BreadcrumbLink>
										)}
									</BreadcrumbItem>
									{index < breadcrumbItems.length - 1 && <BreadcrumbSeparator />}
								</React.Fragment>
							))}
						</BreadcrumbList>
					</Breadcrumb>
					<h1 className="text-3xl font-bold my-6">Forum Search</h1>

					<form onSubmit={handleSearchSubmit} className="flex gap-2 mb-8 max-w-2xl">
						<div className="relative flex-1">
							<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-zinc-500" />
							<Input
								type="search"
								placeholder="Search topics, posts, or users..."
								value={currentSearch}
								onChange={(e) => setCurrentSearch(e.target.value)}
								className="pl-9 bg-zinc-800 border-zinc-700 w-full"
							/>
						</div>
						<Button type="submit" disabled={isLoading}>
							{isLoading ? 'Searching...' : 'Search'}
						</Button>
					</form>

					{isLoading && <p>Loading search results...</p>}

					{!isLoading && searchQuery && results.length === 0 && (
						<p>No results found for "{searchQuery}".</p>
					)}

					{!isLoading && results.length > 0 && (
						<div>
							<h2 className="text-2xl font-semibold mb-4">Results for "{searchQuery}"</h2>
							<ul className="space-y-4">
								{results.map((result) => (
									<li key={result.id} className="p-4 border border-zinc-700 rounded-lg">
										<a href={result.link} className="text-lg text-emerald-400 hover:underline">
											{result.title}
										</a>
										{result.snippet && (
											<p className="text-sm text-zinc-400 mt-1">{result.snippet}</p>
										)}
										<p className="text-xs text-zinc-500 mt-1">Type: {result.type}</p>
									</li>
								))}
							</ul>
						</div>
					)}
				</Wide>
			</main>
			<SiteFooter />
		</div>
	);
};

export default ForumSearchPage;
