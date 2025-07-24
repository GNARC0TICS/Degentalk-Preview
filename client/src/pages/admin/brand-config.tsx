import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@app/components/ui';
import { VisualJsonTabs } from '@app/features/admin/components/VisualJsonTabs';
import { useJsonConfig } from '@app/hooks/useJsonConfig';
import { brandSchema, type BrandConfig } from '@app/schemas/brand.schema';

// Temporary visual builder (Phase-1) – simply displays JSON preview. Enhance later.
const BrandVisualBuilder: React.FC<{
	state: BrandConfig;
	setState: (next: BrandConfig) => void;
}> = ({ state }) => {
	return (
		<pre className="text-xs bg-zinc-800/40 p-4 rounded max-h-[60vh] overflow-auto">
			{JSON.stringify(state, null, 2)}
		</pre>
	);
};

export default function BrandConfigAdminPage() {
	const { data, save, loading } = useJsonConfig<BrandConfig>('/admin/brand-config', brandSchema);

	return (
		<Card>
			<CardHeader>
				<CardTitle>Brand Configuration</CardTitle>
			</CardHeader>
			<CardContent>
				<VisualJsonTabs<BrandConfig>
					shapeSchema={brandSchema}
					value={data}
					onChange={save}
					loading={loading}
				>
					{(state, setState) => <BrandVisualBuilder state={state} setState={setState} />}
				</VisualJsonTabs>
			</CardContent>
		</Card>
	);
}
