# DegenTalk Server Architecture

This document outlines the domain-driven architecture for the DegenTalk server. The goal of this architecture is to create a scalable, maintainable, and robust system by enforcing clear boundaries between different parts of the application.

## Directory Structure

The server codebase is organized into the following top-level directories within `server/src`:

-   `/core`: Contains the fundamental building blocks of the application, such as the database connection, logger, and storage service. These are generic components that can be used by any domain.
-   `/domains`: This is the heart of the application. Each subdirectory within `/domains` represents a distinct business domain (e.g., `wallet`, `forum`, `users`).
-   `/middleware`: Contains Express middleware for handling authentication, rate limiting, and other cross-cutting concerns.
-   `/routes`: The main application router that ties all the domain-specific routes together.
-   `/services`: Contains any application-wide services that don't belong to a specific domain.
-   `/utils`: Contains miscellaneous utility functions.

### Domain Structure

Each domain within `server/src/domains` should follow a standardized structure:

-   `/controllers`: Handles incoming HTTP requests, validates the input, and calls the appropriate service methods. **Controllers should not contain any business logic.**
-   `/services`: Contains the core business logic for the domain. Services should be self-contained and not directly depend on other services from different domains.
-   `/routes`: Defines the API endpoints for the domain and connects them to the controller methods.
-   `/transformers`: Formats the data returned by the service layer into a standardized API response. This is a critical layer for security and consistency.
-   `/validation`: Contains validation schemas (e.g., using Zod) for the request bodies and parameters.

## Domain Communication

To maintain clear boundaries and avoid creating a "big ball of mud," domains must not import directly from each other. The following rules apply:

1.  **No Cross-Domain Imports:** A service in the `wallet` domain cannot directly import and use a service from the `forum` domain.
2.  **Allowed Imports:** Domains are only allowed to import from the `/core` directory and the `/shared` workspace.
3.  **Communication Patterns:** When domains need to communicate, they should do so through one of the following methods:
    -   **API Calls:** One service can make an HTTP request to an endpoint exposed by another domain.
    -   **Shared Services:** If two domains need to share a piece of logic, it should be extracted into a shared service in the `/services` directory.
    -   **Event Bus:** For decoupled communication, an event bus can be used to publish events that other domains can subscribe to.

## ESLint Enforcement

To automatically enforce these architectural rules, a custom ESLint rule, `no-cross-domain-imports`, has been implemented. This rule will produce a warning if a file in one domain attempts to import a file from another domain, helping to catch architectural violations early in the development process. 