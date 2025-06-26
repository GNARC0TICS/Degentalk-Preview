import React from 'react';
import { useBrand, BrandProvider } from '@/contexts/BrandContext';
import { Card, CardHeader, CardTitle, CardContent, Textarea, Button } from '@/components/ui';
import { brandConfigApi } from '@/features/admin/services/brandConfigApi';

const Editor: React.FC = () => {
	const { brandConfig, refresh } = useBrand();
	const [value, setValue] = React.useState('');
	const [saving, setSaving] = React.useState(false);

	React.useEffect(() => {
		if (brandConfig) setValue(JSON.stringify(brandConfig, null, 2));
	}, [brandConfig]);

	const handleSave = async () => {
		try {
			setSaving(true);
			const parsed = JSON.parse(value);
			await brandConfigApi.updateConfig(parsed);
			await refresh();
		} catch (err) {
			alert('Error saving config: ' + (err as Error).message);
		} finally {
			setSaving(false);
		}
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle>Brand Configuration</CardTitle>
			</CardHeader>
			<CardContent className="space-y-4">
				<Textarea
					className="w-full h-[60vh]"
					value={value}
					onChange={(e) => setValue(e.target.value)}
				/>
				<div className="flex gap-2">
					<Button onClick={handleSave} disabled={saving}>
						Save
					</Button>
					<Button variant="secondary" onClick={refresh}>
						Refresh
					</Button>
				</div>
			</CardContent>
		</Card>
	);
};

const BrandConfigAdminPage: React.FC = () => (
	<BrandProvider>
		<Editor />
	</BrandProvider>
);

export default BrandConfigAdminPage;
