# Wallet-Workspace

This workspace is dedicated to the development and testing of the wallet system for Degentalk™™. It provides a focused environment with only the necessary code and configurations for the wallet functionality. Its structure and file naming conventions are intended to mirror the main Degentalk™™ project to ensure seamless reintegration.

## Goal

The primary goal of this workspace is to set up a functional testbed for wallet-related features, starting with:
1.  **Automatic Wallet Creation:** Ensure a wallet is automatically created for a user immediately upon successful account registration.
2.  **Wallet Display & Interaction:** Implement and test UI components for displaying wallet balances, transaction history, and user inventory.
3.  **Admin Treasury:** Set up UI and backend logic for treasury management.
4.  **Supporting Infrastructure:** Replicate relevant backend services, routes, utilities, hooks, and context providers from the main Degentalk™™ application.

## Prerequisites

*   Node.js (version specified in main project, e.g., v20 or later)
*   A package manager (e.g., `pnpm`, `npm`, or `yarn` - ensure consistency with the main project if possible)
*   Access to a PostgreSQL database instance (local, Docker, or cloud-based like Neon)

## Initial Setup

1.  **Clone/Copy Workspace:** Ensure this `Wallet-Workspace` directory is correctly set up with files mirrored from the main Degentalk™™ project as per `wallet-scope.md`.
2.  **Install Dependencies:**
    *   Navigate to the `Wallet-Workspace` directory in your terminal.
    *   Run `pnpm install` (or `npm install` / `yarn install`) to download all required packages as defined in `package.json`.

## Database Setup

1.  **Create a Test Database:**
    *   Set up a new, separate PostgreSQL database instance. This will be your dedicated test database for the wallet workspace.
    *   Obtain the connection string (URL) for this new database.

2.  **Configure Environment Variables (`Wallet-Workspace/.env.local`):**
    *   Create this file if it doesn't exist.
    *   Add your test database connection string:
        ```env
        TEST_DATABASE_URL="your_new_postgresql_connection_string"
        ```
    *   Add session secret (critical for authentication):
        ```env
        SESSION_SECRET="your-strong-session-secret-here" 
        ```
    *   Add server port:
        ```env
        PORT=5002 
        ```
    *   Add Vite client API URL (must match server port):
        ```env
        VITE_API_URL="http://localhost:5002"
        ```
    *   (Optional) For easier development login:
        ```env
        DEV_BYPASS_PASSWORD="true" 
        ```
    *   Add any CCPayment or other necessary environment variables as listed in `wallet-scope.md` or required by copied services.

3.  **Drizzle Configuration:**
    *   The `Wallet-Workspace/drizzle.config.ts` file is pre-configured to:
        *   Use the `TEST_DATABASE_URL`.
        *   Point to schema at `./db/schema/index.ts`.
        *   Output migrations to `./db/migrations/`.

4.  **Run Database Migrations:**
    *   From the `Wallet-Workspace` directory:
    *   **Important Note on Drizzle Migrations:** If you encounter errors with `drizzle-kit generate` or `push` related to complex inline constraints (common with extensive schemas), follow this two-step approach:

        **Step 4.1: Minimal Schema Generation & Push (Foundation)**
        *   Temporarily comment out any complex inline constraint definitions in your schema files (`Wallet-Workspace/db/schema/**/*.ts`). This typically involves the second argument to `pgTable` calls, like `pgTable(..., (table) => ({ ... }))`.
        *   Also, temporarily comment out any `drizzle-zod` schema generation lines (e.g., `createInsertSchema`, `InferInsertModel`).
        *   Run the generation and push commands (ensure `TEST_DATABASE_URL` is correctly set in your environment or prefixed to the command):
            ```bash
            # Ensure TEST_DATABASE_URL is available in your shell environment for these commands
            # Example: TEST_DATABASE_URL="your_wallet_db_url" npx drizzle-kit generate
            npx drizzle-kit generate
            npx drizzle-kit push
            ```
            This creates the basic table structures.

        **Step 4.2: Add Indexes, Constraints & Re-migrate**
        *   Uncomment the previously commented lines OR (preferably for complex constraints/indexes) reintroduce them using Drizzle's standalone syntax directly below your table definitions or in a separate `indexes.ts` file. Example:
            ```typescript
            // In your schema file, e.g., users.ts
            // export const users = pgTable(...);

            // Standalone index/constraint definitions:
            // export const usernameUnique = uniqueIndex('users_username_unique').on(users.username);
            // export const fkUserToGroup = foreignKey({ columns: [users.groupId], foreignColumns: [userGroups.id]});
            ```
        *   Regenerate and push the migrations again:
            ```bash
            npx drizzle-kit generate
            npx drizzle-kit push
            ```
        *   Once the schema and constraints are stable, you can uncomment your `drizzle-zod` lines.

    *   *(Note: The command `npx drizzle-kit generate:pg` is deprecated. Use `npx drizzle-kit generate` instead. Similarly, `npx drizzle-kit push:pg` is now `npx drizzle-kit push`.)*

