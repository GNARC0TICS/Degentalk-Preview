import React, { createContext, useContext, useEffect, useState, memo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
	Eye,
	EyeOff,
	Keyboard,
	MousePointer,
	Volume2,
	VolumeX,
	Sun,
	Moon,
	Type,
	Contrast,
	Focus,
	Settings
} from 'lucide-react';
import { cn } from '@/utils/utils';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';

// Accessibility preferences context
interface AccessibilityPreferences {
	reducedMotion: boolean;
	highContrast: boolean;
	largeText: boolean;
	focusOutlines: boolean;
	soundFeedback: boolean;
	keyboardNavigation: boolean;
	colorBlindFriendly: boolean;
	fontSize: number;
	colorTheme: 'auto' | 'light' | 'dark' | 'high-contrast';
}

const defaultPreferences: AccessibilityPreferences = {
	reducedMotion: false,
	highContrast: false,
	largeText: false,
	focusOutlines: true,
	soundFeedback: false,
	keyboardNavigation: true,
	colorBlindFriendly: false,
	fontSize: 16,
	colorTheme: 'auto'
};

interface AccessibilityContextType {
	preferences: AccessibilityPreferences;
	updatePreference: <K extends keyof AccessibilityPreferences>(
		key: K,
		value: AccessibilityPreferences[K]
	) => void;
	isAccessibilityMenuOpen: boolean;
	toggleAccessibilityMenu: () => void;
}

const AccessibilityContext = createContext<AccessibilityContextType | null>(null);

export const useAccessibility = () => {
	const context = useContext(AccessibilityContext);
	if (!context) {
		throw new Error('useAccessibility must be used within AccessibilityProvider');
	}
	return context;
};

// Enhanced focus management hook
export const useFocusManagement = () => {
	const [isKeyboardUser, setIsKeyboardUser] = useState(false);
	const { preferences } = useAccessibility();

	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === 'Tab') {
				setIsKeyboardUser(true);
			}
		};

		const handleMouseDown = () => {
			setIsKeyboardUser(false);
		};

		window.addEventListener('keydown', handleKeyDown);
		window.addEventListener('mousedown', handleMouseDown);

		return () => {
			window.removeEventListener('keydown', handleKeyDown);
			window.removeEventListener('mousedown', handleMouseDown);
		};
	}, []);

	return {
		isKeyboardUser,
		shouldShowFocusOutlines: isKeyboardUser && preferences.focusOutlines
	};
};

// Skip navigation component
export const SkipNavigation = memo(() => {
	const skipLinks = [
		{ href: '#main-content', label: 'Skip to main content' },
		{ href: '#forum-navigation', label: 'Skip to forum navigation' },
		{ href: '#thread-list', label: 'Skip to thread list' },
		{ href: '#sidebar', label: 'Skip to sidebar' }
	];

	return (
		<div className="sr-only focus-within:not-sr-only fixed top-0 left-0 z-[200] bg-zinc-900 border border-zinc-700 rounded-br-lg">
			<nav aria-label="Skip navigation">
				<ul className="flex flex-col p-2 space-y-1">
					{skipLinks.map((link) => (
						<li key={link.href}>
							<a
								href={link.href}
								className="block px-4 py-2 text-sm text-white bg-emerald-600 rounded focus:outline-none focus:ring-2 focus:ring-emerald-400 hover:bg-emerald-700 transition-colors"
								onFocus={(e) => e.target.scrollIntoView()}
							>
								{link.label}
							</a>
						</li>
					))}
				</ul>
			</nav>
		</div>
	);
});

