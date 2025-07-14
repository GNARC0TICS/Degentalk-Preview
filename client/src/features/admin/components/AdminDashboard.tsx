/**
 * Admin Dashboard Component
 *
 * The main dashboard that shows an overview of all admin modules,
 * their status, and quick access to key functions.
 */

import { useMemo } from 'react';
import { Link } from 'wouter';
import {
	TrendingUp,
	Users,
	Activity,
	AlertCircle,
	CheckCircle,
	Clock,
	Zap,
	BarChart3,
	Settings,
	Shield,
	ExternalLink,
	type LucideIcon
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAdminModules } from '@/hooks/use-admin-modules';
import { useAuth } from '@/hooks/use-auth';
import { getModuleStatusInfo } from '@admin/lib/admin-utils';
import type { AdminModule } from '@shared/config/admin.config';

// Quick stats interface
interface QuickStat {
	title: string;
	value: string | number;
	change?: string;
	icon: LucideIcon;
	color: string;
}

// Icon mapping for status
const statusIcons = {
	active: CheckCircle,
	disabled: AlertCircle,
	maintenance: Clock,
	beta: Zap,
	error: AlertCircle
};

export default function AdminDashboard() {
	const { user } = useAuth();
	const { modules, enabledModules, isLoading } = useAdminModules();

	// Calculate dashboard statistics
	const stats: QuickStat[] = useMemo(
		() => [
			{
				title: 'Total Modules',
				value: modules.length,
				icon: Settings,
				color: 'text-blue-600'
			},
			{
				title: 'Active Modules',
				value: enabledModules.length,
				change: `${Math.round((enabledModules.length / modules.length) * 100)}% enabled`,
				icon: CheckCircle,
				color: 'text-green-600'
			},
			{
				title: 'Admin Access',
				value: user?.role === 'admin' ? 'Full' : 'Limited',
				icon: Shield,
				color: user?.role === 'admin' ? 'text-emerald-600' : 'text-yellow-600'
			},
			{
				title: 'System Status',
				value: 'Operational',
				icon: Activity,
				color: 'text-green-600'
			}
		],
		[modules, enabledModules, user]
	);

	// Group modules by status
	const modulesByStatus = useMemo(() => {
		const grouped = modules.reduce(
			(acc, module) => {
				const { status } = getModuleStatusInfo(module);
				if (!acc[status]) acc[status] = [];
				acc[status].push(module);
				return acc;
			},
			{} as Record<string, AdminModule[]>
		);

		return grouped;
	}, [modules]);

	// Get featured modules (high priority, enabled modules)
	const featuredModules = useMemo(() => {
		return enabledModules
			.filter((module) => module.order < 50) // Core modules
			.sort((a, b) => a.order - b.order)
			.slice(0, 6);
	}, [enabledModules]);

	if (isLoading) {
		return (
			<div className="p-8">
				<div className="animate-pulse space-y-6">
					<div className="h-8 bg-admin-element rounded w-1/3"></div>
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
						{[1, 2, 3, 4].map((i) => (
							<div key={i} className="h-32 bg-admin-element rounded"></div>
						))}
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="p-8 space-y-8">
			{/* Welcome Header */}
			<div className="space-y-2">
				<h1 className="text-3xl font-bold text-admin-text-primary">
					Welcome back, {user?.username || 'Admin'}
				</h1>
				<p className="text-admin-text-secondary">
					Manage your platform with {modules.length} available admin modules
				</p>
			</div>

			{/* Quick Stats */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
				{stats.map((stat, index) => {
					const Icon = stat.icon;
					return (
						<Card
							key={index}
							className="hover:shadow-lg transition-shadow bg-admin-surface border-admin-border"
						>
							<CardContent className="p-6">
								<div className="flex items-center justify-between">
									<div className="space-y-1">
										<p className="text-sm font-medium text-admin-text-secondary">{stat.title}</p>
										<p className="text-2xl font-bold text-admin-text-primary">{stat.value}</p>
										{stat.change && (
											<p className="text-xs text-admin-text-secondary">{stat.change}</p>
										)}
									</div>
									<Icon className={`w-8 h-8 ${stat.color}`} />
								</div>
							</CardContent>
						</Card>
					);
				})}
			</div>

			{/* Featured Modules */}
			<div className="space-y-4">
				<div className="flex items-center justify-between">
					<h2 className="text-xl font-semibold text-admin-text-primary">Quick Access</h2>
					<Badge
						variant="outline"
						className="text-xs border-admin-border text-admin-text-secondary"
					>
						{featuredModules.length} modules
					</Badge>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					{featuredModules.map((module) => {
						const statusInfo = getModuleStatusInfo(module);
						const StatusIcon = statusIcons[statusInfo.status];

						return (
							<Card
								key={module.id}
								className="hover:shadow-lg transition-shadow group bg-admin-surface border-admin-border"
							>
								<CardHeader className="pb-3">
									<div className="flex items-center justify-between">
										<CardTitle className="text-base flex items-center gap-2 text-admin-text-primary">
											<div className="w-8 h-8 rounded-lg bg-admin-text-accent/10 flex items-center justify-center">
												{/* You could add actual icons here based on module.icon */}
												<div className="w-4 h-4 rounded bg-admin-text-accent text-white text-xs flex items-center justify-center">
													{module.name.charAt(0)}
												</div>
											</div>
											{module.name}
										</CardTitle>
										<div className={`p-1 rounded-full ${statusInfo.bg}`}>
											<StatusIcon className={`w-3 h-3 ${statusInfo.icon}`} />
										</div>
									</div>
									{module.description && (
										<p className="text-sm text-admin-text-secondary line-clamp-2">
											{module.description}
										</p>
									)}
								</CardHeader>
								<CardContent className="pt-0">
									<div className="flex items-center justify-between">
										<div className="flex items-center gap-2">
											<Badge
												variant={statusInfo.status === 'active' ? 'default' : 'secondary'}
												className={`text-xs ${statusInfo.bg} ${statusInfo.text} border-0`}
											>
												{statusInfo.label}
											</Badge>
											{module.settings?.beta && (
												<Badge
													variant="outline"
													className="text-xs border-admin-border text-admin-text-secondary"
												>
													Beta
												</Badge>
											)}
										</div>
										<Button
											asChild
											size="sm"
											variant="ghost"
											className="opacity-0 group-hover:opacity-100 transition-opacity text-admin-text-secondary hover:text-admin-text-accent"
										>
											<Link href={module.route}>
												<ExternalLink className="w-3 h-3 mr-1" />
												Open
											</Link>
										</Button>
									</div>
								</CardContent>
							</Card>
						);
					})}
				</div>
			</div>

			{/* Module Status Overview */}
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
				{/* Active Modules */}
				<Card className="bg-admin-surface border-admin-border">
					<CardHeader>
						<CardTitle className="flex items-center gap-2 text-admin-text-primary">
							<CheckCircle className="w-5 h-5 text-admin-status-ok" />
							Active Modules ({modulesByStatus.active?.length || 0})
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="space-y-2 max-h-64 overflow-y-auto">
							{modulesByStatus.active?.map((module) => (
								<div
									key={module.id}
									className="flex items-center justify-between p-2 hover:bg-admin-surface-hover rounded transition-colors"
								>
									<span className="text-sm font-medium text-admin-text-primary">{module.name}</span>
									<Button
										asChild
										size="sm"
										variant="ghost"
										className="text-admin-text-secondary hover:text-admin-text-accent"
									>
										<Link href={module.route}>
											<ExternalLink className="w-3 h-3" />
										</Link>
									</Button>
								</div>
							)) || <p className="text-sm text-admin-text-secondary italic">No active modules</p>}
						</div>
					</CardContent>
				</Card>

				{/* System Health */}
				<Card className="bg-admin-surface border-admin-border">
					<CardHeader>
						<CardTitle className="flex items-center gap-2 text-admin-text-primary">
							<BarChart3 className="w-5 h-5 text-admin-text-accent" />
							System Health
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="space-y-4">
							<div className="flex justify-between items-center">
								<span className="text-sm text-admin-text-secondary">Module Coverage</span>
								<span className="text-sm font-medium text-admin-text-primary">
									{Math.round((enabledModules.length / modules.length) * 100)}%
								</span>
							</div>

							<div className="flex justify-between items-center">
								<span className="text-sm text-admin-text-secondary">Permission System</span>
								<Badge className="text-xs bg-admin-status-ok/10 text-admin-status-ok border-admin-status-ok/20">
									Active
								</Badge>
							</div>

							<div className="flex justify-between items-center">
								<span className="text-sm text-admin-text-secondary">Route Protection</span>
								<Badge className="text-xs bg-admin-status-ok/10 text-admin-status-ok border-admin-status-ok/20">
									Enabled
								</Badge>
							</div>

							{modulesByStatus.disabled && modulesByStatus.disabled.length > 0 && (
								<div className="flex justify-between items-center">
									<span className="text-sm text-admin-text-secondary">Disabled Modules</span>
									<Badge className="text-xs bg-admin-status-warning/10 text-admin-status-warning border-admin-status-warning/20">
										{modulesByStatus.disabled.length}
									</Badge>
								</div>
							)}
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Recent Activity - Placeholder for future implementation */}
			<Card className="bg-admin-surface border-admin-border">
				<CardHeader>
					<CardTitle className="flex items-center gap-2 text-admin-text-primary">
						<Activity className="w-5 h-5 text-admin-text-accent" />
						Recent Activity
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="text-center py-8">
						<Activity className="w-12 h-12 mx-auto mb-4 opacity-50 text-admin-text-secondary" />
						<p className="text-admin-text-secondary">Activity tracking will be available soon</p>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
