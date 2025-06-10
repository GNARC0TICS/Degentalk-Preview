import React from 'react';
import { PathProgress } from './path-progress';
import { getDominantPath } from '@shared/path-config';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Lightbulb } from 'lucide-react';

interface UserPathsDisplayProps {
	pluginData: Record<string, any> | null;
	className?: string;
}

const UserPathsDisplay: React.FC<UserPathsDisplayProps> = ({ pluginData, className = '' }) => {
	// Get paths from pluginData
	const paths = pluginData?.paths || {};
	const pathEntries = Object.entries(paths);

	// Get the dominant path
	const dominantPathId = getDominantPath(paths);

	// If no paths, show empty state
	if (pathEntries.length === 0) {
		return (
			<div className={className}>
				<Alert>
					<Lightbulb className="h-4 w-4" />
					<AlertTitle>No paths discovered yet</AlertTitle>
					<AlertDescription>
						Paths are discovered by participating in different forum categories. Post in various
						sections to build your DegenTalk identity!
					</AlertDescription>
				</Alert>
			</div>
		);
	}

	return (
		<div className={className}>
			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				{pathEntries.map(([pathId, xp]) => (
					<PathProgress
						key={pathId}
						pathId={pathId}
						xp={xp as number}
						isDominant={pathId === dominantPathId}
					/>
				))}
			</div>
		</div>
	);
};

export { UserPathsDisplay };
