export function getRarityColor(rarity?: string): string {
  switch (rarity?.toLowerCase()) {
    case 'common':
      return 'bg-slate-600 text-slate-200';
    case 'uncommon':
      return 'bg-green-800 text-green-200';
    case 'rare':
      return 'bg-blue-800 text-blue-200';
    case 'epic':
      return 'bg-purple-800 text-purple-200';
    case 'legendary':
      return 'bg-amber-800 text-amber-200';
    case 'mythic':
      return 'bg-red-800 text-red-100';
    default:
      return 'bg-slate-600 text-slate-200';
  }
}

export function getRarityBorderClass(rarity?: string): string {
  switch (rarity?.toLowerCase()) {
    case 'common':
      return 'border-2 border-slate-700';
    case 'uncommon':
      return 'border-2 border-green-700';
    case 'rare':
      return 'border-2 border-blue-700';
    case 'epic':
      return 'border-2 border-purple-700';
    case 'legendary':
      return 'border-3 border-amber-600 shadow-lg shadow-amber-900/20';
    case 'mythic':
      return 'border-3 border-red-600 shadow-lg shadow-red-900/20';
    default:
      return '';
  }
} 