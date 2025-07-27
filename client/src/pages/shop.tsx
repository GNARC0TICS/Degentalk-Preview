import React, { useState } from 'react';
import { useShopItems } from '@/hooks/use-shop-items';
import type { ItemCategory } from '@/hooks/use-vault-items';
import type { ShopItem } from '@/hooks/use-shop-items';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
// Removed Wide import - using standard container instead

// Import components
import { ShopItemCard } from '@/components/shop/shop-item-card';
import { Skeleton } from '@/components/ui/skeleton';
import { LoadingSpinner } from '@/components/ui/loader';
import { ErrorDisplay } from '@/components/ui/error-display';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
	AlertCircle,
	Coins,
	RefreshCw,
	Search,
	ShoppingCart,
	Wallet,
	Filter,
	Home,
	ChevronLeft,
	Sparkles,
	TrendingUp,
	Clock
} from 'lucide-react';
import { Input } from '@/components/ui/input';

const categories: Array<{ id: ItemCategory | 'all'; label: string; icon?: React.ElementType }> = [
	{ id: 'all', label: 'All Items', icon: ShoppingCart },
	{ id: 'frames', label: 'Frames', icon: Sparkles },
	{ id: 'titles', label: 'Titles', icon: TrendingUp },
	{ id: 'badges', label: 'Badges', icon: Sparkles },
	{ id: 'colors', label: 'Colors', icon: Sparkles },
	{ id: 'effects', label: 'Effects', icon: Sparkles },
	{ id: 'boosts', label: 'Boosts', icon: TrendingUp },
	{ id: 'seasonal', label: 'Seasonal', icon: Clock },
	{ id: 'mystery', label: 'Mystery Boxes', icon: ShoppingCart }
];

