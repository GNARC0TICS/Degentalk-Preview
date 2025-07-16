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
export { AdminPageShell } from '@/features/admin/layout/layout/AdminPageShell';
export { EntityTable } from '@/features/admin/layout/layout/EntityTable';
export { EntityFilters } from '@/features/admin/layout/layout/EntityFilters';

// Form Controls
export { ColorPicker } from './form-controls/ColorPicker';
export { ImageUpload } from './form-controls/ImageUpload';
export { JsonEditor } from './form-controls/JsonEditor';
export { SwitchRow } from './form-controls/SwitchRow';

// Common Components
export { AdminDataTable } from './common/AdminDataTable';
export { VisualJsonTabs } from './VisualJsonTabs';

// Protected Route
export { default as ProtectedAdminRoute } from './protected-admin-route';
