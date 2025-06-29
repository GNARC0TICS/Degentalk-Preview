# Phase-1 ─ Visual Config Refactor & UX Upgrade

> Scope: Replace textarea-based JSON editors on `brand-config.tsx`, `feature-flags.tsx`, and `ui-config.tsx` with a dual-tab **Visual ⇄ Raw JSON** workflow powered by shared form primitives and Zod validation.

---

## 0. Pre-Flight Checklist

- [ ] Create dedicated branch `feat/visual-config-phase1`.
- [ ] Ensure all existing admin pages compile/CI green prior to refactor.
- [ ] Lock current config endpoints' contract (collect sample payloads for schemas).

---

## 1. Shared Foundation

### 1.1 Shared Components (`client/src/components/admin/form-controls`)

| Component | Description |
|-----------|-------------|
| `ColorPicker.tsx` | React-Colorful wrapper + Tailwind chip preview + hex input |
| `SwitchRow.tsx`  | Label \+ subtitle \+ Radix switch (accessibility first) |
| `ImageUpload.tsx`| Drag-drop zone, file validation, preview, delete handler |
| `JsonEditor.tsx` | Monaco-lite JSON editor with gutter error display |
| `InlineError.tsx`| Icon + message for schema errors / network failures |

Implementation tasks:
1. Scaffold directory & barrel export (`index.ts`).
2. Install `react-colorful`, `react-dropzone`, `@monaco-editor/react` (peer deps). Update `package.json` & lockfile.
3. Create unit tests for each component in `__tests__/form-controls/`.
4. Add storybook stories (if storybook present) else placeholder MDX examples in `README.md`.

### 1.2 Visual ⇄ JSON Tabs

File: `client/src/components/admin/VisualJsonTabs.tsx`

1. Use Radix `Tabs` to render `Visual` & `Raw JSON` triggers.
2. Props:
   ```ts
   interface VisualJsonTabsProps<T> {
     shapeSchema: ZodSchema<T>;
     value: T;
     onChange: (next: T) => void;
     loading?: boolean;
     children: (state: T, setState: (next: T) => void) => React.ReactNode;
   }
   ```
3. Internal state mirrors `value`. Debounced (500-750 ms) validation on both tab edits.
4. Visual tab renders `children` (builder UI). Raw tab renders `<JsonEditor>`.
5. If `shapeSchema.safeParse(state)` fails: 
   - Show red badge on Raw JSON tab
   - Inline error list via `<InlineError>` at top of editor.
6. Expose imperative `getErrors()` for parent pages (optional).
7. Add keyboard shortcut **Ctrl/Cmd + S** ➜ triggers parent save handler.

### 1.3 Hook: `useJsonConfig`

Location: `client/src/hooks/useJsonConfig.ts`

Tasks:
1. Accept endpoint string and schema.
2. Internally uses `apiRequest` (GET / PUT).
3. Returns `{ data, save(newData), reset(), loading, isDirty }`.
4. Implements optimistic save + toast feedback (`Saving…`, `Saved`, `Error`).
5. Edge-cases: 409 diff conflict ➜ prompt overwrite.

---

## 2. Zod Schemas & Types

| Schema File | Endpoint | Notes |
|-------------|----------|-------|
| `schemas/brand.schema.ts` | `/admin/brand-config` | Theme zones (primary, accent, banner) |
| `schemas/featureFlags.schema.ts` | `/admin/feature-flags` | Array of flags {key, description, isEnabled, rolloutPercentage} |
| `schemas/uiQuotes.schema.ts` | `/admin/ui-quotes` | Hero & footer quotes, weights, tags |

Tasks:
1. Generate files under `client/src/schemas/` (export `z` schema + TS type).
2. Add runtime validators to protect API responses (`assertValid` helper).
3. Update `scripts/validate-config` (if exists) to include new schemas.

---

## 3. Page Refactors

### 3.1 `brand-config.tsx`

1. Delete legacy textarea + BrandProvider usage.
2. Import `useJsonConfig<BrandConfig>` and `VisualJsonTabs`.
3. Build Visual tab UI:
   - Loop through `state.zones` keys.
   - For each zone render `ColorPicker` (primary & accent) + `ImageUpload` for banner.
4. Hook `save` on change.
5. Migrate routes if component path changes (update `shared/config/admin.config.ts`).

### 3.2 `feature-flags.tsx`

1. Move flag DTO to schema file.
2. Wrap existing table component inside `VisualJsonTabs` Visual tab.
   - Raw tab auto-populated.
3. Remove duplicate API calls; rely solely on `useJsonConfig`.
4. Replace `/api/feature-flags` service calls with PUT bulk save.
5. Add `SwitchRow` + slider for rollout % inside table rows.

### 3.3 `ui-config.tsx`

1. Limit Phase-1 to **Quotes** tab only (hero/footer).
2. Extract quote builder form into Visual tab.
3. Move `type`, `headline`, `subheader`, etc. fields into `state` via `useJsonConfig`.
4. Add "Import / Export JSON" buttons in Raw tab (utilising FileSaver / download-blob helper).
5. Remove on-the-fly network pagination (processing now client-side within config object).

---

## 4. Routing & Module Wiring

- Update `shared/config/admin.config.ts` module descriptors if component import paths moved.
- Ensure lazy imports still align e.g. `import('@/pages/admin/brand-config')`.
- Remove unused BrandContext provider files.
- Clean `client/src/contexts/BrandContext.tsx` if now redundant.

---

## 5. API Layer

- **Backend unchanged** (expects PUT full object). Confirm endpoints:
  - `PUT /admin/brand-config`
  - `PUT /admin/feature-flags`
  - `PUT /admin/ui-quotes`
- If PATCH diff-update exists, decide later; current hook will send full payload.
- Add mock fixtures for Cypress/e2e tests.

---

## 6. Tests

### 6.1 Unit Tests
- `VisualJsonTabs` validation → passes correct errors array.
- `useJsonConfig` optimistic save → sets `isDirty` flag & resets.

### 6.2 Component Tests (React Testing Library)
- BrandConfig page renders ColorPicker & changes propagate to Raw JSON.
- FeatureFlags toggling updates underlying JSON.

### 6.3 E2E (Cypress / Playwright)
- Admin logs in → edits brand primary color → saves → reload page → value persists.

---

## 7. ESLint / Style Cleanup

- Add rule: `@degen/no-admin-textarea-config` to prohibit raw `<textarea>` for JSON in admin pages.
- Prettier ignore for generated JSON editors (Monaco injects markup).

---

## 8. Documentation

- Update `docs/admin/user-guide.md` – new screenshots & instructions.
- Create `docs/admin/visual-config-workflow.md` explaining Visual/Raw tabs.
- Deprecate instructions referencing textarea editors.

---

## 9. Cleanup Tasks

- [ ] Delete `client/src/contexts/BrandContext.tsx` if no longer used.
- [ ] Remove unused hooks/services (`brandConfigApi`, individual flag fetchers).
- [ ] Purge dead CSS tied to old editors.
- [ ] Update CI snapshots & VRT baselines.

---

## 10. Deployment Gate

- Toggle feature flag `admin.visual-config` (if exists) to **enabled**.
- Announce to QA channel → regression checklist.
- Merge branch only after approval & green pipeline.

---

**End of Plan** 