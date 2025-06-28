---
title: target structure
status: STABLE
updated: 2025-06-28
---

# Canonical Structure Proposal

This document outlines the target architectural state for the `client/src` directory. The goal is to establish a clear, consistent, and scalable structure that promotes code clarity and developer efficiency.

## 1. Proposed Directory Structure

The proposed structure standardizes on a feature-based architecture, co-locating all domain-specific logic.

```
client/src/
├── assets/             // Static assets like images, fonts
├── components/
│   ├── layout/         // App shells, grids, structural components (e.g., SiteLayout)
│   └── ui/             // Dumb, reusable UI atoms (Button, Input, Card)
├── config/             // Client-side runtime configuration (themes, navigation)
├── constants/          // App-wide constants (routes, keys)
├── core/               // App initialization (React Query, Router, Auth)
├── features/           // **PRIMARY LOCATION FOR DOMAIN LOGIC**
│   ├── auth/
│   │   ├── api/
│   │   ├── components/
│   │   ├── hooks/
│   │   └── types.ts
│   ├── forum/
│   │   └── ... (similar structure)
│   └── profile/
│       └── ... (similar structure)
├── hooks/              // Truly generic, cross-feature hooks (e.g., useMediaQuery)
├── lib/                // Truly generic, cross-feature utils (e.g., date formatters)
├── pages/              // Route entry points, assembling features and layouts
├── providers/          // Global context providers
├── stores/             // Global state management
├── styles/             // Global CSS, themes, and variables
└── types/              // Truly global, cross-project types (if any)
```

**Rationale:**
-   **Clear Separation:** `features` holds business logic, `components/ui` holds presentation, and `components/layout` holds structure. This separation of concerns is critical for maintainability.
-   **Co-location:** All code related to a single feature (API calls, components, hooks, types) lives in one place, making it easier to find and modify.
-   **Reduced Globals:** By moving logic into `features`, we reduce the reliance on global `hooks`, `lib`, and `types` directories, lowering coupling.

## 2. Directory Rules & Responsibilities

-   **`features/`**:
    -   A feature is a distinct domain of the application (e.g., `profile`, `wallet`, `forum`).
    -   Each feature folder should be self-contained and theoretically portable.
    -   It contains all components, hooks, API services, and types specific to that domain.
    -   Features should only interact with each other via shared hooks, state stores, or well-defined API services, never by directly importing components from another feature.

-   **`components/ui/`**:
    -   Contains "dumb," presentation-only components.
    -   These components should have no knowledge of application state or business logic.
    -   They receive all data and callbacks via props.
    -   Examples: `Button`, `Input`, `Dialog`, `Card`. These are often sourced from a component library like ShadCN/UI.

-   **`components/layout/`**:
    -   Contains components that define the structure and layout of pages.
    -   They arrange `feature` components and `ui` components into a cohesive whole.
    -   Examples: `SiteHeader`, `Sidebar`, `PageGrid`.

-   **`hooks/` & `lib/`**:
    -   These are for **truly generic** code only.
    -   Before adding a file here, ask: "Is this used by at least three different features and has no specific domain knowledge?" If not, it belongs in a feature folder.

## 3. Naming & File Conventions

-   **Component Files**: `PascalCase.tsx`. (e.g., `UserProfile.tsx`).
-   **Hooks**: `useCamelCase.ts`. (e.g., `useUserData.ts`).
-   **Services/API**: `camelCaseApi.ts` or `camelCaseService.ts`. (e.g., `userApi.ts`).
-   **Barrel Files (`index.ts`)**:
    -   Use sparingly. They are acceptable within a feature's `components` directory to export a public API of components for that feature.
    -   Avoid using them in high-level directories like `features/` or `components/` as it can obscure dependencies and slow down IDEs.

## 4. Definition of Done for a Feature Folder

A feature folder is considered complete and well-structured when it contains the following:

-   [ ] **`components/`**: All React components specific to this feature.
-   [ ] **`hooks/`**: All React hooks specific to this feature.
-   [ ] **`api/` or `services/`**: All API request logic and data fetching/mutation logic.
-   [ ] **`types.ts`**: All TypeScript types and interfaces specific to this feature.
-   [ ] **`index.ts` (optional)**: A barrel file exporting the public interface of the feature.
-   [ ] **`tests/` (optional but recommended)**: Unit and integration tests for the feature.

By adhering to this structure, the codebase will become more predictable, easier to navigate, and simpler to scale.
