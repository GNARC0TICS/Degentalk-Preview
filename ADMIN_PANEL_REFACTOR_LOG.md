# ADMIN PANEL REFACTOR LOG

---

## Overview

This document tracks all findings, scopes, priorities, and recommended fixes from the ongoing admin panel audit. It is updated at each checkpoint and serves as a master checklist and deprecation log.

---

## 1. Sidebar/Navigation Components

### Canonical Sidebar

- **File:** `client/src/components/admin/admin-sidebar.tsx`
- **Status:** Canonical, KEEP. Should be used everywhere in the admin panel.

### Deprecated Sidebars

- **File:** `client/src/components/admin/simple-admin-sidebar.tsx`
- **Status:** DEPRECATED. Already marked as such. Safe to remove after confirming no usages.

### Other Sidebars

- **Files:** `client/src/components/layout/sidebar.tsx`, `client/src/components/ui/sidebar.tsx`, etc.
- **Status:** Not relevant to admin panel refactor (used for forum/general UI).

---

## 2. Layout Wrappers

### Canonical Admin Layout

- **File:** `client/src/pages/admin/admin-layout.tsx`
- **Status:** Canonical, KEEP. Should be the only admin layout.

### Deprecated Layouts

- **No redundant admin layout wrappers detected.**

---

## 3. Page-by-Page Layout/Sidebar Usage

| File                        | Uses AdminLayout? | Manual Sidebar? | Priority | Fix/Recommendation                                  |
|-----------------------------|-------------------|-----------------|----------|-----------------------------------------------------|
| index.tsx                   | ❌                | ❌              | HIGH     | Wrap all content in `<AdminLayout>`                 |
| categories.tsx              | ❌                | ❌              | HIGH     | Wrap all content in `<AdminLayout>`                 |
| cooldowns.tsx               | ✅                | ❌              | OK       | No action needed                                    |
| treasury.tsx                | Partial (loading) | ❌              | HIGH     | Wrap all main content in `<AdminLayout>`            |
| ...                         | ...               | ...             | ...      | ...                                                 |

_(Continue to fill this table as each file is audited)_

---

## 4. Deprecation Log

- [x] `client/src/components/admin/simple-admin-sidebar.tsx`  
  - **Reason:** Superseded by `admin-sidebar.tsx`.  
  - **Action:** Remove after confirming no usages.

---

## 5. Next Steps

- Continue file-by-file audit for all admin pages.
- For each, check for:
  - Usage of `AdminLayout` (should be present).
  - Any manual/duplicate sidebar or navigation logic (should be removed).
  - Consistent spacing/layout (should use shared utilities, not manual margins everywhere).
- Update this log at each checkpoint.

---

## 6. Notes

- This document is a living log. Update after every audit checkpoint.
- Use as a master checklist for implementation and deprecation tracking.
