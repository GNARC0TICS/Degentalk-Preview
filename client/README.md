# Degentalk Client

## Status: Reviewed – Awaiting Final Approval | 2025-06-02

## 1. Purpose & Role

The `client/` directory contains the entire frontend application for the Degentalk platform. This includes all user interfaces, client-side logic, state management, and interactions with the backend API. It is built using React, TypeScript, and Vite, with styling managed by Tailwind CSS. Its primary role is to provide a rich, responsive, and intuitive user experience.

## 2. Structure & Key Components

The client codebase is organized to enhance modularity, maintainability, and scalability, with a strong emphasis on a feature-based structure.

*   **`client/src/main.tsx`**: The main entry point for the React application.
*   **`client/src/App.tsx`**: The root component, handling routing and global layout.
*   **`client/src/core/`**: Core client-side logic, including API setup (`queryClient.ts`, `api.ts`), router configuration, and global providers.
*   **`client/src/features/[feature-name]/`**: Modules for distinct application features (e.g., `forum`, `wallet`, `admin`, `users`). Each typically contains:
    *   `components/`: Feature-specific UI components.
    *   `hooks/`: Feature-specific custom React hooks.
    *   `pages/`: Page components for this feature's routes.
    *   `services/`: API service functions for backend interaction.
    *   `types/`: TypeScript definitions specific to the feature.
    *   `utils/`: Feature-specific utility functions.
*   **`client/src/components/`**: Shared, reusable UI components not specific to a single feature.
    *   `ui/`: Foundational UI primitives (e.g., Button, Card from Shadcn UI).
    *   `layout/`: Global layout components (e.g., Sidebar, Header, Footer).
    *   Other domain-specific shared components (e.g., `forum/`, `profile/`).
*   **`client/src/pages/`**: Page-level components and route entry points, organized by major sections of the application.
*   **`client/src/hooks/`**: General-purpose custom React hooks shared across features.
*   **`client/src/lib/`**: General utilities and helpers (e.g., `utils.ts`, `formatters.ts`).
*   **`client/src/styles/`**: Global CSS files, Tailwind CSS configuration, and specific styles like `zone-themes.css`.
*   **`client/src/constants/`**: Application-wide constants (e.g., `routes.ts`, `env.ts`).
*   **`client/src/contexts/`**: React Context API providers for global or widely shared state.
*   **`client/src/providers/`**: Aggregates various context and other global providers for the application.
*   **`client/public/`**: Static assets (images, fonts) served directly.

## 3. Source of Truth References

*   **UI Design System:** `config/tailwind.config.ts` (project root) for design tokens.
*   **Data Models & Schemas:** `db/schema/` (project root) contains Drizzle ORM schemas. Shared types can also be found in `shared/types.ts`.
*   **API Interaction:** `client/src/lib/queryClient.ts` (`apiRequest`) is the preferred API client. Specific service calls are often within `features/[feature-name]/services/`.
*   **Component Library:** `client/src/components/ui/` for foundational UI primitives.
*   **Import Patterns:** `.cursor/rules/import-patterns.mdc` (project root) for import statement guidelines.

## 4. Architectural Principles & Conventions

*   **Feature-Based Modularity:** New development should prioritize encapsulating logic and UI within dedicated feature directories (`client/src/features/`).
*   **Component Reusability:** Promote the creation of small, focused, and reusable components. UI primitives should reside in `client/src/components/ui/`.
*   **State Management:** Utilize React Query for server-side state management and data fetching, and React Context API for global client-side state.
*   **Type Safety:** Leverage TypeScript extensively to ensure robust and error-free code.
*   **Responsive Design:** All UI components must be designed and implemented to be fully responsive across various screen sizes, primarily using Tailwind CSS utilities.
*   **Accessibility (A11y):** Adhere to WCAG guidelines. Ensure proper semantic HTML, keyboard navigation, and ARIA attributes where necessary.
*   **Kebab-Case Naming:** All files and folders (except React components, which use PascalCase) should use kebab-case or lowercase.
*   **Path Aliases:** Always use the `@/` path alias for imports from the `src/` directory.

## 5. Status & Known Issues

*   **Status:** Frontend is actively being developed and restructured. The migration to a feature-based architecture is ongoing.
*   **Restructuring Progress:** While some areas (e.g., Admin XP system UI) have been migrated, many components and pages still reside in the older `src/components/` and `src/pages/` directories.
*   **Legacy API Usage:** Some older components might still use deprecated API clients (`api` from `@/lib/api.ts`) instead of `apiRequest`. These should be migrated as encountered.

## 6. Getting Started (Development)

*   **Prerequisites:** Node.js, npm/pnpm.
*   **Installation:** `npm install` in the root directory.
*   **Running the Frontend:** `npm run dev` (from the root directory). This starts the Vite development server, typically accessible at `http://localhost:5173` (or the port specified in `VITE_PORT` environment variable).
*   **Environment Variables:** Ensure a `.env.local` file is present in the project root directory with necessary frontend configurations (e.g., API endpoint URLs, feature flags).
*   **Browser:** Open your web browser to the development server URL.

## 7. Quick Notes (For Devs or Agents)

*   When creating new features, prioritize the `client/src/features/[feature-name]/` structure.
*   Before creating a new UI component, check `client/src/components/ui/` for existing primitives and `client/src/components/[domain]/` for shared domain components.
*   Run `npm run check` and `npm run lint` (from the root directory) regularly to maintain code quality.
*   For UI/UX design guidelines, refer to `.clinerules/cline-for-webdev-ui.md` (if available) or general project design documentation.

---
*This README is intended to be a living document. Please update it as the client architecture or key components change.*
