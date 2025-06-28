/**
 * Fixture Management Dashboard
 * Complete dashboard for managing test fixtures with Magic UI components
 */

import React from 'react';
import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FixtureBuilder } from '@/components/fixtures/fixture-builder';
import { FixturePreview } from '@/components/fixtures/fixture-preview';
import {
	Database,
	Settings,
	History,
	Download,
	Upload,
	Trash2,
	RefreshCw,
	TrendingUp,
	Users,
	MessageSquare,
	Coins,
	Activity
} from 'lucide-react';
import { toast } from 'sonner';

interface FixtureSession {
	id: string;
	name: string;
	type: string;
	count: number;
	createdAt: string;
	fixtures: any[];
}

interface FixtureStats {
	totalFixtures: number;
	byType: Record<string, number>;
	recentSessions: number;
	diskUsage: string;
}

export default function FixturesDashboard() {
	const [activeTab, setActiveTab] = useState('builder');
	const [sessions, setSessions] = useState<FixtureSession[]>([]);
	const [currentSession, setCurrentSession] = useState<FixtureSession | null>(null);
	const [stats, setStats] = useState<FixtureStats>({
		totalFixtures: 0,
		byType: {},
		recentSessions: 0,
		diskUsage: '0 MB'
	});

	// Load sessions from localStorage on mount
	useEffect(() => {
		const savedSessions = localStorage.getItem('fixture-sessions');
		if (savedSessions) {
			try {
				setSessions(JSON.parse(savedSessions));
			} catch (error) {
				console.error('Failed to load fixture sessions:', error);
			}
		}
	}, []);

	// Calculate stats when sessions change
	useEffect(() => {
		const totalFixtures = sessions.reduce((sum, session) => sum + session.count, 0);
		const byType = sessions.reduce(
			(acc, session) => {
				acc[session.type] = (acc[session.type] || 0) + session.count;
				return acc;
			},
			{} as Record<string, number>
		);

		const recentSessions = sessions.filter(
			(session) => new Date(session.createdAt) > new Date(Date.now() - 24 * 60 * 60 * 1000)
		).length;

		const diskUsage = `${Math.round(JSON.stringify(sessions).length / 1024)} KB`;

		setStats({ totalFixtures, byType, recentSessions, diskUsage });
	}, [sessions]);

	const handleGenerateFixtures = useCallback(
		(fixtures: any[], type: string, count: number) => {
			const newSession: FixtureSession = {
				id: Date.now().toString(),
				name: `${type.charAt(0).toUpperCase() + type.slice(1)} Fixtures`,
				type,
				count,
				createdAt: new Date().toISOString(),
				fixtures
			};

			const updatedSessions = [newSession, ...sessions.slice(0, 19)]; // Keep last 20 sessions
			setSessions(updatedSessions);
			setCurrentSession(newSession);

			// Save to localStorage
			localStorage.setItem('fixture-sessions', JSON.stringify(updatedSessions));

			toast.success(`Generated ${count} ${type} fixtures`);
		},
		[sessions]
	);

	const deleteSession = useCallback(
		(sessionId: string) => {
			const updatedSessions = sessions.filter((s) => s.id !== sessionId);
			setSessions(updatedSessions);
			localStorage.setItem('fixture-sessions', JSON.stringify(updatedSessions));

			if (currentSession?.id === sessionId) {
				setCurrentSession(null);
			}

			toast.success('Session deleted');
		},
		[sessions, currentSession]
	);

	const exportSessions = useCallback(() => {
		const exportData = {
			sessions,
			exportedAt: new Date().toISOString(),
			version: '1.0'
		};

		const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
		const url = URL.createObjectURL(blob);
		const link = document.createElement('a');
		link.href = url;
		link.download = `fixture-sessions-${Date.now()}.json`;
		link.click();
		URL.revokeObjectURL(url);

		toast.success('Sessions exported');
	}, [sessions]);

	const clearAllSessions = useCallback(() => {
		setSessions([]);
		setCurrentSession(null);
		localStorage.removeItem('fixture-sessions');
		toast.success('All sessions cleared');
	}, []);

	const statCards = [
		{
			title: 'Total Fixtures',
			value: stats.totalFixtures.toLocaleString(),
			icon: Database,
			description: 'Generated across all sessions'
		},
		{
			title: 'Recent Sessions',
			value: stats.recentSessions.toString(),
			icon: Activity,
			description: 'Created in last 24 hours'
		},
		{
			title: 'Storage Used',
			value: stats.diskUsage,
			icon: TrendingUp,
			description: 'Local storage usage'
		},
		{
			title: 'Active Session',
			value: currentSession ? '1' : '0',
			icon: Settings,
			description: 'Currently selected'
		}
	];

	const typeIcons: Record<string, any> = {
		user: Users,
		thread: MessageSquare,
		post: MessageSquare,
		transaction: Coins
	};

	return (
		<div className="min-h-screen bg-background">
			<div className="container mx-auto px-4 py-8">
				<div className="flex items-center justify-between mb-8">
					<div>
						<h1 className="text-4xl font-bold">Fixture Dashboard</h1>
						<p className="text-muted-foreground">Generate and manage test data for Degentalk</p>
					</div>

					<div className="flex gap-2">
						<Button variant="outline" onClick={exportSessions}>
							<Download className="w-4 h-4 mr-2" />
							Export
						</Button>
						<Button variant="outline" onClick={clearAllSessions}>
							<Trash2 className="w-4 h-4 mr-2" />
							Clear All
						</Button>
					</div>
				</div>

				{/* Stats Cards */}
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
					{statCards.map((card, index) => {
						const Icon = card.icon;
						return (
							<Card key={index}>
								<CardContent className="p-6">
									<div className="flex items-center justify-between">
										<div>
											<p className="text-sm text-muted-foreground">{card.title}</p>
											<p className="text-2xl font-bold">{card.value}</p>
											<p className="text-xs text-muted-foreground">{card.description}</p>
										</div>
										<Icon className="w-8 h-8 text-muted-foreground" />
									</div>
								</CardContent>
							</Card>
						);
					})}
				</div>

				{/* Type Distribution */}
				{Object.keys(stats.byType).length > 0 && (
					<Card className="mb-8">
						<CardHeader>
							<CardTitle>Fixtures by Type</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="flex flex-wrap gap-3">
								{Object.entries(stats.byType).map(([type, count]) => {
									const Icon = typeIcons[type] || Database;
									return (
										<div key={type} className="flex items-center gap-2 bg-muted p-3 rounded-lg">
											<Icon className="w-4 h-4" />
											<span className="font-medium">{type}</span>
											<Badge variant="secondary">{count}</Badge>
										</div>
									);
								})}
							</div>
						</CardContent>
					</Card>
				)}

				{/* Main Content */}
				<Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
					<TabsList className="grid w-full grid-cols-3">
						<TabsTrigger value="builder">Builder</TabsTrigger>
						<TabsTrigger value="preview">Preview</TabsTrigger>
						<TabsTrigger value="history">History</TabsTrigger>
					</TabsList>

					<TabsContent value="builder">
						<FixtureBuilder
							onGenerate={(fixtures) => {
								handleGenerateFixtures(fixtures, 'user', fixtures.length);
							}}
						/>
					</TabsContent>

					<TabsContent value="preview">
						{currentSession ? (
							<div className="space-y-6">
								<Card>
									<CardHeader>
										<CardTitle className="flex items-center justify-between">
											Current Session: {currentSession.name}
											<div className="flex gap-2">
												<Badge variant="secondary">{currentSession.type}</Badge>
												<Badge>{currentSession.count} items</Badge>
											</div>
										</CardTitle>
									</CardHeader>
								</Card>

								<FixturePreview fixtures={currentSession.fixtures} type={currentSession.type} />
							</div>
						) : (
							<Card>
								<CardContent className="p-8 text-center">
									<Database className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
									<h3 className="text-lg font-semibold mb-2">No Active Session</h3>
									<p className="text-muted-foreground mb-4">
										Generate fixtures or select a session from history to preview
									</p>
									<Button onClick={() => setActiveTab('builder')}>Create Fixtures</Button>
								</CardContent>
							</Card>
						)}
					</TabsContent>

					<TabsContent value="history">
						<div className="space-y-4">
							<div className="flex items-center justify-between">
								<h2 className="text-2xl font-bold">Session History</h2>
								<p className="text-muted-foreground">{sessions.length} sessions</p>
							</div>

							{sessions.length > 0 ? (
								<div className="space-y-3">
									{sessions.map((session) => {
										const Icon = typeIcons[session.type] || Database;
										return (
											<Card
												key={session.id}
												className={`cursor-pointer transition-colors ${
													currentSession?.id === session.id
														? 'border-primary bg-primary/5'
														: 'hover:bg-muted/50'
												}`}
												onClick={() => setCurrentSession(session)}
											>
												<CardContent className="p-4">
													<div className="flex items-center justify-between">
														<div className="flex items-center gap-3">
															<Icon className="w-5 h-5" />
															<div>
																<h3 className="font-semibold">{session.name}</h3>
																<p className="text-sm text-muted-foreground">
																	{new Date(session.createdAt).toLocaleString()}
																</p>
															</div>
														</div>

														<div className="flex items-center gap-2">
															<Badge variant="secondary">{session.type}</Badge>
															<Badge>{session.count} items</Badge>
															<Button
																variant="ghost"
																size="sm"
																onClick={(e) => {
																	e.stopPropagation();
																	deleteSession(session.id);
																}}
															>
																<Trash2 className="w-4 h-4" />
															</Button>
														</div>
													</div>
												</CardContent>
											</Card>
										);
									})}
								</div>
							) : (
								<Card>
									<CardContent className="p-8 text-center">
										<History className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
										<h3 className="text-lg font-semibold mb-2">No Sessions Yet</h3>
										<p className="text-muted-foreground">
											Your fixture generation history will appear here
										</p>
									</CardContent>
								</Card>
							)}
						</div>
					</TabsContent>
				</Tabs>
			</div>
		</div>
	);
}
