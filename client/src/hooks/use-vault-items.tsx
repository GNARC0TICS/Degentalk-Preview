import { useState, useEffect } from 'react';
import type { ShopItem } from './use-shop-items.tsx';

export type ItemCategory =
	| 'frames'
	| 'titles'
	| 'badges'
	| 'colors'
	| 'effects'
	| 'boosts'
	| 'seasonal'
	| 'mystery';

export function useVaultItemsForShop(category?: ItemCategory) {
	const [items, setItems] = useState<ShopItem[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<Error | null>(null);

	useEffect(() => {
		setIsLoading(false);
		setItems([]);
		setError(null);
	}, [category]);

	return {
		items,
		isLoading,
		error
	};
}
