# Degentalk Shared Code

## Status: Reviewed – Awaiting Final Approval | 2025-06-02

## 1. Purpose & Role

The `shared/` directory contains code, type definitions, and validation schemas that are used by **both** the `client/` (frontend) and `server/` (backend) applications. Its primary purpose is to ensure consistency, reduce duplication, and provide a single source of truth for data structures and validation rules that cross the client-server boundary.

## 2. Structure & Key Components

The structure of the `shared/` directory is generally kept simple and focused on its cross-cutting concerns:

*   **`shared/types.ts`**: (Or `shared/index.ts` if re-exporting from multiple type files)
    *   Contains TypeScript interfaces and type aliases that define the shape of data objects exchanged between the client and server.
    *   Examples: API response payloads, request bodies, core entity types (e.g., `User`, `Thread`, `Post`, `WalletTransaction`) if not fully defined by ORM schemas for client use.
*   **`shared/validators/`**: 
    *   Contains Zod (or similar library) schemas used for validating data on both the client-side (e.g., form inputs) and server-side (e.g., API request bodies, environment variables).
    *   Often organized by domain or entity (e.g., `user.ts`, `forum.ts`, `admin.ts`).
*   **`shared/constants.ts`**: 
    *   Defines constants that are relevant to both client and server logic.
    *   Examples: Default pagination limits, role names, specific event names, feature flags if managed across both.
*   **`shared/utils/`**: (Use sparingly)
    *   May contain truly generic utility functions that have no dependencies on client or server-specific environments and are useful for both.
    *   Example: A simple string manipulation function or a formatting utility that doesn't rely on browser APIs or Node.js modules.
*   **`shared/signature/SignatureTierConfig.ts`**: As seen in the directory tree, this likely defines configuration related to user signature tiers, shared between client (for display) and server (for logic).
*   **`shared/path-config.ts`**: As seen in the directory tree, this might define configurations for user progression paths or similar gamification elements shared across client and server.

**Important Considerations:**
*   Code in `shared/` **must not** have dependencies on client-specific libraries (e.g., React, DOM APIs) or server-specific libraries (e.g., Express, Node.js core modules like `fs`).
*   Keep this directory lean. If a piece of code is only used by the client or only by the server, it belongs in that respective part of the codebase.

## 3. Source of Truth References

*   **Data Contracts:** `shared/types.ts` and `shared/validators/` effectively define the data contracts between the client and server.
*   **Validation Logic:** Zod schemas within `shared/validators/` are the source of truth for data validation rules.

## 4. Architectural Principles & Conventions

*   **Universality:** Code must be runnable in both Node.js (server) and browser (client) environments.
*   **Dependency Free (Platform Specific):** Avoid platform-specific APIs or libraries.
*   **Single Responsibility:** Files and modules should have a clear, single responsibility (e.g., types for users, validators for forum posts).
*   **Clarity and Simplicity:** Shared code should be easy to understand as it impacts multiple parts of the system.
*   **Type Safety:** Leverage TypeScript extensively.

## 5. Getting Started (Usage)

*   **Importing:** Both client and server code can import modules from `shared/` using appropriate path aliases if configured (e.g., `@shared/types` or relative paths if aliases are not set up for `shared`). Check `tsconfig.json` for path alias configurations.
    *   Example Client: `import type { User } from '@shared/types';`
    *   Example Server: `import { userCreateSchema } from '@shared/validators/user';`

## 6. Key Technologies

*   **TypeScript:** For type definitions and ensuring type safety across client/server boundaries.
*   **Zod (or similar):** For schema definition and validation.

---
*This README is intended to be a living document. Please update it if the structure or purpose of the `shared/` directory changes.*
