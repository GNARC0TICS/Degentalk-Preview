# Degentalk Monorepo Refactoring: Execution Plan (v2 - Bulletproof)

## 1. Objective

To refactor the Degentalk monorepo into a clean, scalable, and enterprise-grade "apps/packages/tools" structure. This plan incorporates rigorous safety checks, validation, and rollback procedures for each phase.

## 2. Guiding Principles

- **Safety First:** Every phase begins with creating a recovery point (a new git branch) and is reversible.
- **Verifiability:** Every step has a clear validation command or checklist to confirm success.
- **Atomic Phases:** The refactor is broken into logical, committable phases. A failure in one phase does not prevent rolling back to the previous stable state.
- **Clarity:** Commands are explicit, and risks are documented upfront.

## 3. Global Pre-Flight Check

Before starting Phase I, ensure the `main` branch is stable and ready.

- **[ ] Git Status:** Working directory is clean.
  - **Command:** `git status`
  - **Expected:** `working tree clean`
- **[ ] Test Suite:** All tests pass.
  - **Command:** `pnpm test`
  - **Expected:** All tests pass without errors.
- **[ ] Build:** The entire repository builds successfully.
  - **Command:** `pnpm -r build`
  - **Expected:** All packages build without errors.

---

## Phase I: Foundational Structure

**Objective:** Create the new top-level `packages/` and `tools/` directories that will house the reorganized code.

### 1.1. Pre-Flight: Create a Recovery Point

- **[ ] Create Branch:** Create a new branch for this phase.
  - **Command:** `git checkout -b feature/refactor-phase-1-structure`
- **[ ] Create Tag:** Tag the starting point for easy reference.
  - **Command:** `git tag refactor-phase-1-start`

### 1.2. Execution: Create New Root Directories

- **[ ] Dry Run (Preview):** List the directories to be created.
  - **Command:** `echo "mkdir packages tools"`
  - **Expected:** The command prints the creation command to the console.
- **[ ] Execute:** Create the directories.
  - **Command:** `mkdir packages tools`

### 1.3. Post-Flight: Validation & Reporting

- **[ ] Verify Creation:** Check that the directories now exist.
  - **Validation Command:** `ls -d packages/ tools/`
  - **Expected:** The command lists both `packages/` and `tools/`.
- **[ ] Generate Diff Report:** See what has changed.
  - **Reporting Command:** `git status`
  - **Expected:** Shows `packages/` and `tools/` as untracked. (Note: Since they are empty, `git diff` will show nothing yet).

### 1.4. Risks & Mitigations

- **Risk:** Minimal. Creating empty directories is a non-destructive operation.
- **Mitigation:** N/A.

### 1.5. Rollback Plan

- **Commands:**
  ```bash
  # Remove the created directories
  rm -rf packages tools
  # Return to the main branch
  git checkout main
  # Delete the feature branch
  git branch -D feature/refactor-phase-1-structure
  # Delete the tag
  git tag -d refactor-phase-1-start
  ```

---

## Phase II: Relocate Core Packages

**Objective:** Move the primary applications (`client`, `server`) and the `shared` library into the new `packages/` directory using `git mv` to preserve file history.

### 2.1. Pre-Flight: Create a Recovery Point

- **[ ] Commit Previous Phase:** Commit the work from Phase I.
  - **Command:** `git add . && git commit -m "refactor: create packages/ and tools/ directories"`
- **[ ] Create Branch:** Create a new branch for this phase.
  - **Command:** `git checkout -b feature/refactor-phase-2-relocate-core`
- **[ ] Create Tag:** Tag the starting point.
  - **Command:** `git tag refactor-phase-2-start`

### 2.2. Execution: Move Directories

- **[ ] Dry Run (Preview):** List the move operations.
  - **Commands:**
    ```bash
    echo "git mv client packages/client"
    echo "git mv server packages/server"
    echo "git mv shared packages/shared"
    ```
  - **Expected:** The commands to be executed are printed to the console.
- **[ ] Execute Moves:**
  - **Commands:**
    ```bash
    git mv client packages/client
    git mv server packages/server
    git mv shared packages/shared
    ```

### 2.3. Post-Flight: Validation & Reporting

- **[ ] Verify Relocation:** Check that the directories exist in their new locations.
  - **Validation Commands:**
    ```bash
    ls -d packages/client/
    ls -d packages/server/
    ls -d packages/shared/
    ls client server shared # This should fail, proving the old paths are gone
    ```
  - **Expected:** The first three commands succeed, listing the new directories. The final command fails with a "No such file or directory" error.
- **[ ] Generate Diff Report:** See the summary of file moves.
  - **Reporting Command:** `git status`
  - **Expected:** Git status will show a large number of files as "renamed" (e.g., `renamed: client/package.json -> packages/client/package.json`).

