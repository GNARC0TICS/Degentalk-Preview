import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'; // Assuming shadcn/ui tabs
import { cn } from '@/lib/utils';

export interface TabConfig {
	// Export TabConfig
	value: string;
	label: string;
	icon?: React.ReactNode;
	content: React.ReactNode;
}

interface AdminPageShellProps {
	title: string;
	breadcrumb?: React.ReactNode;
	pageActions?: React.ReactNode;
	tabsConfig?: TabConfig[];
	activeTab?: string;
	onTabChange?: (value: string) => void;
	children?: React.ReactNode; // To be used if not using tabs, or as a fallback
	className?: string;
}

export function AdminPageShell({
	title,
	breadcrumb,
	pageActions,
	tabsConfig,
	activeTab,
	onTabChange,
	children,
	className
}: AdminPageShellProps) {
	// TODO: Implement scroll restoration if needed

	const defaultActiveTab = tabsConfig?.[0]?.value;
	const currentActiveTab = activeTab || defaultActiveTab;

	return (
		<div className={cn('px-4 md:px-8 py-6 space-y-6', className)}>
			{/* Header Section */}
			<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
				<div>
					{breadcrumb && <div className="mb-1 text-sm text-admin-text-secondary">{breadcrumb}</div>}
					<h1 className="text-2xl md:text-3xl font-bold text-admin-text-primary">{title}</h1>
				</div>
				{pageActions && (
					<div className="flex flex-wrap gap-2 justify-start md:justify-end">{pageActions}</div>
				)}
			</div>

			{/* Tabs Section or Direct Children */}
			{tabsConfig && tabsConfig.length > 0 && currentActiveTab ? (
				<Tabs value={currentActiveTab} onValueChange={onTabChange} className="w-full">
					<TabsList className="bg-admin-surface border border-admin-border-subtle">
						{tabsConfig.map((tab) => (
							<TabsTrigger
								key={tab.value}
								value={tab.value}
								className="data-[state=active]:bg-admin-bg-element data-[state=active]:text-admin-text-accent"
							>
								{tab.icon && <span className="mr-2 h-4 w-4">{tab.icon}</span>}
								{tab.label}
							</TabsTrigger>
						))}
					</TabsList>
					{tabsConfig.map((tab) => (
						<TabsContent key={tab.value} value={tab.value} className="mt-6">
							{tab.content}
						</TabsContent>
					))}
				</Tabs>
			) : (
				children
			)}
		</div>
	);
}
