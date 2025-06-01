import React, { useState } from 'react';
import { useShopItems } from '@/hooks/use-shop-items';
import { ItemCategory } from '@/hooks/use-vault-items';
import { ShopItem } from '@/hooks/use-shop-items';
import { Link } from 'wouter';

// Import components
import { ShopItemCard } from '@/components/shop/shop-item-card';
import { Skeleton } from '@/components/ui/skeleton';
import { LoadingSpinner } from '@/components/ui/loader';
import { ErrorDisplay } from '@/components/ui/error-display';
import { Button } from '@/components/ui/button';
import { AlertCircle, Coins, RefreshCw, Search, ShoppingCart, Wallet, Filter, Home, ChevronLeft } from 'lucide-react';
import { Input } from '@/components/ui/input';

const categories: Array<{ id: ItemCategory | 'all'; label: string }> = [
  { id: 'all', label: 'All Items' },
  { id: 'frames', label: 'Frames' },
  { id: 'titles', label: 'Titles' },
  { id: 'badges', label: 'Badges' },
  { id: 'colors', label: 'Colors' },
  { id: 'effects', label: 'Effects' },
  { id: 'boosts', label: 'Boosts' },
  { id: 'seasonal', label: 'Seasonal' },
  { id: 'mystery', label: 'Mystery Boxes' },
];

export default function ShopPage() {
  // State
  const [selectedCategory, setSelectedCategory] = useState<ItemCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Hooks
  const { items, isLoading, isError, error, refetch } = useShopItems(selectedCategory !== 'all' ? selectedCategory as ItemCategory : undefined);
  
  // Placeholder function for wallet actions
  const handleWalletAction = () => {
    // Wallet action clicked (was console.log)
    // Feature coming soon: Wallet functionality is not yet available (was console.log)
  };
  
  // Filter items by search query
  const filteredItems = !isLoading && !isError && items 
    ? items.filter(item => 
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase())
      ) 
    : [];
  
  // Handle refresh
  const handleRefresh = () => {
    refetch(); // Use refetch from useQuery
  };
  
  // Handle item purchase
  const handlePurchase = (item: ShopItem) => {
    // Sign in required: Please sign in to purchase shop items (was console.log)
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Navigation */}
      <div className="mb-6">
        <Link href="/">
          <Button variant="ghost" className="flex items-center text-zinc-400 hover:text-white">
            <ChevronLeft className="h-4 w-4 mr-1" />
            <Home className="h-4 w-4 mr-1" />
            Back to Home
          </Button>
        </Link>
      </div>

      {/* Shop Header */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white mb-1">DegenTalk Shop</h1>
            <p className="text-zinc-400">Upgrade your profile with unique items and boosts</p>
          </div>
          
          <div className="flex items-center gap-3">
            <Link href="/shop/dgt-purchase">
              <Button 
                variant="outline" 
                className="bg-zinc-800 border-zinc-700 hover:bg-zinc-700 hover:border-zinc-600"
              >
                <Coins className="h-4 w-4 mr-2 text-emerald-500" />
                Buy DGT
              </Button>
            </Link>
            
            <Button 
              onClick={() => handleWalletAction()}
              className="bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400"
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
              className="pl-9 bg-zinc-900 border-zinc-800"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <Button
            variant="outline"
            className="bg-zinc-800 border-zinc-700"
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
        <div className="no-scrollbar overflow-x-auto pb-2">
          <div className="flex gap-2 min-w-max">
            {categories.map(category => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "outline"}
                size="sm"
                className={
                  selectedCategory === category.id
                    ? "bg-emerald-600 hover:bg-emerald-500"
                    : "bg-zinc-800 border-zinc-700 hover:bg-zinc-700"
                }
                onClick={() => setSelectedCategory(category.id)}
                disabled={isLoading} // Disable while loading
              >
                {category.label}
              </Button>
            ))}
          </div>
        </div>
      </div>
      
      {/* Error State */}
      {isError && (
        <ErrorDisplay 
          title="Error Loading Shop Items" 
          error={error}
          onRetry={handleRefresh}
          variant="card" // Use the card variant for a contained look
          className="my-12" // Add some margin
        />
      )}
      
      {/* Loading State - Use Skeleton for grid layout */}
      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
              <Skeleton className="w-full aspect-square mb-4" />
              <Skeleton className="h-6 w-3/4 mb-2" />
              <Skeleton className="h-4 w-full mb-4" />
              <div className="flex justify-between">
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-8 w-24" />
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Empty State */}
      {!isLoading && !isError && filteredItems.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
          <div className="w-16 h-16 rounded-full bg-zinc-800 flex items-center justify-center mb-4">
            <ShoppingCart className="h-8 w-8 text-zinc-500" />
          </div>
          <h3 className="text-xl font-bold mb-2">No Items Found</h3>
          <p className="text-zinc-400 mb-4 max-w-md">
            {searchQuery
              ? `No items matching "${searchQuery}" were found. Try a different search term.`
              : 'No items found in this category. Check back soon for new additions.'}
          </p>
          {searchQuery && (
            <Button variant="outline" onClick={() => setSearchQuery('')}>
              Clear Search
            </Button>
          )}
        </div>
      )}
      
      {/* Item Grid */}
      {!isLoading && !isError && filteredItems.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredItems.map(item => (
            <ShopItemCard 
              key={item.id} 
              item={item} 
              onPurchaseClick={() => handlePurchase(item)}
              // TODO: Add loading state to purchase button inside ShopItemCard
            />
          ))}
        </div>
      )}
    </div>
  );
}