// Accessibility settings panel
const AccessibilityPanel = memo(() => {
	const { preferences, updatePreference, isAccessibilityMenuOpen, toggleAccessibilityMenu } =
		useAccessibility();

	const settingsGroups = [
		{
			title: 'Visual',
			icon: Eye,
			settings: [
				{
					key: 'highContrast' as const,
					label: 'High Contrast',
					description: 'Increase contrast for better visibility',
					type: 'switch' as const
				},
				{
					key: 'largeText' as const,
					label: 'Large Text',
					description: 'Increase text size throughout the interface',
					type: 'switch' as const
				},
				{
					key: 'fontSize' as const,
					label: 'Font Size',
					description: 'Adjust base font size',
					type: 'slider' as const,
					min: 12,
					max: 24,
					step: 1
				},
				{
					key: 'colorBlindFriendly' as const,
					label: 'Color Blind Friendly',
					description: 'Use patterns and symbols in addition to color',
					type: 'switch' as const
				}
			]
		},
		{
			title: 'Motion & Animation',
			icon: Focus,
			settings: [
				{
					key: 'reducedMotion' as const,
					label: 'Reduced Motion',
					description: 'Minimize animations and transitions',
					type: 'switch' as const
				}
			]
		},
		{
			title: 'Navigation',
			icon: Keyboard,
			settings: [
				{
					key: 'focusOutlines' as const,
					label: 'Focus Outlines',
					description: 'Show clear focus indicators for keyboard navigation',
					type: 'switch' as const
				},
				{
					key: 'keyboardNavigation' as const,
					label: 'Enhanced Keyboard Support',
					description: 'Enable additional keyboard shortcuts',
					type: 'switch' as const
				}
			]
		},
		{
			title: 'Audio',
			icon: Volume2,
			settings: [
				{
					key: 'soundFeedback' as const,
					label: 'Sound Feedback',
					description: 'Play sounds for interactions and notifications',
					type: 'switch' as const
				}
			]
		}
	];

	return (
		<AnimatePresence>
			{isAccessibilityMenuOpen && (
				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					exit={{ opacity: 0 }}
					className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[150] flex items-center justify-center p-4"
					onClick={toggleAccessibilityMenu}
				>
					<motion.div
						initial={{ scale: 0.9, opacity: 0 }}
						animate={{ scale: 1, opacity: 1 }}
						exit={{ scale: 0.9, opacity: 0 }}
						onClick={(e) => e.stopPropagation()}
						className="bg-zinc-900/95 backdrop-blur-xl border border-zinc-700/50 rounded-xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
						role="dialog"
						aria-labelledby="accessibility-title"
						aria-describedby="accessibility-description"
					>
						<div className="flex items-center justify-between mb-6">
							<div>
								<h2
									id="accessibility-title"
									className="text-xl font-semibold text-white flex items-center gap-2"
								>
									<Settings className="w-5 h-5 text-emerald-400" />
									Accessibility Settings
								</h2>
								<p id="accessibility-description" className="text-sm text-zinc-400 mt-1">
									Customize the interface to match your needs and preferences
								</p>
							</div>
							<Button
								variant="ghost"
								size="icon"
								onClick={toggleAccessibilityMenu}
								aria-label="Close accessibility settings"
							>
								<EyeOff className="w-5 h-5" />
							</Button>
						</div>

						<div className="space-y-8">
							{settingsGroups.map((group) => (
								<div key={group.title}>
									<h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
										<group.icon className="w-4 h-4 text-emerald-400" />
										{group.title}
									</h3>
									<div className="space-y-4">
										{group.settings.map((setting) => (
											<div key={setting.key} className="flex items-center justify-between py-2">
												<div className="flex-1 mr-4">
													<Label className="text-sm font-medium text-white">{setting.label}</Label>
													<p className="text-xs text-zinc-400 mt-1">{setting.description}</p>
												</div>
												<div>
													{setting.type === 'switch' ? (
														<Switch
															checked={preferences[setting.key] as boolean}
															onCheckedChange={(checked) => updatePreference(setting.key, checked)}
															aria-describedby={`${setting.key}-description`}
														/>
													) : setting.type === 'slider' ? (
														<div className="w-32">
															<Slider
																value={[preferences[setting.key] as number]}
																onValueChange={([value]) => updatePreference(setting.key, value)}
																min={setting.min}
																max={setting.max}
																step={setting.step}
																className="w-full"
																aria-label={setting.label}
															/>
															<div className="text-xs text-zinc-400 text-center mt-1">
																{preferences[setting.key]}px
															</div>
														</div>
													) : null}
												</div>
											</div>
										))}
									</div>
								</div>
							))}
						</div>

						<div className="flex justify-end gap-3 mt-8 pt-6 border-t border-zinc-700/50">
							<Button
								variant="outline"
								onClick={() => {
									Object.keys(defaultPreferences).forEach((key) => {
										updatePreference(
											key as keyof AccessibilityPreferences,
											defaultPreferences[key as keyof AccessibilityPreferences]
										);
									});
								}}
							>
								Reset to Defaults
							</Button>
							<Button onClick={toggleAccessibilityMenu}>Save & Close</Button>
						</div>
					</motion.div>
				</motion.div>
			)}
		</AnimatePresence>
	);
});

// Accessibility trigger button
export const AccessibilityTrigger = memo(() => {
	const { toggleAccessibilityMenu } = useAccessibility();

	return (
		<Button
			variant="ghost"
			size="icon"
			onClick={toggleAccessibilityMenu}
			className="fixed bottom-4 left-4 z-50 bg-zinc-900/90 backdrop-blur-lg border border-zinc-700/50 hover:bg-zinc-800/90"
			aria-label="Open accessibility settings"
			title="Accessibility Settings"
		>
			<Eye className="w-5 h-5" />
		</Button>
	);
});

// Live region for announcements
export const LiveRegion = memo(() => {
	const [announcements, setAnnouncements] = useState<string[]>([]);

	useEffect(() => {
		const handleAnnouncement = (event: CustomEvent<string>) => {
			setAnnouncements((prev) => [...prev, event.detail].slice(-3)); // Keep last 3 announcements
		};

		window.addEventListener('accessibility-announce', handleAnnouncement as EventListener);
		return () => {
			window.removeEventListener('accessibility-announce', handleAnnouncement as EventListener);
		};
	}, []);

	return (
		<div aria-live="polite" aria-atomic="true" className="sr-only" role="status">
			{announcements.map((announcement, index) => (
				<div key={index}>{announcement}</div>
			))}
		</div>
	);
});

