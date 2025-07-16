import React from 'react';
import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';

interface BreadcrumbItem {
	label: string;
	href?: string;
}

interface MyBBBreadcrumbProps {
	items: BreadcrumbItem[];
}

export function MyBBBreadcrumb({ items }: MyBBBreadcrumbProps) {
	return (
		<div className="mybb-breadcrumb">
			<Link to="/" className="text-blue-600 hover:text-blue-800">
				<Home className="inline w-3 h-3 mb-0.5" />
			</Link>
			{items.map((item, index) => (
				<React.Fragment key={index}>
					<span className="mybb-breadcrumb-separator">»</span>
					{item.href ? (
						<Link to={item.href} className="text-blue-600 hover:text-blue-800">
							{item.label}
						</Link>
					) : (
						<span className="text-gray-700">{item.label}</span>
					)}
				</React.Fragment>
			))}
		</div>
	);
}