import React from 'react';
import {
	Command,
	HelpCircle,
	CloudRain,
	Gift,
	MessageSquare,
	BellRing,
	User,
	Wind
} from 'lucide-react';

interface CommandHelpItem {
	command: string;
	description: string;
	example: string;
	icon: React.ReactNode;
	adminOnly?: boolean;
}

export default function ShoutboxHelpCommand() {
	const commandList: CommandHelpItem[] = [
		{
			command: '/help',
			description: 'Show this help message',
			example: '/help',
			icon: <HelpCircle className="h-4 w-4" />
		},
		{
			command: '/tip',
			description: 'Send a tip to a user',
			example: '/tip @username 50 dgt',
			icon: <Gift className="h-4 w-4" />
		},
		{
			command: '/rain',
			description: 'Distribute tokens to random active users',
			example: '/rain 5 usdt 10',
			icon: <CloudRain className="h-4 w-4" />
		},
		{
			command: '/dust',
			description: 'Send a tiny amount of DGT (0.0001) to roast someone',
			example: '/dust @username',
			icon: <Wind className="h-4 w-4" />,
			adminOnly: true
		},
		{
			command: '/me',
			description: 'Send a message in third person',
			example: '/me is feeling lucky',
			icon: <User className="h-4 w-4" />
		},
		{
			command: '/clear',
			description: 'Clear your view of the shoutbox',
			example: '/clear',
			icon: <MessageSquare className="h-4 w-4" />
		},
		{
			command: '/dnd',
			description: 'Toggle do not disturb mode (mute notifications)',
			example: '/dnd',
			icon: <BellRing className="h-4 w-4" />
		}
	];

	return (
		<div className="bg-zinc-900/80 border border-zinc-800 rounded-lg p-4 my-3">
			<div className="flex items-center mb-3 text-emerald-400">
				<Command className="h-5 w-5 mr-2" />
				<h3 className="font-medium">Available Commands</h3>
			</div>

			<div className="space-y-3">
				{commandList.map((cmd) => (
					<div key={cmd.command} className="flex items-start">
						<div className="mt-0.5 mr-3 text-zinc-400">{cmd.icon}</div>
						<div>
							<div className="flex items-center gap-2">
								<div className="font-mono text-sm bg-zinc-800 px-1.5 py-0.5 rounded text-emerald-300 inline-block">
									{cmd.command}
								</div>
								{cmd.adminOnly && (
									<span className="text-xs bg-red-950/50 text-red-400 px-1.5 py-0.5 rounded border border-red-900/50">
										Admin/Mod
									</span>
								)}
							</div>
							<p className="text-sm mt-1 text-zinc-300">{cmd.description}</p>
							<p className="text-xs mt-0.5 text-zinc-500 font-mono">Example: {cmd.example}</p>
						</div>
					</div>
				))}
			</div>

			<div className="mt-4 text-xs text-zinc-500 border-t border-zinc-800 pt-3">
				<p>
					<span className="text-zinc-400">Tip/Rain Limits:</span> Min DGT: 10, Min USDT: 0.1, Max
					Recipients: 15
				</p>
				<p className="mt-1">
					<span className="text-zinc-400">Cooldowns:</span> These commands may have cooldown periods
					configured by admins
				</p>
			</div>
		</div>
	);
}

// Function to process the help command
export function processHelpCommand(content: string): {
	isHelpCommand: boolean;
	message?: JSX.Element;
} {
	if (content.trim().toLowerCase() === '/help') {
		return {
			isHelpCommand: true,
			message: <ShoutboxHelpCommand />
		};
	}

	return { isHelpCommand: false };
}
