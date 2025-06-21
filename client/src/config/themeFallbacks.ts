import { Flame, Target, Archive, Dices, FileText, Folder, type LucideIcon } from 'lucide-react';

export interface DefaultZoneTheme {
	icon: LucideIcon;
	color: string;
}

export const DEFAULT_ZONE_THEMES: Record<string, DefaultZoneTheme> = {
	default: {
		icon: Folder,
		color: 'text-emerald-400'
	},
	pit: {
		icon: Flame,
		color: 'text-red-400'
	},
	mission: {
		icon: Target,
		color: 'text-blue-400'
	},
	casino: {
		icon: Dices,
		color: 'text-purple-400'
	},
	briefing: {
		icon: FileText,
		color: 'text-amber-400'
	},
	archive: {
		icon: Archive,
		color: 'text-gray-400'
	}
};
