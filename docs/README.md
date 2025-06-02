# Degentalk Documentation Hub

## Status: Reviewed – Awaiting Final Approval | 2025-06-02

## 1. Purpose & Role

This `docs/` directory serves as the central documentation hub for the entire Degentalk project. Its purpose is to provide comprehensive, up-to-date, and easily navigable information for all developers, contributors, and stakeholders. This `README.md` acts as the main entry point and table of contents for all project documentation.

## 2. Structure & Key Components

The documentation is organized into logical sections and individual Markdown files to ensure clarity and modularity.

*   **`docs/README.md` (This file)**: The primary entry point, providing an overview and links to all major documentation sections.
*   **`docs/audit-summary.md`**: A report detailing the initial documentation audit and scaffolding progress.
*   **`docs/memory-bank/`**: Contains Cline's internal memory bank, including raw reflection logs and consolidated learnings, crucial for continuous improvement and context preservation across sessions.
*   **Domain-Specific Documentation (e.g., `docs/forum/`, `docs/shop/`, `docs/ui/`)**: Directories containing detailed documentation specific to particular business domains or architectural layers.
*   **General Project Documentation (e.g., `docs/codebase-overview.md`, `docs/refactor-tracker.md`)**: Files covering broader project aspects, refactoring efforts, or specific technical deep-dives.
*   **Archived Documentation (`docs/archive/`)**: Contains outdated or superseded documentation for historical reference.

## 3. Source of Truth References

*   **Project Overview:** The root `README.md` or `CONTRIBUTING.md` (if present) provides the highest-level project context.
*   **Codebase Structure:** Refer to the `README.md` files within `client/`, `server/`, `db/`, `shared/`, `scripts/`, and `config/` for detailed information on those respective areas.
*   **Architectural Decisions:** Key architectural patterns and decisions are documented within relevant `README.md` files and specific design documents (e.g., `docs/designworkflow.md`).
*   **Rules & Conventions:** The `.cursor/rules/` and `.clinerules/` directories contain the active rules and protocols governing development practices.

## 4. Architectural Principles & Conventions

*   **Concise & Truthful:** Documentation aims to be direct, accurate, and free of unnecessary fluff, respecting developer time.
*   **Modular:** Information is broken down into smaller, manageable files, linked together for easy navigation.
*   **Living Document:** All documentation is expected to be updated regularly as the project evolves.
*   **LLM-Assisted Compatibility:** Documentation is structured to be easily parsable and useful for AI agents, ensuring clear headings, consistent formatting, and explicit references.

## 5. Status & Known Issues

*   **Status:** Documentation overhaul is in progress. Many sections are initial drafts and require further population and refinement.
*   **Completeness:** Not all areas of the codebase are fully documented yet. Refer to `docs/audit-summary.md` for a detailed list of pending documentation tasks.
*   **Consistency:** While efforts are made to maintain consistency, some older documents may not fully adhere to the new standards.
*   (TODO: Add any other known major issues or areas of active refactoring specific to the documentation itself.)

## 6. Getting Started (Development)

*   **New Developers:** Start by reading the root `README.md` (or `CONTRIBUTING.md`), then explore the `codebase-overview.md` and the `README.md` files in `client/`, `server/`, `db/`, and `shared/`.
*   **Contributing to Docs:** Follow the "Documentation Overhaul Plan" (summarized in the previous session) for guidelines on structure, tone, and content.
*   **Finding Information:** Use the links below or navigate the directory structure to find specific documentation.

## 7. Key Document Links

*   Project Overview & Setup (`../../README.md`)
*   Frontend Architecture (`../client/README.md`)
*   Backend Architecture (`../server/README.md`)
*   Database Guide (`../db/README.md`)
*   Shared Code Guide (`../shared/README.md`)
*   Scripts & Tooling (`../scripts/README.md`)
*   Configuration (`../config/README.md`)
*   Cline's Memory Bank (`./memory-bank/projectbrief.md`)
*   Documentation Audit Summary (`./audit-summary.md`)
*   Codebase Overview (`./codebase-overview.md`)
*   Refactor Tracker (`./refactor-tracker.md`)
*   (TODO: Add links to other key documents as they are created/audited and become stable.)

---
*This README is intended to be a living document. Please update it as the documentation architecture or key components change.*
