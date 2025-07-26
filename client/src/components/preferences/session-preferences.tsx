import React, { useState } from 'react';
import type { User } from '@shared/types/user.types';
import { Button } from '@app/components/ui/button';
import { Card, CardContent } from '@app/components/ui/card';
import { Badge } from '@app/components/ui/badge';
import { Separator } from '@app/components/ui/separator';
import {
	AlertTriangle,
	Clock,
	Globe,
	Laptop,
	Smartphone,
	Tablet,
	LogOut,
	ShieldAlert
} from 'lucide-react';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
	DialogClose
} from '@app/components/ui/dialog';
import { formatDistanceToNow } from 'date-fns';

interface SessionPreferencesProps {
	user: User;
}

interface Session {
	id: string;
	device: string;
	deviceType: 'desktop' | 'mobile' | 'tablet' | 'unknown';
	browser: string;
	location: string;
	ip: string;
	lastActive: Date;
	isCurrentSession: boolean;
}

export function SessionPreferences({ user }: SessionPreferencesProps) {
	// Mock sessions data - would come from API in real app
	const [sessions, setSessions] = useState<Session[]>([
		{
			id: 'current-session',
			device: 'Windows 11',
			deviceType: 'desktop',
			browser: 'Chrome 125',
			location: 'Vancouver, Canada',
			ip: '192.168.1.1',
			lastActive: new Date(),
			isCurrentSession: true
		},
		{
			id: 'session-2',
			device: 'iPhone 15',
			deviceType: 'mobile',
			browser: 'Safari',
			location: 'Seattle, USA',
			ip: '192.168.1.2',
			lastActive: new Date(Date.now() - 86400000), // 1 day ago
			isCurrentSession: false
		},
		{
			id: 'session-3',
			device: 'iPad Pro',
			deviceType: 'tablet',
			browser: 'Safari',
			location: 'Portland, USA',
			ip: '192.168.1.3',
			lastActive: new Date(Date.now() - 432000000), // 5 days ago
			isCurrentSession: false
		}
	]);

	const [showSignOutConfirm, setShowSignOutConfirm] = useState(false);
	const [sessionToLogOut, setSessionToLogOut] = useState<string | null>(null);

	const handleSignOutSession = (sessionId: string) => {
		// Confirm before signing out
		setSessionToLogOut(sessionId);
		setShowSignOutConfirm(true);
	};

	const confirmSignOut = () => {
		if (sessionToLogOut) {
			if (sessionToLogOut === 'all') {
				// Sign out all sessions except current
				setSessions(sessions.filter((s) => s.isCurrentSession));
			} else {
				// Sign out specific session
				setSessions(sessions.filter((s) => s.id !== sessionToLogOut));
			}
			setShowSignOutConfirm(false);
			setSessionToLogOut(null);
		}
	};

	const getDeviceIcon = (deviceType: string) => {
		switch (deviceType) {
			case 'desktop':
				return <Laptop className="h-5 w-5 text-blue-400" />;
			case 'mobile':
				return <Smartphone className="h-5 w-5 text-emerald-400" />;
			case 'tablet':
				return <Tablet className="h-5 w-5 text-purple-400" />;
			default:
				return <Globe className="h-5 w-5 text-slate-400" />;
		}
	};

	return (
		<div>
			<div className="mb-6">
				<h2 className="text-2xl font-bold mb-2">Session Preferences</h2>
				<p className="text-zinc-400">Manage your active login sessions across devices</p>
			</div>

			{/* Active Sessions List */}
			<Card className="mb-6 bg-zinc-800/50 border-zinc-700">
				<CardContent className="pt-6">
					<div className="space-y-4">
						{sessions.map((session) => (
							<div
								key={session.id}
								className={`p-4 rounded-md ${session.isCurrentSession ? 'bg-emerald-900/20 border border-emerald-800' : 'bg-zinc-900'}`}
							>
								<div className="flex items-start justify-between mb-3">
									<div className="flex items-center">
										{getDeviceIcon(session.deviceType)}
										<div className="ml-3">
											<div className="font-medium text-white flex items-center">
												{session.device} / {session.browser}
												{session.isCurrentSession && (
													<Badge className="ml-2 bg-emerald-600">Current</Badge>
												)}
											</div>
											<div className="text-xs text-zinc-400">
												{session.location} • IP: {session.ip}
											</div>
										</div>
									</div>
									{!session.isCurrentSession && (
										<Button
											variant="outline"
											size="sm"
											className="text-red-400 border-zinc-700 hover:border-red-400 hover:text-red-300"
											onClick={() => handleSignOutSession(session.id)}
										>
											<LogOut className="h-4 w-4 mr-1" />
											Sign Out
										</Button>
									)}
								</div>
								<div className="flex items-center text-xs text-zinc-500">
									<Clock className="h-3 w-3 mr-1" />
									Last active {formatDistanceToNow(session.lastActive, { addSuffix: true })}
								</div>
							</div>
						))}
					</div>
				</CardContent>
			</Card>

			{/* Security Recommendations */}
			<Card className="mb-6 bg-zinc-800/50 border-zinc-700">
				<CardContent className="pt-6">
					<h3 className="text-lg font-medium mb-4 flex items-center">
						<ShieldAlert className="h-5 w-5 mr-2 text-amber-500" />
						Security Recommendations
					</h3>

					<div className="bg-amber-900/20 border border-amber-800 rounded-md p-4 mb-4">
						<div className="flex items-start">
							<AlertTriangle className="h-5 w-5 text-amber-500 mr-3 mt-0.5" />
							<div>
								<h4 className="font-medium text-amber-400">Best Practices</h4>
								<p className="text-sm text-zinc-300 mt-1">
									For better security, regularly review your active sessions and sign out from
									devices you no longer use.
								</p>
							</div>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Submit Buttons */}
			<div className="flex justify-end gap-3 mt-8">
				<Button
					type="button"
					variant="outline"
					className="text-red-400 border-zinc-700 hover:border-red-400 hover:text-red-300"
					onClick={() => handleSignOutSession('all')}
				>
					<LogOut className="h-4 w-4 mr-2" />
					Sign Out All Other Devices
				</Button>
			</div>

			{/* Confirm Dialog */}
			<Dialog open={showSignOutConfirm} onOpenChange={setShowSignOutConfirm}>
				<DialogContent className="bg-zinc-900 border-zinc-700">
					<DialogHeader>
						<DialogTitle>Sign Out Session</DialogTitle>
						<DialogDescription>
							{sessionToLogOut === 'all'
								? 'Are you sure you want to sign out from all other devices?'
								: 'Are you sure you want to sign out this session?'}
						</DialogDescription>
					</DialogHeader>
					<DialogFooter className="gap-2 sm:gap-0">
						<DialogClose asChild>
							<Button variant="outline" className="border-zinc-700">
								Cancel
							</Button>
						</DialogClose>
						<Button onClick={confirmSignOut} className="bg-red-600 hover:bg-red-700">
							Sign Out
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}
