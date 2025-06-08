import React from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Shop categories (can be expanded in the future)
const CATEGORIES = [
  { id: 'all', label: 'All Items' },
  { id: 'frames', label: 'Frames' },
  { id: 'titles', label: 'Titles' },
  { id: 'badges', label: 'Badges' },
  { id: 'colors', label: 'Colors' },
  { id: 'effects', label: 'Effects' },
  { id: 'boosts', label: 'Boosts' },
  { id: 'seasonal', label: 'Seasonal' },
  { id: 'mystery', label: 'Mystery' },
];

interface ShopCategoriesTabsProps {
  activeCategory: string;
  onCategoryChange: (category: string) => void;
}

export function ShopCategoriesTabs({ 
  activeCategory, 
  onCategoryChange 
}: ShopCategoriesTabsProps) {
  return (
    <div className="border-b border-zinc-800 relative">
      <div className="max-w-full overflow-x-auto pb-px scrollbar-hide">
        <Tabs 
          value={activeCategory} 
          onValueChange={onCategoryChange}
          className="w-full"
        >
          <TabsList className="bg-transparent border-b-0 h-auto p-0 flex gap-4">
            {CATEGORIES.map((category) => (
              <TabsTrigger
                key={category.id}
                value={category.id}
                className={`
                  px-4 py-2 rounded-t-lg font-medium text-sm data-[state=active]:text-white 
                  data-[state=active]:bg-zinc-900 data-[state=active]:border-emerald-500 
                  data-[state=active]:border-b-2 border-b-2 border-transparent
                  transition-all duration-200 ease-in-out
                `}
              >
                {category.label}
                
                {/* Special indicators for categories */}
                {category.id === 'seasonal' && (
                  <span className="ml-2 px-1.5 py-0.5 text-xs bg-blue-900/50 text-blue-400 rounded-full">
                    New
                  </span>
                )}
                
                {category.id === 'mystery' && (
                  <span className="ml-2 px-1.5 py-0.5 text-xs bg-violet-900/50 text-violet-400 rounded-full">
                    Special
                  </span>
                )}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>
      
      {/* Gradient fade for horizontal scrolling */}
      <div className="absolute right-0 top-0 h-full w-8 bg-gradient-to-l from-black to-transparent pointer-events-none" />
    </div>
  );
}