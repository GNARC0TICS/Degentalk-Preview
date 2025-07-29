import { create } from 'zustand';
import { persist, subscribeWithSelector } from 'zustand/middleware';
import { produce } from 'immer';

// A semantic type for slot identifiers.
export type SlotId =
	`${'sidebar' | 'main' | 'mobile'}/${'left' | 'right' | 'top' | 'bottom' | 'widgets'}`;

// Represents a specific instance of a component in the layout.
export interface LayoutComponentInstance {
	instanceId: string; // Unique ID for this instance (e.g., uuid)
	componentId: string; // ID from the componentRegistry
	expansionLevel?: 'collapsed' | 'preview' | 'expanded';
}

// The primary state object, versioned for future-proofing.
export interface LayoutStateV1 {
	version: 1;
	sidebars: {
		left: {
			isVisible: boolean;
			width: 'thin' | 'normal';
		};
		right: {
			isVisible: boolean;
			width: 'thin' | 'normal';
		};
		position: 'left-right' | 'right-left';
	};
	// A map of slot IDs to an ordered array of component instance IDs.
	order: Record<SlotId, string[]>;
	// A map of instance IDs to their full configuration.
	instances: Record<string, LayoutComponentInstance>;
}

// Default layout configuration for SSR and new users.
const defaultLayout: Omit<LayoutStateV1, 'version'> = {
	sidebars: {
		left: { isVisible: true, width: 'normal' },
		right: { isVisible: true, width: 'normal' },
		position: 'left-right'
	},
	order: {
		'sidebar/left': ['profile-card'],
		'sidebar/right': [
			'shoutbox',
			'wallet-summary',
			'daily-tasks',
			'hot-threads',
			'forum-nav',
			'leaderboard',
			'active-members'
		],
		'sidebar/top': [],
		'sidebar/bottom': [],
		'sidebar/widgets': [],
		'main/left': [],
		'main/right': [],
		'main/top': [],
		'main/bottom': [],
		'main/widgets': [],
		'mobile/left': [],
		'mobile/right': [],
		'mobile/top': [],
		'mobile/bottom': [],
		'mobile/widgets': ['mobile-shoutbox', 'mobile-wallet', 'mobile-leaderboard']
	},
	instances: {
		'profile-card': { instanceId: 'profile-card', componentId: 'profileCard' },
		shoutbox: { instanceId: 'shoutbox', componentId: 'shoutbox' },
		'wallet-summary': { instanceId: 'wallet-summary', componentId: 'walletSummary' },
		'daily-tasks': { instanceId: 'daily-tasks', componentId: 'dailyTasks' },
		'hot-threads': { instanceId: 'hot-threads', componentId: 'hotThreads' },
		'forum-nav': { instanceId: 'forum-nav', componentId: 'forumNav' },
		leaderboard: { instanceId: 'leaderboard', componentId: 'leaderboard' },
		'active-members': { instanceId: 'active-members', componentId: 'activeMembers' },
		// Mobile-specific widget instances
		'mobile-shoutbox': { instanceId: 'mobile-shoutbox', componentId: 'shoutbox' },
		'mobile-wallet': { instanceId: 'mobile-wallet', componentId: 'walletSummary' },
		'mobile-leaderboard': { instanceId: 'mobile-leaderboard', componentId: 'leaderboard' }
	}
};

// Augmented Zustand store type including hydration metadata and actions.
export interface LayoutStoreState extends LayoutStateV1 {
	_hasHydrated: boolean;
	setHasHydrated: (state: boolean) => void;
	// existing actions
	toggleSidebar: (side: 'left' | 'right') => void;
	swapSidebars: () => void;
	moveWidget: (
		sourceSlot: SlotId,
		destSlot: SlotId,
		sourceIndex: number,
		destIndex: number
	) => void;
	removeWidget: (instanceId: string) => void;
	reorderWidget: (slot: SlotId, oldIndex: number, newIndex: number) => void;
	resetToDefaults: () => void;
}