// Utility to announce content to screen readers
export const announce = (message: string) => {
	window.dispatchEvent(new CustomEvent('accessibility-announce', { detail: message }));
};

// Provider component
export const AccessibilityProvider = memo(({ children }: { children: React.ReactNode }) => {
	const [preferences, setPreferences] = useLocalStorage<AccessibilityPreferences>(
		'accessibility-preferences',
		defaultPreferences
	);
	const [isAccessibilityMenuOpen, setIsAccessibilityMenuOpen] = useState(false);

	const updatePreference = <K extends keyof AccessibilityPreferences>(
		key: K,
		value: AccessibilityPreferences[K]
	) => {
		setPreferences((prev) => ({ ...prev, [key]: value }));
	};

	const toggleAccessibilityMenu = () => {
		setIsAccessibilityMenuOpen((prev) => !prev);
	};

	// Apply preferences to document
	useEffect(() => {
		const root = document.documentElement;

		// Font size
		root.style.fontSize = `${preferences.fontSize}px`;

		// High contrast
		if (preferences.highContrast) {
			root.classList.add('high-contrast');
		} else {
			root.classList.remove('high-contrast');
		}

		// Reduced motion
		if (preferences.reducedMotion) {
			root.classList.add('reduce-motion');
		} else {
			root.classList.remove('reduce-motion');
		}

		// Large text
		if (preferences.largeText) {
			root.classList.add('large-text');
		} else {
			root.classList.remove('large-text');
		}

		// Focus outlines
		if (!preferences.focusOutlines) {
			root.classList.add('no-focus-outlines');
		} else {
			root.classList.remove('no-focus-outlines');
		}

		// Color blind friendly
		if (preferences.colorBlindFriendly) {
			root.classList.add('colorblind-friendly');
		} else {
			root.classList.remove('colorblind-friendly');
		}
	}, [preferences]);

	// Keyboard shortcuts
	useEffect(() => {
		if (!preferences.keyboardNavigation) return;

		const handleKeyDown = (e: KeyboardEvent) => {
			// Alt + A for accessibility menu
			if (e.altKey && e.key === 'a') {
				e.preventDefault();
				toggleAccessibilityMenu();
			}

			// Alt + S for skip navigation
			if (e.altKey && e.key === 's') {
				e.preventDefault();
				const skipLink = document.querySelector('a[href="#main-content"]') as HTMLElement;
				skipLink?.focus();
			}
		};

		window.addEventListener('keydown', handleKeyDown);
		return () => window.removeEventListener('keydown', handleKeyDown);
	}, [preferences.keyboardNavigation, toggleAccessibilityMenu]);

	const value = {
		preferences,
		updatePreference,
		isAccessibilityMenuOpen,
		toggleAccessibilityMenu
	};

	return (
		<AccessibilityContext.Provider value={value}>
			{children}
			<SkipNavigation />
			<AccessibilityPanel />
			<AccessibilityTrigger />
			<LiveRegion />
		</AccessibilityContext.Provider>
	);
});

// Enhanced focus trap for modals
export const FocusTrap = memo(
	({ children, isActive }: { children: React.ReactNode; isActive: boolean }) => {
		const trapRef = useRef<HTMLDivElement>(null);

		useEffect(() => {
			if (!isActive) return;

			const trap = trapRef.current;
			if (!trap) return;

			const focusableElements = trap.querySelectorAll(
				'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
			);
			const firstElement = focusableElements[0] as HTMLElement;
			const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

			const handleKeyDown = (e: KeyboardEvent) => {
				if (e.key !== 'Tab') return;

				if (e.shiftKey) {
					if (document.activeElement === firstElement) {
						e.preventDefault();
						lastElement?.focus();
					}
				} else {
					if (document.activeElement === lastElement) {
						e.preventDefault();
						firstElement?.focus();
					}
				}
			};

			trap.addEventListener('keydown', handleKeyDown);
			firstElement?.focus();

			return () => {
				trap.removeEventListener('keydown', handleKeyDown);
			};
		}, [isActive]);

		return (
			<div ref={trapRef} className={isActive ? '' : 'contents'}>
				{children}
			</div>
		);
	}
);

SkipNavigation.displayName = 'SkipNavigation';
AccessibilityPanel.displayName = 'AccessibilityPanel';
AccessibilityTrigger.displayName = 'AccessibilityTrigger';
LiveRegion.displayName = 'LiveRegion';
AccessibilityProvider.displayName = 'AccessibilityProvider';
FocusTrap.displayName = 'FocusTrap';
