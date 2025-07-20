import { Link } from 'react-router-dom';
import { ChevronRight, Home, Layers, FolderOpen } from 'lucide-react';
import { ROUTES } from '@/constants/routes';

export interface BreadcrumbItem {
	label: string;
	href: string;
	icon?: React.ReactNode;
}

interface BreadcrumbNavProps {
	items: BreadcrumbItem[];
	className?: string;
}

export function BreadcrumbNav({ items, className = '' }: BreadcrumbNavProps) {
	// Default home item that will always be first
	const defaultItems: BreadcrumbItem[] = [
		{
			label: 'Home',
			href: ROUTES.HOME,
			icon: <Home className="h-4 w-4" />
		},
		{
			label: 'Forums',
			href: ROUTES.FORUMS,
			icon: <Layers className="h-4 w-4" />
		}
	];

	// Combine default items with passed items, but skip duplicates
	const allItems = [
		...defaultItems.filter((defaultItem) => !items.some((item) => item.href === defaultItem.href)),
		...items
	];

	return (
		<nav className={`flex text-sm ${className}`} aria-label="Breadcrumb">
			<ol className="flex flex-wrap items-center space-x-2">
				{allItems.map((item, index) => {
					const isLast = index === allItems.length - 1;

					return (
						<li key={item.href} className="flex items-center">
							{index > 0 && <ChevronRight className="h-4 w-4 mx-1 text-zinc-500 flex-shrink-0" />}

							{isLast ? (
								<span className="flex items-center gap-1.5 font-medium text-zinc-200">
									{item.icon || <FolderOpen className="h-4 w-4 text-amber-500" />}
									<span>{item.label}</span>
								</span>
							) : (
								<Link
									to={item.href}
									className="flex items-center gap-1.5 text-zinc-400 hover:text-zinc-200 transition-colors"
								>
									{item.icon || <FolderOpen className="h-4 w-4 text-zinc-500" />}
									<span>{item.label}</span>
								</Link>
							)}
						</li>
					);
				})}
			</ol>
		</nav>
	);
}
