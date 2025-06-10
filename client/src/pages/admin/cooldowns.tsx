import React from 'react';
import AdminLayout from './admin-layout.tsx';
import { CooldownSettings } from '@/components/admin/cooldown-settings.tsx';

export default function CooldownSettingsPage() {
<<<<<<< HEAD
	return (
		<AdminLayout>
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
		</AdminLayout>
	);
}
=======
  return (
    <AdminLayout>
      <header className="mb-8">
        <h2 className="text-3xl font-bold tracking-tight text-white mb-2">Command Cooldowns</h2>
        <p className="text-gray-400">
          Configure cooldown periods for commands to prevent spam and abuse
        </p>
      </header>

      <div className="max-w-3xl mx-auto">
        <CooldownSettings />
      </div>
    </AdminLayout>
  );
} 
>>>>>>> e9161f07a590654bde699619fdc9d26a47d0139a
