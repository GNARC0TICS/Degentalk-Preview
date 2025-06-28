import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';

interface MotionContextValue {
	isMotionEnabled: boolean;
	toggleMotion: () => void;
}

const MotionContext = createContext<MotionContextValue | undefined>(undefined);

export function MotionProvider({ children }: { children: React.ReactNode }) {
	// 1. Detect OS-level preference first
	const prefersReduced =
		typeof window !== 'undefined' && window.matchMedia
			? window.matchMedia('(prefers-reduced-motion: reduce)').matches
			: false;

	const [isMotionEnabled, setIsMotionEnabled] = useState<boolean>(() => {
		// Initial state: localStorage value, else inverse of prefersReduced
		if (typeof window === 'undefined') return true;
		const stored = localStorage.getItem('motion-enabled');
		return stored !== null ? stored === 'true' : !prefersReduced;
	});

	// 2. Persist to localStorage and update <body> class
	useEffect(() => {
		if (typeof window === 'undefined') return;
		localStorage.setItem('motion-enabled', String(isMotionEnabled));
		document.body.classList.toggle('no-motion', !isMotionEnabled);
	}, [isMotionEnabled]);

	// 3. Provide a toggle callback
	const toggleMotion = useCallback(() => {
		setIsMotionEnabled((prev) => !prev);
	}, []);

	const value: MotionContextValue = { isMotionEnabled, toggleMotion };

	return <MotionContext.Provider value={value}>{children}</MotionContext.Provider>;
}

export function useMotion() {
	const ctx = useContext(MotionContext);
	if (!ctx) throw new Error('useMotion must be used within MotionProvider');
	return ctx;
}
