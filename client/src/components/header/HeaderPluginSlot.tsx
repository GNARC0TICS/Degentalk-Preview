import React from 'react';

// Plugin registry type
type HeaderPlugin = () => React.ReactElement;

// Global plugin registry
const headerPluginRegistry = new Map<string, HeaderPlugin>();

// Register a header plugin
export function registerHeaderPlugin(name: string, plugin: HeaderPlugin): void {
	headerPluginRegistry.set(name, plugin);
}

// Unregister a header plugin
export function unregisterHeaderPlugin(name: string): void {
	headerPluginRegistry.delete(name);
}

// Get all registered plugins for a position
function getPluginsForPosition(position: string): HeaderPlugin[] {
	const plugins: HeaderPlugin[] = [];

	// For now, we'll render all plugins regardless of position
	// In the future, we can extend the registry to include position metadata
	headerPluginRegistry.forEach((plugin) => {
		plugins.push(plugin);
	});

	return plugins;
}

interface HeaderPluginSlotProps {
	position: 'left' | 'center' | 'right';
	className?: string;
}

export function HeaderPluginSlot({ position, className }: HeaderPluginSlotProps) {
	const plugins = getPluginsForPosition(position);

	if (plugins.length === 0) {
		return null;
	}

	return (
		<div className={`flex items-center space-x-2 ${className}`}>
			{plugins.map((Plugin, index) => (
				<Plugin key={`${position}-plugin-${index}`} />
			))}
		</div>
	);
}
