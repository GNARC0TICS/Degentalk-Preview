import React from 'react';
import { Button } from '@app/components/ui/button';
import { Badge } from '@app/components/ui/badge';
import { Filter, Flame, Clock, ThumbsUp, MessageSquare } from 'lucide-react';

// Define prefix types with their styles
const prefixStyles = {
	hot: {
		icon: <Flame className="h-4 w-4 mr-1" />,
		color: 'bg-gradient-to-r from-orange-600 to-red-600 border-none text-white'
	},
	pinned: {
		icon: <ThumbsUp className="h-4 w-4 mr-1" />,
		color: 'bg-gradient-to-r from-cyan-600 to-blue-600 border-none text-white'
	},
	'scam alert': {
		icon: <MessageSquare className="h-4 w-4 mr-1" />,
		color: 'bg-gradient-to-r from-red-600 to-pink-600 border-none text-white'
	},
	signal: {
		icon: <MessageSquare className="h-4 w-4 mr-1" />,
		color: 'bg-gradient-to-r from-amber-600 to-yellow-600 border-none text-white'
	},
	strategy: {
		icon: <MessageSquare className="h-4 w-4 mr-1" />,
		color: 'bg-gradient-to-r from-emerald-600 to-green-600 border-none text-white'
	},
	request: {
		icon: <MessageSquare className="h-4 w-4 mr-1" />,
		color: 'bg-gradient-to-r from-blue-600 to-indigo-600 border-none text-white'
	},
	guide: {
		icon: <MessageSquare className="h-4 w-4 mr-1" />,
		color: 'bg-gradient-to-r from-purple-600 to-violet-600 border-none text-white'
	},
	shill: {
		icon: <MessageSquare className="h-4 w-4 mr-1" />,
		color: 'bg-gradient-to-r from-fuchsia-600 to-pink-600 border-none text-white'
	},
	leak: {
		icon: <MessageSquare className="h-4 w-4 mr-1" />,
		color: 'bg-gradient-to-r from-teal-600 to-cyan-600 border-none text-white'
	}
};

const tagStyles = {
	nfts: 'bg-purple-900/20 text-purple-300 border-purple-800/30',
	eth: 'bg-blue-900/20 text-blue-300 border-blue-800/30',
	solana: 'bg-emerald-900/20 text-emerald-300 border-emerald-800/30',
	defi: 'bg-cyan-900/20 text-cyan-300 border-cyan-800/30',
	mindset: 'bg-amber-900/20 text-amber-300 border-amber-800/30',
	casino: 'bg-red-900/20 text-red-300 border-red-800/30'
};

interface ForumFiltersProps {
	onFilterChange?: (type: string, value: string) => void;
	onSortChange?: (sortOption: string) => void;
	selectedPrefix?: string | null;
	selectedTag?: string | null;
	selectedSort?: string;
	prefixes?: string[];
	tags?: string[];
	className?: string;
}

export function ForumFilters({
	onFilterChange = () => {},
	onSortChange = () => {},
	selectedPrefix = null,
	selectedTag = null,
	selectedSort = 'hot',
	prefixes = Object.keys(prefixStyles),
	tags = Object.keys(tagStyles),
	className = ''
}: ForumFiltersProps) {
	const handlePrefixClick = (prefix: string) => {
		onFilterChange('prefix', prefix === selectedPrefix ? '' : prefix);
	};

	const handleTagClick = (tag: string) => {
		onFilterChange('tag', tag === selectedTag ? '' : tag);
	};

	const handleSortClick = (sort: string) => {
		onSortChange(sort);
	};

	return (
		<div className={`space-y-4 ${className}`}>
			{/* Filter by heading */}
			<div className="flex items-center justify-between">
				<h3 className="text-sm font-medium text-zinc-300 flex items-center">
					<Filter className="h-4 w-4 mr-2 text-zinc-400" />
					Filter by:
				</h3>
			</div>

			{/* Prefixes filter */}
			<div>
				<h4 className="text-xs text-zinc-500 mb-2">PREFIXES</h4>
				<div className="flex flex-wrap gap-2">
					{prefixes.map((prefix) => {
						const prefixKey = prefix.toLowerCase() as keyof typeof prefixStyles;
						const style = prefixStyles[prefixKey] || prefixStyles.hot;

						return (
							<Badge
								key={prefix}
								className={`cursor-pointer ${style.color} ${selectedPrefix === prefix ? 'ring-2 ring-white/20' : ''}`}
								onClick={() => handlePrefixClick(prefix)}
							>
								{style.icon}
								{prefix}
							</Badge>
						);
					})}
				</div>
			</div>

			{/* Tags filter */}
			<div>
				<h4 className="text-xs text-zinc-500 mb-2">TAGS</h4>
				<div className="flex flex-wrap gap-2">
					{tags.map((tag) => {
						const tagKey = tag.toLowerCase() as keyof typeof tagStyles;
						const style = tagStyles[tagKey] || 'bg-zinc-900/20 text-zinc-300 border-zinc-800/30';

						return (
							<Badge
								key={tag}
								variant="outline"
								className={`cursor-pointer ${style} ${selectedTag === tag ? 'ring-2 ring-white/20' : ''}`}
								onClick={() => handleTagClick(tag)}
							>
								{tag}
							</Badge>
						);
					})}
				</div>
			</div>

			{/* Sort options */}
			<div>
				<h4 className="text-xs text-zinc-500 mb-2">SORT BY</h4>
				<div className="flex flex-wrap gap-2">
					<Button
						variant={selectedSort === 'hot' ? 'default' : 'outline'}
						size="sm"
						className={selectedSort !== 'hot' ? 'border-zinc-700 bg-zinc-800/40' : ''}
						onClick={() => handleSortClick('hot')}
					>
						<Flame className="h-4 w-4 mr-1" />
						Hot
					</Button>
					<Button
						variant={selectedSort === 'new' ? 'default' : 'outline'}
						size="sm"
						className={selectedSort !== 'new' ? 'border-zinc-700 bg-zinc-800/40' : ''}
						onClick={() => handleSortClick('new')}
					>
						<Clock className="h-4 w-4 mr-1" />
						New
					</Button>
					<Button
						variant={selectedSort === 'top' ? 'default' : 'outline'}
						size="sm"
						className={selectedSort !== 'top' ? 'border-zinc-700 bg-zinc-800/40' : ''}
						onClick={() => handleSortClick('top')}
					>
						<ThumbsUp className="h-4 w-4 mr-1" />
						Top
					</Button>
				</div>
			</div>
		</div>
	);
}
