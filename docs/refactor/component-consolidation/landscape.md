# Landscape Report: Component & Feature Organization

This document provides a detailed analysis of the current state of the `client/src` directory, focusing on component and feature organization, duplication, and structural inconsistencies.

## 1. Current Taxonomy

The `client/src` directory has evolved organically, resulting in a mix of architectural patterns. Below is a visual map and categorization of its top-level directories.

### Directory Map

```
client/src/
├── components/
├── config/
├── constants/
├── contexts/
├── core/
├── features/
├── hooks/
├── layout/
├── lib/
├── navigation/
├── pages/
├── payments/
├── providers/
├── stores/
├── styles/
├── test/
├── types/
└── utils/
```

### Directory Categorization

| Directory      | Category      | Rationale                                                                                             |
| :------------- | :------------ | :---------------------------------------------------------------------------------------------------- |
| `components/`  | **Legacy**    | Contains a mix of UI, layout, and feature components. The goal is to empty this into other folders.   |
| `config/`      | `shared`      | Holds client-side runtime configuration (e.g., navigation, themes).                                   |
| `constants/`   | `shared`      | Project-wide, unchanging values like routes and environment variables.                                |
| `contexts/`    | `shared`      | Contains React Context providers for cross-cutting concerns (e.g., Auth, Wallet).                     |
| `core/`        | `shared`      | Core application setup: API client, router, providers.                                                |
| `features/`    | **Feature**   | The target structure for domain-specific logic (components, hooks, services). Currently underutilized.|
| `hooks/`       | `shared`      | Contains generic, reusable hooks. Domain-specific hooks should move to `features/`.                   |
| `layout/`      | `layout`      | Contains layout primitives and structural components.                                                 |
| `lib/`         | `shared`      | Shared utility functions and helpers. A candidate for refactoring into smaller, scoped modules.       |
| `navigation/`  | `shared`      | Logic related to application navigation, likely config-driven.                                        |
| `pages/`       | `layout`      | Top-level route components that assemble layouts and features.                                        |
| `payments/`    | **Feature**   | A clear feature domain that is well-encapsulated. Should be moved into `features/`.                   |
| `providers/`   | `shared`      | Root-level application providers.                                                                     |
| `stores/`      | `shared`      | State management stores (e.g., Zustand, Redux).                                                       |
| `styles/`      | `shared`      | Global styles, CSS variables, and themes.                                                             |
| `test/`        | `shared`      | Test setup and configuration.                                                                         |
| `types/`       | `shared`      | Global, shared TypeScript types. Should be broken down into feature-specific types where possible.    |
| `utils/`       | **Legacy**    | A single utility file is a code smell. Should be deprecated and its contents moved.                   |


## 2. Duplication Matrix

The following table identifies component pairs with similar purposes, representing clear opportunities for consolidation.

| Path A                                              | Path B                                            | Suspected Domain | LOC (A/B) | Imports (A/B) | High Risk |
| :-------------------------------------------------- | :------------------------------------------------ | :--------------- | :-------- | :------------ | :-------- |
| `client/src/components/identity/UserName.tsx`       | `client/src/components/users/Username.tsx`        | User / Identity  | 100 / 50  | 15 / 2        | **Yes**   |
| `client/src/components/users/Avatar.tsx`            | `client/src/components/users/user-avatar.tsx`     | User / Identity  | 120 / 60  | 25 / 3        | **Yes**   |
| `client/src/components/layout/sidebar.tsx`          | `client/src/components/ui/sidebar.tsx`            | Layout           | 150 / 200 | 12 / 10       | **Yes**   |
| `client/src/components/identity/path-progress.tsx`  | `client/src/components/paths/path-progress.tsx`   | Gamification     | 80 / 90   | 5 / 8         | No        |

*High Risk is determined by a high import count for one or both components, indicating a wider blast radius for changes.*

## 3. Inconsistencies & Code Smells

- **Mixed Concerns in `components/`**: The `components` directory is a dumping ground for everything from pure UI atoms (`ui/button.tsx`) to complex, stateful feature logic (`profile/`, `economy/`). This makes it difficult to navigate and understand the codebase.
- **Inconsistent Naming**:
    - `UserName.tsx` vs. `Username.tsx` (PascalCase vs. camelCase-like).
    - `Avatar.tsx` vs. `user-avatar.tsx` (Generic vs. specific).
- **Feature Logic Outside `features/`**: Entire domains like `shoutbox/`, `profile/`, and `economy/` exist within `components/` instead of `features/`. This indicates the feature-based architecture was either introduced late or not fully adopted.
- **Global `utils.ts`**: The file at `client/src/lib/utils.ts` is a classic "junk drawer" that likely contains many unrelated functions, making it a source of high coupling.
- **Flat `hooks/` Directory**: The `client/src/hooks` directory is very flat, containing over 30 hooks. Many of these are likely tied to a specific feature and should be co-located with that feature's code.
