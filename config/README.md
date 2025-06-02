# Configuration Files

## Status: Reviewed – Awaiting Final Approval | 2025-06-02

## 1. Purpose & Role

The `config/` directory centralizes various configuration files that govern the behavior of development tools, build processes, and styling within the Degentalk project. Its purpose is to provide a single, organized location for project-wide settings, ensuring consistency and ease of management.

## 2. Structure & Key Components

This directory contains essential configuration files for key development tools:

*   **`config/postcss.config.js`**: Configuration for PostCSS, a tool for transforming CSS with JavaScript plugins. This file defines how CSS is processed, including auto-prefixing, minification, and other transformations.
*   **`config/tailwind.config.ts`**: The primary configuration file for Tailwind CSS. It defines the project's design system, including custom colors, typography, spacing, breakpoints, and other utility classes. All UI styling should adhere to the definitions in this file.
*   **`config/vite.config.ts`**: The configuration file for Vite, the build tool used for the frontend. This file specifies how the project is built, served in development, and optimized for production, including plugins, aliases, and proxy settings.

## 3. Source of Truth References

*   **CSS Processing:** `config/postcss.config.js` is the source of truth for PostCSS transformations.
*   **Design System:** `config/tailwind.config.ts` is the definitive source for all design tokens and UI utility configurations.
*   **Build & Dev Server:** `config/vite.config.ts` dictates the frontend build and development server behavior.

## 4. Architectural Principles & Conventions

*   **Centralized Configuration:** All major tool configurations should reside in this directory to provide a clear overview and easy access.
*   **Consistency:** Changes to styling or build processes should be made here to ensure they apply consistently across the entire project.
*   **Modularity:** While centralized, configurations should be structured logically within their respective files.

## 5. Status & Known Issues

*   **Status:** Initial documentation pass. These configurations are stable but may require updates as project dependencies or build requirements evolve.
*   (TODO: Add any specific known issues or areas of active refactoring related to configuration files.)

## 6. Getting Started (Development)

*   Developers should familiarize themselves with these files to understand how styling, CSS processing, and the frontend build system are configured.
*   When adding new UI components or features, ensure they align with the design system defined in `tailwind.config.ts`.
*   For build-related issues or optimizations, `vite.config.ts` is the first place to check.

## 7. Quick Notes (For Devs or Agents)

*   Avoid hardcoding values that could be defined in `tailwind.config.ts`.
*   Changes to these files often require a restart of the development server.
*   Consult the official documentation for PostCSS, Tailwind CSS, and Vite for advanced configurations.

---
*This README is intended to be a living document. Please update it as the configuration architecture or key components change.*
