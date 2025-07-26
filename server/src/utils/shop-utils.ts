/**
 * Shop Utilities
 * 
 * Temporary stub file to fix missing import.
 * TODO: Implement actual shop item data
 */

export interface ShopItem {
  id: string;
  name: string;
  category: string;
  priceDGT?: number;
  priceUSD?: number;
  description?: string;
  createdAt?: Date;
  // Add other properties as needed
}

// Temporary empty array until shop items are properly implemented
export const shopItems: ShopItem[] = [];

// You can add mock data here for development:
/*
export const shopItems: ShopItem[] = [
  {
    id: '1',
    name: 'Example Frame',
    category: 'frames',
    priceDGT: 1000,
    description: 'A sample avatar frame'
  }
];
*/