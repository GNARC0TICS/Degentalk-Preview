import React, { createContext, useContext, useEffect, useState } from 'react';
import type { RuntimeBrandConfig } from '@db_types/brand.types';

interface BrandContextValue {
	brandConfig: RuntimeBrandConfig | null;
	refresh: () => Promise<void>;
}

const BrandContext = createContext<BrandContextValue | undefined>(undefined);

export const BrandProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	const [brandConfig, setBrandConfig] = useState<RuntimeBrandConfig | null>(null);

	const fetchConfig = async () => {
		try {
			const res = await fetch('/api/admin/brand-config', { credentials: 'include' });
			const data = await res.json();
			setBrandConfig(data);
			applyCssVars(data);
		} catch (err) {
			console.error('Failed to load brand config', err);
		}
	};

	useEffect(() => {
		fetchConfig();
	}, []);

	return (
		<BrandContext.Provider value={{ brandConfig, refresh: fetchConfig }}>
			{children}
		</BrandContext.Provider>
	);
};

export const useBrand = () => {
	const ctx = useContext(BrandContext);
	if (!ctx) throw new Error('useBrand must be used within BrandProvider');
	return ctx;
};

const applyCssVars = (config: RuntimeBrandConfig) => {
	const root = document.documentElement;
	if (config.colors) {
		Object.entries(config.colors as Record<string, string>).forEach(([key, val]) => {
			root.style.setProperty(`--brand-${key}`, String(val));
		});
	}
	if (config.typography) {
		Object.entries(config.typography as Record<string, string>).forEach(([key, val]) => {
			root.style.setProperty(`--brand-typography-${key}`, String(val));
		});
	}
};
