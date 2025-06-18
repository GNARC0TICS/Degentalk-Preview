import { useXpActions } from '@/features/admin/services/xpActionsService';
import { XpActionRow } from '@/components/admin/XpActionRow';
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export default function XpActionsAdminPage() {
	const { data: actions, isLoading, error } = useXpActions();

	return (
		<div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
			<h2 className="text-3xl font-bold tracking-tight">XP Action Settings</h2>
			<Card>
				<CardHeader>
					<CardTitle>Per-Action XP & Clout</CardTitle>
				</CardHeader>
				<CardContent>
					{isLoading && <p>Loading…</p>}
					{error && <p className="text-red-500">Error loading actions</p>}
					{actions && (
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Action Key</TableHead>
									<TableHead>Description</TableHead>
									<TableHead>XP Amount</TableHead>
									<TableHead>Enabled</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{actions.actions.map((a: any) => (
									<XpActionRow key={a.action} action={a} />
								))}
							</TableBody>
						</Table>
					)}
				</CardContent>
			</Card>
		</div>
	);
} 