# Migration Blueprint: Component Consolidation

This document provides a phased, step-by-step plan for refactoring the client-side component structure to align with the `target-structure.md`.

## 1. Phase 0 – Preparation

1.  **Communication**: Announce a short feature freeze window to the development team to prevent merge conflicts.
2.  **Branching**: Create a dedicated, long-lived refactoring branch: `refactor/component-consolidation`. All work will be done here.
3.  **Linting Rule**: Add a temporary ESLint rule to prevent new files from being added to legacy component directories (e.g., `client/src/components/profile`, `client/src/components/economy`). This forces new development to follow the target structure.
    ```json
    // .eslintrc.json
    {
      "rules": {
        "no-restricted-imports": [
          "error",
          {
            "patterns": [
              {
                "group": ["@/components/*", "!@/components/ui", "!@/components/layout"],
                "message": "Feature components should be placed in the 'features' directory."
              }
            ]
          }
        ]
      }
    }
    ```

## 2. Phase 1 – Duplicate Resolution

This phase focuses on merging the identified duplicate components. The primary criteria for choosing a "winner" are feature completeness and alignment with the target architecture.

### Duplicate Resolution Plan (YAML)

```yaml
- winner: client/src/components/users/Username.tsx
  loser: client/src/components/identity/UserName.tsx
  actions:
    - "DECISION: `users/Username.tsx` is the winner due to its superior feature set (cosmetics, rarity, system roles)."
    - "ANALYSIS: The `useIdentityDisplay` hook from the loser must be reconciled with the `useUserCosmetics` hook used by the winner."
    - "ACTION: Modify the winner to accept a `user` object prop (like the loser) to simplify migration, instead of individual props."
    - "ACTION: Create a temporary re-export shim at the loser's path to redirect imports during the transition."
    - "RENAME: The winning file will be moved to `client/src/features/identity/components/Username.tsx`."

- winner: client/src/components/users/Avatar.tsx
  loser: client/src/components/users/user-avatar.tsx
  actions:
    - "DECISION: `users/Avatar.tsx` is the winner as it is more feature-complete (e.g. frames)."
    - "ACTION: Ensure all props from the loser are supported by the winner."
    - "ACTION: Create a re-export shim at the loser's path."
    - "RENAME: The winning file will be moved to `client/src/features/identity/components/Avatar.tsx`."

- winner: client/src/components/ui/sidebar.tsx
  loser: client/src/components/layout/sidebar.tsx
  actions:
    - "DECISION: The two sidebars serve different purposes. `ui/sidebar.tsx` is a generic container, while `layout/sidebar.tsx` is the main application sidebar."
    - "ACTION: Rename `layout/sidebar.tsx` to `AppSidebar.tsx` to clarify its specific role."
    - "ACTION: Move `AppSidebar.tsx` to `client/src/components/layout/AppSidebar.tsx`."
    - "ACTION: No merge needed, just clarification of purpose."

- winner: client/src/components/paths/path-progress.tsx
  loser: client/src/components/identity/path-progress.tsx
  actions:
    - "DECISION: The two files are very similar. `paths/path-progress.tsx` is chosen as the winner."
    - "ACTION: Perform a diff and merge any missing features into the winner."
    - "ACTION: Create a re-export shim at the loser's path."
    - "RENAME: The winning file will be moved to `client/src/features/gamification/components/PathProgress.tsx`."
```

## 3. Phase 2 – Move & Codemod

This phase involves automated and semi-automated file moves and import updates.

1.  **Run Automated Moves**: Use `jscodeshift` or a similar codemod tool with a custom script to automatically move files from legacy `components/*` directories to their new `features/*` locations.
2.  **Update Imports**: The codemod script should also update all import paths across the codebase to reflect the new file locations.
3.  **Update Aliases (Optional)**: Update `tsconfig.json` path aliases if necessary to simplify imports (e.g., `@/features/` -> `~/features/`).
4.  **Prune Shims**: Once all imports are updated, remove the temporary re-export shims created in Phase 1.

## 4. Phase 3 – Cleanup

1.  **Delete Legacy Directories**: Remove the now-empty feature directories from `client/src/components/` (e.g., `components/profile`, `components/economy`, etc.).
2.  **Update Documentation**: Update `directory-tree.md` and any other architectural diagrams to reflect the new structure.
3.  **Finalize Linting**: Change the ESLint rule from Phase 0 from a warning to an error to strictly enforce the new structure going forward.

## 5. Risks & Mitigations

-   **Circular Dependencies**:
    -   **Risk**: Moving files can introduce circular dependencies between features.
    -   **Mitigation**: Use a tool like `madge` to analyze the dependency graph before and after changes. Break cycles by extracting shared logic into `lib/` or `hooks/`.
-   **Large Merge Conflicts**:
    -   **Risk**: The long-lived refactor branch will conflict with ongoing feature development.
    -   **Mitigation**: Communicate the feature freeze clearly. Rebase the refactor branch frequently on the main branch to resolve conflicts in small, manageable chunks.
-   **Build & Test Failures**:
    -   **Risk**: Automated refactoring can miss edge cases, leading to broken builds or tests.
    -   **Mitigation**: Run the full test suite (unit, integration, e2e) after each major step of the migration.

## 6. Estimated Timeline

-   **Phase 0 (Prep)**: 2 hours
-   **Phase 1 (Duplicate Resolution)**: 8-12 hours (requires careful manual analysis)
-   **Phase 2 (Move & Codemod)**: 4-6 hours (mostly automated)
-   **Phase 3 (Cleanup)**: 2 hours
-   **Total**: ~16-22 hours

**Parallelization**: The resolution of each duplicate pair in Phase 1 can be done in parallel by different developers.
