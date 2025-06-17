import React from 'react';
import { Badge } from '@/components/ui/badge';
import type { ProfileData } from '@/types/profile';
import { getRarityColor } from './rarityUtils';

interface Props {
  profile: ProfileData;
}

const InventoryTab: React.FC<Props> = ({ profile }) => (
  <div className="space-y-6">
    <h3 className="text-lg font-semibold text-slate-200">Inventory</h3>
    {profile.inventory.length > 0 ? (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {profile.inventory.map((item) => (
          <div
            key={item.id}
            className={`rounded-lg overflow-hidden border ${item.isEquipped ? 'border-indigo-500' : 'border-zinc-700/50'} bg-zinc-900/70 backdrop-blur-sm transition-all hover:bg-zinc-900/90 hover:border-zinc-700/80`}
          >
            <div className="h-24 bg-zinc-800/70 relative overflow-hidden">
              {item.imageUrl ? (
                <img src={item.imageUrl} alt={item.productName} className="w-full h-full object-cover" />
              ) : (
                <div className="flex items-center justify-center h-full text-zinc-400">No Image</div>
              )}
              <div className={`absolute top-1 right-1 text-xs py-1 px-2 rounded-full ${getRarityColor(item.rarity)}`}>
                {item.rarity}
              </div>
            </div>
            <div className="p-2">
              <div className="text-sm font-medium text-zinc-200 truncate">{item.productName}</div>
              <div className="text-xs text-zinc-400">{item.productType}</div>
              {item.isEquipped && (
                <Badge variant="secondary" className="mt-1 text-xs bg-indigo-900/70 text-indigo-300">
                  Equipped
                </Badge>
              )}
            </div>
          </div>
        ))}
      </div>
    ) : (
      <div className="text-slate-500 italic">No items in inventory</div>
    )}
  </div>
);

export default InventoryTab; 