5.  **Seed Data (Optional but Recommended):**
    *   Create seed scripts in `Wallet-Workspace/scripts/db/` (e.g., `seed.ts`).
    *   Use the Drizzle instance from `Wallet-Workspace/server/src/core/db.ts`.
    *   Add a script to `package.json`: `"db:seed": "tsx ./scripts/db/seed.ts"`.
    *   Run: `pnpm db:seed`.

## Authentication System (Replication)

The workspace replicates the main Degentalk™™ authentication system:

*   **Mechanism:** Username/Password login via Passport.js (LocalStrategy).
*   **Session Management:** Uses `express-session` with sessions stored in the PostgreSQL database via `connect-pg-simple` (configured in `Wallet-Workspace/server/storage.ts`).
*   **Core Auth Files (to be copied from main project):**
    *   `server/src/domains/auth/auth.routes.ts`: Contains `setupAuthPassport()` which configures Passport strategies and session settings.
    *   `server/src/domains/auth/services/auth.service.ts`: Password hashing, cookie settings.
    *   `server/src/domains/auth/controllers/auth.controller.ts`: Handles HTTP requests for registration/login.
    *   `server/src/domains/auth/middleware/auth.middleware.ts`: Provides `isAuthenticated` checks.
    *   `server/storage.ts`: Provides the `PGStore` for sessions and user database operations.
*   **Server Setup:** The `Wallet-Workspace/server/index.ts` will be configured to initialize `express-session` and Passport, using `setupAuthPassport()`.

## Wallet Creation on Signup (Implementation Plan)

The primary feature to test is automatic wallet creation upon user registration.
*   **Trigger Point:** This will be implemented within the `register` function in `Wallet-Workspace/server/src/domains/auth/controllers/auth.controller.ts`.
*   **Action:** After a new user is successfully created by `storage.createUser(...)`, a call will be made to a wallet service function (e.g., `walletService.createInitialWallet(newUser.id)`) from the copied `Wallet-Workspace/server/src/domains/wallet/services/wallet.service.ts`.

## Running the Workspace

*   **Run Both Server and Client (Development):**
    ```bash
    pnpm dev 
    ```
*   **Run Backend Server Only (Development):**
    ```bash
    pnpm dev:server
    ```
    (Usually on port 5002, check logs or `Wallet-Workspace/server/index.ts`)
*   **Run Frontend Client Only (Development):**
    ```bash
    pnpm dev:client
    ```
    (Usually on port 5174, check Vite logs)

## Developing and Testing UI Components

This workspace allows isolated development and testing of wallet UI components.

1.  **Locate Components:** Wallet UI components will be in `Wallet-Workspace/client/src/features/wallet/components/`, etc.
2.  **Displaying Components:**
    *   **Modify `App.tsx`:** Import and render components in `Wallet-Workspace/client/src/App.tsx`.
        ```tsx
        // In Wallet-Workspace/client/src/App.tsx
        // import MyWalletComponent from './features/wallet/components/MyWalletComponent'; // Adjust path

        function App() {
          return (
            <div>
              <h1>Wallet Component Test Bench</h1>
              {/* <MyWalletComponent /> */}
            </div>
          );
        }
        export default App;
        ```
    *   **Mock Session/User Context:** Client-side components often rely on user context (e.g., `useUser`). A `MockSessionProvider` will be created in `Wallet-Workspace/client/src/contexts/` to provide mock user data, allowing components to render correctly.
    *   **Client Entry (`main.tsx`):** `Wallet-Workspace/client/src/main.tsx` will be updated to wrap the `App` component with necessary providers like `QueryClientProvider`, `WalletProvider` (copied), and the `MockSessionProvider`.
    *   **Dedicated Test Pages/Routes:** For complex scenarios, set up simple routing in `App.tsx` or create a `WalletTestBench.tsx` component.
3.  **View in Browser:** Access the Vite dev server URL (e.g., `http://localhost:5174`).
4.  **Iterate:** HMR should update the view automatically on changes.

## Workflow Notes

*   **Focused Development:** Concentrate on wallet features without the full Degentalk™™ application's overhead.
*   **API Interaction:** Frontend components will interact with the workspace's backend services. Ensure `pnpm dev:server` is running.
*   **Data Source:** All data uses the dedicated test database.
*   **Referencing Main Project:** Keep the main Degentalk™™ project open for reference.
*   **Structural Integrity:** All copied files **must** maintain their original names and directory structures from the main Degentalk™™ project. No renaming or restructuring.

## Building for Production (Informational)

*   **Build Server:** `pnpm build:server`
*   **Build Client:** `pnpm build:client`
