import { useState, useCallback, useEffect } from 'react';
import { useLocation, useSearch } from 'wouter';
import type { ThreadFiltersState, ThreadSortOption } from '@/components/forum/ThreadFilters';
import type { TagId } from '@db/types';

interface UseForumFiltersOptions {
	defaultSort?: ThreadSortOption;
	syncWithUrl?: boolean;
	storageKey?: string;
}

/**
 * useForumFilters Hook
 *
 * Manages forum filter state with optional URL synchronization and localStorage persistence.
 * Provides a single source of truth for filter state management.
 */
export function useForumFilters({
	defaultSort = 'latest',
	syncWithUrl = true,
	storageKey
}: UseForumFiltersOptions = {}) {
	const [, setLocation] = useLocation();
	const searchParams = useSearch();
	const urlParams = new URLSearchParams(searchParams);

	// Initialize filters from URL or defaults
	const getInitialFilters = (): ThreadFiltersState => {
		if (syncWithUrl && searchParams) {
			const tags = urlParams.getAll('tags[]').map(Number).filter(Boolean);
			const prefixId = urlParams.get('prefixId') ? Number(urlParams.get('prefixId')) : undefined;
			const solved = urlParams.get('solved') as 'solved' | 'unsolved' | undefined;

			const filters: ThreadFiltersState = {
				sortBy: (urlParams.get('sort') as ThreadSortOption) || defaultSort,
				tags
			};

			if (prefixId !== undefined) filters.prefixId = prefixId;
			if (solved) filters.solved = solved;
			if (urlParams.get('bookmarked') === 'true') filters.bookmarked = true;
			if (urlParams.get('mine') === 'true') filters.mine = true;
			if (urlParams.get('replied') === 'true') filters.replied = true;
			if (urlParams.get('q')) filters.q = urlParams.get('q')!;

			return filters;
		}

		// Try to load from localStorage if storage key provided
		if (storageKey) {
			try {
				const saved = localStorage.getItem(storageKey);
				if (saved) {
					const parsed = JSON.parse(saved);
					const filters: ThreadFiltersState = {
						sortBy: parsed.sortBy || defaultSort,
						tags: parsed.tags || []
					};

					if (parsed.prefixId !== undefined) filters.prefixId = parsed.prefixId;
					if (parsed.solved) filters.solved = parsed.solved;
					if (parsed.bookmarked) filters.bookmarked = true;
					if (parsed.mine) filters.mine = true;
					if (parsed.replied) filters.replied = true;
					if (parsed.q) filters.q = parsed.q;

					return filters;
				}
			} catch (error) {
				console.error('Failed to parse saved filters:', error);
			}
		}

		return {
			sortBy: defaultSort,
			tags: []
		};
	};

	const [filters, setFiltersState] = useState<ThreadFiltersState>(getInitialFilters);

	// Sync filters to URL when they change
	useEffect(() => {
		if (!syncWithUrl) return;

		const currentPath = window.location.pathname;
		const newParams = new URLSearchParams();

		// Only add non-default values to URL
		if (filters.sortBy !== defaultSort) {
			newParams.set('sort', filters.sortBy);
		}

		filters.tags.forEach((tag) => {
			newParams.append('tags[]', tag.toString());
		});

		if (filters.prefixId !== undefined) {
			newParams.set('prefixId', filters.prefixId.toString());
		}

		if (filters.solved) {
			newParams.set('solved', filters.solved);
		}

		if (filters.bookmarked) {
			newParams.set('bookmarked', 'true');
		}

		if (filters.mine) {
			newParams.set('mine', 'true');
		}

		if (filters.replied) {
			newParams.set('replied', 'true');
		}

		if (filters.q && filters.q.trim()) {
			newParams.set('q', filters.q);
		}

		const newSearch = newParams.toString();
		const newUrl = newSearch ? `${currentPath}?${newSearch}` : currentPath;

		// Only update if URL actually changed
		if (window.location.pathname + window.location.search !== newUrl) {
			window.history.replaceState({}, '', newUrl);
		}
	}, [filters, syncWithUrl, defaultSort]);

	// Save to localStorage when filters change
	useEffect(() => {
		if (storageKey) {
			localStorage.setItem(storageKey, JSON.stringify(filters));
		}
	}, [filters, storageKey]);

	const setFilters = useCallback((newFilters: ThreadFiltersState) => {
		setFiltersState(newFilters);
	}, []);

	const updateFilter = useCallback(
		<K extends keyof ThreadFiltersState>(key: K, value: ThreadFiltersState[K]) => {
			setFiltersState((prev) => ({ ...prev, [key]: value }));
		},
		[]
	);

	const resetFilters = useCallback(() => {
		const defaultFilters: ThreadFiltersState = {
			sortBy: defaultSort,
			tags: []
		};
		setFiltersState(defaultFilters);

		// Clear localStorage if using it
		if (storageKey) {
			localStorage.removeItem(storageKey);
		}
	}, [defaultSort, storageKey]);

	const toggleTag = useCallback((tagId: TagId) => {
		setFiltersState((prev) => ({
			...prev,
			tags: prev.tags.includes(tagId)
				? prev.tags.filter((id) => id !== tagId)
				: [...prev.tags, tagId]
		}));
	}, []);

	const hasActiveFilters =
		filters.tags.length > 0 ||
		'prefixId' in filters ||
		filters.sortBy !== defaultSort ||
		'solved' in filters ||
		!!filters.bookmarked ||
		!!filters.mine ||
		!!filters.replied ||
		(!!filters.q && filters.q.trim() !== '');

	return {
		filters,
		setFilters,
		updateFilter,
		resetFilters,
		toggleTag,
		hasActiveFilters
	};
}
