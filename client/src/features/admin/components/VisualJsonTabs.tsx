import React from 'react';
import * as Tabs from '@radix-ui/react-tabs';
import { ZodSchema } from 'zod';
import { JsonEditor } from './form-controls/JsonEditor.tsx';
import { InlineError } from './form-controls/InlineError.tsx';

export interface VisualJsonTabsProps<T> {
	shapeSchema: ZodSchema<T>;
	value: T;
	onChange: (next: T) => void;
	loading?: boolean;
	children: (state: T, setState: (next: T) => void) => React.ReactNode;
}

/**
 * Two-tab interface for visual editing versus raw JSON. Handles validation with Zod.
 */
export function VisualJsonTabs<T>({
	shapeSchema,
	value,
	onChange,
	loading,
	children
}: VisualJsonTabsProps<T>) {
	const [tab, setTab] = React.useState<'visual' | 'json'>('visual');
	const [internal, setInternal] = React.useState<T>(value);
	const [jsonValue, setJsonValue] = React.useState<string>(JSON.stringify(value, null, 2));
	const [errors, setErrors] = React.useState<string[]>([]);

	// sync incoming value changes
	React.useEffect(() => {
		setInternal(value);
		setJsonValue(JSON.stringify(value, null, 2));
	}, [value]);

	// validate when internal state changes (visual)
	React.useEffect(() => {
		const result = shapeSchema.safeParse(internal);
		setErrors(result.success ? [] : result.error.errors.map((e) => e.message));
		if (result.success) onChange(internal);
	}, [internal]);

	// validate JSON changes
	React.useEffect(() => {
		if (tab !== 'json') return;
		try {
			const parsed = JSON.parse(jsonValue);
			const result = shapeSchema.safeParse(parsed);
			setErrors(result.success ? [] : result.error.errors.map((e) => e.message));
			if (result.success) onChange(parsed);
		} catch (err) {
			setErrors([(err as Error).message]);
		}
	}, [jsonValue, tab]);

	return (
		<Tabs.Root value={tab} onValueChange={(v) => setTab(v as 'visual' | 'json')} className="w-full">
			<Tabs.List className="mb-4 flex border-b border-border">
				<Tabs.Trigger
					value="visual"
					className={`px-4 py-2 text-sm font-medium transition-colors data-[state=active]:border-b-2 data-[state=active]:border-primary`}
				>
					Visual
				</Tabs.Trigger>
				<Tabs.Trigger
					value="json"
					className={`px-4 py-2 text-sm font-medium transition-colors data-[state=active]:border-b-2 data-[state=active]:border-primary`}
				>
					Raw JSON
					{errors.length > 0 && <span className="ml-1 text-red-600">•</span>}
				</Tabs.Trigger>
			</Tabs.List>
			{/* Visual tab */}
			<Tabs.Content value="visual" className="outline-none">
				{children(internal, setInternal)}
			</Tabs.Content>
			{/* JSON tab */}
			<Tabs.Content value="json" className="outline-none">
				<JsonEditor value={jsonValue} onChange={setJsonValue} errors={errors} height="60vh" />
			</Tabs.Content>
			{loading && <div className="mt-2 text-sm text-muted-foreground">Saving…</div>}
		</Tabs.Root>
	);
}
