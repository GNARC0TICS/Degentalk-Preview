---
title: DynamicLayout
status: STABLE
updated: 2025-06-28
---

# Dynamic & Configurable Layout System Plan (Production Grade)

**Date:** 2025-06-18
**Status:** **Finalized & Approved**

## 1. Executive Summary & Core Upgrades

This document outlines a production-grade plan to refactor the application's layout into a dynamic, user-configurable system. The initial plan has been upgraded to incorporate best practices for state management, persistence, performance, and developer experience.

| Area                         | Why it matters                                                       | Suggested Upgrade                                                                                            |
| ---------------------------- | -------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| **State Store**              | React Context can cause performance issues with frequent re-renders. | Swap to **Zustand** for its tiny footprint, selector-based rendering, and built-in persistence middleware.     |
| **Persistence**              | Local-only storage does not sync across devices.                     | Persist to the `userPreferences.layout` database table with an optimistic localStorage fallback.             |
| **Type-Safety / Validation** | An invalid or malformed config can break the entire UI.              | Wrap all incoming layout configurations in a **Zod** schema; add a `version` field for safe migrations.      |
| **Rendering Engine**         | The layout system will be needed on multiple pages (forum, profile). | Make the `LayoutRenderer` generic: `<LayoutRenderer page="home" />`. Slots will be sourced from a config map. |
| **Widget Isolation**         | A single broken widget should not crash the entire page.             | Wrap each widget in an **ErrorBoundary** and use **React.lazy/Suspense** for code-splitting.                  |
| **Performance**              | First Contentful Paint (FCP) is a critical user metric.              | Pre-render a default layout on the server-side, then hydrate with user preferences on the client.          |
| **Accessibility**            | All users, including keyboard-only users, must have a good experience. | Use `dnd-kit`’s built-in keyboard sensors and add ARIA live regions to announce layout changes.              |
| **Testing**                  | Drag-and-drop functionality is notoriously brittle.                  | Implement Cypress end-to-end tests: save a layout, reload the page, and assert the DOM order is correct.     |
| **Theming**                  | For pixel-perfect design control.                                    | Expose sidebar width and layout gap as CSS variables (e.g., `--sidebar-w`, `--layout-gap`).                  |

---

## 2. Data Model & State

### 2.1. Data Model (Version 1)

We will adopt a versioned state structure to facilitate future schema migrations.

```typescript
// A semantic type for slot identifiers.
type SlotId = `${'sidebar' | 'main'}/${'left' | 'right' | 'top' | 'bottom'}`;

// Represents a specific instance of a component in the layout.
interface LayoutComponentInstance {
  instanceId: string; // Unique ID for this instance (e.g., uuid)
  componentId: string; // ID from the componentRegistry
  expansionLevel?: 'collapsed' | 'preview' | 'expanded';
}

// The primary state object, versioned for future-proofing.
interface LayoutStateV1 {
  version: 1;
  sidebars: Record<'left' | 'right', {
      isVisible: boolean;
      width: 'thin' | 'normal';
  }>;
  // A map of slot IDs to an ordered array of component instance IDs.
  order: Record<SlotId, string[]>;
  // A map of instance IDs to their full configuration.
  instances: Record<string, LayoutComponentInstance>;
}
```
*Rationale:* Separating `order` and `instances` allows for placing the same type of widget in multiple slots without ID conflicts and simplifies state updates.

### 2.2. State Management (Zustand)

We will use Zustand for efficient, selector-based state management, avoiding the overhead of React Context providers.

```typescript
import { create } from 'zustand';
import { persist, subscribeWithSelector } from 'zustand/middleware';
import produce from 'immer'; // For safe, direct state mutations

export const useLayoutStore = create<LayoutStateV1>()(
  subscribeWithSelector(
    persist(
      (set, get) => ({
        // Initial state shape
        version: 1,
        sidebars: { /* ... */ },
        order: { /* ... */ },
        instances: { /* ... */ },

        // Example action
        swapSidebars: () => {
          set(produce(draft => {
            // Immer allows direct mutation syntax
            const currentLeft = draft.sidebars.left;
            draft.sidebars.left = draft.sidebars.right;
            draft.sidebars.right = currentLeft;
          }));
        },
        // ... other actions like moveWidget, toggleSidebar, etc.
      }),
      {
        name: 'dgt-layout-preferences', // Key for localStorage
        // Here we can add logic to sync with the backend API
      }
    )
  )
);
```

---

## 3. Component Architecture

### 3.1. Component Registry (with Code-Splitting)

The registry will map component IDs to dynamic imports, enabling lazy loading for each widget.

