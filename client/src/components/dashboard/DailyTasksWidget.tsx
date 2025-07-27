import React from 'react';
import { useDailyTasks } from '@/hooks/useDailyTasks';
import { CheckCircle, Lock, Flame } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';

export default function DailyTasksWidget() {
	const { tasks, stats, completeTask } = useDailyTasks();

	return (
		<Card className="bg-zinc-900/50 border border-zinc-800 rounded-lg overflow-hidden">
			<CardHeader className="pb-3">
				<CardTitle className="text-lg flex items-center">
					<Flame className="h-5 w-5 text-amber-500 mr-2" />
					Daily Tasks
				</CardTitle>
				{/* Summary Bar */}
				<div className="text-sm mt-2 text-zinc-400 flex flex-wrap gap-2">
					<span className="font-semibold text-emerald-400">{stats.xpEarnedToday} XP</span>|
					<span className="font-semibold text-amber-400">🔥 {stats.streakDays}-day streak</span>|
					<span>{stats.tasksLeft} tasks left</span>
				</div>
				<Progress value={stats.progressPercent} className="h-2 mt-3" />
			</CardHeader>
			<CardContent className="space-y-3 max-h-64 overflow-y-auto">
				{tasks.map((task) => (
					<div
						key={task.id}
						className="flex items-center justify-between p-2 bg-zinc-800/60 rounded-md hover:bg-zinc-800 transition cursor-pointer"
						onClick={() => task.status === 'active' && completeTask(task.id)}
					>
						<div className="flex items-center gap-2">
							{task.status === 'completed' ? (
								<CheckCircle className="h-5 w-5 text-emerald-400" />
							) : task.status === 'locked' ? (
								<Lock className="h-5 w-5 text-zinc-500" />
							) : (
								<div className="h-4 w-4 rounded-full bg-emerald-500 animate-pulse" />
							)}
							<p
								className={`text-sm ${task.status === 'completed' ? 'line-through text-zinc-500' : ''}`}
							>
								{task.title}
							</p>
						</div>
						<span className="text-xs text-zinc-400">+{task.xp} XP</span>
					</div>
				))}
			</CardContent>
		</Card>
	);
}