### 2.4. Risks & Mitigations

- **Risk:** IDEs and file watchers may lose track of files, causing temporary indexing or linting issues.
- **Mitigation:** Restarting the IDE (e.g., VS Code) and any running development servers or test watchers after this phase is complete will resolve these issues.

### 2.5. Rollback Plan

- **Commands:**
  ```bash
  # Revert the 'git mv' operations before committing
  git restore .
  # If already committed, revert the commit
  # git revert HEAD --no-edit
  
  # Return to the previous stable state
  git checkout feature/refactor-phase-1-structure
  # Delete the feature branch
  git branch -D feature/refactor-phase-2-relocate-core
  # Delete the tag
  git tag -d refactor-phase-2-start
  ```

---

## Phase III: Consolidate Tools and Scripts

**Objective:** Reorganize the various script, library, and linting rule directories into the new centralized `tools/` directory to improve clarity and separation of concerns.

### 3.1. Pre-Flight: Create a Recovery Point

- **[ ] Commit Previous Phase:**
  - **Command:** `git add . && git commit -m "refactor: relocate client, server, and shared to packages/"`
- **[ ] Create Branch:**
  - **Command:** `git checkout -b feature/refactor-phase-3-consolidate-tools`
- **[ ] Create Tag:**
  - **Command:** `git tag refactor-phase-3-start`

### 3.2. Execution: Move Directories

- **[ ] Dry Run (Preview):**
  - **Commands:**
    ```bash
    echo "git mv lib tools/lib"
    echo "git mv eslint-plugins tools/eslint-plugins"
    echo "git mv eslint-rules tools/eslint-rules"
    echo "mkdir -p tools/scripts"
    # Preview moving script subdirectories
    for dir in admin codemods cron db dev docs logs migration missions ops phase5 quality refactor seed templates testing tools validation; do echo "git mv scripts/$dir tools/scripts/$dir"; done
    ```
  - **Expected:** A list of all the `git mv` commands to be executed is printed.
- **[ ] Execute Moves:**
  - **Commands:**
    ```bash
    git mv lib tools/lib
    git mv eslint-plugins tools/eslint-plugins
    git mv eslint-rules tools/eslint-rules
    mkdir -p tools/scripts
    for dir in admin codemods cron db dev docs logs migration missions ops phase5 quality refactor seed templates testing tools validation; do git mv scripts/$dir tools/scripts/$dir; done
    ```

### 3.3. Post-Flight: Validation & Reporting

- **[ ] Verify Relocation:**
  - **Validation Commands:**
    ```bash
    ls -d tools/lib/
    ls -d tools/eslint-plugins/
    ls -d tools/eslint-rules/
    ls -d tools/scripts/*
    ```
  - **Expected:** All commands succeed, listing the newly moved directories.
- **[ ] Generate Diff Report:**
  - **Reporting Command:** `git status`
  - **Expected:** Git status will show all moved files as "renamed". The `scripts/` directory should now only contain top-level files.

### 3.4. Risks & Mitigations

- **Risk:** Scripts with hardcoded relative paths (e.g., `../db/schema`) will break.
- **Mitigation:** This is expected. Phase V (Codemods) is designed to fix these programmatically. A final manual audit of any remaining top-level scripts in the root `scripts/` folder will be necessary after the automated pass.

### 3.5. Rollback Plan

- **Commands:**
  ```bash
  # Revert the 'git mv' operations before committing
  git restore .
  rm -rf tools/scripts # remove the newly created directory
  
  # If already committed, revert the commit
  # git revert HEAD --no-edit
  
  # Return to the previous stable state
  git checkout feature/refactor-phase-2-relocate-core
  # Delete the feature branch
  git branch -D feature/refactor-phase-3-consolidate-tools
  # Delete the tag
  git tag -d refactor-phase-3-start
  ```

---

## Phase IV: Update Monorepo Configuration

**Objective:** Update the core configuration files (`pnpm-workspace.yaml`, `tsconfig.base.json`, `package.json`) to recognize the new directory structure. This phase makes the monorepo aware of the new file locations.

### 4.1. Pre-Flight: Create a Recovery Point

- **[ ] Commit Previous Phase:**
  - **Command:** `git add . && git commit -m "refactor: consolidate scripts and tools"`
- **[ ] Create Branch:**
  - **Command:** `git checkout -b feature/refactor-phase-4-update-config`
- **[ ] Create Tag:**
  - **Command:** `git tag refactor-phase-4-start`

### 4.2. Execution: Modify Configuration Files

- **[ ] Update PNPM Workspace:**
  - **File:** `pnpm-workspace.yaml`
  - **Action:** Replace the entire content of the file with the new workspace definition.
  - **New Content:**
    ```yaml
    packages:
      - 'packages/*'
      - 'tools/*'
      - 'db'
    ```
