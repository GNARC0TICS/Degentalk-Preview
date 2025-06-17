import React from 'react';
import { CooldownSettings } from '@/components/admin/cooldown-settings';

export default function CooldownSettingsPage() {
	return (
		<div className="container px-4 mx-auto py-6">
				<header className="mb-8">
					<h2 className="text-3xl font-bold tracking-tight text-white mb-2">Command Cooldowns</h2>
					<p className="text-gray-400">
						Configure cooldown periods for commands to prevent spam and abuse
					</p>
				</header>

				<div className="max-w-3xl mx-auto">
					<CooldownSettings />
				</div>
			</div>
	);
}
