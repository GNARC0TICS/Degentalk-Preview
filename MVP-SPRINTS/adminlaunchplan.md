# DegenTalk Admin Panel Launch Plan (Streamlined)

## Current Status Summary (May 2025)

The admin panel needs significant work to achieve a robust, secure, and maintainable state for MVP launch. This document outlines the remaining tasks in order of priority.

### Core Issues to Address:

1. **Componentization:** Few reusable admin components exist, causing high redundancy and inconsistent implementation.
2. **Security & Permissions:** Admin routes need proper protection and role-based access control.
3. **Functionality Gaps:** Many admin pages display data but lack core action capabilities.

## Phase 1: Foundation & Structure

- **[ ] Refactor Admin Layout & Navigation**
  - Move hardcoded admin links to a configuration file
  - Make navigation role-aware (show links based on permissions)
  - Implement functional search or remove placeholder
  - Files: `client/src/pages/admin/admin-layout.tsx`, create `client/src/config/admin-routes.ts`

- **[ ] Create Reusable Admin Components**
  - Extract common UI patterns into shared components:
    - Data tables with filtering/sorting
    - Action menus and confirmation dialogs
    - Pagination controls
    - Form sections and card layouts
  - Files: Create components in `client/src/components/admin/`

- **[ ] Implement Pagination & Filtering**
  - Create proper pagination with page links and count display
  - Add functional filter dropdowns that update API queries
  - Files: Create reusable pagination and filter components

## Phase 2: Core Management Features

- **[ ] User Management Actions**
  - Wire up user actions (Edit, Ban/Unban, Role Change, Delete)
  - Implement confirmation dialogs and success feedback
  - Connect to backend API endpoints
  - Files: Update `client/src/pages/admin/users.tsx`

- **[ ] Category Management**
  - Make the categories page fully functional
  - Add, edit, and delete categories with proper validation
  - Connect to backend API endpoints
  - Files: Update `client/src/pages/admin/categories.tsx`

- **[ ] Thread Moderation**
  - Implement thread listing with search and filtering
  - Add moderation actions (delete, lock, pin)
  - Files: Update `client/src/pages/admin/threads.tsx`

## Phase 3: XP & Economy Management

- **[ ] XP & DGT Admin Panels**
  - Create interfaces for managing:
    - XP actions and values
    - Level thresholds and rewards
    - User manual adjustments
    - Store items and pricing
  - Connect to existing backend endpoints
  - Files: Create components in `client/src/pages/admin/xp/` and `/dgt/`

- **[ ] Shop Management**
  - Build interface for creating and managing shop items
  - Add image upload for item icons
  - Implement price and inventory controls
  - Files: Create `client/src/pages/admin/shop/items.tsx`

## Phase 4: Moderation & Reports

- **[ ] Reports Management**
  - Create interface for viewing and handling user reports
  - Implement actions (dismiss, take action, escalate)
  - Files: Create `client/src/pages/admin/reports.tsx`

- **[ ] Announcements**
  - Build announcements editor with rich text support
  - Add publish/unpublish controls and scheduling
  - Files: Create `client/src/pages/admin/announcements/`

## Phase 5: Security & Testing

- **[ ] Integrate Real Permissions**
  - Replace mocked permissions with actual user role data
  - Implement client-side route guards based on permissions
  - Files: Update `client/src/pages/admin/admin-layout.tsx`, integrate with auth context

- **[ ] Verify Backend Security**
  - Audit all admin API routes for proper middleware protection
  - Ensure consistent use of `isAdmin` checks
  - Files: Review all routes in `server/` with `/admin/` endpoints

- **[ ] Add Basic Admin Tests**
  - Write integration tests for critical admin flows
  - Test security boundaries and access control
  - Files: Create test files for admin components and pages

---

## Implementation Priorities

1. **First:** Reusable components and layout structure
2. **Second:** User, category, and thread management 
3. **Third:** XP/DGT admin panels and shop management
4. **Fourth:** Reports and announcements
5. **Fifth:** Permissions and security hardening

This streamlined plan focuses on the most critical aspects needed for a secure and functional admin panel at MVP launch.