- **[ ] Update TypeScript Path Aliases:**
  - **File:** `tsconfig.base.json`
  - **Action:** Replace the `compilerOptions.paths` object with the new, more robust aliases.
  - **New `paths` Object:**
    ```json
    "paths": {
      "@degentalk/client/*": ["packages/client/src/*"],
      "@degentalk/server/*": ["packages/server/src/*"],
      "@degentalk/shared/*": ["packages/shared/src/*"],
      "@degentalk/db/*": ["db/*"],
      "@degentalk/scripts/*": ["scripts/*"],
      "@degentalk/tools/*": ["tools/*"]
    }
    ```

### 4.3. Post-Flight: Validation & Reporting

- **[ ] Verify PNPM Workspaces:**
  - **Validation Command:** `pnpm -r ls --depth -1`
  - **Expected:** The command should list all packages from their new locations (e.g., `@degentalk/client`, `@degentalk/server`). It should *not* show errors about missing packages.
- **[ ] Verify TypeScript Path Resolution (Initial Check):**
  - **Validation Command:** `pnpm -r typecheck`
  - **Expected:** The command will likely fail with many errors inside the source files. This is **expected**. The critical validation here is that it does *not* fail because of invalid `paths` configuration in `tsconfig.base.json`. The errors should be about unresolved imports within the code, which will be fixed in the next phase.
- **[ ] Generate Diff Report:**
  - **Reporting Command:** `git diff HEAD`
  - **Expected:** The diff will show the changes to `pnpm-workspace.yaml` and `tsconfig.base.json`.

### 4.4. Risks & Mitigations

- **Risk:** Build and test scripts will be completely broken after this phase. Any command like `pnpm test` will fail.
- **Mitigation:** This is an expected and accepted risk for this phase. The purpose of this phase is *only* to update the workspace configuration. The broken state will be resolved in Phase V. Do not attempt to fix broken tests or builds manually at this stage.

### 4.5. Rollback Plan

- **Commands:**
  ```bash
  # Revert the file changes before committing
  git restore pnpm-workspace.yaml tsconfig.base.json
  
  # If already committed, revert the commit
  # git revert HEAD --no-edit
  
  # Return to the previous stable state
  git checkout feature/refactor-phase-3-consolidate-tools
  # Delete the feature branch
  git branch -D feature/refactor-phase-4-update-config
  # Delete the tag
  git tag -d refactor-phase-4-start
  ```

---

## Phase V: Code-Level Path Updates (Codemods)

**Objective:** Programmatically update all broken `import` and `require` statements across the entire monorepo to use the new workspace-relative path aliases.

### 5.1. Pre-Flight: Create a Recovery Point & Scaffolding

- **[ ] Commit Previous Phase:**
  - **Command:** `git add . && git commit -m "refactor: update monorepo configuration"`
- **[ ] Create Branch:**
  - **Command:** `git checkout -b feature/refactor-phase-5-codemods`
- **[ ] Create Tag:**
  - **Command:** `git tag refactor-phase-5-start`
- **[ ] Create Codemod Script File:**
  - **Command:** `mkdir -p tools/codemods && touch tools/codemods/update-import-paths.ts`
  - **Note:** The logic for this script is complex and will be developed as part of the execution of this step. It will need to resolve old relative paths against the new file locations and map them to the new `@degentalk/*` aliases.

### 5.2. Execution: Run Codemod

- **[ ] Dry Run:**
  - **Action:** Execute the codemod in "dry run" mode to preview the changes without writing them to disk. This is the most critical safety check.
  - **Command:** `pnpm jscodeshift -t tools/codemods/update-import-paths.ts packages/ --dry`
  - **Verification:** Carefully review the diff output in the console. Ensure the transformations are correct. If they are not, refine the codemod script and repeat the dry run.
- **[ ] Execute for Real:**
  - **Action:** Once the dry run produces the correct output, run the codemod to apply the changes.
  - **Command:** `pnpm jscodeshift -t tools/codemods/update-import-paths.ts packages/`

### 5.3. Post-Flight: Validation & Reporting

- **[ ] Verify Type Checking:**
  - **Validation Command:** `pnpm -r typecheck`
  - **Expected:** The number of type errors should be drastically reduced. Ideally, it should be zero. Some manual fixes may be required for edge cases the codemod missed.
- **[ ] Verify Build:**
  - **Validation Command:** `pnpm -r build`
  - **Expected:** All packages should build successfully. This is a strong indicator that the import paths are correct.
- **[ ] Generate Diff Report:**
  - **Reporting Command:** `git status` and `git diff HEAD --stat`
  - **Expected:** A very large number of files across the `packages/` directory will be reported as modified.

