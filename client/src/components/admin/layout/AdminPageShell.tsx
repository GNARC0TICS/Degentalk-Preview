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
	const defaultActiveTab = tabsConfig?.[0]?.value;
	const currentActiveTab = activeTab || defaultActiveTab;

	return (
		<div className={cn('px-4 sm:px-6 md:px-8 py-4 md:py-6 space-y-4 md:space-y-6', className)}>
			{/* Header Section */}
			<div className="flex flex-col sm:flex-row sm:items-start md:items-center md:justify-between gap-3 md:gap-4">
				<div className="min-w-0 flex-1">
					{breadcrumb && <div className="mb-1 text-sm text-admin-text-secondary">{breadcrumb}</div>}
					<h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-admin-text-primary truncate">
						{title}
					</h1>
				</div>
				{pageActions && (
					<div className="flex flex-wrap gap-2 justify-start sm:justify-end shrink-0">
						{pageActions}
					</div>
				)}
			</div>

			{/* Tabs Section or Direct Children */}
			{tabsConfig && tabsConfig.length > 0 && currentActiveTab ? (
				<Tabs value={currentActiveTab} onValueChange={onTabChange} className="w-full">
					<TabsList className="bg-admin-surface border border-admin-border-subtle w-full justify-start overflow-x-auto">
						{tabsConfig.map((tab) => (
							<TabsTrigger
								key={tab.value}
								value={tab.value}
								className="data-[state=active]:bg-admin-bg-element data-[state=active]:text-admin-text-accent whitespace-nowrap"
							>
								{tab.icon && <span className="mr-1 sm:mr-2 h-4 w-4 shrink-0">{tab.icon}</span>}
								<span className="hidden sm:inline">{tab.label}</span>
								<span className="sm:hidden">{tab.label.split(' ')[0]}</span>
							</TabsTrigger>
						))}
					</TabsList>
					{tabsConfig.map((tab) => (
						<TabsContent key={tab.value} value={tab.value} className="mt-4 md:mt-6">
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
