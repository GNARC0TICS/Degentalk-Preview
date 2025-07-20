import React, { ReactNode, useState, Fragment } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search, ExternalLink, Bell, Menu, X, ChevronRight, Home } from 'lucide-react';
import { ModSidebar } from './mod-sidebar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbSeparator
} from '@/components/ui/breadcrumb';
import { Badge } from '@/components/ui/badge';

interface ModLayoutProps {
	children: ReactNode;
	title?: string;
}

export function ModLayout({ children, title = 'Dashboard' }: ModLayoutProps) {
	const location = useLocation();
	const [isSearchActive, setIsSearchActive] = useState(false);

	// Generate breadcrumbs based on the current location
	const generateBreadcrumbs = () => {
		const pathSegments = location.pathname.split('/').filter(Boolean);

		// Create breadcrumb items
		return (
			<BreadcrumbList>
				<BreadcrumbItem>
					<BreadcrumbLink asChild>
						<Link to="/mod" className="flex items-center">
							<Home className="h-3 w-3 mr-1" />
							<span>Mod</span>
						</Link>
					</BreadcrumbLink>
				</BreadcrumbItem>
				{pathSegments.slice(1).map((segment, index) => {
					// Create the path up to this segment
					const path = `/${pathSegments.slice(0, index + 2).join('/')}`;
					// Format segment name (capitalize first letter, replace hyphens with spaces)
					const formattedSegment = segment
						.replace(/-/g, ' ')
						.replace(/\b\w/g, (char) => char.toUpperCase());

					return (
						<Fragment key={path}>
							<BreadcrumbSeparator>
								<ChevronRight className="h-4 w-4" />
							</BreadcrumbSeparator>
							<BreadcrumbItem>
								{index === pathSegments.length - 2 ? (
									<BreadcrumbLink asChild>
										<Link to={path} className="text-primary hover:underline">
											{formattedSegment}
										</Link>
									</BreadcrumbLink>
								) : (
									<span className="text-zinc-400">{formattedSegment}</span>
								)}
							</BreadcrumbItem>
						</Fragment>
					);
				})}
			</BreadcrumbList>
		);
	};

	return (
		<div className="flex flex-col min-h-screen bg-zinc-900">
			{/* Mod header */}
			<header className="border-b border-zinc-800 bg-zinc-900 sticky top-0 z-50">
				<div className="container flex h-16 items-center px-4 sm:px-6">
					{/* Mobile menu button */}
					<Sheet>
						<SheetTrigger asChild>
							<Button variant="ghost" size="icon" className="md:hidden mr-2">
								<Menu className="h-5 w-5 text-zinc-400" />
								<span className="sr-only">Toggle menu</span>
							</Button>
						</SheetTrigger>
						<SheetContent side="left" className="p-0">
							<div className="flex flex-col h-full">
								<ModSidebar />
							</div>
						</SheetContent>
					</Sheet>

					<Link to="/mod" className="mr-6 flex items-center space-x-2">
						<span className="font-bold text-primary">Degentalk Moderator</span>
					</Link>

					{/* Breadcrumbs */}
					<div className="hidden md:flex items-center text-sm text-zinc-400">
						{generateBreadcrumbs()}
					</div>

					<div className="flex-1 flex items-center justify-end space-x-4">
						{/* User avatar */}
						<Avatar className="h-8 w-8">
							<AvatarFallback className="bg-primary/20 text-primary">
								{/* Mock user placeholder */}
							</AvatarFallback>
						</Avatar>

						{/* View site button */}
						<Link to="/">
							<Button
								variant="outline"
								size="sm"
								className="border-zinc-800 hover:bg-zinc-800 hover:text-white text-zinc-400"
							>
								<ExternalLink className="h-4 w-4 mr-2" />
								<span>View Site</span>
							</Button>
						</Link>
					</div>
				</div>
			</header>

			{/* Mod content */}
			<div className="flex-1 flex">
				{/* Sidebar - desktop only */}
				<div className="hidden md:block">
					<ModSidebar />
				</div>

				{/* Main content */}
				<main className="flex-1 p-6 overflow-auto">{children}</main>
			</div>
		</div>
	);
}
