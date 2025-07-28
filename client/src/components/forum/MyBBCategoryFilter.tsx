import React from 'react';
import { cn } from '@/utils/utils';

interface MyBBCategoryFilterProps {
  selectedCategory: 'all' | 'featured' | 'general';
  onCategoryChange: (category: 'all' | 'featured' | 'general') => void;
}

export function MyBBCategoryFilter({ selectedCategory, onCategoryChange }: MyBBCategoryFilterProps) {
  return (
    <div className="mybb-category-filter mb-4">
      <table className="inline-block">
        <tbody>
          <tr>
            <td className="text-xs text-zinc-400 pr-3">View:</td>
            <td>
              <button
                onClick={() => onCategoryChange('all')}
                className={cn(
                  "text-xs px-3 py-1 mr-1 rounded transition-colors",
                  selectedCategory === 'all'
                    ? "bg-emerald-600 text-white font-semibold"
                    : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-300"
                )}
              >
                All Forums
              </button>
            </td>
            <td>
              <button
                onClick={() => onCategoryChange('featured')}
                className={cn(
                  "text-xs px-3 py-1 mr-1 rounded transition-colors",
                  selectedCategory === 'featured'
                    ? "bg-amber-600 text-white font-semibold"
                    : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-300"
                )}
              >
                Featured
              </button>
            </td>
            <td>
              <button
                onClick={() => onCategoryChange('general')}
                className={cn(
                  "text-xs px-3 py-1 rounded transition-colors",
                  selectedCategory === 'general'
                    ? "bg-blue-600 text-white font-semibold"
                    : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-300"
                )}
              >
                General
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}