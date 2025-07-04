/**
 * Example integration showing how to use DynamicSidebar in place of
 * manual widget management in forum layouts
 *
 * This file demonstrates the migration path from individual widget imports
 * to the config-driven sidebar system.
 */

import React from 'react';
import { DynamicSidebar } from './DynamicSidebar';
import type { EntityId } from '@shared/types';

// BEFORE: Manual widget management
// import { QuickStats } from '@/components/forum/QuickStats';
// import { HotTopics } from '@/components/forum/HotTopics';
// import { RecentActivity } from '@/components/forum/RecentActivity';

// const OldSidebar = ({ structureId }: { structureId?: number }) => (
//   <aside className="space-y-6">
//     <QuickStats structureId={structureId} />
//     <HotTopics structureId={structureId} />
//     <RecentActivity structureId={structureId} />
//   </aside>
// );

// AFTER: Config-driven sidebar
interface ForumSidebarProps {
	structureId?: EntityId;
	zoneSlug?: string;
	className?: string;
}

export const ForumSidebar: React.FC<ForumSidebarProps> = ({ structureId, zoneSlug, className }) => {
	return <DynamicSidebar structureId={structureId} zoneSlug={zoneSlug} className={className} />;
};

// Example usage in different contexts:

// Zone page sidebar
export const ZonePageSidebar: React.FC<{ zoneSlug: string }> = ({ zoneSlug }) => (
	<ForumSidebar zoneSlug={zoneSlug} className="xl:w-80" />
);

// Forum page sidebar
export const ForumPageSidebar: React.FC<{ structureId: EntityId; zoneSlug: string }> = ({
	structureId,
	zoneSlug
}) => (
	<ForumSidebar structureId={structureId} zoneSlug={zoneSlug} className="hidden xl:block xl:w-80" />
);

// Thread page sidebar (using existing ThreadSidebar + DynamicSidebar)
export const ThreadPageSidebar: React.FC<{
	thread: any;
	structureId: EntityId;
	zoneSlug: string;
}> = ({ thread, structureId, zoneSlug }) => (
	<div className="space-y-6 xl:w-80">
		{/* Thread-specific sidebar content */}
		<div className="bg-zinc-900/60 backdrop-blur-sm border border-zinc-700/50 rounded-lg p-4">
			<h3 className="font-semibold text-zinc-100 mb-2">Thread Info</h3>
			{/* Thread metadata */}
		</div>

		{/* Dynamic widgets based on zone */}
		<DynamicSidebar structureId={structureId} zoneSlug={zoneSlug} />
	</div>
);
