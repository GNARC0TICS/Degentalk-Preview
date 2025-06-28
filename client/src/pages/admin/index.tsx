/**
 * Admin Dashboard Page
 *
 * Uses the new modular AdminDashboard component which provides:
 * - Real-time module status overview
 * - Quick access to core admin functions
 * - System health monitoring
 * - Featured modules based on priority
 */

import AdminDashboard from '@/components/admin/AdminDashboard';

export default function AdminDashboardPage() {
	return <AdminDashboard />;
}
