import { create } from 'zustand';
import { persist, subscribeWithSelector } from 'zustand/middleware';
import { produce } from 'immer';

// A semantic type for slot identifiers.
export type SlotId = `${'sidebar' | 'main'}/${'left' | 'right' | 'top' | 'bottom'}`;

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
        left: { isVisible: true, width: 'thin' },
        right: { isVisible: true, width: 'normal' },
        position: 'left-right',
    },
    order: {
        'sidebar/left': ['profile-card'], // Example default
        'sidebar/right': ['shoutbox', 'wallet-summary', 'daily-tasks', 'hot-threads', 'forum-nav', 'leaderboard', 'active-members'], // Example default
        'sidebar/top': [],
        'sidebar/bottom': [],
        'main/left': [],
        'main/right': [],
        'main/top': [],
        'main/bottom': [],
    },
    instances: {
        'profile-card': { instanceId: 'profile-card', componentId: 'profileCard' },
        'shoutbox': { instanceId: 'shoutbox', componentId: 'shoutbox' },
        'wallet-summary': { instanceId: 'wallet-summary', componentId: 'walletSummary' },
        'daily-tasks': { instanceId: 'daily-tasks', componentId: 'dailyTasks' },
        'hot-threads': { instanceId: 'hot-threads', componentId: 'hotThreads' },
        'forum-nav': { instanceId: 'forum-nav', componentId: 'forumNav' },
        'leaderboard': { instanceId: 'leaderboard', componentId: 'leaderboard' },
        'active-members': { instanceId: 'active-members', componentId: 'activeMembers' },
    }
};


export const useLayoutStore = create<LayoutStateV1>()(
  subscribeWithSelector(
    persist(
      (set) => ({
        version: 1,
        ...defaultLayout,

        // ACTIONS
        toggleSidebar: (side: 'left' | 'right') => {
            set(produce((draft: LayoutStateV1) => {
                draft.sidebars[side].isVisible = !draft.sidebars[side].isVisible;
            }));
        },

        swapSidebars: () => {
          set(produce((draft: LayoutStateV1) => {
            const currentLeft = draft.sidebars.left;
            draft.sidebars.left = draft.sidebars.right;
            draft.sidebars.right = currentLeft;
            
            const leftOrder = draft.order['sidebar/left'];
            draft.order['sidebar/left'] = draft.order['sidebar/right'];
            draft.order['sidebar/right'] = leftOrder;
          }));
        },
        
        moveWidget: (sourceSlot: SlotId, destSlot: SlotId, sourceIndex: number, destIndex: number) => {
            set(produce((draft: LayoutStateV1) => {
                const sourceList = draft.order[sourceSlot];
                const [movedItem] = sourceList.splice(sourceIndex, 1);

                if (sourceSlot === destSlot) {
                    sourceList.splice(destIndex, 0, movedItem);
                } else {
                    const destList = draft.order[destSlot];
                    destList.splice(destIndex, 0, movedItem);
                }
            }));
        },

        // NEW: Remove a widget entirely from the layout
        removeWidget: (instanceId: string) => {
            set(produce((draft: LayoutStateV1) => {
                // Find the slot containing this instance
                const slotKey = Object.keys(draft.order).find((slot) => draft.order[slot as SlotId].includes(instanceId)) as SlotId | undefined;
                if (slotKey) {
                    draft.order[slotKey] = draft.order[slotKey].filter((id) => id !== instanceId);
                }
                delete draft.instances[instanceId];
            }));
        },

        // NEW: Reorder a widget within the same slot
        reorderWidget: (slot: SlotId, oldIndex: number, newIndex: number) => {
            set(produce((draft: LayoutStateV1) => {
                const list = draft.order[slot];
                const [moved] = list.splice(oldIndex, 1);
                list.splice(newIndex, 0, moved);
            }));
        }
      }),
      {
        name: 'dgt-layout-preferences', // Key for localStorage
        // Future: Add logic to sync with a backend API via a storage adapter.
      }
    )
  )
);
