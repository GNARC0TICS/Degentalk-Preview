/*
  Zone themes configuration
  This file contains the default theme settings for forum zones/navigation.  
  Admins can later modify these values via a dedicated UI-Config interface or by editing this file.
  The frontend will fetch these settings from /api/ui/themes to override its local defaults.
*/

export interface ZoneThemeConfig {
  icon?: string; // Name of Lucide icon component or emoji string
  color?: string; // Tailwind text color class
  bgColor?: string; // Tailwind background color class
  borderColor?: string; // Tailwind border color class
  label?: string; // Human-readable label
}

export const zoneThemes: Record<string, ZoneThemeConfig> = {
  pit: {
    icon: 'Flame',
    color: 'text-red-400',
    bgColor: 'bg-red-900/20',
    borderColor: 'border-red-500/30',
    label: 'The Pit'
  },
  mission: {
    icon: 'Target',
    color: 'text-blue-400',
    bgColor: 'bg-blue-900/20',
    borderColor: 'border-blue-500/30',
    label: 'Mission Control'
  },
  casino: {
    icon: 'Dices',
    color: 'text-purple-400',
    bgColor: 'bg-purple-900/20',
    borderColor: 'border-purple-500/30',
    label: 'Casino Floor'
  },
  briefing: {
    icon: 'FileText',
    color: 'text-amber-400',
    bgColor: 'bg-amber-900/20',
    borderColor: 'border-amber-500/30',
    label: 'Briefing Room'
  },
  archive: {
    icon: 'Archive',
    color: 'text-gray-400',
    bgColor: 'bg-gray-900/20',
    borderColor: 'border-gray-500/30',
    label: 'Archive'
  },
  default: {
    icon: 'Folder',
    color: 'text-emerald-400',
    bgColor: 'bg-zinc-900/80',
    borderColor: 'border-zinc-700/30',
    label: 'Default'
  }
};

export default zoneThemes; 