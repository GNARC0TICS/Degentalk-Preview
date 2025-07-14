# Admin Feature Module

This directory contains all client-side code related to the Degentalk Admin Panel. It is structured as a "feature slice" to promote modularity, maintainability, and clear separation of concerns.

## Structure

-   `layout/`: Contains the main admin layout components, including the `AdminLayout` and `ModularAdminLayout`.
-   `lib/`: Houses admin-specific utility functions, API clients (e.g., `adminApi`), and helper modules.
-   `components/`: Reusable UI components specific to the admin panel (e.g., `AdminToggle`, `ModularAdminSidebar`).
-   `views/`: Top-level components that represent distinct pages or sections within the admin panel (e.g., `UserManagementView`, `SettingsView`). New features, like Wallet Management, will have their views here.
-   `styles/`: Admin-specific CSS or styling configurations.
-   `__tests__/`: Unit and integration tests for admin-specific components, hooks, and utilities.

## How to Add New Admin Functionality

1.  **Define the Module**: If it's a new top-level section, define it in the `AdminModuleRegistry` (typically found in `shared/config/admin.config.ts` or similar). Assign it a unique `id`, `name`, `route`, and `icon`.
2.  **Create the View**: Create a new `.tsx` file under `views/` for your new admin page (e.g., `views/wallet/UserWalletManager.tsx`). This will be the main component rendered when the admin navigates to your feature.
3.  **Build Components/Hooks**: Create any supporting components or React hooks under `components/` or `hooks/` within your feature's sub-directory (e.g., `views/wallet/components/BalanceCard.tsx`, `views/wallet/hooks/useUserFinancialProfile.ts`).
4.  **Implement API Calls**: Use the `adminApi` client (from `lib/adminApi.ts`) to make calls to the backend admin API endpoints.
5.  **Register Routes**: Ensure your new view is registered in the main admin routing configuration (where `ModularAdminLayout` consumes the `AdminModuleRegistry`).
6.  **Add Tests**: Write unit and integration tests for your new components and logic under `__tests__/`.

## Path Aliases

Within this module, you can use the `@admin/*` path alias for internal imports:

```typescript
import { someAdminUtil } from '@admin/lib/someAdminUtil';
import { AdminPageShell } from '@admin/components/layout/AdminPageShell';
```

For general utilities, use `@utils/*`:

```typescript
import { apiRequest } from '@utils/api-request';
```

## Goals

-   **Modularity**: Each admin feature should be as self-contained as possible.
-   **Consistency**: Follow existing coding styles, component patterns, and naming conventions.
-   **Testability**: Write tests for all new logic.
-   **Performance**: Optimize components for fast loading and responsiveness.
