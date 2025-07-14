/**
 * Admin Components Export Barrel
 *
 * Centralized exports for all admin UI components
 */

// Main Dashboard
export { AdminDashboard } from './AdminDashboard';
export { AdminThemeProvider } from './AdminThemeProvider';
export { ModularAdminLayout } from './ModularAdminLayout';
export { ModularAdminSidebar } from './ModularAdminSidebar';

// Layout Components
export { AdminPageShell } from './layout/AdminPageShell';
export { EntityTable } from './layout/EntityTable';
export { EntityFilters } from './layout/EntityFilters';

// Form Controls
export { ColorPicker } from './form-controls/ColorPicker';
export { ImageUpload } from './form-controls/ImageUpload';
export { JsonEditor } from './form-controls/JsonEditor';
export { SwitchRow } from './form-controls/SwitchRow';

// Common Components
export { AdminDataTable } from './common/AdminDataTable';
export { VisualJsonTabs } from './VisualJsonTabs';

// Protected Route
export { default as ProtectedAdminRoute } from '@admin/components/protected-admin-route';