```typescript
// client/src/config/componentRegistry.ts
import React from 'react';

// The registry maps a string ID to a function that returns a dynamic import.
export const componentRegistry = {
  walletSummary: () => import('@/components/sidebar/wallet-summary-widget'),
  leaderboard: () => import('@/components/sidebar/leaderboard-widget'),
  hotThreads: () => import('@/features/forum/components/HotThreads'),
  activeMembers: () => import('@/components/users/ActiveMembersWidget'),
  // ... add all other dynamic widgets here
} satisfies Record<string, () => Promise<{ default: React.FC<any> }>>;

export type ComponentId = keyof typeof componentRegistry;
```

### 3.2. Abstracted Layout Renderer

The `LayoutRenderer` will be a generic component responsible for rendering slots and widgets based on the current page.

```tsx
// client/src/components/layout/LayoutRenderer.tsx
import React, { Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { useLayoutStore } from '@/contexts/LayoutStore'; // Assuming store is in contexts
import { componentRegistry } from '@/config/componentRegistry';
import { pageSlotMap } from '@/config/pageSlotMap';

// A generic component to render a single widget instance
const WidgetInstance = ({ instanceId }: { instanceId: string }) => {
  const instance = useLayoutStore(s => s.instances[instanceId]);
  if (!instance) return null;

  const Widget = React.lazy(componentRegistry[instance.componentId]);

  return (
    <Suspense fallback={<WidgetSkeleton />}>
      <ErrorBoundary FallbackComponent={WidgetCrashed}>
        <Widget {...instance.props} />
      </ErrorBoundary>
    </Suspense>
  );
};

// The main renderer
export const LayoutRenderer: React.FC<{ page: 'home' | 'forum' | 'profile' }> = ({ page }) => {
    const order = useLayoutStore(s => s.order);
    const slotsForPage = pageSlotMap[page]; // A config mapping page names to an array of SlotIds

    return (
      <div className="dynamic-layout-grid">
        {slotsForPage.map(slotId => (
          <aside data-slot={slotId} key={slotId}>
            {order[slotId]?.map(instanceId => (
              <WidgetInstance key={instanceId} instanceId={instanceId} />
            ))}
          </aside>
        ))}
      </div>
    );
};
```

---

## 4. User Interface: The Layout Editor

The `LayoutEditor` will be a modal providing a comprehensive interface for customization.

-   **Global Tab:** Controls for sidebar visibility, position swapping, and widths.
-   **Arrange Tab:** A keyboard-accessible drag-and-drop interface for reordering widgets between slots.
-   **Widget Settings:** A drawer or sub-panel for configuring per-instance properties (a future-proofing measure).
-   **Reset Button:** A clearly marked button to reset the layout to the site default, with a confirmation dialog.

Persistence will be handled via a `useMutation` hook that optimistically updates the local Zustand store and then sends the new configuration to the `/api/preferences/layout` endpoint.

---

## 5. Phased Implementation Roadmap

| Phase | Deliverable                                         | Priority |
| ----- | --------------------------------------------------- | -------- |
| 1     | Zustand store, type definitions, and SSR fallback.  | High     |
| 2     | Generic `LayoutRenderer` & slot map for `home` page.| High     |
| 3     | Migrate existing sidebar widgets into the registry. | High     |
| 4     | `LayoutEditor` v1 (visibility & drag-and-drop).     | Medium   |
| 5     | Backend persistence and schema migration.           | Medium   |
| 6     | Mobile-friendly editor (e.g., bottom sheet).        | Low      |
| 7     | Documentation and Cypress test harness.             | Low      |

---

## 6. Quick Wins & Best Practices

-   **CSS Grid:** Use CSS Grid for the main layout structure to make reordering sidebars a simple matter of changing `grid-template-areas`.
-   **Data Attributes:** Add `data-slot` and `data-widget-id` attributes to rendered elements to simplify testing and styling.
-   **Centralized Styling:** Use a shared `.widget-wrapper` class to ensure consistent padding, margins, and borders for all widgets.

---

## 7. Risk Analysis & Mitigation

| Risk                                           | Impact | Mitigation                                                              |
| ---------------------------------------------- | ------ | ----------------------------------------------------------------------- |
| Widget throws a runtime error                  | High   | Wrap every widget instance in its own `ErrorBoundary`.                  |
| Large widget bundles slow down initial load    | Medium | Use `React.lazy` and `Suspense` for per-widget code-splitting.          |
| Client/server layout mismatch on load          | Medium | SSR a default layout and hydrate with user preferences on the client.   |
| Drag-and-drop state conflicts                  | Low    | Use a versioned schema and ensure the server has final authority.       |

---

## 8. Definition of Done (Ship-it Check)

-   [ ] The Zustand store and all related types compile without errors.
-   [ ] The baseline server-rendered layout is identical before and after the refactor.
-   [ ] The Layout Editor can successfully hide/show sidebars and reorder at least two widgets.
-   [ ] User preferences persist on page reload (localStorage) and appear on another device (backend sync).
