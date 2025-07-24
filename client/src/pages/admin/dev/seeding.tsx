import { useState } from 'react';
import { Button } from '@app/components/ui/button';
import { AdminPageShell } from '@app/features/admin/layout/layout/AdminPageShell';

interface SeedConfig {
	id: string;
	label: string;
}

const SEEDS: SeedConfig[] = [
	{ id: 'users', label: 'Seed Users' },
	{ id: 'forum', label: 'Seed Forum Structure' },
	{ id: 'threads', label: 'Seed Realistic Threads' },
	{ id: 'xp', label: 'Seed XP Actions' },
	{ id: 'all', label: 'Seed ALL (Destructive)' }
];

export default function AdminDevSeedingPage() {
	const [statusMsg, setStatusMsg] = useState<string | null>(null);
	const [running, setRunning] = useState<string | null>(null);

	const runSeed = async (id: string) => {
		try {
			setRunning(id);
			setStatusMsg(`Running seed '${id}'...`);
			const res = await fetch(`/admin/dev/seed/${id}`, {
				method: 'POST'
			});
			const data = await res.json();
			if (res.ok) {
				setStatusMsg(data.message ?? 'Seed completed successfully.');
			} else {
				setStatusMsg(data.message ?? 'Seed failed. Check server logs.');
			}
		} catch (err: any) {
			setStatusMsg(err.message ?? 'Unexpected error');
		} finally {
			setRunning(null);
		}
	};

	return (
		<AdminPageShell
			title="Dev Seeding"
			description="Run database seed scripts directly from the admin panel (development mode only)"
		>
			<div className="space-y-4">
				{SEEDS.map((seed) => (
					<Button
						key={seed.id}
						disabled={!!running}
						onClick={() => runSeed(seed.id)}
						variant={seed.id === 'all' ? 'destructive' : 'default'}
					>
						{running === seed.id ? 'Running...' : seed.label}
					</Button>
				))}
			</div>
			{statusMsg && <p className="mt-6 text-sm text-muted-foreground">{statusMsg}</p>}
		</AdminPageShell>
	);
}
