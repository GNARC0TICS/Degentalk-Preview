# 🏦 Forum Management and Configuration Workflow

This document outlines the canonical process for managing the forum structure in Degentalk. Adhering to this workflow is critical for maintaining data integrity and ensuring a predictable, version-controlled system.

## 🏛️ Core Philosophy: Config as the Source of Truth

The entire forum structure—including all zones, forums, and their properties (rules, themes, etc.)—is defined in a single file: `client/src/config/forumMap.config.ts`.

**This file is the absolute source of truth.**

The database `forum_structure` table is merely a performance-optimized, relational reflection of this configuration. The backend application reads from the database for speed, but all changes *must* originate from the configuration file.

This approach provides several key benefits:
-   **Version Control:** Your forum's entire structure is tracked in Git. You can view its history, revert changes, and use pull requests to review and approve modifications.
-   **Predictability:** Changes are not made directly to a live database. They are planned, reviewed, and deployed systematically.
-   **Safety:** The workflow includes a `dry-run` mode to preview all changes before they are applied, preventing accidental data loss or misconfiguration.

---

## Workflow: Modifying the Forum Structure

The following is the standard operational procedure for making any change to the forum layout.

### Step 1: Modify the Configuration File

All changes begin by editing `client/src/config/forumMap.config.ts`. This includes:
-   Adding a new zone or forum.
-   Renaming an existing forum.
-   Changing the position of a zone.
-   Updating the rules or theme for a forum.
-   Removing a forum.

### Step 2: Preview Changes with a Dry Run

Before applying any changes to a database, perform a "dry run" from your local development environment. This command will simulate the entire synchronization process and log every `CREATE`, `UPDATE`, and `ARCHIVE` action it would perform, without actually executing them.

Run the following command from the project root:

```bash
pnpm db:sync:forums --dry-run
```

Review the output carefully to ensure the planned changes match your intentions.

**Example Dry Run Output:**
```
INFO: [ForumStructureService] Starting forum config sync (Dry Run: true)
INFO: [ForumStructureService] Updating forum/zone: live-trade-reacts
INFO: [ForumStructureService] Creating forum/zone: new-meme-forum
INFO: [ForumStructureService] Archiving forum/zone: old-strategy-forum
INFO: [ForumStructureService] Dry run finished. No changes were made.
INFO: [ForumStructureService] Forum config sync finished. { created: 1, updated: 1, archived: 1 }
```

### Step 3: Commit and Deploy

Once you have verified that the dry run is correct, commit the changes to `forumMap.config.ts`. This creates a permanent, version-controlled record of the change.

### Step 4: Execute the Sync in Production

Immediately following the deployment of the code containing the updated config file, the live synchronization must be run against the production database.

Run the following command from the production environment:

```bash
pnpm db:sync:forums
```

This will execute the database transaction, applying all changes atomically. The service's in-memory cache is automatically cleared, and the new forum structure will be live immediately.

---

##  будущего (Future): Admin-Driven Workflow

The ultimate goal is to allow administrators to manage this configuration from a dedicated admin panel. The `syncFromConfig` service was built specifically to support this.

The future workflow will involve:
1.  An **Admin Panel UI** for visually editing the forum structure.
2.  A secure API endpoint (e.g., `POST /api/admin/forums/sync`).
3.  When an admin saves changes, the system will **programmatically update the `forumMap.config.ts` file via a pull request**, preserving the Git-based source of truth. The production sync will occur after the PR is reviewed and merged.
4.  This ensures that even admin-driven changes are version-controlled, reviewed, and deployed safely.

---

## ⚠️ Important Notes

-   **Never modify the `forum_structure` table directly.** Doing so will cause the database to be out of sync with the configuration file, and your changes will be overwritten during the next official sync.
-   **Archiving vs. Deleting:** When a forum is removed from the config file, it is "soft-deleted" in the database by setting its `isHidden` flag to `true`. This preserves all of its associated content (threads, posts) while hiding it from the user interface.
-   **Run the sync after every deployment** that includes a change to `forumMap.config.ts` to ensure the live state reflects the configuration. 