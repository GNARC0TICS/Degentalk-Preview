import { useCallback, useEffect, useState } from 'react';
import { ZodSchema } from 'zod';
import { apiRequest } from '@/lib/api-request';
import { useToast } from '@/hooks/use-toast';

export interface UseJsonConfigReturn<T> {
	data: T | null;
	save: (next: T) => void;
	reset: () => void;
	loading: boolean;
	isDirty: boolean;
}

/**
 * Hook that fetches a JSON config object, validates it with Zod, and provides save/reset helpers.
 */
export function useJsonConfig<T>(endpoint: string, schema: ZodSchema<T>): UseJsonConfigReturn<T> {
	const { toast } = useToast();
	const [data, setData] = useState<T | null>(null);
	const [original, setOriginal] = useState<T | null>(null);
	const [loading, setLoading] = useState(true);
	const isDirty =
		original !== null && data !== null && JSON.stringify(original) !== JSON.stringify(data);

	// initial load
	useEffect(() => {
		(async () => {
			setLoading(true);
			try {
				const res = await apiRequest<{ [key: string]: unknown }>({ url: endpoint, method: 'GET' });
				const parsed = schema.parse(res);
				setData(parsed);
				setOriginal(parsed);
			} catch (err) {
				toast({ title: 'Error', description: (err as Error).message, variant: 'destructive' });
			} finally {
				setLoading(false);
			}
		})();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [endpoint]);

	const save = useCallback(
		async (next: T) => {
			setData(next);
			try {
				toast({ title: 'Saving…' });
				setLoading(true);
				await apiRequest({ url: endpoint, method: 'PUT', data: next });
				setOriginal(next);
				toast({ title: 'Saved successfully' });
			} catch (err) {
				toast({
					title: 'Save failed',
					description: (err as Error).message,
					variant: 'destructive'
				});
			} finally {
				setLoading(false);
			}
		},
		[endpoint]
	);

	const reset = useCallback(() => {
		if (original) setData(original);
	}, [original]);

	return { data, save, reset, loading, isDirty };
}
