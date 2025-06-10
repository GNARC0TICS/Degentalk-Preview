import React from 'react';
import { Gift, CloudRain, DollarSign } from 'lucide-react';

export interface ShoutboxMessageStyleProps {
	type: 'regular' | 'rain' | 'tip' | 'system';
	currency?: 'DGT' | 'USDT';
	content: string;
	sender: string;
	amount?: number;
}

export function StyledShoutboxMessage({
	type,
	currency,
	content,
	sender,
	amount
}: ShoutboxMessageStyleProps) {
	// Regular messages just return the content
	if (type === 'regular') {
		return <span>{content}</span>;
	}

	// For system messages
	if (type === 'system') {
		return <span className="text-zinc-400 italic">{content}</span>;
	}

	// Style based on message type
	const getMessageStyles = () => {
		if (type === 'tip') {
			return {
				wrapperClass:
					currency === 'DGT'
						? 'bg-amber-950/30 border border-amber-800/30 px-3 py-1.5 rounded-md'
						: 'bg-blue-950/30 border border-blue-800/30 px-3 py-1.5 rounded-md',
				iconClass: currency === 'DGT' ? 'text-amber-500' : 'text-blue-500',
				icon: <Gift className="h-4 w-4 mr-1.5 inline-block" />,
				highlight: currency === 'DGT' ? 'text-amber-400' : 'text-blue-400',
				amountBadgeClass:
					currency === 'DGT'
						? 'bg-amber-900/50 text-amber-300 border-amber-800/50'
						: 'bg-blue-900/50 text-blue-300 border-blue-800/50'
			};
		} else {
			// rain
			return {
				wrapperClass:
					currency === 'DGT'
						? 'bg-emerald-950/30 border border-emerald-800/30 px-3 py-1.5 rounded-md'
						: 'bg-cyan-950/30 border border-cyan-800/30 px-3 py-1.5 rounded-md',
				iconClass: currency === 'DGT' ? 'text-emerald-500' : 'text-cyan-500',
				icon: <CloudRain className="h-4 w-4 mr-1.5 inline-block" />,
				highlight: currency === 'DGT' ? 'text-emerald-400' : 'text-cyan-400',
				amountBadgeClass:
					currency === 'DGT'
						? 'bg-emerald-900/50 text-emerald-300 border-emerald-800/50'
						: 'bg-cyan-900/50 text-cyan-300 border-cyan-800/50'
			};
		}
	};

	const styles = getMessageStyles();

	return (
		<div className={styles.wrapperClass}>
			<div className="flex items-center">
				<span className={styles.iconClass}>{styles.icon}</span>
				<span className={styles.highlight}>{type === 'tip' ? 'Tip' : 'Rain'}</span>

				{amount && (
					<span
						className={`ml-2 text-xs px-1.5 py-0.5 rounded border ${styles.amountBadgeClass} flex items-center`}
					>
						<DollarSign className="h-3 w-3 mr-0.5" />
						{amount} {currency}
					</span>
				)}
			</div>

			<div className="mt-1 text-white">{content}</div>
		</div>
	);
}

// Helper function to check if a message contains a tip or rain command
export function detectMessageType(content: string): {
	type: 'regular' | 'rain' | 'tip' | 'system';
	command?: string;
	username?: string;
	amount?: number;
	currency?: 'DGT' | 'USDT';
	recipientCount?: number;
} {
	// Check for rain command
	const rainRegex =
		/^🌧️\s+@(\w+)\s+is\s+making\s+it\s+rain\s+(\d+(?:\.\d+)?)\s+(DGT|USDT)\s+on\s+(\d+)\s+lucky\s+users!$/i;
	const rainMatch = content.match(rainRegex);

	if (rainMatch) {
		return {
			type: 'rain',
			command: 'rain',
			username: rainMatch[1],
			amount: parseFloat(rainMatch[2]),
			currency: rainMatch[3].toUpperCase() as 'DGT' | 'USDT',
			recipientCount: parseInt(rainMatch[4])
		};
	}

	// Check for tip command
	const tipRegex = /^💰\s+@(\w+)\s+tipped\s+(\d+(?:\.\d+)?)\s+(DGT|USDT)\s+to\s+@(\w+)!$/i;
	const tipMatch = content.match(tipRegex);

	if (tipMatch) {
		return {
			type: 'tip',
			command: 'tip',
			username: tipMatch[1], // sender
			amount: parseFloat(tipMatch[2]),
			currency: tipMatch[3].toUpperCase() as 'DGT' | 'USDT'
		};
	}

	// Check if it's a system message
	if (content.startsWith('System:') || content.includes('[System]')) {
		return { type: 'system' };
	}

	// Default to regular message
	return { type: 'regular' };
}
