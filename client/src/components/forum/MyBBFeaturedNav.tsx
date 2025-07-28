import React from 'react';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/utils/utils';

interface MyBBFeaturedNavProps {
  forums: any[];
  onForumClick: (slug: string) => void;
}

export function MyBBFeaturedNav({ forums, onForumClick }: MyBBFeaturedNavProps) {
  const featuredForums = forums.filter(f => f.isFeatured);
  
  if (featuredForums.length === 0) return null;
  
  return (
    <div className="mybb-forum-category mb-4">
      <div className="mybb-category-header mybb-category-yellow">
        <div className="mybb-category-title">Quick Jump to Featured Forums</div>
      </div>
      
      <div className="bg-zinc-950 border-x border-b border-zinc-800 p-3">
        <div className="flex flex-wrap gap-2">
          {featuredForums.map(forum => (
            <button
              key={forum.id}
              onClick={() => onForumClick(forum.slug)}
              className={cn(
                "inline-flex items-center gap-1 px-3 py-1 text-xs rounded",
                "bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white",
                "border border-zinc-700 hover:border-zinc-600",
                "transition-all duration-200"
              )}
            >
              {forum.theme?.icon && (
                <span className="text-sm">{forum.theme.icon}</span>
              )}
              <span>{forum.name}</span>
              <ChevronRight className="w-3 h-3 opacity-50" />
            </button>
          ))}
        </div>
        
        {/* Forum jump dropdown - classic style */}
        <div className="mt-3 pt-3 border-t border-zinc-800">
          <form className="flex items-center gap-2">
            <label className="text-xs text-zinc-400">Forum Jump:</label>
            <select 
              className="text-xs bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-zinc-300 focus:outline-none focus:border-emerald-600"
              onChange={(e) => e.target.value && onForumClick(e.target.value)}
              defaultValue=""
            >
              <option value="">-- Select Forum --</option>
              <optgroup label="Featured Forums">
                {featuredForums.map(forum => (
                  <option key={forum.id} value={forum.slug}>
                    {forum.name}
                  </option>
                ))}
              </optgroup>
              <optgroup label="General Forums">
                {forums.filter(f => !f.isFeatured).map(forum => (
                  <option key={forum.id} value={forum.slug}>
                    {forum.name}
                  </option>
                ))}
              </optgroup>
            </select>
            <button 
              type="button"
              className="text-xs px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded transition-colors"
              onClick={() => {
                const select = document.querySelector('select') as HTMLSelectElement;
                if (select?.value) onForumClick(select.value);
              }}
            >
              Go
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}