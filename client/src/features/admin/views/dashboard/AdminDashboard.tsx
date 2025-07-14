/**
 * Admin Dashboard Page
 *
 * Uses the new modular AdminDashboard component which provides:
 * - Real-time module status overview
 * - Quick access to core admin functions
 * - System health monitoring
 * - Featured modules based on priority
 */

import AdminDashboard from '@/features/admin/components/AdminDashboard';
import { RequireAdmin } from '@/components/auth';

export default function AdminDashboardPage() {
	return (
		<RequireAdmin>
			<AdminDashboard />
		</RequireAdmin>
	);
}
