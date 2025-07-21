import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { generateSidebarLinks } from '@/config/admin.config';

const adminLinks = generateSidebarLinks();

interface SimpleMenuProps {
	onItemClick?: () => void;
}

type NavItem = (typeof adminLinks)[number] & { depth?: number };

export default function SimpleMenu({ onItemClick }: SimpleMenuProps) {
	const location = useLocation();

	const renderLink = (item: NavItem) => {
		const isActive = location.pathname === item.href || (item.href && location.pathname.startsWith(item.href));

		return (
			<Link
				key={item.href}
				to={item.href!}
				onClick={onItemClick}
				className={`flex items-center px-4 py-3 text-sm rounded transition-colors ${
					isActive ? 'bg-emerald-500 text-white' : 'hover:bg-gray-800'
				} ${item.depth && item.depth > 0 ? 'pl-6' : ''}`}
			>
				{item.label}
			</Link>
		);
	};

	const buildLinks = (items: typeof adminLinks, depth = 0): React.ReactNode => {
		return items.map((item) => {
			if ('children' in item && item.children) {
				return (
					<React.Fragment key={item.label}>
						<div
							className={`px-4 py-2 mt-4 text-xs font-semibold uppercase tracking-wide text-gray-400`}
						>
							{item.label}
						</div>
						{buildLinks(item.children, depth + 1)}
					</React.Fragment>
				);
			}

			return renderLink({ ...item, depth });
		});
	};

	return <nav className="space-y-0.5">{buildLinks(adminLinks)}</nav>;
}
