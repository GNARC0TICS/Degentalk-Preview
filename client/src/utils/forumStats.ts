export function getMomentumLabel(
	todaysPosts: number,
	totalPosts: number,
	daysOld: number
): 'rising' | 'stable' | 'cooling' {
	if (totalPosts === 0) return 'stable';
	const avg = totalPosts / Math.max(daysOld, 1);
	const ratio = avg === 0 ? 1 : todaysPosts / avg;
	if (ratio > 1.5) return 'rising';
	if (ratio < 0.5) return 'cooling';
	return 'stable';
}
