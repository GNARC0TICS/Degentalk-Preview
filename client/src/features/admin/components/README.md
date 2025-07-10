# Admin Components

This directory (`client/src/components/admin/`) houses reusable React components tailored for the Degentalk Admin Panel. The goal is to promote consistency and accelerate the development of new admin interfaces.

## Structure

Components are typically organized into subdirectories based on their function:

- `inputs/`: Contains specialized input controls for admin forms (e.g., role selectors, toggles with admin-specific styling or behavior).
- `layout/`: Components related to the overall structure and layout of admin pages (e.g., specialized cards, section wrappers).
- `shared/` (example, create if needed): For other general-purpose admin components that don't fit neatly into other categories.

## Key Reusable Components

### 1. `inputs/AdminToggle.tsx`

- **Purpose**: A standardized toggle switch component for admin settings.
- **Features**: Provides a consistent look and feel for boolean settings. It typically includes a label and an optional description, built upon ShadCN's `Switch` component.
- **Props**:
  - `id: string`: HTML ID for the toggle.
  - `label: React.ReactNode`: The primary label for the toggle.
  - `description?: React.ReactNode`: Optional helper text displayed below the label.
  - `checked: boolean`: Current state of the toggle.
  - `onCheckedChange: (checked: boolean) => void`: Callback function when the toggle state changes.
  - `disabled?: boolean`: Whether the toggle is disabled.
  - `className?: string`: Additional CSS classes for the wrapper.
- **Usage**:
  ```tsx
  <AdminToggle
  	id="feature-enabled"
  	label="Enable Feature X"
  	description="Toggles the availability of Feature X site-wide."
  	checked={settings.featureXEnabled}
  	onCheckedChange={(isChecked) => updateSetting('featureXEnabled', isChecked)}
  />
  ```

### 2. `inputs/AdminAccessSelector.tsx`

- **Purpose**: A multi-select popover component for assigning access permissions based on user roles.
- **Features**: Fetches available roles from the `/api/admin/roles` endpoint. Allows selection of multiple role IDs. Useful for configuring which roles can view, post, or perform other actions.
- **Props**:
  - `selectedRoleIds: number[]`: An array of currently selected role IDs.
  - `onSelectionChange: (selectedIds: number[]) => void`: Callback function when the selection changes.
  - `availableRoles?: Role[]`: Optionally, you can pass the list of roles if already fetched. Otherwise, it fetches internally.
  - `isLoading?: boolean`: If `availableRoles` are being fetched externally, use this to show a loading state.
  - `triggerLabel?: string`: Label for the selection trigger button (defaults to "Select Roles").
  - `disabled?: boolean`: Whether the selector is disabled.
  - `className?: string`: Additional CSS classes for the wrapper.
- **Usage**:
  ```tsx
  <AdminAccessSelector
  	selectedRoleIds={currentAccessSettings.canView}
  	onSelectionChange={(ids) => handleAccessChange('canView', ids)}
  />
  ```

### 3. `layout/AdminSectionCard.tsx` (Example - Create if it exists or is planned)

- **Purpose**: A standardized card component for grouping related settings or information within an admin page.
- **Features**: Provides consistent styling, including a title, optional description, and content area.
- **Props**:
  - `title: string`: The title of the section.
  - `description?: string`: An optional description or introduction for the section.
  - `children: React.ReactNode`: The content of the card.
  - `className?: string`: Additional CSS classes.
- **Usage**:
  ```tsx
  <AdminSectionCard title="User Management" description="Configure user roles and permissions.">
  	{/* ... user management form elements ... */}
  </AdminSectionCard>
  ```

## Best Practices

- **Reusability**: When creating a new admin UI element, consider if it can be generalized and added to this directory.
- **Consistency**: Leverage existing components here to maintain a uniform look and feel across the admin panel.
- **Props Design**: Design component props to be clear and flexible.
- **Accessibility**: Ensure components are accessible (e.g., proper ARIA attributes, keyboard navigation).

By centralizing these shared admin components, we can build a more robust and maintainable admin interface.
