import React from 'react';
import { Link } from 'wouter';
import {
	Home,
	Users,
	TrendingUp,
	Star,
	MessageSquare,
	FlameIcon,
	Clock,
	PanelsTopLeft,
	LayoutGrid
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { forumCategories } from '@schema';
import type { ForumCategoryWithStats } from '@shared/types';
import { useLocation } from 'wouter';
import { ROUTES } from '@/constants/routes';

export type ForumCategory = typeof forumCategories.$inferSelect;

// ... (full content preserved) 