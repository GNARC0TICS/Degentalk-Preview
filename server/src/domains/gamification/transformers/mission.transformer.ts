import type { Mission, UserMissionProgress } from '@schema';

interface MissionWithProgress extends Mission {
	progress?: UserMissionProgress;
}

// Public view (unauthenticated users)
export function toPublicMission(mission: Mission) {
	return {
		id: mission.id,
		title: mission.title,
		description: mission.description,
		type: mission.type,
		icon: mission.icon || '🎯',
		rewardPreview: {
			xp: mission.xpReward,
			dgt: mission.dgtReward || undefined,
			badge: mission.badgeReward || undefined
		}
	};
}

// Authenticated user view (includes progress)
export function toAuthenticatedMission(mission: MissionWithProgress, progress?: UserMissionProgress | null) {
	const missionProgress = progress || mission.progress;
	
	// Handle stacking missions
	let stackingInfo = {};
	if (mission.type === 'stacking' && mission.stages) {
		const stages = typeof mission.stages === 'string' ? JSON.parse(mission.stages) : mission.stages;
		const metadata = missionProgress?.metadata || {};
		const claimedStages = metadata.claimedStages || [];
		
		// Find current stage
		let currentStage = 0;
		let nextStageAt = stages[0]?.count;
		
		if (missionProgress) {
			for (let i = 0; i < stages.length; i++) {
				if (missionProgress.currentCount >= stages[i].count) {
					currentStage = i + 1;
					nextStageAt = stages[i + 1]?.count || null;
				}
			}
		}
		
		stackingInfo = {
			currentStage: Math.max(1, currentStage),
			totalStages: stages.length,
			nextStageAt
		};
	}
	
	return {
		id: mission.id,
		title: mission.title,
		description: mission.description,
		type: mission.type,
		icon: mission.icon || '🎯',
		progress: missionProgress ? {
			current: missionProgress.currentCount,
			required: mission.requiredCount,
			isCompleted: missionProgress.isCompleted,
			isClaimed: missionProgress.isRewardClaimed,
			...stackingInfo
		} : {
			current: 0,
			required: mission.requiredCount,
			isCompleted: false,
			isClaimed: false,
			...stackingInfo
		},
		rewardPreview: {
			xp: mission.xpReward,
			dgt: mission.dgtReward || undefined,
			badge: mission.badgeReward || undefined
		}
	};
}

// Admin view (includes all data)
export function toAdminMission(mission: Mission, stats?: {
	totalCompletions: number;
	totalClaims: number;
	avgCompletionTime?: number;
}) {
	return {
		...mission,
		stats: stats || {
			totalCompletions: 0,
			totalClaims: 0,
			avgCompletionTime: null
		}
	};
}

// Mission list response
export function toMissionListResponse(missions: MissionWithProgress[], userId?: string) {
	return {
		missions: userId 
			? missions.map(m => toAuthenticatedMission(m))
			: missions.map(m => toPublicMission(m)),
		count: missions.length,
		timestamp: new Date().toISOString()
	};
}

// Mission progress summary
export function toProgressSummary(missions: MissionWithProgress[]) {
	const total = missions.length;
	const completed = missions.filter(m => m.progress?.isCompleted).length;
	const claimed = missions.filter(m => m.progress?.isRewardClaimed).length;
	const inProgress = missions.filter(m => 
		m.progress && m.progress.currentCount > 0 && !m.progress.isCompleted
	).length;

	return {
		total,
		completed,
		claimed,
		inProgress,
		notStarted: total - completed - inProgress,
		completionRate: total > 0 ? Math.round((completed / total) * 100) : 0
	};
}