export default function ShopPage() {
	// State
	const [selectedCategory, setSelectedCategory] = useState<ItemCategory | 'all'>('all');
	const [searchQuery, setSearchQuery] = useState('');

	// Hooks
	const { items, isLoading, isError, error, refetch } = useShopItems(
		selectedCategory !== 'all' ? (selectedCategory as ItemCategory) : undefined
	);

	// Placeholder function for wallet actions
	const handleWalletAction = () => {
		// Wallet action clicked (was console.log)
		// Feature coming soon: Wallet functionality is not yet available (was console.log)
	};

	// Filter items by search query - Fix the runtime error by ensuring items is an array
	const filteredItems = React.useMemo(() => {
		if (isLoading || isError || !items || !Array.isArray(items)) {
			return [];
		}

		if (!searchQuery.trim()) {
			return items;
		}

		return items.filter(
			(item) =>
				item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
				item.description.toLowerCase().includes(searchQuery.toLowerCase())
		);
	}, [items, searchQuery, isLoading, isError]);

	// Handle refresh
	const handleRefresh = () => {
		refetch(); // Use refetch from useQuery
	};

	// Handle item purchase
	const handlePurchase = async (item: ShopItem) => {
		// Sign in required: Please sign in to purchase shop items (was console.log)
	};

	// Get selected category data
	const selectedCategoryData = categories.find((cat) => cat.id === selectedCategory);

	return (
		<div className="min-h-screen bg-gradient-to-br from-black via-zinc-950 to-black">
			<div className="max-w-7xl mx-auto px-4 py-8">
				{/* Navigation */}
				<motion.div
					className="mb-6"
					initial={{ opacity: 0, y: -20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5 }}
				>
					<Link to="/">
						<Button
							variant="ghost"
							className="flex items-center text-zinc-400 hover:text-white transition-colors"
						>
							<ChevronLeft className="h-4 w-4 mr-1" />
							<Home className="h-4 w-4 mr-1" />
							Back to Home
						</Button>
					</Link>
				</motion.div>

				{/* Shop Header */}
				<motion.div
					className="mb-8"
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5, delay: 0.1 }}
				>
					<div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
						<div>
							<h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 text-transparent bg-clip-text mb-2">
								Degentalk Shop
							</h1>
							<p className="text-zinc-400 text-lg">
								Upgrade your profile with unique items and boosts
							</p>

							{/* Stats badges */}
							<div className="flex items-center gap-3 mt-3">
								<Badge variant="outline" className="bg-zinc-800/50 text-zinc-400 border-zinc-700">
									<ShoppingCart className="w-3 h-3 mr-1" />
									{Array.isArray(items) ? items.length : 0} Items
								</Badge>
								{selectedCategory !== 'all' && (
									<Badge
										variant="outline"
										className="bg-emerald-900/20 text-emerald-400 border-emerald-500/30"
									>
										{selectedCategoryData?.icon && (
											<selectedCategoryData.icon className="w-3 h-3 mr-1" />
										)}
										{selectedCategoryData?.label}
									</Badge>
								)}
							</div>
						</div>

						<div className="flex items-center gap-3">
							<Link to="/shop/dgt-purchase">
								<Button
									variant="outline"
									className="bg-zinc-800/50 border-zinc-700 hover:bg-zinc-700 hover:border-zinc-600 backdrop-blur-sm"
								>
									<Coins className="h-4 w-4 mr-2 text-emerald-500" />
									Buy DGT
								</Button>
							</Link>

							<Button
								onClick={() => handleWalletAction()}
								className="bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 shadow-lg shadow-emerald-500/20"
							>
								<Wallet className="h-4 w-4 mr-2" />
								Open Wallet
							</Button>
						</div>
					</div>

					{/* Search and Filters */}
					<div className="flex flex-col sm:flex-row gap-4 mb-6">
						<div className="relative flex-1">
							<Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
							<Input
								placeholder="Search items..."
								className="pl-9 bg-zinc-900/50 border-zinc-800 backdrop-blur-sm focus:border-emerald-500/50 transition-colors"
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
							/>
						</div>

						<Button
							variant="outline"
							className="bg-zinc-800/50 border-zinc-700 hover:bg-zinc-700 backdrop-blur-sm"
							onClick={handleRefresh}
							disabled={isLoading}
						>
							{isLoading ? (
								<LoadingSpinner size="sm" className="mr-2" />
							) : (
								<RefreshCw className="h-4 w-4 mr-2" />
							)}
							Refresh
						</Button>
					</div>

					{/* Categories */}
					<div className="relative overflow-hidden">
						<div className="no-scrollbar overflow-x-auto pb-2">
							<div className="flex gap-2 min-w-max">
							{categories.map((category) => {
								const IconComponent = category.icon || ShoppingCart;
								return (
									<motion.div
										key={category.id}
										whileHover={{ scale: 1.02 }}
										whileTap={{ scale: 0.98 }}
									>
										<Button
											variant={selectedCategory === category.id ? 'default' : 'outline'}
											size="sm"
											className={
												selectedCategory === category.id
													? 'bg-emerald-600 hover:bg-emerald-500 shadow-lg shadow-emerald-500/20'
													: 'bg-zinc-800/50 border-zinc-700 hover:bg-zinc-700 backdrop-blur-sm'
											}
											onClick={() => setSelectedCategory(category.id)}
											disabled={isLoading}
										>
											<IconComponent className="w-4 h-4 mr-2" />
											{category.label}
										</Button>
									</motion.div>
								);
							})}
							</div>
						</div>
					</div>
				</motion.div>

				{/* Error State */}
				<AnimatePresence>
					{isError && (
						<motion.div
							initial={{ opacity: 0, scale: 0.95 }}
							animate={{ opacity: 1, scale: 1 }}
							exit={{ opacity: 0, scale: 0.95 }}
							transition={{ duration: 0.3 }}
						>
							<ErrorDisplay
								title="Error Loading Shop Items"
								error={error}
								onRetry={handleRefresh}
								variant="card"
								className="my-12 bg-red-900/10 border-red-500/20"
							/>
						</motion.div>
					)}
				</AnimatePresence>

				{/* Loading State */}
				{isLoading && (
					<motion.div
						className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ duration: 0.5 }}
					>
						{Array.from({ length: 8 }).map((_, index) => (
							<motion.div
								key={index}
								className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-4 backdrop-blur-sm"
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ duration: 0.5, delay: index * 0.1 }}
							>
								<Skeleton className="w-full aspect-square mb-4" />
								<Skeleton className="h-6 w-3/4 mb-2" />
								<Skeleton className="h-4 w-full mb-4" />
								<div className="flex justify-between">
									<Skeleton className="h-6 w-20" />
									<Skeleton className="h-8 w-24" />
								</div>
							</motion.div>
						))}
					</motion.div>
				)}

				{/* Empty State */}
				{!isLoading && !isError && filteredItems.length === 0 && (
					<motion.div
						className="flex flex-col items-center justify-center py-16 px-4 text-center"
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.5 }}
					>
						<div className="w-20 h-20 rounded-full bg-gradient-to-br from-zinc-800 to-zinc-900 flex items-center justify-center mb-4 shadow-xl">
							<ShoppingCart className="h-10 w-10 text-zinc-500" />
						</div>
						<h3 className="text-2xl font-bold mb-2 text-white">No Items Found</h3>
						<p className="text-zinc-400 mb-6 max-w-md text-lg leading-relaxed">
							{searchQuery
								? `No items matching "${searchQuery}" were found. Try a different search term.`
								: 'No items found in this category. Check back soon for new additions.'}
						</p>
						{searchQuery && (
							<Button
								variant="outline"
								onClick={() => setSearchQuery('')}
								className="bg-zinc-800/50 border-zinc-700 hover:bg-zinc-700 backdrop-blur-sm"
							>
								Clear Search
							</Button>
						)}
					</motion.div>
				)}

				{/* Item Grid */}
				{!isLoading && !isError && filteredItems.length > 0 && (
					<motion.div
						className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ duration: 0.5 }}
					>
						<AnimatePresence>
							{filteredItems.map((item, index) => (
								<motion.div
									key={item.id}
									initial={{ opacity: 0, y: 20 }}
									animate={{ opacity: 1, y: 0 }}
									exit={{ opacity: 0, y: -20 }}
									transition={{ duration: 0.5, delay: index * 0.05 }}
									layout
								>
									<ShopItemCard item={item} onPurchaseClick={() => handlePurchase(item)} />
								</motion.div>
							))}
						</AnimatePresence>
					</motion.div>
				)}
			</div>
		</div>
	);
}
