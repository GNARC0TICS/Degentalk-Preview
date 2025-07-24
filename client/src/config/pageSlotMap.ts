import type { SlotId } from '@app/stores/useLayoutStore';

/**
 * Defines the available layout slots for different pages in the application.
 * This allows the generic LayoutRenderer to be reused across different page types,
 * each with its own unique set of available layout areas.
 *
 * For now, we only define the 'home' page, but this can be extended for 'forum',
 * 'profile', etc., in the future.
 */
export const pageSlotMap: Record<'home' | 'forum' | 'profile', SlotId[]> = {
	home: ['sidebar/left', 'main/top', 'main/bottom', 'sidebar/right'],
	forum: [
		// Future implementation
	],
	profile: [
		// Future implementation
	]
};
