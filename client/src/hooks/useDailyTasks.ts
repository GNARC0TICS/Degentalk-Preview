import { useState, useMemo } from 'react';

export type DailyTaskStatus = 'locked' | 'active' | 'completed';

export interface DailyTask {
  id: string;
  title: string;
  xp: number;
  status: DailyTaskStatus;
  zoneSlug?: string;
}

export interface DailyTasksStats {
  streakDays: number;
  xpEarnedToday: number;
  tasksLeft: number;
  totalTasks: number;
  progressPercent: number;
}

// ---- MOCK DATA -----------------------------------------------------------
const mockTasks: DailyTask[] = [
  { id: '1', title: 'Post a reply in The Pit', xp: 100, status: 'active', zoneSlug: 'the-pit' },
  { id: '2', title: 'Earn 5 upvotes today', xp: 150, status: 'locked' },
  { id: '3', title: 'Upload a profile banner', xp: 50, status: 'completed' },
];

const mockStreak = 3; // days

// --------------------------------------------------------------------------

export function useDailyTasks() {
  const [tasks, setTasks] = useState<DailyTask[]>(mockTasks);

  const stats: DailyTasksStats = useMemo(() => {
    const totalTasks = tasks.length;
    const completed = tasks.filter((t) => t.status === 'completed').length;
    const xpEarnedToday = tasks
      .filter((t) => t.status === 'completed')
      .reduce((sum, t) => sum + t.xp, 0);
    const tasksLeft = totalTasks - completed;
    const progressPercent = totalTasks === 0 ? 0 : (completed / totalTasks) * 100;
    return {
      streakDays: mockStreak,
      xpEarnedToday,
      tasksLeft,
      totalTasks,
      progressPercent,
    };
  }, [tasks]);

  const completeTask = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: 'completed' } : t))
    );
  };

  return { tasks, stats, completeTask };
} 