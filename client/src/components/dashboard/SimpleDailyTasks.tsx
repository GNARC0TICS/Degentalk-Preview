import React from 'react';
import { CheckCircle, Lock, Flame, MessageSquare, Heart, Users, TrendingUp } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/use-auth';
import { useDailyBonus } from '@/hooks/useDailyBonus';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

interface SimpleTask {
  id: string;
  title: string;
  description: string;
  xp: number;
  icon: React.ReactNode;
  link?: string;
  completed?: boolean;
}

/**
 * Simple Daily Tasks Widget for MVP
 * Shows daily login bonus + basic engagement prompts
 */
export default function SimpleDailyTasks() {
  const { user } = useAuth();
  const { streak, bonusData } = useDailyBonus();
  
  // Simple engagement tasks (not tracked, just suggestions)
  const tasks: SimpleTask[] = [
    {
      id: 'daily-login',
      title: 'Daily Login',
      description: 'Login to claim your daily XP',
      xp: 50,
      icon: <Flame className="h-4 w-4" />,
      completed: bonusData?.awarded
    },
    {
      id: 'post-thread',
      title: 'Start a Discussion',
      description: 'Create a new thread in any forum',
      xp: 100,
      icon: <MessageSquare className="h-4 w-4" />,
      link: '/forums'
    },
    {
      id: 'reply-thread',
      title: 'Join the Conversation',
      description: 'Reply to an existing thread',
      xp: 50,
      icon: <Heart className="h-4 w-4" />,
      link: '/forums'
    },
    {
      id: 'view-profile',
      title: 'Touch Grass (Optional)',
      description: 'View someone\'s profile',
      xp: 25,
      icon: <Users className="h-4 w-4" />,
      link: '/users'
    }
  ];

  const completedCount = tasks.filter(t => t.completed).length;
  const totalXP = tasks.filter(t => t.completed).reduce((sum, t) => sum + t.xp, 0);
  const progressPercent = (completedCount / tasks.length) * 100;

  return (
    <Card className="bg-zinc-900/50 border border-zinc-800 rounded-lg overflow-hidden">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center justify-between">
          <div className="flex items-center">
            <TrendingUp className="h-5 w-5 text-amber-500 mr-2" />
            Daily Activities
          </div>
          {streak > 0 && (
            <Badge variant="outline" className="flex items-center gap-1 text-xs">
              <Flame className="h-3 w-3 text-orange-500" />
              {streak} day streak
            </Badge>
          )}
        </CardTitle>
        
        {/* Summary */}
        <div className="text-sm mt-2 text-zinc-400 flex flex-wrap gap-2">
          <span className="font-semibold text-emerald-400">{totalXP} XP earned</span>
          <span className="text-zinc-600">•</span>
          <span>{tasks.length - completedCount} activities left</span>
        </div>
        <Progress value={progressPercent} className="h-2 mt-3" />
      </CardHeader>
      
      <CardContent className="space-y-2 max-h-64 overflow-y-auto">
        {tasks.map((task, index) => (
          <motion.div
            key={task.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            {task.link && !task.completed ? (
              <Link to={task.link}>
                <TaskItem task={task} />
              </Link>
            ) : (
              <TaskItem task={task} />
            )}
          </motion.div>
        ))}
        
        {/* Coming Soon Teaser */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-4 p-3 bg-zinc-800/30 rounded-md border border-zinc-700/50 border-dashed"
        >
          <p className="text-xs text-zinc-500 text-center">
            🚀 Full mission system coming in v1.1
          </p>
        </motion.div>
      </CardContent>
    </Card>
  );
}

function TaskItem({ task }: { task: SimpleTask }) {
  return (
    <div className={`
      flex items-center justify-between p-3 rounded-md transition-colors
      ${task.completed 
        ? 'bg-zinc-800/30' 
        : 'bg-zinc-800/60 hover:bg-zinc-800 cursor-pointer'
      }
    `}>
      <div className="flex items-center gap-3">
        {task.completed ? (
          <CheckCircle className="h-5 w-5 text-emerald-400" />
        ) : (
          <div className="h-5 w-5 rounded-full border-2 border-zinc-600 flex items-center justify-center">
            {task.icon}
          </div>
        )}
        <div>
          <p className={`text-sm font-medium ${
            task.completed ? 'line-through text-zinc-500' : 'text-zinc-200'
          }`}>
            {task.title}
          </p>
          <p className="text-xs text-zinc-400">{task.description}</p>
        </div>
      </div>
      <Badge variant={task.completed ? "secondary" : "outline"} className="text-xs">
        +{task.xp} XP
      </Badge>
    </div>
  );
}