### 5.4. Risks & Mitigations

- **Risk:** The codemod script may have bugs, leading to incorrect transformations or missed edge cases (e.g., dynamic `require` statements, non-standard import paths).
- **Mitigation:**
  1.  **Dry Run:** The `--dry` flag is the primary mitigation.
  2.  **Iterative Application:** Apply the codemod to a single package first (e.g., `packages/shared`) to validate its logic on a smaller surface area before running it on the entire repository.
  3.  **Manual Review:** After the codemod runs, manually inspect the changes in a few key files to confirm correctness.

### 5.5. Rollback Plan

- **Commands:**
  ```bash
  # Revert the file changes before committing
  git restore .
  
  # If already committed, revert the commit
  # git revert HEAD --no-edit
  
  # Return to the previous stable state
  git checkout feature/refactor-phase-4-update-config
  # Delete the feature branch
  git branch -D feature/refactor-phase-5-codemods
  # Delete the tag
  git tag -d refactor-phase-5-start
  ```

---

## Phase VI: Final Cleanup and Verification

**Objective:** To perform a final, full-system verification to ensure the refactored repository is stable, clean, and fully functional.

### 6.1. Pre-Flight: Create a Recovery Point

- **[ ] Commit Previous Phase:**
  - **Command:** `git add . && git commit -m "refactor: update all internal import paths via codemod"`
- **[ ] Create Branch:**
  - **Command:** `git checkout -b feature/refactor-phase-6-final-verification`
- **[ ] Create Tag:**
  - **Command:** `git tag refactor-phase-6-start`

### 6.2. Execution: Clean and Verify

- **[ ] Purge Caches and Reinstall:**
  - **Action:** Remove all build artifacts, caches, and `node_modules` directories to ensure a completely clean state, then reinstall.
  - **Commands:**
    ```bash
    pnpm -r exec rm -rf node_modules dist build .turbo .tscache
    rm -rf node_modules
    pnpm install
    ```
- **[ ] Run Full-System Check:**
  - **Action:** Execute all quality and testing scripts from the root.
  - **Commands:**
    ```bash
    pnpm -r lint
    pnpm -r typecheck
    pnpm -r test
    pnpm -r build
    ```

### 6.3. Post-Flight: Validation & Reporting

- **[ ] Verify Command Success:**
  - **Validation:** Check the output of each command from the previous step.
  - **Expected:** All linting, type-checking, testing, and build commands must pass without any errors. This is the technical sign-off for the refactoring.
- **[ ] Final Diff Report:**
  - **Reporting Command:** `git status`
  - **Expected:** The working directory should be clean.

### 6.4. Risks & Mitigations

- **Risk:** Lingering cache issues or environment-specific problems could cause tests to fail.
- **Mitigation:** The full clean and reinstall step is the primary mitigation. If issues persist, they are likely pre-existing or environment-related and should be investigated separately.

### 6.5. Rollback Plan

- **Commands:**
  ```bash
  # This is the final phase. A rollback from here means reverting the entire refactor.
  # The safest way is to go back to the start of the refactoring branch.
  git reset --hard <commit_hash_of_main_before_refactor>
  
  # Or, to just undo this phase's commit:
  git checkout feature/refactor-phase-5-codemods
  git branch -D feature/refactor-phase-6-final-verification
  git tag -d refactor-phase-6-start
  ```

---

## 7. Manual QA Checklist

After the successful completion of all technical phases, a human must perform a final smoke test to ensure the application is fully functional from a user's perspective.

- **[ ] Start the Application:**
  - **Command:** `pnpm dev`
  - **Expected:** The client and server start without errors.
- **[ ] Basic Pages:**
  - **Action:** Open the application in a browser.
  - **Expected:** The home page and login page render correctly with all styles and assets.
- **[ ] Authentication:**
  - **Action:** Log in with a test user account.
  - **Expected:** Login is successful. The user is redirected to their dashboard.
- **[ ] Core Functionality (Forum):**
  - **Action:** Navigate to a forum, create a new thread, and post a reply.
  - **Expected:** All actions complete successfully. The new content appears correctly.
- **[ ] Core Functionality (Shoutbox/Chat):**
  - **Action:** Send a message in the shoutbox.
  - **Expected:** The message appears in real-time.
- **[ ] Developer Console:**
  - **Action:** Open the browser's developer console.
  - **Expected:** There are no critical runtime errors (404s, 500s, uncaught exceptions).
- **[ ] Final Merge:**
  - **Action:** If all checks pass, this branch is ready to be merged into `main`.
  - **Command:** `git checkout main && git merge feature/refactor-phase-6-final-verification`

This concludes the bulletproof refactoring plan.
  ```

---