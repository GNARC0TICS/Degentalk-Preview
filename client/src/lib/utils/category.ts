export function getCategoryIcon(name: string): string {
  const nameLower = name.toLowerCase();
  if (nameLower.includes('trading') || nameLower.includes('analysis')) return '📈';
  if (nameLower.includes('defi')) return '🏦';
  if (nameLower.includes('nft') || nameLower.includes('art')) return '🖼️';
  if (nameLower.includes('layer') || nameLower.includes('chain')) return '⛓️';
  if (nameLower.includes('development') || nameLower.includes('code')) return '💻';
  if (nameLower.includes('news') || nameLower.includes('announcement')) return '📣';
  return '💬';
}

export function getCategoryColor(name: string): string {
  const nameLower = name.toLowerCase();
  if (nameLower.includes('trading') || nameLower.includes('analysis')) 
    return 'bg-gradient-to-br from-blue-500 to-indigo-500';
  if (nameLower.includes('defi')) 
    return 'bg-gradient-to-br from-emerald-500 to-green-500';
  if (nameLower.includes('nft') || nameLower.includes('art')) 
    return 'bg-gradient-to-br from-pink-500 to-purple-500';
  if (nameLower.includes('layer') || nameLower.includes('chain')) 
    return 'bg-gradient-to-br from-orange-500 to-red-500';
  if (nameLower.includes('development') || nameLower.includes('code')) 
    return 'bg-gradient-to-br from-cyan-500 to-blue-500';
  if (nameLower.includes('news') || nameLower.includes('announcement')) 
    return 'bg-gradient-to-br from-yellow-500 to-amber-500';
  return 'bg-gradient-to-br from-slate-500 to-gray-500';
} 