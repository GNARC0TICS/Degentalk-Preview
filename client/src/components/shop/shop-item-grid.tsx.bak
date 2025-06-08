import React from 'react';
import { ShopItem } from '@/hooks/use-shop-items';
import { ShopItemCard } from './shop-item-card';
import { Loader } from 'lucide-react';

interface ShopItemGridProps {
  items: ShopItem[];
  isLoading: boolean;
  onPurchaseClick: (item: ShopItem) => void;
}

export function ShopItemGrid({ 
  items, 
  isLoading, 
  onPurchaseClick 
}: ShopItemGridProps) {
  
  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="flex flex-col items-center">
          <Loader className="h-8 w-8 text-emerald-500 animate-spin mb-4" />
          <p className="text-zinc-400">Loading shop items...</p>
        </div>
      </div>
    );
  }
  
  // Empty state
  if (items.length === 0) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="text-center">
          <h3 className="text-xl font-bold mb-2">No items found</h3>
          <p className="text-zinc-400">
            No items available in this category.
          </p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {items.map((item) => (
        <ShopItemCard
          key={item.id}
          item={item}
          onPurchaseClick={() => onPurchaseClick(item)}
        />
      ))}
    </div>
  );
}