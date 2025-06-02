# DegenTalk Project Launch Plan & Checklist

## MVP SPRINTS – Streamlined (May 2025)

### Phase 1: Core Functionality & Security

#### Wallet & Vault System *(Deferred)*
- **All wallet tasks are deferred until after core forum, XP, and shop features are complete.*

#### XP, DGT, and Authentication
- **[✅] Backend XP/DGT API, Admin Endpoints, and XP Triggers:**  
  *Complete. All core backend logic and endpoints for XP, DGT, and admin controls are implemented and wired up.*

- **[ ] Authentication System Finalization**
  - **Replace DevAuthProvider:** Remove all dev-only auth logic; use real AuthProvider everywhere.
  - **Login/Registration UI:**  
    *Status: Core forms and pages are implemented and wired to backend. Only polish and edge-case handling remain.*
  - **Session Management & Protected Routes:**  
    *Status: PostgreSQL session store is live. ProtectedRoute/AdminRoute are role-aware. Test persistence and access control.*

#### Forum Core
- **[ ] Forum Frontend Integration**
  - **Connect Components to Forum Page:**  
    *ThreadList, CategoryNavigation, and real API data are mostly wired. Finalize UI polish and error/loading states.*
  - **Thread View Page:**  
    *Thread and post display is functional. Add pagination, polish, and permission checks.*
  - **Thread Creation:**  
    *UI and API are connected. Add polish, validation, and success/error feedback.*

#### Admin Panel
- **[ ] Harden Admin Security**
  - **Implement RLS (Row Level Security):**  
    *Add PostgreSQL RLS policies for critical tables.*
  - **Standardize Auth Header Handling:**  
    *Audit all routes for consistent use of auth middleware and user info.*
  - **Fix Permission Checks:**  
    *Ensure all admin routes are protected and non-admins cannot access sensitive data.*

---

### Phase 2: Polish & Secondary Features

#### User Profile
- **[ ] Profile Editing:**  
  *Integrate inline editing on profile page, wire to backend PATCH endpoint.*
- **[ ] Inventory & Social Data:**  
  *Complete backend logic for inventory and relationships. Replace placeholders with real data.*
- **[ ] Recent Activity:**  
  *Add backend and frontend for recent user activity on profile.*
- **[ ] Rank Calculation:**  
  *Replace placeholder ranks with real calculations.*

#### Shop System
- **[ ] Finalize Purchase Flow:**  
  *Wire up purchase buttons, update balances, and inventory instantly.*
- **[ ] Inventory UI:**  
  *Show equipped items, allow use/sell, animate purchases.*

#### Admin Tools
- **[ ] Refactor Admin Layout & Navigation:**  
  *Move links to config, make role-aware, and add real permissions.*
- **[ ] Reusable Admin Components:**  
  *Extract tables, filters, pagination, and action menus into shared components.*
- **[ ] User/Content Management:**  
  *Make user, category, and thread management fully functional.*

#### Forum Polish
- **[ ] Simplify Routing:**  
  *Deprecate redundant forum pages, clarify forum/category distinction.*
- **[ ] Post Actions:**  
  *Wire up edit, delete, report, and quote actions with modals and permission checks.*
- **[ ] Unread Indicators:**  
  *Implement backend and frontend logic for unread threads/posts.*

---

### Phase 3: Testing & Cleanup

- **[ ] Replace Mock Data:**  
  *Remove all fallback/mock data from UI, rely on real API responses.*
- **[ ] Placeholder Cleanup:**  
  *Replace all placeholder pages/components with real implementations.*
- **[ ] Add Basic Tests:**  
  *Introduce unit/integration tests for critical backend and frontend logic.*
- **[ ] Code Cleanup:**  
  *Remove console logs, improve comments, and refactor as needed.*

---

## What's Next?
1. **Polish and finalize authentication/session flows.**
2. **Complete forum UI integration and polish.**
3. **Finish user profile editing, inventory, and social features.**
4. **Refactor and secure admin panel.**
5. **Enhance shop and inventory UI/UX.**
6. **Begin testing and code cleanup.**

---

**All completed tasks have been removed. Wallet/vault work is deferred. This plan is now focused on the remaining actionable sprints for a clean MVP launch.**
