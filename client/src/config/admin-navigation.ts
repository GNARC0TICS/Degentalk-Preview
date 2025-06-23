export const adminLinks = [
	{ label: 'Dashboard', href: '/admin' },
	{ label: 'Users', href: '/admin/users' },
	{
		label: 'Forum',
		children: [
			{ label: 'Categories', href: '/admin/categories' },
			{ label: 'Zones', href: '/admin/config/zones' },
			{ label: 'Tags', href: '/admin/tags' },
			{ label: 'Prefixes', href: '/admin/prefixes' }
		]
	},
	{
		label: 'Economy',
		children: [
			{ label: 'Treasury', href: '/admin/treasury' },
			{ label: 'DGT Packages', href: '/admin/dgt-packages' }
		]
	},
	{
		label: 'Engagement',
		children: [
			{ label: 'Announcements', href: '/admin/announcements' },
			{ label: 'XP Adjust', href: '/admin/xp/user-adjust' }
		]
	},
	{
		label: 'Settings',
		children: [
			{ label: 'Database Config', href: '/admin/database-config' }
			//      { label: 'Platform Settings', href: '/admin/platform-settings' },
		]
	}
] as const;
