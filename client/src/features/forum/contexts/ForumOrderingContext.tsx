import React, { createContext, useContext, useMemo } from 'react';
import type { ReactNode } from 'react';
import { useZones } from './ForumStructureContext';
import type { MergedZone } from './ForumStructureContext';
import { featureFlags } from '@app/config/featureFlags';

interface ForumOrderingContextValue {
	orderedZones: MergedZone[];
}

const ForumOrderingContext = createContext<ForumOrderingContextValue | null>(null);

export const ForumOrderingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
	const { zones } = useZones();

	const orderedZones = useMemo(() => {
		if (!featureFlags.forum.smartOrdering) return zones;

		// Simple heuristic: zones with any popular forum first, then by lastActivityAt desc.
		return [...zones].sort((a, b) => {
			const aPopular = a.forums?.some((f) => f.isPopular);
			const bPopular = b.forums?.some((f) => f.isPopular);
			if (aPopular !== bPopular) return aPopular ? -1 : 1;

			const aDate = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
			const bDate = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
			return bDate - aDate;
		});
	}, [zones]);

	return (
		<ForumOrderingContext.Provider value={{ orderedZones }}>
			{children}
		</ForumOrderingContext.Provider>
	);
};

export function useOrderedZones() {
	const ctx = useContext(ForumOrderingContext);
	if (!ctx) {
		throw new Error('useOrderedZones must be used within a ForumOrderingProvider');
	}
	return ctx.orderedZones;
}
