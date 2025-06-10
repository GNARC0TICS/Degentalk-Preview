import React, { useState, useEffect } from 'react';
import { apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2 } from 'lucide-react';
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger
} from '@/components/ui/dialog';

interface GifPickerProps {
	onSelect?: (gifUrl: string) => void;
	onGifSelect?: (gifUrl: string) => void; // For backward compatibility
	onClose?: () => void;
	buttonContent?: React.ReactNode;
	isLevelRestricted?: boolean;
	isDialog?: boolean;
}

interface GifData {
	id: string;
	title: string;
	images: {
		fixed_height: {
			url: string;
			height: string;
			width: string;
		};
		original: {
			url: string;
		};
	};
}

export function GifPicker({
	onSelect,
	onGifSelect,
	onClose,
	buttonContent,
	isLevelRestricted = false,
	isDialog = true
}: GifPickerProps) {
	const [search, setSearch] = useState('');
	const [gifs, setGifs] = useState<GifData[]>([]);
	const [trendingGifs, setTrendingGifs] = useState<GifData[]>([]);
	const [loading, setLoading] = useState(false);
	const [open, setOpen] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [giphyEnabled, setGiphyEnabled] = useState(true);
	const [manualGifUrl, setManualGifUrl] = useState('');

	// Use onSelect if provided, otherwise fall back to onGifSelect for backward compatibility
	const handleGifSelected = onSelect || onGifSelect;

	// Fetch trending GIFs on initial load
	useEffect(() => {
		if (open && trendingGifs.length === 0) {
			fetchTrendingGifs();
		}
	}, [open]);

	// Check if Giphy is enabled in site settings
	useEffect(() => {
		const checkGiphyStatus = async () => {
			try {
				const response = await fetch('/api/editor/giphy-status');
				const data = await response.json();
				setGiphyEnabled(data.enabled);
			} catch (err) {
				console.error('Failed to check Giphy status:', err);
				setGiphyEnabled(false);
			}
		};

		checkGiphyStatus();
	}, []);

	// Get trending GIFs from Giphy
	const fetchTrendingGifs = async () => {
		if (!giphyEnabled) {
			setError('GIF search is currently disabled by the administrator.');
			return;
		}

		setLoading(true);
		setError(null);

		try {
			const response = await fetch('/api/editor/giphy-trending');
			const result = await response.json();
			setTrendingGifs(result.data || []);
		} catch (err) {
			console.error('Error fetching trending GIFs:', err);
			setError('Failed to load trending GIFs. Please try again later.');
		} finally {
			setLoading(false);
		}
	};

	// Search for GIFs based on query
	const searchGifs = async () => {
		if (!search.trim() || !giphyEnabled) {
			return;
		}

		setLoading(true);
		setError(null);

		try {
			const response = await fetch('/api/editor/giphy-search', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ query: search })
			});
			const result = await response.json();
			setGifs(result.data || []);
		} catch (err) {
			console.error('Error searching GIFs:', err);
			setError('Failed to search for GIFs. Please try again later.');
		} finally {
			setLoading(false);
		}
	};

	// Handle selecting a GIF
	const handleSelectGif = (gif: GifData) => {
		if (handleGifSelected) {
			handleGifSelected(gif.images.original.url);
		}

		// If this is a standalone dialog being used in the rich text editor integration
		if (!isDialog) {
			if (onClose) {
				onClose();
			}
		} else {
			setOpen(false);
		}
	};

	// Handle search input enter key
	const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === 'Enter') {
			searchGifs();
		}
	};

	if (isLevelRestricted) {
		return (
			<Button
				variant="ghost"
				size="sm"
				className="text-muted-foreground opacity-50 cursor-not-allowed"
				disabled
			>
				{buttonContent}
			</Button>
		);
	}

	if (!giphyEnabled) {
		return (
			<Button
				variant="ghost"
				size="sm"
				className="text-muted-foreground opacity-50 cursor-not-allowed"
				disabled
				title="GIF search is currently disabled"
			>
				{buttonContent}
			</Button>
		);
	}

	// If this is not a dialog (e.g., used directly in the rich text editor)
	if (!isDialog) {
		return (
			<div className="sm:max-w-[550px] max-h-[80vh] overflow-hidden flex flex-col bg-zinc-800 border border-zinc-700 text-white rounded-md">
				<div className="p-4 border-b border-zinc-700">
					<h2 className="text-xl font-semibold text-white">Search GIFs</h2>
				</div>

				<div className="flex items-center gap-2 m-4">
					<Input
						placeholder="Search for GIFs..."
						value={search}
						onChange={(e) => setSearch(e.target.value)}
						onKeyDown={handleKeyPress}
						className="bg-zinc-700 border-zinc-600 text-white"
					/>
					<Button onClick={searchGifs} variant="default" disabled={loading || !search.trim()}>
						{loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Search'}
					</Button>
				</div>

				<Tabs defaultValue="trending" className="w-full px-4">
					<TabsList className="w-full mb-2 bg-zinc-700">
						<TabsTrigger value="trending" className="data-[state=active]:bg-zinc-600">
							Trending
						</TabsTrigger>
						<TabsTrigger
							value="search"
							className="data-[state=active]:bg-zinc-600"
							disabled={gifs.length === 0}
						>
							Search Results
						</TabsTrigger>
					</TabsList>

					<div className="overflow-y-auto flex-1 h-[400px] border border-zinc-700 rounded p-2">
						{error && <div className="p-4 text-center text-red-400">{error}</div>}

						<TabsContent value="trending" className="m-0">
							{loading ? (
								<div className="flex justify-center items-center h-full">
									<Loader2 className="h-8 w-8 animate-spin text-white" />
								</div>
							) : (
								<div className="grid grid-cols-2 gap-2">
									{trendingGifs.map((gif) => (
										<div
											key={gif.id}
											onClick={() => handleSelectGif(gif)}
											className="cursor-pointer hover:opacity-80 transition-opacity rounded overflow-hidden bg-zinc-900 flex items-center justify-center h-[150px]"
										>
											<img
												src={gif.images.fixed_height.url}
												alt={gif.title}
												className="max-h-full"
											/>
										</div>
									))}
								</div>
							)}
						</TabsContent>

						<TabsContent value="search" className="m-0">
							{loading ? (
								<div className="flex justify-center items-center h-full">
									<Loader2 className="h-8 w-8 animate-spin text-white" />
								</div>
							) : (
								<div className="grid grid-cols-2 gap-2">
									{gifs.map((gif) => (
										<div
											key={gif.id}
											onClick={() => handleSelectGif(gif)}
											className="cursor-pointer hover:opacity-80 transition-opacity rounded overflow-hidden bg-zinc-900 flex items-center justify-center h-[150px]"
										>
											<img
												src={gif.images.fixed_height.url}
												alt={gif.title}
												className="max-h-full"
											/>
										</div>
									))}
								</div>
							)}
						</TabsContent>
					</div>
				</Tabs>

				<div className="mt-2 mb-4 text-xs text-zinc-400 text-center">Powered by GIPHY</div>
			</div>
		);
	}

	// Standard dialog mode
	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button variant="ghost" size="sm" className="hover:bg-zinc-700">
					{buttonContent}
				</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-[550px] max-h-[80vh] overflow-hidden flex flex-col bg-zinc-800 border border-zinc-700 text-white">
				<DialogHeader>
					<DialogTitle className="text-white">Search GIFs</DialogTitle>
				</DialogHeader>

				<div className="flex items-center gap-2 mb-4">
					<Input
						placeholder="Search for GIFs..."
						value={search}
						onChange={(e) => setSearch(e.target.value)}
						onKeyDown={handleKeyPress}
						className="bg-zinc-700 border-zinc-600 text-white"
					/>
					<Button onClick={searchGifs} variant="default" disabled={loading || !search.trim()}>
						{loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Search'}
					</Button>
				</div>

				<Tabs defaultValue="trending" className="w-full">
					<TabsList className="w-full mb-2 bg-zinc-700">
						<TabsTrigger value="trending" className="data-[state=active]:bg-zinc-600">
							Trending
						</TabsTrigger>
						<TabsTrigger
							value="search"
							className="data-[state=active]:bg-zinc-600"
							disabled={gifs.length === 0}
						>
							Search Results
						</TabsTrigger>
					</TabsList>

					<div className="overflow-y-auto flex-1 h-[400px] border border-zinc-700 rounded p-2">
						{error && <div className="p-4 text-center text-red-400">{error}</div>}

						<TabsContent value="trending" className="m-0">
							{loading ? (
								<div className="flex justify-center items-center h-full">
									<Loader2 className="h-8 w-8 animate-spin text-white" />
								</div>
							) : (
								<div className="grid grid-cols-2 gap-2">
									{trendingGifs.map((gif) => (
										<div
											key={gif.id}
											onClick={() => handleSelectGif(gif)}
											className="cursor-pointer hover:opacity-80 transition-opacity rounded overflow-hidden bg-zinc-900 flex items-center justify-center h-[150px]"
										>
											<img
												src={gif.images.fixed_height.url}
												alt={gif.title}
												className="max-h-full"
											/>
										</div>
									))}
								</div>
							)}
						</TabsContent>

						<TabsContent value="search" className="m-0">
							{loading ? (
								<div className="flex justify-center items-center h-full">
									<Loader2 className="h-8 w-8 animate-spin text-white" />
								</div>
							) : (
								<div className="grid grid-cols-2 gap-2">
									{gifs.map((gif) => (
										<div
											key={gif.id}
											onClick={() => handleSelectGif(gif)}
											className="cursor-pointer hover:opacity-80 transition-opacity rounded overflow-hidden bg-zinc-900 flex items-center justify-center h-[150px]"
										>
											<img
												src={gif.images.fixed_height.url}
												alt={gif.title}
												className="max-h-full"
											/>
										</div>
									))}
								</div>
							)}
						</TabsContent>
					</div>
				</Tabs>

				<div className="mt-2 text-xs text-zinc-400 text-center">Powered by GIPHY</div>
			</DialogContent>
		</Dialog>
	);
}
