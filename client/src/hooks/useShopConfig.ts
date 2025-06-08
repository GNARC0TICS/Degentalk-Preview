import { useState, useEffect, useMemo } from 'react';
import { economyConfig, DgtPackage } from '@/config/economy.config.ts'; // Added .ts extension

// Define category to tags mapping
const CATEGORY_TAGS: Record<string, string[]> = {
  cosmetics: ['Frames', 'Titles', 'Badges', 'Skins'],
  boosts: ['XP Boost', 'Tip Boost', 'Rain Boost', 'Multiplier'],
  bundles: ['Value Pack', 'Complete Set', 'Limited Time'],
  seasonal: ['Limited', 'Special Event', 'Holiday'],
  // Add more categories as needed
};

/**
 * Hook to access and manage shop configuration and featured items.
 */
export function useShopConfig() {
  const shopConfig = economyConfig.shop;
  const dgtPackages = shopConfig.dgtPackages;

  // Separate packages by featured status
  const heroItem = useMemo(() => dgtPackages.find((pkg: DgtPackage) => pkg.isFeatured === 'hero'), [dgtPackages]); // Explicitly typed pkg
  const featuredItems = useMemo(() => dgtPackages.filter((pkg: DgtPackage) => pkg.isFeatured === true), [dgtPackages]); // Explicitly typed pkg
  const nonFeaturedItems = useMemo(() => dgtPackages.filter((pkg: DgtPackage) => !pkg.isFeatured), [dgtPackages]); // Explicitly typed pkg

  // State for rotating featured items
  const [featuredIndex, setFeaturedIndex] = useState(0);

  // Auto-rotation effect for featured items (excluding hero)
  useEffect(() => {
    if (featuredItems.length > 1) {
      const interval = setInterval(() => {
        setFeaturedIndex(prevIndex => (prevIndex + 1) % featuredItems.length);
      }, 25000); // Rotate every 25 seconds

      return () => clearInterval(interval);
    }
  }, [featuredItems]);

  // Get the current item to display on the shop card
  const currentShopItem = useMemo(() => {
    if (heroItem) {
      return heroItem;
    }
    if (featuredItems.length > 0) {
      return featuredItems[featuredIndex];
    }
    // Fallback to a random non-featured item if no featured items exist
    if (nonFeaturedItems.length > 0) {
        const randomIndex = Math.floor(Math.random() * nonFeaturedItems.length);
        return nonFeaturedItems[randomIndex];
    }
    return undefined; // No items available
  }, [heroItem, featuredItems, featuredIndex, nonFeaturedItems]);

  // Get tags for a given category
  const getCategoryTags = (category: string): string[] => {
    return CATEGORY_TAGS[category] || [];
  };

  return {
    shopConfig,
    dgtPackages,
    currentShopItem,
    getCategoryTags,
    // Add functions for manual navigation if needed later
    // nextFeaturedItem: () => setFeaturedIndex(prevIndex => (prevIndex + 1) % featuredItems.length),
    // prevFeaturedItem: () => setFeaturedIndex(prevIndex => (prevIndex - 1 + featuredItems.length) % featuredItems.length),
  };
}