export const useLayoutStore = create<LayoutStoreState>()(
	subscribeWithSelector(
		persist(
			(set, get) => ({
				version: 1,
				...defaultLayout,
				_hasHydrated: true,
				setHasHydrated: (state: boolean) => set({ _hasHydrated: state }),

				// ACTIONS
				toggleSidebar: (side: 'left' | 'right') => {
					set(
						produce((draft: LayoutStateV1) => {
							draft.sidebars[side].isVisible = !draft.sidebars[side].isVisible;
						})
					);
				},

				swapSidebars: () => {
					set(
						produce((draft: LayoutStateV1) => {
							const currentLeft = draft.sidebars.left;
							draft.sidebars.left = draft.sidebars.right;
							draft.sidebars.right = currentLeft;

							const leftOrder = draft.order['sidebar/left'];
							draft.order['sidebar/left'] = draft.order['sidebar/right'];
							draft.order['sidebar/right'] = leftOrder;
						})
					);
				},

				moveWidget: (
					sourceSlot: SlotId,
					destSlot: SlotId,
					sourceIndex: number,
					destIndex: number
				) => {
					set(
						produce((draft: LayoutStateV1) => {
							const sourceList = draft.order[sourceSlot];
							const [movedItem] = sourceList.splice(sourceIndex, 1);
							if (movedItem !== undefined) {
								if (sourceSlot === destSlot) {
									if (sourceIndex < destIndex) destIndex -= 1;
									sourceList.splice(destIndex, 0, movedItem);
								} else {
									const destList = draft.order[destSlot];
									destList.splice(destIndex, 0, movedItem);
								}
							}
						})
					);
				},

				// NEW: Remove a widget entirely from the layout
				removeWidget: (instanceId: string) => {
					set(
						produce((draft: LayoutStateV1) => {
							// Find the slot containing this instance
							const slotKey = Object.keys(draft.order).find((slot) =>
								draft.order[slot as SlotId].includes(instanceId)
							) as SlotId | undefined;
							if (slotKey) {
								draft.order[slotKey] = draft.order[slotKey].filter((id) => id !== instanceId);
							}
							delete draft.instances[instanceId];
						})
					);
				},

				// NEW: Reorder a widget within the same slot
				reorderWidget: (slot: SlotId, oldIndex: number, newIndex: number) => {
					set(
						produce((draft: LayoutStateV1) => {
							const list = draft.order[slot];
							const [moved] = list.splice(oldIndex, 1);
							if (moved !== undefined) {
								list.splice(newIndex, 0, moved);
							}
						})
					);
				},

				// Reset to default layout
				resetToDefaults: () => {
					set({
						...defaultLayout,
						version: 1,
						_hasHydrated: true
					});
				}
			}),
			{
				name: 'dgt-layout-preferences', // Key for localStorage
				onRehydrateStorage: () => {
					return (state, error) => {
						if (error) {
							console.error('Failed to rehydrate layout state:', error);
							// Reset to defaults on error
							useLayoutStore.setState({ ...defaultLayout, _hasHydrated: true });
						} else if (state) {
							// Validate and merge with defaults to ensure all required fields exist
							const validatedState = {
								...defaultLayout,
								...state,
								// Ensure order and instances are properly merged, not replaced
								order: {
									...defaultLayout.order,
									...(state.order || {})
								},
								instances: {
									...defaultLayout.instances,
									...(state.instances || {})
								}
							};
							
							// If no instances exist in persisted state, use defaults
							if (!state.instances || Object.keys(state.instances).length === 0) {
								validatedState.instances = defaultLayout.instances;
								validatedState.order = defaultLayout.order;
							}
							
							useLayoutStore.setState({ ...validatedState, _hasHydrated: true });
						} else {
							// No persisted state, use defaults
							useLayoutStore.setState({ _hasHydrated: true });
						}
					};
				}
			}
		)
	)
);

// All instanceId/componentId are string/UUID. No direct entity IDs found, but this file is future compatible.
