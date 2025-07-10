/**
 * Admin Layout with Modular Navigation
 *
 * Integrates the new ModularAdminLayout for a cohesive admin experience
 * with collapsible sidebar, permission-aware navigation, and status indicators.
 */

import type { ReactNode } from 'react';
import ModularAdminLayout from '@/features/admin/components/ModularAdminLayout';

interface AdminLayoutProps {
	children: ReactNode;
}

/**
 * Admin Layout using the new ModularAdminLayout system
 *
 * This layout provides:
 * - Permission-aware modular navigation
 * - Collapsible sidebar with mobile support
 * - Status indicators for module health
 * - Dynamic route generation from AdminModuleRegistry
 */
export default function AdminLayout({ children }: AdminLayoutProps) {
	return <ModularAdminLayout>{children}</ModularAdminLayout>;
}
